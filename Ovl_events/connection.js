const fs = require("fs");
const path = require("path");
const { delay, DisconnectReason, jidDecode } = require("@whiskeysockets/baileys");
const { execSync } = require("child_process");
let evt = require("../lib/ovlcmd");
const pkg = require("../package");
const config = require("../set");
const { manage_env } = require("../lib/manage_env");
const { installpg, reloadCommands } = require("../lib/plugin");
const decodeJid = v1 => {
  if (!v1) {
    return v1;
  }
  if (/:\d+@/gi.test(v1)) {
    const v12 = jidDecode(v1) || {};
    return (v12.user && v12.server && v12.user + "@" + v12.server) || v1;
  }
  return v1;
};
async function installMissingDependencies() {
  const package = require("../package.json");
  const v1 = {
    ...package.dependencies,
    ...package.devDependencies,
  };
  const v2 = [];
  for (const v12 of Object.keys(v1 || {})) {
    try {
      require.resolve(v12);
    } catch {
      v2.push(v12 + "@" + v1[v12]);
    }
  }
  if (!v2.length) {
    return;
  }
  console.log("⚙️ Installation des dépendances manquantes : " + v2.join(", "));
  try {
    execSync("npm install " + v2.join(" "), {
      stdio: "inherit",
    });
    console.log("✅ Dépendances installées.");
  } catch (e) {
    console.error("❌ Erreur installation npm :", e.message);
  }
}
async function connection_update(v1, v2, v3, v4 = null) {
  const { connection, lastDisconnect } = v1;
  switch (connection) {
    case "connecting":
      console.log("🌍 Connexion en cours...");
      break;
    case "open":
      console.log(
        "\n╭─────────────────╮\n│                  \n│   🎉 OVL BOT ONLINE 🎉  \n│                  \n╰─────────────────╯\n",
      );
      console.log("🔄 Synchronisation des variables d'environnement...");
      await manage_env();
      console.log("✅ Variables synchronisées.");
      await installpg();
      await installMissingDependencies();
      await reloadCommands();
      await delay(1000);
      const v12 =
        "╭───〔 🤖 𝙊𝙑𝙇 𝘽𝙊𝙏 〕───⬣\n│ ߷ *Etat*       ➜ Connecté ✅\n│ ߷ *Préfixe*    ➜ " +
        config.PREFIXE +
        "\n│ ߷ *Mode*       ➜ " +
        config.MODE +
        "\n│ ߷ *Commandes*  ➜ " +
        evt.cmd.length +
        "\n│ ߷ *Version*    ➜ " +
        pkg.version +
        "\n│ ߷ *Développeur*➜ Ainz\n╰──────────────⬣";
      console.log(v12);
      await v2.sendMessage(decodeJid(v2.user.id), {
        text: v12,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363371282577847@newsletter",
            newsletterName: "OVL-MD",
          },
        },
      });
      await delay(10000);
      if (v4) {
        await v4();
      }
      break;
    case "close":
      const v22 = lastDisconnect?.error?.output?.statusCode;
      if (v22 === DisconnectReason.loggedOut) {
        console.log("⛔ Déconnecté : Session terminée.");
      } else {
        console.log("⚠️ Connexion perdue, reconnexion...");
        await delay(5000);
        v3();
      }
      break;
  }
}
module.exports = connection_update;
