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

async function getLatestVanillaVersion() {
  const versionManifest = await getVersionManifest();
  return versionManifest.latest.release;
}

async function getLatestPurpurVersion() {
  const response = await fetch("https://api.purpurmc.org/v2/purpur/");
  const data = await response.json();
  return data.versions[data.versions.length - 1];
}

async function getLatestPaperVersion() {
  const response = await fetch("https://api.papermc.io/v2/projects/paper");
  const data = await response.json();
  return data.versions[data.versions.length - 1];
}

async function getLatestMohistVersion() {
  const response = await fetch("https://mohistmc.com/api/versions");
  const versions = await response.json();
  return versions[versions.length - 1];
}

async function handlePurpur(version, build, res) {
  if (!build) {
    return res.status(400).json({ error: true, message: "Build parameter is required for purpur." });
  }

  const purpurData = await fetch(`https://api.purpurmc.org/v2/purpur/${version}/${build}`).then(res => res.json());
  
  if (purpurData.error) {
    return res.status(400).json({ error: true, message: purpurData.error });
  }

  if (!purpurData.download) {
    return res.status(400).json({ error: true, message: "Invalid build." });
  }

  res.redirect(302, purpurData.download);
}

async function handlePaper(version, build, res) {
  const paperBuilds = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`).then(res => res.json());
  
  if (paperBuilds.error) {
    return res.status(400).json({ error: true, message: paperBuilds.error });
  }

  let finalBuild;
  if (build === "latest") {
    finalBuild = paperBuilds.builds[paperBuilds.builds.length - 1];
  } else {
    finalBuild = paperBuilds.builds.find(b => b.build === build);
    if (!finalBuild) {
      return res.status(400).json({ error: true, message: "Invalid build." });
    }
  }

  let filename = finalBuild.downloads.application.name;
  res.redirect(302, `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${finalBuild.build}/downloads/${filename}`);
}

async function handleVanilla(version, res) {
  const versionManifest = await getVersionManifest();
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

async function handleMohist(version, res) {
  const mohistData = await fetch(`https://mohistmc.com/api/${version}/latest`).then(res => res.json());

  if (mohistData.error) {
    return res.status(400).json({ error: true, message: mohistData.error });
  }

  res.redirect(302, mohistData.url);
}

app.get("/download/:software/:version/:build?", async (req, res) => {
  const { software, version: rawVersion, build: rawBuild } = req.params;

  if (!VALID_SOFTWARES.includes(software)) {
    return res.status(400).json({ error: true, message: "Invalid software type." });
  }

  let version;

  switch (software) {
    case "vanilla":
      version = rawVersion === "latest" ? await getLatestVanillaVersion() : rawVersion;
      await handleVanilla(version, res);
      break;
    case "purpur":
      version = rawVersion === "latest" ? await getLatestPurpurVersion() : rawVersion;
      await handlePurpur(version, rawBuild, res);
      break;
    case "paper":
      version = rawVersion === "latest" ? await getLatestPaperVersion() : rawVersion;
      await handlePaper(version, rawBuild, res);
      break;
    case "mohistmc":
      version = rawVersion === "latest" ? await getLatestMohistVersion() : rawVersion;
      await handleMohist(version, res);
      break;
  }
});

app.listen(3000);
