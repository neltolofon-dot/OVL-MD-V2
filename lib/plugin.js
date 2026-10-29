const fs = require("fs");
const axios = require("axios");
const path = require("path");
const { exec } = require("child_process");
let evt = require("../lib/ovlcmd");
const { Plugin } = require("../DataBase/plugin");
const { delay, jidDecode } = require("@whiskeysockets/baileys");
function extractNpmModules(v1) {
  const v2 = /require\s*\(\s*['"]([^\.\/][^'"]*)['"]\s*\)/g;
  const v3 = new Set();
  let v4;
  while ((v4 = v2.exec(v1)) !== null) {
    v3.add(v4[1]);
  }
  let v5 = {};
  try {
    v5 = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"));
  } catch {}
  const v6 = v5.dependencies || {};
  const v7 = v5.devDependencies || {};
  return [...v3].filter(v12 => !v6[v12] && !v7[v12]);
}
function installModules(v1) {
  if (!v1.length) {
    return Promise.resolve();
  }
  return new Promise((v12, v2) => {
    exec(
      "npm install " + v1.join(" "),
      {
        cwd: path.resolve(__dirname, "../"),
        stdio: "inherit",
      },
      v13 => (v13 ? v2(v13) : v12()),
    );
  });
}
async function installpg() {
  const v1 = path.join(__dirname, "../plugins");
  if (!fs.existsSync(v1)) {
    fs.mkdirSync(v1, {
      recursive: true,
    });
  }
  const v2 = await Plugin.findAll();
  for (const { name, url } of v2) {
    const v12 = path.join(v1, name + ".js");
    if (fs.existsSync(v12)) {
      continue;
    }
    try {
      const v13 = (await axios.get(url)).data;
      fs.writeFileSync(v12, v13);
      const v22 = extractNpmModules(v13);
      if (v22.length) {
        await installModules(v22);
      }
    } catch {}
  }
}
let isReloading = false;
async function reloadCommands() {
  if (isReloading) {
    return;
  }
  if (!Array.isArray(evt.cmd)) {
    return;
  }
  isReloading = true;
  try {
    evt.cmd.length = 0;
    const v1 = async (v12, v2) => {
      if (!fs.existsSync(v12)) {
        return;
      }
      const v3 = fs.readdirSync(v12).filter(v13 => path.extname(v13).toLowerCase() === ".js");
      console.log("📂 Chargement des " + v2 + " :");
      for (const v13 of v3) {
        const v14 = path.join(v12, v13);
        await delay(50);
        try {
          delete require.cache[require.resolve(v14)];
          require(v14);
          console.log("  ✓ " + v13);
        } catch (e) {
          console.log("  ✗ " + v13 + " — erreur : " + e.message);
        }
      }
    };
    await v1(path.join(__dirname, "../cmd"), "commandes");
    await v1(path.join(__dirname, "../plugins"), "plugins");
  } finally {
    isReloading = false;
  }
}
module.exports = {
  extractNpmModules,
  installModules,
  installpg,
  reloadCommands,
};
