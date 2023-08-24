/*
  Made by Aleksander Wegrzyn under the Code Credit License.
*/

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.options("*", cors());

const VALID_SOFTWARES = ["vanilla", "paper", "purpur", "mohistmc"];

app.get("/", (req, res) => {
  res.redirect(301, "https://github.com/polish-penguin-dev/MC-SRV-DL-API" + req.path);
});

async function getVersionManifest() {
  const response = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
  return await response.json();
}

app.get("/download/:software/:version/:build?", async (req, res) => {
  const { software, version: rawVersion, build: rawBuild } = req.params;

  if (!VALID_SOFTWARES.includes(software)) {
    return res.status(400).json({ error: true, message: "Invalid software type." });
  }

  const versionManifest = await getVersionManifest();
  let version = rawVersion === "latest" ? versionManifest.latest.release : rawVersion;

  switch (software) {
    case "purpur":
      await handlePurpur(version, rawBuild, res);
      break;
    case "paper":
      await handlePaper(version, rawBuild, versionManifest, res);
      break;
    case "vanilla":
      handleVanilla(version, versionManifest, res);
      break;
    case "mohistmc":
      await handleMohist(version, versionManifest, res);
      break;
  }
});

async function handlePurpur(version, build, res) {
  if (!build) {
    return res.status(400).json({ error: true, message: "Build parameter is required for purpur." });
  }

  const purpurData = await fetch(`https://api.purpurmc.org/v2/purpur/${version}/${build}`).then(res => res.json());
  
  if (purpurData.error) {
    return res.status(400).json({ error: true, message: purpurData.error });
  }

  res.redirect(302, `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`);
}

async function handlePaper(version, build, versionManifest, res) {
  if (!build) {
    return res.status(400).json({ error: true, message: "Build parameter is required for paper." });
  }

  const paperBuilds = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`).then(res => res.json());
  
  if (paperBuilds.error) {
    return res.status(400).json({ error: true, message: paperBuilds.error });
  }

  let finalBuild = build === "latest" ? paperBuilds.builds[paperBuilds.builds.length - 1] : paperBuilds.builds.find(b => b.build === build);
  let filename = finalBuild.downloads.application.name;

  res.redirect(302, `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${finalBuild.build}/downloads/${filename}`);
}

function handleVanilla(version, versionManifest, res) {
  const vanillaVersion = versionManifest.versions.find(v => v.id === version);

  if (!vanillaVersion) {
    return res.status(400).json({ error: true, message: "Version not found." });
  }

  fetch(vanillaVersion.url)
    .then(res => res.json())
    .then(data => {
      res.redirect(302, data.downloads.server.url);
    });
}

async function handleMohist(version, versionManifest, res) {
  const mohistData = await fetch(`https://mohistmc.com/api/${version}/latest`).then(res => res.json());

  if (mohistData.error) {
    return res.status(400).json({ error: true, message: mohistData.error });
  }

  res.redirect(302, mohistData.url);
}

app.listen(3000);
