# Minecraft Server Download/Software API

## MC-SRV-DL-API Lets you easily download minecraft server software such as paper, purpur or vanilla all in one place.

### It can be used to always get the latest server software or as a replacement for the now archived Yive's mirror.

The Minecraft Server Software API let's you download server softwares with ease. As of right now, these are:

- 📜Paper
- 🎶Purpur
- 🎉Vanilla

To download one, use the /download endpoint with the software, version and build parameter. Here is an example:

To grab the latest paper .jar download link:

`
GET https://mc-srv-dl-api.pingwinco.xyz/download?software=paper&version=1.20&build=latest
`

Example response:

```json
{
  "error": false,
  "download": "https://api.papermc.io/v2/projects/paper/versions/1.20/builds/17/downloads/paper-1.20-17.jar"
}
```

To grab the latest vanilla server.jar: (no build parameter required)

`
GET https://mc-srv-dl-api.pingwinco.xyz/download?software=vanilla&version=latest
`

Example response:

```json
{
  "error": false,
  "download": "https://piston-data.mojang.com/v1/objects/84194a2f286ef7c14ed7ce0090dba59902951553/server.jar"
}
```

Please consider donating: https://www.paypal.com/donate/?hosted_button_id=Z43BFTB2UDSHQ

**This code goes by the Code Credit License, included in the LICENSE.md file. Made by Aleksander Wegrzyn (or polish-penguin-dev)**

