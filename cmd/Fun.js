const { ovlcmd } = require("../lib/ovlcmd");
const fancy = require("../lib/style");
const config = require("../set");
const fs = require("fs");
const axios = require("axios");
const { levels } = require("../DataBase/levels");
const { Ranks } = require("../DataBase/rank");
ovlcmd(
  {
    nom_cmd: "fliptext",
    classe: "Fun",
    desc: "Inverse le texte fourni.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    const v1 = arg.join(" ");
    if (!v1) {
      return await ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un texte à inverser !",
        },
        {
          quoted: ms,
        },
      );
    }
    const v2 = v1.split("").reverse().join("");
    await ovl.sendMessage(
      dest,
      {
        text: v2,
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "readmore",
    classe: "Fun",
    desc: "Ajoute un effet 'voir plus' au texte.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    const v1 = arg.join(" ");
    if (!v1) {
      return await ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un texte",
        },
        {
          quoted: ms,
        },
      );
    }
    const v2 = "" + v1.split(" ").join(" ") + String.fromCharCode(8206).repeat(4001);
    await ovl.sendMessage(
      dest,
      {
        text: v2,
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "ship",
    classe: "Fun",
    desc: "Test de compatibilité entre deux personnes",
    alias: ["match"],
  },
  async (dest, ovl, ctx) => {
    const { auteur_Msg_Repondu, auteur_Message, arg, ms, getJid } = ctx;
    let v1;
    let v2;
    if (arg.length >= 2 && arg[0].includes("@") && arg[1].includes("@")) {
      v1 = arg[0].replace("@", "") + "@lid";
      v2 = arg[1].replace("@", "") + "@lid";
    } else if (arg.length >= 1 && arg[0].includes("@") && auteur_Msg_Repondu) {
      v1 = arg[0].replace("@", "") + "@lid";
      v2 = auteur_Msg_Repondu;
    } else if (auteur_Msg_Repondu) {
      v1 = auteur_Message;
      v2 = auteur_Msg_Repondu;
    } else {
      return await ovl.sendMessage(
        dest,
        {
          text: "Mentionne deux personnes",
        },
        {
          quoted: ms,
        },
      );
    }
    const v3 = await getJid(v1, dest, ovl);
    const v4 = await getJid(v2, dest, ovl);
    const v5 = Math.floor(Math.random() * 101);
    let v6;
    if (v5 <= 30) {
      v6 = "💔 Pas vraiment compatibles... 😢";
    } else if (v5 <= 70) {
      v6 = "🤔 Il y a du potentiel, mais cela demande du travail !";
    } else {
      v6 = "💖 Vous êtes faits l'un pour l'autre ! 🌹";
    }
    await ovl.sendMessage(
      dest,
      {
        text:
          "💘 *Ship*\n\n@" +
          v3.split("@")[0] +
          " & @" +
          v4.split("@")[0] +
          ", " +
          v6 +
          "\n💖 Compatibilité : *" +
          v5 +
          "%*",
        mentions: [v3, v4],
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "couplepp",
    classe: "Fun",
    desc: "Envoie des photos de couple animées.",
    alias: ["cpp"],
  },
  async (dest, ovl, ctx) => {
    try {
      const { data } = await axios.get("https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json");
      const v1 = data[Math.floor(Math.random() * data.length)];
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v1.female,
          },
          caption: "❤️ *Pour Madame 💁🏻‍♀️*",
        },
        {
          quoted: ctx.ms,
        },
      );
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v1.male,
          },
          caption: "❤️ *Pour Monsieur 💁🏻‍♂️*",
        },
        {
          quoted: ctx.ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de la récupération des données :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "❗ Impossible de récupérer les images. Réessaie plus tard.",
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
    nom_cmd: "fancy",
    classe: "Fun",
    react: "✍️",
    desc: "Applique un style fancy au texte",
  },
  async (dest, ovl, ctx) => {
    const { arg, repondre } = ctx;
    const v1 = config.PREFIXE;
    if (arg.length === 0) {
      return await repondre(
        "Utilisation :\n" +
          (v1 + "fancy <ID> <texte> — Appliquer un style au texte\n") +
          (v1 + "fancy list [nom] — Lister les styles disponibles (optionnel : filtrer par nom)\n\n") +
          ("Exemple : " + v1 + "fancy 3 Hello World\n") +
          ("Exemple pour la liste : " + v1 + "fancy list ovl\n\n"),
      );
    }
    if (arg[0].toLowerCase() === "list") {
      const v12 = arg[1] || "OVL-MD-V2";
      return await repondre(fancy.list(v12, fancy));
    }
    const v2 = parseInt(arg[0], 10);
    const v3 = arg.slice(1).join(" ");
    if (isNaN(v2) || !v3) {
      return await repondre(
        "❌ Arguments invalides.\n" +
          ("Utilisation : " + v1 + "fancy <ID> <texte>\n") +
          ("Pour voir la liste des styles : " + v1 + "fancy list"),
      );
    }
    try {
      const v12 = Object.keys(fancy).filter(v13 => v13.length < 3);
      const v22 = v12[v2 - 1];
      if (!v22) {
        return await repondre("_Style introuvable pour l'ID : " + v2 + "_");
      }
      const v32 = fancy[v22];
      return await repondre(fancy.apply(v32, v3));
    } catch {
      return await repondre("_Une erreur s'est produite :(_");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "blague",
    classe: "Fun",
    react: "😂",
    desc: "Renvoie une blague",
  },
  async (dest, ovl, ctx) => {
    try {
      let v1 = "https://v2.jokeapi.dev/joke/Any?lang=fr";
      let v2 = await axios.get(v1);
      let v3 = v2.data;
      if (v3.type === "single") {
        ovl.sendMessage(
          dest,
          {
            text: "*Blague du jour :* " + v3.joke,
          },
          {
            quoted: ctx.ms,
          },
        );
      } else if (v3.type === "twopart") {
        ovl.sendMessage(
          dest,
          {
            text: "*Blague du jour :* " + v3.setup + "\n\n*Réponse :* " + v3.delivery,
          },
          {
            quoted: ctx.ms,
          },
        );
      } else {
        ovl.sendMessage(
          dest,
          {
            text: "Désolé, je n'ai pas trouvé de blague à vous raconter.",
          },
          {
            quoted: ctx.ms,
          },
        );
      }
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Une erreur s'est produite lors de la récupération de la blague.",
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
    nom_cmd: "citation",
    classe: "Fun",
    react: "💬",
    desc: "Renvoie une citation",
  },
  async (dest, ovl) => {
    try {
      const v1 = "https://kaamelott.chaudie.re/api/random";
      const v2 = await axios.get(v1);
      const v3 = v2.data;
      if (v3.status === 1 && v3.citation) {
        const v12 = v3.citation.citation;
        const v22 = v3.citation.infos.auteur || "Inconnu";
        const v32 = v3.citation.infos.personnage || "Personnage inconnu";
        const v4 = v3.citation.infos.saison || "Saison inconnue";
        const v5 = v3.citation.infos.episode || "Épisode inconnu";
        const v6 =
          '*Citation du jour :*\n"' +
          v12 +
          '"\n\n*Auteur :* ' +
          v22 +
          "\n*Personnage :* " +
          v32 +
          "\n*Saison :* " +
          v4 +
          "\n*Épisode :* " +
          v5;
        ovl.sendMessage(dest, {
          text: v6,
        });
      } else {
        ovl.sendMessage(dest, {
          text: "Désolé, je n'ai pas trouvé de citation à vous donner.",
        });
      }
    } catch (e) {
      ovl.sendMessage(dest, {
        text: "Une erreur s'est produite lors de la récupération de la citation.",
      });
    }
  },
);
ovlcmd(
  {
    nom_cmd: "rank",
    classe: "Fun",
    react: "🏆",
    desc: "Affiche le rang d'un utilisateur selon ses messages envoyés et gère l'activation/désactivation globale du level up.",
  },
  async (dest, ovl, ctx) => {
    const { arg, auteur_Message, getJid, auteur_Msg_Repondu, ms } = ctx;
    const v1 =
      (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid") || auteur_Msg_Repondu || auteur_Message;
    const v2 = await getJid(v1, dest, ovl);
    let v3;
    try {
      v3 = await ovl.profilePictureUrl(v2, "image");
    } catch {
      v3 = "https://files.catbox.moe/ulwqtr.jpg";
    }
    const v4 = await Ranks.findAll({
      order: [["messages", "DESC"]],
    });
    const v5 = await Ranks.findOne({
      where: {
        id: v2,
      },
    });
    if (!v5) {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas encore de rang. Commencez à interagir pour en obtenir un !",
        },
        {
          quoted: ms,
        },
      );
    }
    const { name, level, exp, messages } = v5;
    const v6 = levels[level] ? levels[level + 1].expRequired : "Max";
    const v7 = v4.findIndex(v12 => v12.id === v2) + 1;
    const v8 = v4.length;
    const v9 =
      "╭───🏆 *OVL-RANK* 🏆───╮\n┃ 🏷️ *Nom :* " +
      (name || "Inconnu") +
      "\n┃ 🥇 *Classement :* " +
      v7 +
      "/" +
      v8 +
      "\n┃ 🔰 *Niveau :* " +
      level +
      "\n┃ 🏅 *Titre :* " +
      (levels[level - 1]?.name || "OVL-GOD-LEVEL") +
      " \n┃ 📊 *EXP :* " +
      exp +
      "/" +
      (v6 || "Max") +
      "\n┃ ✉️ *Messages :* " +
      messages +
      "\n╰──────────────────╯";
    await ovl.sendMessage(
      dest,
      {
        image: {
          url: v3,
        },
        caption: v9,
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "toprank",
    classe: "Fun",
    react: "🥇",
    desc: "Voir les meilleurs utilisateurs",
  },
  async (dest, ovl, ctx) => {
    const v1 = await Ranks.findAll({
      order: [["messages", "DESC"]],
      limit: 10,
    });
    if (v1.length === 0) {
      return ovl.sendMessage(
        dest,
        {
          text: "Aucune donnée disponible pour le moment.",
        },
        {
          quoted: ctx.ms,
        },
      );
    }
    let v2 = "\n╭──🏆 *OVL-TOP-RANK* 🏆──╮";
    v1.forEach((v12, v22) => {
      const v3 = ("" + (v22 + 1)).padStart(2, " ");
      v2 +=
        "┃ " +
        v3 +
        ". 🏷️ *Nom :* " +
        (v12.name || "Inconnu") +
        "\n┃    ✉️ *Messages :* " +
        v12.messages +
        "\n┃    🔰 *Niveau :* " +
        v12.level +
        " (" +
        (levels[v12.level - 1]?.name || "OVL-GOD-LEVEL") +
        ")\n┃\n";
    });
    v2 += "╰───────────────────╯";
    await ovl.sendMessage(
      dest,
      {
        text: v2,
      },
      {
        quoted: ctx.ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "profile",
    classe: "Fun",
    react: "👤",
    desc: "Affiche le nom, le numéro et la bio d'un utilisateur",
  },
  async (dest, ovl, { msg_Repondu, ms, auteur_Message, arg, getJid, auteur_Msg_Repondu }) => {
    const v1 =
      (arg[0]?.includes("@") && arg[0].replace("@", "") + "@s.whatsapp.net") ||
      auteur_Msg_Repondu ||
      auteur_Message;
    const v2 = await getJid(v1, dest, ovl);
    let v3;
    try {
      v3 = await ovl.profilePictureUrl(v2, "image");
    } catch {
      v3 = "https://files.catbox.moe/ulwqtr.jpg";
    }
    const v4 = await Ranks.findOne({
      where: {
        id: v2,
      },
    });
    const v5 = v4?.name || "Inconnu";
    const v6 = v2.split("@")[0];
    let v7 = "Pas de bio";
    try {
      const v12 = await ovl.fetchStatus(v2);
      if (v12.length > 0 && v12[0].status) {
        v7 = typeof v12[0].status === "string" ? v12[0].status : v12[0].status.status || "Pas de bio";
      }
    } catch {}
    const v8 = "👤 Nom: " + v5 + "\n📱 Numéro: " + v6 + "\n💬 Bio: " + v7;
    await ovl.sendMessage(
      dest,
      {
        image: {
          url: v3,
        },
        caption: v8,
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "fake",
    classe: "Fun",
    react: "📝",
    desc: "Envoie un message fake comme si un autre utilisateur l'avait envoyé",
  },
  async (dest, ovl, { ms, arg, getJid }) => {
    if (!arg[0] || !arg.join(" ").includes("/")) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Usage: fake @user fake_message / bot_message",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg[0].replace("@", "") + "@lid";
    const v2 = await getJid(v1, dest, ovl);
    const v3 = arg.slice(1).join(" ");
    const [v4, v5] = v3.split("/").map(v12 => v12.trim());
    const v6 = {
      key: {
        fromMe: false,
        participant: v2,
        remoteJid: v2,
      },
      message: {
        extendedTextMessage: {
          text: v4,
          contextInfo: {
            mentionedJid: [],
          },
        },
      },
    };
    await ovl.sendMessage(
      dest,
      {
        text: v5,
      },
      {
        quoted: v6,
      },
    );
  },
);
