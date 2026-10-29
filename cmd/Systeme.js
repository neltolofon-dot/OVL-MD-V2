const { ovlcmd } = require("../lib/ovlcmd");
const config = require("../set");
const { updateEnvFile } = require("../lib/manage_env");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const simpleGit = require("simple-git");
const git = simpleGit();
const ENV_FILE = path.join(process.cwd(), ".env");
const CONFIG_ENV_FILE = path.join(process.cwd(), "config_env.json");
ovlcmd(
  {
    nom_cmd: "setvar",
    classe: "Système",
    react: "⚙️",
    desc: "Définit ou modifie une variable d'environnement. Usage: setvar KEY = value",
  },
  async (dest, ovl, { repondre, prenium_id, arg }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    try {
      let [v1, ...v2] = arg;
      v1 = v1?.toUpperCase();
      if (!v1 || v2.length === 0 || v2[0] !== "=") {
        return repondre("Usage correct : setvar KEY = value\nExemple : setvar MODE = private");
      }
      const v3 = v2.slice(1).join(" ");
      updateEnvFile(ENV_FILE, v1, v3);
      let v4 = fs.existsSync(CONFIG_ENV_FILE) ? JSON.parse(fs.readFileSync(CONFIG_ENV_FILE, "utf8")) : {};
      v4[v1] = v3;
      fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(v4, null, 2), "utf8");
      config[v1] = v3;
      repondre("Variable mise à jour : " + v1 + " = " + v3);
    } catch (e) {
      console.error(e);
      repondre("Une erreur est survenue lors de la mise à jour de la variable.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "delvar",
    classe: "Système",
    react: "🗑️",
    desc: "Supprime une variable d'environnement. Usage: delvar KEY",
  },
  async (dest, ovl, { repondre, prenium_id, arg }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    try {
      const v1 = arg[0]?.toUpperCase();
      if (!v1) {
        return repondre("Usage correct : delvar KEY\nExemple : delvar MODE");
      }
      updateEnvFile(ENV_FILE, v1, null);
      let v2 = fs.existsSync(CONFIG_ENV_FILE) ? JSON.parse(fs.readFileSync(CONFIG_ENV_FILE, "utf8")) : {};
      delete v2[v1];
      fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(v2, null, 2), "utf8");
      delete config[v1];
      repondre("Variable supprimée : " + v1);
    } catch (e) {
      console.error(e);
      repondre("Une erreur est survenue lors de la suppression de la variable.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "getvar",
    classe: "Système",
    react: "📄",
    desc: "Affiche la valeur d'une variable ou toutes les variables. Usage: getvar KEY ou getvar all",
  },
  async (dest, ovl, { repondre, arg, prenium_id }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    try {
      const v1 = arg[0]?.toUpperCase();
      if (!v1) {
        return repondre("Usage : getvar KEY ou getvar all");
      }
      if (v1 === "ALL") {
        const v12 = Object.entries(config).filter(([v13, v22]) => v22 !== undefined);
        if (v12.length === 0) {
          return repondre("Aucune variable définie.");
        }
        const v2 = v12.map(([v13, v22]) => "• " + v13 + " = " + v22).join("\n");
        return repondre("Liste des variables :\n" + v2);
      } else {
        if (config[v1] === undefined) {
          return repondre("La variable " + v1 + " n'existe pas.");
        }
        return repondre(v1 + " = " + config[v1]);
      }
    } catch (e) {
      repondre("Une erreur est survenue lors de la récupération de la variable.");
    }
  },
);
function formatDateGMTFr(v1) {
  const v2 = new Date(v1);
  return (
    v2.toLocaleString("fr-FR", {
      timeZone: "UTC",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " GMT"
  );
}
ovlcmd(
  {
    nom_cmd: "checkupdate",
    classe: "Système",
    react: "🔍",
    desc: "Vérifie les mises à jour disponibles du bot.",
  },
  async (dest, ovl, { repondre, prenium_id }) => {
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      await git.init();
      const v1 = await git.getRemotes();
      if (!v1.some(v12 => v12.name === "origin")) {
        await git.addRemote("origin", "https://github.com/Ainz-devs/OVL-MD-V2");
      }
      await git.fetch();
      const v2 = "origin/main";
      const v3 = await git.branch(["-r"]);
      if (!v3.all.includes(v2)) {
        return repondre("❌ Branche distante introuvable.");
      }
      const v4 = await git.log({
        from: "main",
        to: v2,
      });
      if (v4.total > 0) {
        const v12 = v4.all
          .map(v13 => "🔹 " + v13.message + " — _" + formatDateGMTFr(v13.date) + "_")
          .join("\n");
        const v22 =
          "✨🚀 *MISE À JOUR DISPONIBLE !* 🚀✨\n\n📣 *Détails des modifs :*\n\n" +
          v12 +
          "\n\n🔧 Pour appliquer la mise à jour, tape la commande :  \n➡️ *" +
          config.PREFIXE +
          "update*";
        return repondre(v22);
      } else {
        return repondre("✅ Le bot est déjà à jour.");
      }
    } catch (e) {
      console.error(e);
      return repondre("❌ Erreur lors de la vérification des mises à jour.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "update",
    classe: "Système",
    react: "♻️",
    desc: "Met à jour le bot automatiquement.",
    alias: ["maj"],
  },
  async (dest, ovl, { repondre, prenium_id }) => {
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = await git.getRemotes();
      if (!v1.some(v12 => v12.name === "origin")) {
        await git.addRemote("origin", "https://github.com/Ainz-devs/OVL-MD-V2.git");
      }
      await git.fetch();
      const v2 = await git.branch(["-r"]);
      if (!v2.all.includes("origin/main")) {
        return repondre("❌ Branche distante introuvable.");
      }
      const v3 = await git.status();
      if (!v3.behind && !v3.modified.length && !v3.created.length && !v3.deleted.length) {
        return repondre("✅ Le bot est déjà à jour.");
      }
      await repondre("⏳ Téléchargement des dernières modifications...");
      await git.reset(["--hard"]);
      await git.pull("origin", "main");
      await repondre("✅ Mise à jour réussie. Redémarrage en cours...");
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } catch (e) {
      console.error("❌ Erreur de mise à jour :", e);
      await repondre("❌ Mise à jour échouée.");
    }
  },
);
