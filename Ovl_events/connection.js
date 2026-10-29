const { delay, DisconnectReason, jidDecode } = require("@whiskeysockets/baileys");
const { execSync } = require("child_process");
let evt = require("../lib/ovlcmd");
const pkg = require("../package.json");
const config = require("../set");
const { manage_env } = require("../lib/manage_env");
const { installpg, reloadCommands } = require("../lib/plugin");

const decodeJid = jid => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const decoded = jidDecode(jid) || {};
    return (decoded.user && decoded.server && decoded.user + "@" + decoded.server) || jid;
  }
  return jid;
};

// Tentatives de reconnexion : délai croissant pour ne pas marteler les
// serveurs WhatsApp (et se faire bloquer) quand la panne dure.
let tentativesReconnexion = 0;
const DELAI_RECONNEXION_MAX_MS = 60000;

// `npm install` ne doit tourner qu'une fois par processus : auparavant il était
// relancé à chaque reconnexion, ce qui pouvait bloquer le bot plusieurs minutes.
let dependancesVerifiees = false;

async function installMissingDependencies() {
  if (dependancesVerifiees || process.env.AUTO_INSTALL === "off") return;
  dependancesVerifiees = true;

  const manifeste = { ...pkg.dependencies, ...pkg.devDependencies };
  const manquantes = [];
  for (const nom of Object.keys(manifeste || {})) {
    try {
      require.resolve(nom);
    } catch {
      manquantes.push(nom + "@" + manifeste[nom]);
    }
  }
  if (!manquantes.length) return;

  console.log("⚙️ Installation des dépendances manquantes : " + manquantes.join(", "));
  try {
    execSync("npm install " + manquantes.join(" "), { stdio: "inherit" });
    console.log("✅ Dépendances installées.");
  } catch (e) {
    console.error("❌ Erreur installation npm :", e.message);
    console.error("   Lancez `npm install` manuellement puis redémarrez le bot.");
  }
}

function resumeDemarrage() {
  return (
    "╭───〔 🤖 OVL BOT 〕───⬣\n" +
    "│ ߷ *Etat*       ➜ Connecté ✅\n" +
    `│ ߷ *Préfixe*    ➜ ${config.PREFIXE}\n` +
    `│ ߷ *Mode*       ➜ ${config.MODE}\n` +
    `│ ߷ *Commandes*  ➜ ${evt.cmd.length}\n` +
    `│ ߷ *Version*    ➜ ${pkg.version}\n` +
    `│ ߷ *Owner*      ➜ ${config.NOM_OWNER}\n` +
    "│ ߷ *Base*       ➜ OVL-MD-V2 (Ainz)\n" +
    "╰──────────────⬣"
  );
}

async function connection_update(update, ovl, reconnecter, onPret = null) {
  const { connection, lastDisconnect } = update;

  switch (connection) {
    case "connecting":
      console.log("🌍 Connexion en cours...");
      break;

    case "open": {
      tentativesReconnexion = 0;
      console.log("\n╭─────────────────────╮\n│  🎉 OVL BOT ONLINE 🎉  │\n╰─────────────────────╯\n");

      try {
        console.log("🔄 Synchronisation des variables d'environnement...");
        await manage_env();
        console.log("✅ Variables synchronisées.");
      } catch (e) {
        console.error("⚠️ Synchronisation des variables échouée :", e.message);
      }

      try {
        await installpg();
      } catch (e) {
        console.error("⚠️ Chargement des plugins distants échoué :", e.message);
      }

      await installMissingDependencies();

      try {
        await reloadCommands();
      } catch (e) {
        console.error("⚠️ Chargement des commandes échoué :", e.message);
      }

      await delay(1000);
      const resume = resumeDemarrage();
      console.log(resume);

      try {
        await ovl.sendMessage(decodeJid(ovl.user.id), { text: resume });
      } catch (e) {
        console.error("⚠️ Message de démarrage non envoyé :", e.message);
      }

      await delay(5000);
      if (onPret) await onPret();
      break;
    }

    case "close": {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (code === DisconnectReason.loggedOut) {
        console.error(
          "⛔ Déconnecté : la session a été fermée depuis WhatsApp (appareil délié).\n" +
            "   Supprimez le dossier auth/ et générez un nouveau SESSION_ID.",
        );
        return;
      }

      tentativesReconnexion += 1;
      const attente = Math.min(5000 * tentativesReconnexion, DELAI_RECONNEXION_MAX_MS);
      console.warn(
        `⚠️ Connexion perdue (code ${code ?? "inconnu"}), ` +
          `reconnexion dans ${Math.round(attente / 1000)}s ` +
          `(tentative ${tentativesReconnexion})...`,
      );
      await delay(attente);
      reconnecter();
      break;
    }
  }
}

module.exports = connection_update;
