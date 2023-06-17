# Minecraft Server Download/Software API

## MC-SRV-DL-API Lets you easily download minecraft server software such as paper, purpur or spigot all in one place.

### It can be used to always get the latest server software or as a replacement for the now archived Yive's mirror.

The Minecraft Server Software API let's you download server softwares with ease. As of right now, these are:

- Paper
- Purpur
- Spigot
- Vanilla

To download one, use the /download endpoint with the software, version and build parameter. Here is an example:

To grab the latest paper .jar download link:

`GET https://mc-srv-dl-api.pingwinco.xyz/download?software=paper&version=1.20&build=latest`

Example response:

```
{
  "error": false,
  "download": "https://api.papermc.io/v2/projects/paper/versions/1.20/builds/17/downloads/paper-1.20-17.jar"
}
```


