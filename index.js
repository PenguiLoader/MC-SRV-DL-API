/*
  Made by Aleksander Wegrzyn under the Code Credit License.
*/

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
const app = express();

app.get("/", (req, res) => {
  res.redirect(301, "https://github.com/polish-penguin-dev/MC-SRV-DL-API" + req.path);
});

//quick function to get the version manifest so the latest version can be grabbed with ease. TODO: Add option to get the latest *availible* version for the software if it has not yet updated to the latest.
async function getVersionManifest() {
  const response = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
  const versionmanifest = response.json();
  
  return await versionmanifest;
}

app.get("/download/:software?/:version?/:build?", (req, res) => {
  let software = req.query.software || req.params.software;
  let version = req.query.version || req.params.version;
  let build = req.query.build || req.params.build;
  let json = req.query.json;
  
  //check that all the required parameters are included.
  if(!software || !version) {
    return res.status(400).json({ error: true, message: "You need the software and version parameter in the URL (sometimes build)." });
  }

  const softwares = ["vanilla", "paper", "purpur", "mohistmc"];
  
    //check if the software parameter is a valid, real software.
    if(!softwares.includes(software)) {
      return res.status(400).json({ error: true, message: "The software must be vanilla, paper, purpur, or mohistmc." });
    }

  
  //for purpur:
  if(software === "purpur") {
    if(!build) {
      return res.status(400).json({ error: true, message: "The build parameter is required for this software." });
    }
    
    getVersionManifest().then(versionmanifest => {
        if(version === "latest") {
          version = versionmanifest.latest.release;
        }
      
        fetch(`https://api.purpurmc.org/v2/purpur/${version}/${build}`)
        .then(results => results.json())
        .then(data => {
          if(data.error) {
            return res.status(400).json({ error: true, message: data.error })
          }
          
          if(json) {
           return res.status(200).json({ error: false, download: `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`, version: version });
          } else {
            res.redirect(302, `https://api.purpurmc.org/v2/purpur/${version}/${build}/download`)
          }
        });
    });
  }

  //for paper:
  if(software === "paper") {
    if(!build) {
      return res.status(400).json({ error: true, message: "The build parameter is required for this software." });
    }
    
    let filename;
    
      getVersionManifest().then(versionmanifest => {
        if(version === "latest") {
          version = versionmanifest.latest.release;
        }

        fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`)
        .then(results => results.json())
        .then(data => {
          if(data.error) {
            return res.status(400).json({ error: true, message: data.error });
          } 
      
          if(build === "latest") {
            build = data.builds.at(-1).build;
            filename = data.builds.at(-1).downloads.application.name;

            if(json) {
              return res.status(200).json({ error: false, download: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}`, version: version });
            } else {
              res.redirect(302, `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}`)
            }
          } else {
            //check if the build is valid.
            fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}`)
            .then(results => results.json())
            .then(data => {
              if(data.error) {
                return res.status(400).json({ error: true, message: data.error });
              }

              filename = `paper-${version}-${build}.jar`;

              if(json) {
                return res.status(200).json({ error: false, download: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}`, version: version });
              } else {
               res.redirect(302, `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/${filename}`)
              }
            });
          }
        });
      });
  }

  //for vanilla:
  if(software === "vanilla") {
    fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")
    .then(results => results.json())
    .then(data => { 
      const builds = data.versions;
      let foundVersion = false;

      if(version === "latest") {
        version = data.latest.release;
      }
      
      builds.forEach((vanillaBuild, index) => {
        if(vanillaBuild.id === version) {
          foundVersion = true;
          
          fetch(vanillaBuild.url)
          .then(results => results.json())
          .then(data => {
            if(json) {
              return res.status(200).json({ error: false, download: data.downloads.server.url, version: version });
            } else {
              res.redirect(302, data.downloads.server.url);
            }
          });
        }

        //loop finshed:
        if(index === builds.length - 1 && foundVersion === false) return res.status(400).json({ error: true, message: "version not found" });
      });
    });
  }

  //for mohistmc:
  if(software === "mohistmc") {
    getVersionManifest().then(versionmanifest => {
        if(version === "latest") {
          version = versionmanifest.latest.release;
        }  

      fetch(`https://mohistmc.com/api/${version}/latest`)
      .then(results => results.json())
      .then(data => {
        if(data.error) {
            return res.status(400).json({ error: true, message: data.error });
          } 

        if(json) {
          return res.status(200).json({ error: false, download: data.url, version: version });
        } else {
          res.redirect(302, data.url);
        }
      })
    });
  }
});

app.use(cors());
app.options("*", cors());

app.listen(3000);