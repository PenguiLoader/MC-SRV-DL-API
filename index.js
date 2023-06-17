import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import * as fs from "fs";
const app = express();

app.get("/", (req, res) => {
  res.redirect(301, "https://github.com/polish-penguin-dev/MC-SRV-DL-API" + req.path);
});

app.get("/download", (req, res) => {
  let software = req.query.software;
  let version = req.query.version;
  let build = req.query.build;
  let filename;
  
  //check that all the required parameters are included.
  if(!software || !version || !build && software !== "vanilla") {
    return res.status(400).json({ error: true, message: "You need the software, version, and build parameter in the URL." });
  }

  const softwares = ["vanilla", "paper", "spigot", "purpur"];
  
    //check if the software parameter is a valid, real software.
    if(!softwares.includes(software)) {
      return res.status(400).json({ error: true, message: "The software must be vanilla, paper, spigot or purpur." });
    }

  
  //for purpur:
  if(software === "purpur") {
    fetch(`https://api.purpurmc.org/v2/purpur/${version}/${build}`)
    .then(results => results.json())
    .then(data => {
      if(data.error) {
        return res.status(400).json({ error: true, message: data.error })
      }

      return res.status(200).json({ error: false, download: `https://api.purpurmc.org/v2/purpur/${version}/${build}/download` });
    });
  }

  //for paper:
  if(software === "paper") {
    fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`)
    .then(results => results.json())
    .then(data => {
      if(data.error) {
        return res.status(400).json({ error: true, message: data.error });
      } 
      
      if(build === "latest") {
        build = data.builds.at(-1).build;
        filename = data.builds.at(-1).downloads.application.name;

        return res.status(200).json({ error: false, download: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}` });
      } else {
        //check if the build is valid.
        fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}`)
        .then(results => results.json())
        .then(data => {
          if(data.error) {
            return res.status(400).json({ error: true, message: data.error });
          }

          filename = `paper-${version}-${build}.jar`;

          return res.status(200).json({ error: false, download: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}` });
        });
      }
    });
  }

  //for vanilla:
  if(software === "vanilla") {
    fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")
    .then(results => results.json())
    .then(data => {
      const builds = data.versions;
      let foundVersion = false;
      
      builds.forEach((vanillaBuild, index) => {
        if(vanillaBuild.id === version) {
          foundVersion = true;
          
          fetch(vanillaBuild.url)
          .then(results => results.json())
          .then(data => {
            return res.status(200).json({ error: false, download: data.downloads.server.url });
          });
        }

        //loop finshed:
        if(index === builds.length - 1 && foundVersion === false) return res.status(400).json({ error: true, message: "version not found" });
      });
    });
  }
});

app.use(cors());
app.options("*", cors());

app.listen(3000);