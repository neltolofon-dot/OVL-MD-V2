const { ovlcmd, cmd } = require("../lib/ovlcmd");
const config = require("../set");
const { translate } = require("@vitalets/google-translate-api");
const prefixe = config.PREFIXE;
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { WA_CONF } = require("../DataBase/wa_conf");
const { TempMail } = require("tempmail.lol");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { exec } = require("child_process");
const AdmZip = require("adm-zip");
const os = require("os");
const pkg = require("../package");
function stylize(v1) {
  const v2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const v3 = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return v1
    .split("")
    .map(v12 => {
      const v22 = v2.indexOf(v12);
      if (v22 !== -1) {
        return v3[v22];
      } else {
        return v12;
      }
    })
    .join("");
}
const contextInfo = {
  forwardingScore: 1,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363371282577847@newsletter",
    newsletterName: "ᴏᴠʟ-ᴍᴅ-ᴠ𝟸",
  },
};
ovlcmd(
  {
    nom_cmd: "test",
    classe: "Outils",
    react: "🌟",
    desc: "Tester la connectivité du bot",
  },
  async (dest, ovl, { ms, repondre, arg }) => {
    try {
      const v1 = "./lib/theme.json";
      const v2 = fs.readFileSync(v1, "utf8");
      const v3 = JSON.parse(v2);
      const [v4] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          mention: "1",
        },
      });
      const v5 =
        "🌐 Bienvenue sur *OVL-MD-V2*, votre bot WhatsApp multi-device.\n🔍 Tapez *" +
        config.PREFIXE +
        "allmenu* pour voir toutes les commandes disponibles.\n> ©2025 OVL-MD-V2 By *AINZ*";
      let v6;
      if (v4.mention.startsWith("[")) {
        const v12 = JSON.parse(v4.mention);
        v6 = v12[Math.floor(Math.random() * v12.length)];
      } else if (v4.mention.startsWith("http://") || v4.mention.startsWith("https://")) {
        const v12 = JSON.parse(v4.mention);
        v6 = v12[Math.floor(Math.random() * v12.length)];
      } else {
        const v12 = v3.find(v13 => v13.id === v4.mention);
        if (!v12) {
          throw new Error("Thème introuvable");
        }
        v6 = v12.theme[Math.floor(Math.random() * v12.theme.length)];
      }
      if (v6.endsWith(".mp4")) {
        await ovl.sendMessage(
          dest,
          {
            video: {
              url: v6,
            },
            caption: stylize(v5),
            gifPlayback: true,
          },
          {
            quoted: ms,
          },
        );
      } else {
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v6,
            },
            caption: stylize(v5),
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      console.error("Erreur dans test:", e);
      const v1 =
        "🌐 Bienvenue sur *OVL-MD-V2*, votre bot WhatsApp multi-device.\n🔍 Tapez *" +
        config.PREFIXE +
        "menu* pour voir toutes les commandes disponibles.\n> ©2025 OVL-MD-V2 By *AINZ*";
      await ovl.sendMessage(
        dest,
        {
          text: stylize(v1),
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "description",
    classe: "Outils",
    desc: "Menu des commandes : toutes, par catégorie ou détail d’une commande.",
    alias: ["desc", "help"],
  },
  async (dest, ovl, ctx) => {
    try {
      const { arg, ms } = ctx;
      const v1 = cmd;
      if (arg.length) {
        const v12 = arg[0].toLowerCase();
        if (v12 === "all") {
          let v13 = "📚 *Toutes les commandes disponibles :*\n\n";
          v1.forEach(v14 => {
            v13 +=
              "🔹 *" +
              v14.nom_cmd +
              "* — _" +
              v14.desc +
              "_\nAlias : [" +
              v14.alias.join(", ") +
              "]\nClasse : " +
              v14.classe +
              "\n\n";
          });
          return await ovl.sendMessage(
            dest,
            {
              text: v13,
            },
            {
              quoted: ms,
            },
          );
        }
        if (v12 === "cat") {
          const v13 = [...new Set(v1.map(v14 => v14.classe))];
          let v23 = "📂 *Catégories disponibles :*\n\n";
          v13.forEach(v14 => {
            const v24 = v1.filter(v15 => v15.classe === v14);
            v23 += "📁 *" + v14 + "* (" + v24.length + ")\n";
            v24.forEach(v15 => {
              v23 += " ┗ 🧩 *" + v15.nom_cmd + "* — _" + v15.desc + "_\n";
            });
            v23 += "\n";
          });
          return await ovl.sendMessage(
            dest,
            {
              text: v23,
            },
            {
              quoted: ms,
            },
          );
        }
        if (v12.startsWith("cat=")) {
          const v13 = v12.split("cat=")[1].toLowerCase();
          const v23 = [...new Set(v1.map(v14 => v14.classe.toLowerCase()))];
          if (!v23.includes(v13)) {
            return await ovl.sendMessage(
              dest,
              {
                text:
                  '❌ Catégorie *"' +
                  v13 +
                  '"* introuvable.\nUtilise *desc cat* pour voir les catégories disponibles.',
              },
              {
                quoted: ms,
              },
            );
          }
          const v3 = v1.filter(v14 => v14.classe.toLowerCase() === v13);
          let v4 = '📁 *Commandes de la catégorie "' + v13 + '"* (' + v3.length + ") :\n\n";
          v3.forEach(v14 => {
            v4 += "🧩 *" + v14.nom_cmd + "* — _" + v14.desc + "_\nAlias : [" + v14.alias.join(", ") + "]\n\n";
          });
          return await ovl.sendMessage(
            dest,
            {
              text: v4,
            },
            {
              quoted: ms,
            },
          );
        }
        const v22 = v1.find(
          v13 => v13.nom_cmd.toLowerCase() === v12 || v13.alias.map(v14 => v14.toLowerCase()).includes(v12),
        );
        if (v22) {
          const v13 =
            "🧩 *Détails de la commande :*\n\n" +
            ("🔹 *Nom* : " + v22.nom_cmd + "\n") +
            ("📚 *Alias* : [" + v22.alias.join(", ") + "]\n") +
            ("🗂️ *Classe* : " + v22.classe + "\n") +
            ("📝 *Description* : " + v22.desc);
          return await ovl.sendMessage(
            dest,
            {
              text: v13,
            },
            {
              quoted: ms,
            },
          );
        } else {
          return await ovl.sendMessage(
            dest,
            {
              text: '❌ Commande ou alias *"' + v12 + '"* introuvable.',
            },
            {
              quoted: ms,
            },
          );
        }
      }
      const v2 =
        "📖 *Menu d'aide des commandes :*\n\n📌 *desc all* → Toutes les commandes\n📌 *desc cat=[catégorie]* → Commandes d’une seule catégorie\n📌 *desc [commande]* → Détail d'une commande spécifique\n\nExemples :\n• desc all\n• desc cat=groupe\n• desc tagall";
      await ovl.sendMessage(
        dest,
        {
          text: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur dans description :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur s’est produite dans le menu description.",
        },
        {
          quoted: ctx.ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "theme",
    classe: "Outils",
    react: "🎨",
    desc: "Gérer les thèmes disponibles",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
      }
      const v1 = "./lib/theme.json";
      const v2 = fs.readFileSync(v1, "utf8");
      const v3 = JSON.parse(v2);
      const [v4] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          mention: "1",
        },
      });
      const v5 = () => {
        const v12 = config.PREFIXE + "theme 2";
        const v22 = config.PREFIXE + "theme https://exemple.com/theme1.jpg;https://exemple.com/theme2.png";
        return ovl.sendMessage(
          dest,
          {
            text:
              "🎨 *Utilisation de la commande thème :*\n\n" +
              ("• *" + config.PREFIXE + "theme list* : Affiche la liste des thèmes disponibles\n") +
              ("• *" + config.PREFIXE + "theme <numéro>* : Applique un thème par son numéro\n") +
              ("• *" +
                config.PREFIXE +
                "theme <url>* : Utilise une ou plusieurs images personnalisées (séparées par ; )\n\n") +
              "📌 *Exemples :*\n" +
              ("- " + v12 + "\n") +
              ("- " + v22),
          },
          {
            quoted: ms,
          },
        );
      };
      if (arg.length === 0) {
        return v5();
      }
      const v6 = arg.join(" ").toLowerCase();
      if (v6 === "list") {
        let v12 = "*🎨 Liste des thèmes disponibles :*\n";
        v3.forEach((v13, v22) => {
          v12 += v22 + 1 + ". " + v13.nom + "\n";
        });
        return ovl.sendMessage(
          dest,
          {
            image: {
              url: "https://files.catbox.moe/6xlk10.jpg",
            },
            caption: v12,
          },
          {
            quoted: ms,
          },
        );
      }
      if (v6.startsWith("http://") || v6.startsWith("https://")) {
        const v12 = arg
          .join(" ")
          .split(";")
          .map(v13 => v13.trim())
          .filter(v13 => v13.length > 0);
        const v22 = /^https?:\/\/.+/i;
        for (const v13 of v12) {
          if (!v22.test(v13)) {
            return repondre("❌ URL invalide : " + v13);
          }
        }
        v4.mention = JSON.stringify(v12);
        await v4.save();
        return ovl.sendMessage(
          dest,
          {
            text: "✅ " + v12.length + " thème(s) personnalisé(s) défini(s).",
          },
          {
            quoted: ms,
          },
        );
      }
      const v7 = parseInt(v6, 10);
      if (isNaN(v7) || v7 < 1 || v7 > v3.length) {
        return ovl.sendMessage(
          dest,
          {
            text:
              "❌ Numéro invalide.\n📌 Utilise *" +
              config.PREFIXE +
              "theme list* pour voir les numéros disponibles.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v8 = v3[v7 - 1];
      const v9 = v8.id;
      v4.mention = v9;
      await v4.save();
      return ovl.sendMessage(
        dest,
        {
          text: "✅ Thème *" + v8.nom + "* sélectionné avec succès !",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur dans la commande theme :", e);
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur est survenue lors du traitement de la commande.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "menu",
    classe: "Outils",
    react: "🔅",
    desc: "Affiche le menu du bot",
  },
  async (dest, ovl, ctx) => {
    const { ms, arg } = ctx;
    try {
      const v1 = process.uptime();
      const v2 = Math.floor(v1 / 86400);
      const v3 = Math.floor((v1 / 3600) % 24);
      const v4 = Math.floor((v1 % 3600) / 60);
      const v5 = Math.floor(v1 % 60);
      let v6 = "";
      if (v2 > 0) {
        v6 += v2 + "J ";
      }
      if (v3 > 0) {
        v6 += v3 + "H ";
      }
      if (v4 > 0) {
        v6 += v4 + "M ";
      }
      if (v5 > 0) {
        v6 += v5 + "S";
      }
      const v7 = new Date();
      const v8 = v7.toLocaleDateString("fr-FR");
      const v9 = v7.toLocaleTimeString("fr-FR");
      const v10 = process.platform;
      const v11 = cmd;
      const v12 = {};
      v11.forEach(v110 => {
        if (!v12[v110.classe]) {
          v12[v110.classe] = [];
        }
        v12[v110.classe].push(v110);
      });
      const v13 = Object.keys(v12).sort((v110, v22) =>
        v110.localeCompare(v22, undefined, {
          sensitivity: "base",
        }),
      );
      v13.forEach(v110 => {
        v12[v110].sort((v111, v22) =>
          v111.nom_cmd.localeCompare(v22.nom_cmd, undefined, {
            numeric: true,
          }),
        );
      });
      let v14 = "";
      if (arg.length === 0) {
        v14 +=
          "╭──⟪ " +
          config.NOM_BOT +
          " ⟫──╮\n├ ߷ Préfixe       : " +
          config.PREFIXE +
          "\n├ ߷ Owner         : " +
          config.NOM_OWNER +
          "\n├ ߷ Commandes     : " +
          v11.length +
          "\n├ ߷ Uptime        : " +
          v6.trim() +
          "\n├ ߷ Date          : " +
          v8 +
          "\n├ ߷ Heure         : " +
          v9 +
          "\n├ ߷ Plateforme    : " +
          v10 +
          "\n├ ߷ Développeur   : AINZ\n├ ߷ Version       : " +
          pkg.version +
          "\n╰──────────────────╯\n\n";
        v14 += "╭───⟪ Catégories ⟫───╮\n";
        v13.forEach((v110, v22) => {
          v14 += "├ ߷ " + (v22 + 1) + " • " + v110 + "\n";
        });
        v14 += "╰───────────────────╯\n";
        v14 +=
          "\n💡 Tape *" +
          config.PREFIXE +
          "menu <numéro>* ou *" +
          config.PREFIXE +
          "menu <nom>* pour voir les commandes d'une catégorie.\n💡 Tape *" +
          config.PREFIXE +
          "allmenu* pour voir la liste de toutes les commandes disponibles.\n📌 Exemples :\n• *" +
          config.PREFIXE +
          "menu 1*\n• *" +
          config.PREFIXE +
          "menu outils*\n\n> ©2025 OVL-MD-V2 By *AINZ*";
      } else if (arg[0].toLowerCase() === "allmenu") {
        v14 += "╭──⟪ Toutes les commandes ⟫──╮\n";
        v11.forEach(v110 => {
          v14 += "├ ߷ [" + v110.classe + "] " + v110.nom_cmd + "\n";
        });
        v14 += "╰───────────────────────────╯\n";
      } else {
        const v110 = arg.join(" ").toLowerCase();
        let v22 = null;
        const v32 = parseInt(v110, 10);
        if (!isNaN(v32)) {
          if (v32 < 1 || v32 > v13.length) {
            return ovl.sendMessage(
              dest,
              {
                text: "Catégorie introuvable : " + arg[0],
              },
              {
                quoted: ms,
              },
            );
          }
          v22 = v13[v32 - 1];
        } else {
          v22 = v13.find(v111 => v111.toLowerCase() === v110);
          if (!v22) {
            return ovl.sendMessage(
              dest,
              {
                text: "Catégorie introuvable : " + arg.join(" "),
              },
              {
                quoted: ms,
              },
            );
          }
        }
        v14 += "╭────⟪ " + v22.toUpperCase() + " ⟫────╮\n";
        v12[v22].forEach(v111 => {
          v14 += "├ ߷ " + v111.nom_cmd + "\n";
        });
        v14 += "╰──────────────────╯\n\nTape *" + config.PREFIXE + "menu* pour revenir au menu principal.";
      }
      const [v15] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          mention: "1",
        },
      });
      const v16 = "./lib/theme.json";
      const v17 = fs.readFileSync(v16, "utf8");
      const v18 = JSON.parse(v17);
      let v19;
      if (v15.mention.startsWith("[")) {
        const v110 = JSON.parse(v15.mention);
        v19 = v110[Math.floor(Math.random() * v110.length)];
      } else if (v15.mention.startsWith("http")) {
        const v110 = JSON.parse(v15.mention);
        v19 = v110[Math.floor(Math.random() * v110.length)];
      } else {
        const v110 = v18.find(v111 => v111.id === v15.mention);
        if (!v110) {
          throw new Error();
        }
        v19 = v110.theme[Math.floor(Math.random() * v110.theme.length)];
      }
      try {
        if (v19 && v19.endsWith(".mp4")) {
          await ovl.sendMessage(
            dest,
            {
              video: {
                url: v19,
              },
              caption: stylize(v14),
              gifPlayback: true,
            },
            {
              quoted: ms,
            },
          );
        } else if (v19) {
          await ovl.sendMessage(
            dest,
            {
              image: {
                url: v19,
              },
              caption: stylize(v14),
            },
            {
              quoted: ms,
            },
          );
        } else {
          throw new Error();
        }
      } catch {
        await ovl.sendMessage(
          dest,
          {
            text: stylize(v14),
          },
          {
            quoted: ms,
          },
        );
      }
    } catch {
      await ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de la génération du menu.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "allmenu",
    classe: "Outils",
    react: "📜",
    desc: "Affiche toutes les commandes du bot",
  },
  async (dest, ovl, ctx) => {
    const { ms } = ctx;
    try {
      const v1 = process.uptime();
      const v2 = Math.floor(v1 / 86400);
      const v3 = Math.floor((v1 / 3600) % 24);
      const v4 = Math.floor((v1 % 3600) / 60);
      const v5 = Math.floor(v1 % 60);
      let v6 = "";
      if (v2 > 0) {
        v6 += v2 + "J ";
      }
      if (v3 > 0) {
        v6 += v3 + "H ";
      }
      if (v4 > 0) {
        v6 += v4 + "M ";
      }
      if (v5 > 0) {
        v6 += v5 + "S";
      }
      const v7 = new Date();
      const v8 = v7.toLocaleDateString("fr-FR");
      const v9 = v7.toLocaleTimeString("fr-FR");
      const v10 = process.platform;
      const v11 = cmd;
      const v12 = {};
      v11.forEach(v110 => {
        if (!v12[v110.classe]) {
          v12[v110.classe] = [];
        }
        v12[v110.classe].push(v110);
      });
      const v13 = Object.keys(v12).sort((v110, v22) => v110.localeCompare(v22));
      for (const v110 of v13) {
        v12[v110].sort((v111, v22) =>
          v111.nom_cmd.localeCompare(v22.nom_cmd, undefined, {
            numeric: true,
          }),
        );
      }
      let v14 =
        "╭──⟪ " +
        config.NOM_BOT +
        " ⟫──╮\n├ ߷ Préfixe       : " +
        config.PREFIXE +
        "\n├ ߷ Owner         : " +
        config.NOM_OWNER +
        "\n├ ߷ Commandes  : " +
        v11.length +
        "\n├ ߷ Uptime        : " +
        v6.trim() +
        "\n├ ߷ Date    : " +
        v8 +
        "\n├ ߷ Heure   : " +
        v9 +
        "\n├ ߷ Plateforme  : " +
        v10 +
        "\n├ ߷ Développeur : AINZ\n├ ߷ Version        : " +
        pkg.version +
        "\n╰──────────────────╯\n\n";
      for (const v110 of v13) {
        v14 += "╭──⟪ " + v110.toUpperCase() + " ⟫──╮\n";
        v12[v110].forEach(v111 => {
          v14 += "├ ߷ " + v111.nom_cmd + "\n";
        });
        v14 += "╰──────────────────╯\n\n";
      }
      v14 += "> ©2025 OVL-MD-V2 By *AINZ*";
      const [v15] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          mention: "1",
        },
      });
      const v16 = v15.mention;
      const v17 = "./lib/theme.json";
      const v18 = fs.readFileSync(v17, "utf8");
      const v19 = JSON.parse(v18);
      let v20;
      if (v15.mention.startsWith("[")) {
        const v110 = JSON.parse(v15.mention);
        v20 = v110[Math.floor(Math.random() * v110.length)];
      } else if (v15.mention.startsWith("http://") || v15.mention.startsWith("https://")) {
        const v110 = JSON.parse(v15.mention);
        v20 = v110[Math.floor(Math.random() * v110.length)];
      } else {
        const v110 = v19.find(v111 => v111.id === v15.mention);
        if (!v110) {
          throw new Error("Thème introuvable");
        }
        v20 = v110.theme[Math.floor(Math.random() * v110.theme.length)];
      }
      try {
        if (v20 && v20.endsWith(".mp4")) {
          await ovl.sendMessage(
            dest,
            {
              video: {
                url: v20,
              },
              caption: stylize(v14),
              gifPlayback: true,
            },
            {
              quoted: ms,
            },
          );
        } else if (v20) {
          await ovl.sendMessage(
            dest,
            {
              image: {
                url: v20,
              },
              caption: stylize(v14),
            },
            {
              quoted: ms,
            },
          );
        } else {
          throw new Error("Aucun thème trouvé");
        }
      } catch (e) {
        await ovl.sendMessage(
          dest,
          {
            text: stylize(v14),
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de l'affichage du menu complet.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "vv",
    classe: "Outils",
    react: "👀",
    desc: "Affiche un message envoyé en vue unique dans la discussion",
  },
  async (dest, ovl, ctx) => {
    const { ms, msg_Repondu, repondre } = ctx;
    if (!msg_Repondu) {
      return repondre("Veuillez mentionner un message en vue unique.");
    }
    let v1 = Object.keys(msg_Repondu).find(v12 => v12.startsWith("viewOnceMessage"));
    let v2 = msg_Repondu;
    if (v1) {
      v2 = msg_Repondu[v1].message;
    }
    if (v2) {
      if (
        (v2.imageMessage && v2.imageMessage.viewOnce !== true) ||
        (v2.videoMessage && v2.videoMessage.viewOnce !== true) ||
        (v2.audioMessage && v2.audioMessage.viewOnce !== true)
      ) {
        return repondre("Ce message n'est pas un message en vue unique.");
      }
    }
    try {
      let v12;
      let v22 = {
        quoted: ms,
      };
      if (v2.imageMessage) {
        v12 = await ovl.dl_save_media_ms(v2.imageMessage);
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v12,
            },
            caption: v2.imageMessage.caption || "",
          },
          v22,
        );
      } else if (v2.videoMessage) {
        v12 = await ovl.dl_save_media_ms(v2.videoMessage);
        await ovl.sendMessage(
          dest,
          {
            video: {
              url: v12,
            },
            caption: v2.videoMessage.caption || "",
          },
          v22,
        );
      } else if (v2.audioMessage) {
        v12 = await ovl.dl_save_media_ms(v2.audioMessage);
        await ovl.sendMessage(
          dest,
          {
            audio: {
              url: v12,
            },
            mimetype: "audio/mp4",
            ptt: false,
          },
          v22,
        );
      } else {
        return repondre("Ce type de message en vue unique n'est pas pris en charge.");
      }
    } catch (e) {
      console.error("❌ Erreur lors de l'envoi du message en vue unique :", e.message || e);
      return repondre("Une erreur est survenue lors du traitement du message.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "vv2",
    classe: "Outils",
    react: "👀",
    desc: "Affiche un message envoyé en vue unique en inbox",
  },
  async (dest, ovl, ctx) => {
    const { ms, id_Bot, msg_Repondu, repondre } = ctx;
    if (!msg_Repondu) {
      return repondre("Veuillez mentionner un message en vue unique.");
    }
    let v1 = Object.keys(msg_Repondu).find(v12 => v12.startsWith("viewOnceMessage"));
    let v2 = msg_Repondu;
    if (v1) {
      v2 = msg_Repondu[v1].message;
    }
    if (v2) {
      if (
        (v2.imageMessage && v2.imageMessage.viewOnce !== true) ||
        (v2.videoMessage && v2.videoMessage.viewOnce !== true) ||
        (v2.audioMessage && v2.audioMessage.viewOnce !== true)
      ) {
        return repondre("Ce message n'est pas un message en vue unique.");
      }
    }
    try {
      let v12;
      let v22 = {
        quoted: ms,
      };
      if (v2.imageMessage) {
        v12 = await ovl.dl_save_media_ms(v2.imageMessage);
        await ovl.sendMessage(
          id_Bot,
          {
            image: {
              url: v12,
            },
            caption: v2.imageMessage.caption || "",
          },
          v22,
        );
      } else if (v2.videoMessage) {
        v12 = await ovl.dl_save_media_ms(v2.videoMessage);
        await ovl.sendMessage(
          id_Bot,
          {
            video: {
              url: v12,
            },
            caption: v2.videoMessage.caption || "",
          },
          v22,
        );
      } else if (v2.audioMessage) {
        v12 = await ovl.dl_save_media_ms(v2.audioMessage);
        await ovl.sendMessage(
          id_Bot,
          {
            audio: {
              url: v12,
            },
            mimetype: "audio/mp4",
            ptt: false,
          },
          v22,
        );
      } else {
        return repondre("Ce type de message en vue unique n'est pas pris en charge.");
      }
    } catch (e) {
      console.error("❌ Erreur lors de l'envoi du message en vue unique :", e.message || e);
      return repondre("Une erreur est survenue lors du traitement du message.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "ping",
    classe: "Outils",
    react: "🏓",
    desc: "Mesure la latence du bot.",
  },
  async (dest, ovl, ctx) => {
    const v1 = Date.now();
    const v2 = await ovl.sendMessage(
      dest,
      {
        text: "*OVL-MD-V2 Ping...*",
      },
      {
        quoted: ctx.ms,
      },
    );
    const v3 = Date.now();
    const v4 = v3 - v1;
    await ovl.sendMessage(dest, {
      edit: v2.key,
      text: "*🏓 Pong ! Latence : " + v4 + "ms*",
    });
  },
);
ovlcmd(
  {
    nom_cmd: "uptime",
    classe: "Outils",
    react: "⏱️",
    desc: "Affiche le temps de fonctionnement du bot.",
    alias: ["upt"],
  },
  async (dest, ovl, ctx) => {
    const v1 = process.uptime();
    const v2 = Math.floor(v1 / 86400);
    const v3 = Math.floor((v1 / 3600) % 24);
    const v4 = Math.floor((v1 % 3600) / 60);
    const v5 = Math.floor(v1 % 60);
    let v6 = "";
    if (v2 > 0) {
      v6 += v2 + "J ";
    }
    if (v3 > 0) {
      v6 += v3 + "H ";
    }
    if (v4 > 0) {
      v6 += v4 + "M ";
    }
    if (v5 > 0) {
      v6 += v5 + "S";
    }
    await ovl.sendMessage(
      dest,
      {
        text: "⏳ Temps de fonctionnement : " + v6,
      },
      {
        quoted: ctx.ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "translate",
    classe: "Outils",
    react: "🌍",
    desc: "Traduit un texte dans la langue spécifiée.",
    alias: ["trt"],
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, msg_Repondu } = ctx;
    let v1;
    let v2;
    if (msg_Repondu && arg.length === 1) {
      v1 = arg[0];
      v2 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
    } else if (arg.length >= 2) {
      v1 = arg[0];
      v2 = arg.slice(1).join(" ");
    } else {
      return await ovl.sendMessage(
        dest,
        {
          text:
            "Utilisation : " +
            prefixe +
            "translate <langue> <texte> ou répondre à un message avec : " +
            prefixe +
            "translate <langue>",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await translate(v2, {
        to: v1,
      });
      await ovl.sendMessage(
        dest,
        {
          text: "🌐Traduction (" + v1 + ") :\n" + v12.text,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de la traduction:", e);
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la traduction. Vérifiez la langue et le texte fournis.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "capture",
    classe: "Outils",
    react: "📸",
    desc: "Prend une capture d'écran d'un site web.",
  },
  async (dest, ovl, { arg, ms }) => {
    if (!arg[0]) {
      return ovl.sendMessage(
        dest,
        {
          text: "Entrez un lien",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg[0];
    try {
      const v12 = await axios.get("https://eliteprotech-apis.zone.id/ssweb?url=" + encodeURIComponent(v1), {
        responseType: "arraybuffer",
      });
      await ovl.sendMessage(
        dest,
        {
          image: v12.data,
          caption: "Voici la capture d'écran de: " + v1,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de la capture de l'écran:", e.message);
      await ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de la capture du site. Veuillez réessayer plus tard.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "system_status",
    classe: "Outils",
    react: "🖥️",
    desc: "Affiche les informations du système en temps réel",
  },
  async (dest, ovl, ctx) => {
    const v1 = os.platform();
    const v2 = os.arch();
    const v3 = os.cpus();
    const v4 = (os.totalmem() / 1073741824).toFixed(2);
    const v5 = (os.freemem() / 1073741824).toFixed(2);
    const v6 = os.hostname();
    const v7 = os.loadavg();
    const v8 = os.uptime();
    const v9 = Math.floor(v8 / 86400);
    const v10 = Math.floor((v8 / 3600) % 24);
    const v11 = Math.floor((v8 % 3600) / 60);
    const v12 = Math.floor(v8 % 60);
    let v13 = "";
    if (v9 > 0) {
      v13 += v9 + "J ";
    }
    if (v10 > 0) {
      v13 += v10 + "H ";
    }
    if (v11 > 0) {
      v13 += v11 + "M ";
    }
    if (v12 > 0) {
      v13 += v12 + "S";
    }
    const v14 = v3
      .map(v16 => {
        let v22 = 0;
        for (type in v16.times) {
          v22 += v16.times[type];
        }
        const v32 = (100 - (v16.times.idle / v22) * 100).toFixed(2);
        return v32 + "%";
      })
      .join(", ");
    const v15 = (100 - (v7[0] * 100) / v3.length).toFixed(2);
    await ovl.sendMessage(
      dest,
      {
        text:
          "🖥️ *ÉTAT DU SYSTÈME*\n\n" +
          ("⚡ *Vitesse du serveur*: " + v15 + " %\n") +
          ("🖧 *Charge Moyenne*: " + v7.map(v16 => v16.toFixed(2)).join(", ") + "\n") +
          ("⏳ *Uptime*: " + v13.trim() + "\n") +
          ("💻 *Plateforme*: " + v1 + "\n") +
          ("🔧 *Architecture*: " + v2 + "\n") +
          ("🖧 *Processeur*: " + v3.length + " Cœur(s) (" + v14 + ")\n") +
          ("💾 *Mémoire Totale*: " + v4 + " GB\n") +
          ("🆓 *Mémoire Libre*: " + v5 + " GB\n") +
          ("🌐 *Nom de l'Hôte*: " + v6 + "\n") +
          ("🎉 *Version*: OVL-MD " + pkg.version),
      },
      {
        quoted: ctx.ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "tempmail",
    classe: "Outils",
    react: "📧",
    desc: "Crée un email temporaire.",
  },
  async (dest, ovl, ctx) => {
    const { ms } = ctx;
    try {
      const v1 = new TempMail();
      const v2 = await v1.createInbox();
      const v3 =
        "Voici votre adresse email temporaire : " +
        v2.address +
        "\n\nVotre token est : " +
        v2.token +
        "\n\nPour récupérer vos messages, utilisez <tempinbox votre-token>.";
      await ovl.sendMessage(
        dest,
        {
          text: v3,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      return ovl.sendMessage(
        dest,
        {
          text: "Une erreur s'est produite lors de la création de l'email temporaire.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "tempinbox",
    classe: "Outils",
    react: "📩",
    desc: "Récupère les messages d'un email temporaire.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    if (!arg[0]) {
      return ovl.sendMessage(dest, {
        text: "Pour récupérer les messages de votre email temporaire, fournissez le token qui a été émis.",
      });
    }
    try {
      const v1 = new TempMail();
      const v2 = await v1.checkInbox(arg[0]);
      if (!v2 || v2.length === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "Aucun message trouvé pour ce token.",
          },
          {
            quoted: ms,
          },
        );
      }
      for (let v12 = 0; v12 < v2.length; v12++) {
        const v13 = v2[v12];
        const v22 = v13.sender;
        const v3 = v13.subject;
        const v4 = new Date(v13.date).toLocaleString();
        const v5 = v13.body;
        const v6 =
          "👥 Expéditeur : " + v22 + "\n📝 Sujet : " + v3 + "\n🕜 Date : " + v4 + "\n📩 Message : " + v5;
        await ovl.sendMessage(
          dest,
          {
            text: v6,
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      console.error(e);
      return ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de la récupération des messages de l'email temporaire.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "obfuscate",
    classe: "Outils",
    react: "📥",
    desc: "Obfusque du code JavaScript",
    alias: ["obf"],
  },
  async (dest, ovl, ctx) => {
    const { arg, repondre, ms } = ctx;
    if (!arg || arg.length === 0) {
      return repondre("Veuillez fournir le code JavaScript à obfusquer.");
    }
    const v1 = arg.join(" ");
    try {
      repondre("🔄obfucation en cours...");
      const v12 = JavaScriptObfuscator.obfuscate(v1, {
        compact: true,
        controlFlowFlattening: true,
      }).getObfuscatedCode();
      const v2 = path.join(__dirname, "obfuscate.js");
      fs.writeFileSync(v2, v12);
      await ovl.sendMessage(
        dest,
        {
          document: {
            url: v2,
          },
          mimetype: "application/javascript",
          fileName: "obfuscate.js",
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v2);
    } catch (e) {
      console.error(e);
      repondre("Une erreur est survenue lors de l'obfuscation du code.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "qr",
    classe: "Outils",
    desc: "Génère un QR code pour obtenir une session_id.",
  },
  async (dest, ovl, { ms }) => {
    try {
      const v1 = await axios.get("https://ovl-web.koyeb.app/qr");
      const v2 = v1.data.qr;
      const v3 = path.join(__dirname, "qr_code.png");
      fs.writeFile(v3, v2, "base64", async v12 => {
        if (v12) {
          await ovl.sendMessage(
            dest,
            {
              text: "❌ Une erreur est survenue lors de la génération du QR code.",
            },
            {
              quoted: ms,
            },
          );
        } else {
          const v13 = await ovl.sendMessage(dest, {
            image: {
              url: v3,
            },
          });
          await ovl.sendMessage(
            dest,
            {
              text: "✅ Scannez ce QR code dans *WhatsApp > Appareils connectés > Connecter un appareil*.",
            },
            {
              quoted: v13,
            },
          );
        }
      });
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur est survenue lors de la génération du QR code.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "pair",
    classe: "Outils",
    desc: "Génère un pair_code pour obtenir une session_id",
  },
  async (dest, ovl, { arg, ms }) => {
    if (!arg.length) {
      return await ovl.sendMessage(
        dest,
        {
          text: "❌ Veuillez entrer un numéro de téléphone. Exemple :\n\n`pair 226XXXXXXXX`",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg.join(" ");
    try {
      const v12 = await axios.get("https://ovl-web.koyeb.app/code?number=" + v1);
      const v2 = v12.data.code || "indisponible";
      const v3 = await ovl.sendMessage(dest, {
        text: v2,
      });
      await ovl.sendMessage(
        dest,
        {
          text: "✅ Entrez ce code dans *WhatsApp > Appareils connectés > Connecter un appareil > Appairer avec un code*.",
        },
        {
          quoted: v3,
        },
      );
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur est survenue lors de la génération du code.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "gitclone",
    classe: "Outils",
    react: "📥",
    desc: "clone un repo Git",
    alias: ["gcl"],
  },
  async (dest, ovl, ctx) => {
    const { arg, repondre, ms } = ctx;
    if (!arg || arg.length < 1) {
      return repondre("Veuillez fournir l'URL du dépôt Git à cloner.");
    }
    const v1 = arg[0];
    const v2 = v1 + ".git";
    const v3 = arg[1] ? arg[1] : path.basename(v2, ".git");
    const v4 = v3 + ".zip";
    const v5 = /^(https?:\/\/|git@)([\w.@:\/-]+)(\.git)(\/?)$/;
    if (!v5.test(v2)) {
      return repondre("URL de dépôt Git invalide.");
    }
    try {
      repondre("🔄Clonage du dépôt en cours...");
      exec("git clone " + v2 + " " + v3, (v12, v22, v32) => {
        if (v12) {
          return repondre("Erreur lors du clonage du dépôt : " + v12.message);
        }
        try {
          const v13 = new AdmZip();
          v13.addLocalFolder(v3);
          v13.writeZip(v4);
          const v23 = {
            document: fs.readFileSync(v4),
            mimetype: "application/zip",
            fileName: v3 + ".zip",
          };
          ovl.sendMessage(dest, v23, {
            quoted: ms,
          });
          fs.rmSync(v3, {
            recursive: true,
            force: true,
          });
          fs.unlinkSync(v4);
        } catch (e) {
          repondre("Erreur lors de la compression en zip : " + e.message);
        }
      });
    } catch (e) {
      console.error(e);
      repondre("Une erreur est survenue lors du clonage du dépôt.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "owner",
    classe: "Outils",
    react: "🔅",
    desc: "Numero du propriétaire du bot",
  },
  async (dest, ovl, ctx) => {
    const v1 =
      "BEGIN:VCARD\nVERSION:3.0\nFN:" +
      config.NOM_OWNER +
      "\nORG:undefined;\nTEL;type=CELL;type=VOICE;waid=" +
      config.NUMERO_OWNER +
      ":+" +
      config.NUMERO_OWNER +
      "\nEND:VCARD";
    ovl.sendMessage(
      dest,
      {
        contacts: {
          displayName: config.NOM_OWNER,
          contacts: [
            {
              vcard: v1,
            },
          ],
        },
      },
      {
        quoted: ctx.ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "developpeur",
    classe: "Outils",
    react: "🔅",
    desc: "Contact du propriétaire de ce bot",
    alias: ["dev"],
  },
  async (dest, ovl, ctx) => {
    const v1 = config.NUMERO_OWNER;
    const v2 = config.NOM_OWNER;
    if (!v1) {
      return ctx.repondre(
        "ℹ️ Aucun contact configuré : renseignez NUMERO_OWNER et NOM_OWNER dans le fichier .env.",
      );
    }
    const v3 =
      "BEGIN:VCARD\nVERSION:3.0\nFN:" +
      v2 +
      "\nORG:undefined;\nTEL;type=CELL;type=VOICE;waid=" +
      v1 +
      ":+" +
      v1 +
      "\nEND:VCARD";
    ovl.sendMessage(
      dest,
      {
        contacts: {
          displayName: v2,
          contacts: [
            {
              vcard: v3,
            },
          ],
        },
      },
      {
        quoted: ctx.ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "support",
    classe: "Outils",
    react: "📩",
    desc: "Lien vers les groupes de support du bot",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, repondre, auteur_Message, ms } = ctx;
    const v1 = [
      "https://chat.whatsapp.com/HzhikAmOuYhFXGLmcyMo62",
      "https://chat.whatsapp.com/BP1oOMh0QvR7H3vvO9bRYK",
    ];
    const v2 =
      "📩 *OVL-MD SUPPORT*\nVoici les liens pour rejoindre les groupes de support:\n\n" +
      v1.map(v12 => "🔗 " + v12).join("\n\n");
    if (verif_Groupe) {
      await repondre("📩 Les liens d'invitation ont été envoyés en message privé.");
      await ovl.sendMessage(
        auteur_Message,
        {
          text: v2,
        },
        {
          quoted: ms,
        },
      );
    } else {
      await ovl.sendMessage(
        dest,
        {
          text: v2,
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "repo",
    alias: ["sc", "script", "code_source", "repository"],
    classe: "Outils",
    react: "📦",
    desc: "Affiche les informations et le lien du repository du bot",
  },
  async (dest, ovl, { ms, repondre }) => {
    const v1 = "https://github.com/Ainz-devs/OVL-MD-V2";
    let v2;
    try {
      const { data } = await axios.get("https://api.github.com/repos/Ainz-devs/OVL-MD-V2");
      v2 =
        "\n╭───⟪ 📦 OVL-MD-V2 ⟫───╮\n│ ⇨ ⭐ Stars       : " +
        data.stargazers_count +
        "\n│ ⇨ 🍴 Forks       : " +
        data.forks_count +
        "\n│ ⇨ 🔄 Dernière MAJ : " +
        new Date(data.pushed_at).toLocaleDateString("fr-FR") +
        "\n│ ⇨ 🔗 Repo        : " +
        data.html_url +
        "\n╰───────────────────╯\n> ©2025 ᴏᴠʟ-ᴍᴅ-ᴠ2 ʙʏ *ᴀɪɴᴢ*";
    } catch (e) {
      console.error("Erreur récupération API :", e);
      v2 =
        "\n╭───⟪ 📦 OVL-MD-V2 ⟫───╮\n│ 🔗 Repo : " +
        v1 +
        "\n╰───────────────────╯\n> ©2025 ᴏᴠʟ-ᴍᴅ-ᴠ2 ʙʏ *ᴀɪɴᴢ*";
    }
    try {
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: "https://files.catbox.moe/lojrxz.jpg",
          },
          caption: v2,
          contextInfo,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur envoi avec image :", e);
      await ovl.sendMessage(
        dest,
        {
          text: v2,
          contextInfo,
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
