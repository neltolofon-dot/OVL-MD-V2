const { ovlcmd } = require("../lib/ovlcmd");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { Antilink } = require("../DataBase/antilink");
const { Antitag } = require("../DataBase/antitag");
const { Antibot } = require("../DataBase/antibot");
const { GroupSettings, Events2 } = require("../DataBase/events");
const fs = require("fs");
const { setWarn, delWarn, getLimit, setLimit } = require("../DataBase/warn");
const { Antimention } = require("../DataBase/antimention");
const { Ranks } = require("../DataBase/rank");
const { Antispam } = require("../DataBase/antispam");
ovlcmd(
  {
    nom_cmd: "tagall",
    classe: "Groupe",
    react: "💬",
    desc: "Commande pour taguer tous les membres d'un groupe",
  },
  async (dest, ovl, ctx) => {
    try {
      const {
        ms,
        repondre: repondre2,
        arg,
        mbre_membre,
        verif_Groupe,
        infos_Groupe,
        nom_Auteur_Message,
        verif_Admin,
      } = ctx;
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes");
      }
      const v1 = arg && arg.length > 0 ? arg.join(" ") : "";
      let v2 = "╭───〔  TAG ALL 〕───⬣\n";
      v2 += "│👤 Auteur : *" + nom_Auteur_Message + "*\n";
      v2 += "│💬 Message : *" + v1 + "*\n│\n";
      mbre_membre.forEach(v12 => {
        v2 += "│◦❒ @" + v12.id.split("@")[0] + "\n";
      });
      v2 += "╰═══════════════⬣\n";
      if (verif_Admin) {
        await ovl.sendMessage(
          dest,
          {
            text: v2,
            mentions: mbre_membre.map(v12 => v12.id),
          },
          {
            quoted: ms,
          },
        );
      } else {
        repondre2("Seuls les administrateurs peuvent utiliser cette commande");
      }
    } catch (e) {
      console.error("Erreur lors de l'envoi du message avec tagall :", e);
    }
  },
);
ovlcmd(
  {
    nom_cmd: "tagadmin",
    classe: "Groupe",
    react: "💬",
    desc: "Commande pour taguer tous les administrateurs d'un groupe",
  },
  async (dest, ovl, ctx) => {
    try {
      const {
        ms,
        repondre: repondre2,
        arg,
        verif_Groupe,
        mbre_membre,
        infos_Groupe,
        nom_Auteur_Message,
        verif_Admin,
      } = ctx;
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes");
      }
      const v1 = arg && arg.length > 0 ? arg.join(" ") : "";
      const v2 = mbre_membre.filter(v12 => v12.admin).map(v12 => v12.id);
      if (v2.length === 0) {
        return repondre2("Aucun administrateur trouvé dans ce groupe.");
      }
      let v3 = "╭───〔  TAG ADMINS 〕───⬣\n";
      v3 += "│👤 Auteur : *" + nom_Auteur_Message + "*\n";
      v3 += "│💬 Message : *" + v1 + "*\n│\n";
      mbre_membre.forEach(v12 => {
        if (v12.admin) {
          v3 += "│◦❒ @" + v12.id.split("@")[0] + "\n";
        }
      });
      v3 += "╰═══════════════⬣\n";
      if (verif_Admin) {
        await ovl.sendMessage(
          dest,
          {
            text: v3,
            mentions: v2,
          },
          {
            quoted: ms,
          },
        );
      } else {
        repondre2("Seuls les administrateurs peuvent utiliser cette commande");
      }
    } catch (e) {
      console.error("Erreur lors de l'envoi du message avec tagadmins :", e);
    }
  },
);
ovlcmd(
  {
    nom_cmd: "tag",
    classe: "Groupe",
    react: "💬",
    alias: ["htag", "hidetag"],
    desc: "partager un message à tous les membres d'un groupe",
  },
  async (dest, ovl, ctx) => {
    const { repondre: repondre2, msg_Repondu, verif_Groupe, infos_Groupe, arg, verif_Admin, ms } = ctx;
    if (!verif_Groupe) {
      repondre2("Cette commande ne fonctionne que dans les groupes");
      return;
    }
    if (verif_Admin) {
      let v1 = infos_Groupe;
      let v2 = v1.participants.map(v12 => v12.id);
      let v3;
      if (msg_Repondu) {
        if (msg_Repondu.imageMessage) {
          let v12 = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
          v3 = {
            image: {
              url: v12,
            },
            caption: msg_Repondu.imageMessage.caption,
            mentions: v2,
          };
        } else if (msg_Repondu.videoMessage) {
          let v12 = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
          v3 = {
            video: {
              url: v12,
            },
            caption: msg_Repondu.videoMessage.caption,
            mentions: v2,
          };
        } else if (msg_Repondu.audioMessage) {
          let v12 = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
          v3 = {
            audio: {
              url: v12,
            },
            mimetype: "audio/mp4",
            mentions: v2,
          };
        } else if (msg_Repondu.stickerMessage) {
          let v12 = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
          let v22 = new Sticker(v12, {
            pack: "OVL-MD Hidtag",
            type: StickerTypes.FULL,
            quality: 80,
            background: "transparent",
          });
          const v32 = await v22.toBuffer();
          v3 = {
            sticker: v32,
            mentions: v2,
          };
        } else {
          v3 = {
            text: msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text,
            mentions: v2,
          };
        }
        ovl.sendMessage(dest, v3, {
          quoted: ms,
        });
      } else {
        if (!arg || !arg[0]) {
          repondre2("Veuillez inclure ou mentionner un message à partager.");
          return;
        }
        ovl.sendMessage(
          dest,
          {
            text: arg.join(" "),
            mentions: v2,
          },
          {
            quoted: ms,
          },
        );
      }
    } else {
      repondre2("Cette commande est réservée aux administrateurs du groupe");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "poll",
    classe: "Groupe",
    react: "📊",
    desc: "Crée un sondage dans le groupe(plusieurs votés autorisé).",
  },
  async (dest, ovl, ctx) => {
    try {
      const {
        ms,
        repondre: repondre2,
        arg,
        verif_Groupe,
        infos_Groupe,
        nom_Auteur_Message,
        verif_Admin,
      } = ctx;
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes.");
      }
      let [v1, v2] = arg.join(" ").split(";");
      if (!v2) {
        return repondre2(
          "Veuillez fournir une question suivie des options, séparées par des virgules. Exemple : poll question;option1,option2,option3",
        );
      }
      let v3 = v2
        .split(",")
        .map(v12 => v12.trim())
        .filter(v12 => v12.length > 0);
      if (v3.length < 2) {
        return repondre2("Le sondage doit contenir au moins deux options.");
      }
      if (verif_Admin) {
        await ovl.sendMessage(
          dest,
          {
            poll: {
              name: v1,
              values: v3,
            },
          },
          {
            quoted: ms,
          },
        );
      } else {
        repondre2("Seuls les administrateurs peuvent utiliser cette commande.");
      }
    } catch (e) {
      console.error("Erreur lors de l'envoi du sondage :", e);
      repondre("Une erreur est survenue lors de la création du sondage.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "poll2",
    classe: "Groupe",
    react: "📊",
    desc: "Crée un sondage dans le groupe(un seul vote autorisé).",
  },
  async (dest, ovl, ctx) => {
    try {
      const {
        ms,
        repondre: repondre2,
        arg,
        verif_Groupe,
        infos_Groupe,
        nom_Auteur_Message,
        verif_Admin,
      } = ctx;
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes.");
      }
      let [v1, v2] = arg.join(" ").split(";");
      if (!v2) {
        return repondre2(
          "Veuillez fournir une question suivie des options, séparées par des virgules. Exemple : poll question;option1,option2,option3",
        );
      }
      let v3 = v2
        .split(",")
        .map(v12 => v12.trim())
        .filter(v12 => v12.length > 0);
      if (v3.length < 2) {
        return repondre2("Le sondage doit contenir au moins deux options.");
      }
      if (verif_Admin) {
        await ovl.sendMessage(
          dest,
          {
            poll: {
              name: v1,
              values: v3,
              selectableCount: 1,
            },
          },
          {
            quoted: ms,
          },
        );
      } else {
        repondre2("Seuls les administrateurs peuvent utiliser cette commande.");
      }
    } catch (e) {
      console.error("Erreur lors de l'envoi du sondage :", e);
      repondre("Une erreur est survenue lors de la création du sondage.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "kick",
    classe: "Groupe",
    react: "🛑",
    desc: "Supprime un membre du groupe.",
  },
  async (dest, ovl, ctx) => {
    const {
      verif_Groupe,
      getJid,
      auteur_Msg_Repondu,
      arg,
      infos_Groupe,
      verif_Admin,
      verif_Ovl_Admin,
      prenium_id,
      dev_num,
      ms,
    } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (prenium_id || verif_Admin) {
      const v1 = await infos_Groupe.participants;
      const v2 = v1.filter(v12 => v12.admin).map(v12 => v12.jid);
      const v3 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
      const v4 = await getJid(v3, dest, ovl);
      if (!verif_Ovl_Admin) {
        return ovl.sendMessage(
          dest,
          {
            text: "Je dois être administrateur pour effectuer cette action.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!v4 || !v1.find(v12 => v12.jid === v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "Membre introuvable dans ce groupe.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (v2.includes(v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "Impossible d'exclure un administrateur du groupe.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (dev_num.includes(v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vous ne pouvez pas exclure un développeur.",
          },
          {
            quoted: ms,
          },
        );
      }
      try {
        await ovl.groupParticipantsUpdate(dest, [v4], "remove");
        ovl.sendMessage(
          dest,
          {
            text: "@" + v4.split("@")[0] + " a été exclu.",
            mentions: [v4],
          },
          {
            quoted: ms,
          },
        );
      } catch (e) {
        console.error("Erreur :", e);
        ovl.sendMessage(
          dest,
          {
            text: "Une erreur est survenue lors de l'exclusion.",
          },
          {
            quoted: ms,
          },
        );
      }
    } else {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas la permission d'utiliser cette commande.",
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
    nom_cmd: "kickall",
    classe: "Groupe",
    react: "🛑",
    desc: "Supprime tous les membres non administrateurs du groupe.",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, infos_Groupe, ms, auteur_Message, verif_Ovl_Admin, dev_num, id_Bot, getJid } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = infos_Groupe.participants;
    let v2 = v1.find(v12 => v12.admin === "superadmin")?.jid;
    if (!v2) {
      v2 = v1[0]?.jid;
    }
    if (![v2, id_Bot, ...dev_num].includes(auteur_Message)) {
      return ovl.sendMessage(
        dest,
        {
          text: "Seul le créateur du groupe ou le propriétaire du bot peut utiliser cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je dois être administrateur pour effectuer cette action.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v3 = await GroupSettings.findOne({
      where: {
        id: dest,
      },
    });
    if (v3?.goodbye === "oui") {
      return ovl.sendMessage(
        dest,
        {
          text: "Désactivez le goodbye message (goodbye off) avant de continuer.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v4 = v1.filter(v12 => !v12.admin && !dev_num.includes(v12.jid)).map(v12 => v12.jid);
    if (v4.length === 0) {
      return ovl.sendMessage(
        dest,
        {
          text: "Aucun membre non administrateur à exclure.",
        },
        {
          quoted: ms,
        },
      );
    }
    await ovl.sendMessage(
      dest,
      {
        text: "⚠️ Kickall va commencer dans 5 secondes.\nEnvoyez 'stop' pour annuler.",
      },
      {
        quoted: ms,
      },
    );
    await new Promise(v12 => setTimeout(v12, 5000));
    let v5 = false;
    for (const v12 of v4) {
      const v13 = await ovl.recup_msg({
        ms_org: dest,
        temps: 300000,
      });
      const v22 = (v13?.message?.conversation || v13?.message?.extendedTextMessage?.text || "")
        .trim()
        .toLowerCase();
      const v32 = v13?.key?.participant || v13?.key?.remoteJid;
      const v42 = await getJid(v32, dest, ovl);
      if (v22 === "stop" && [v2, id_Bot, ...dev_num].includes(v42)) {
        v5 = true;
        await ovl.sendMessage(
          dest,
          {
            text: "⛔ Kickall annulé !",
          },
          {
            quoted: ms,
          },
        );
        break;
      }
      try {
        await ovl.groupParticipantsUpdate(dest, [v12], "remove");
        await new Promise(v14 => setTimeout(v14, 500));
      } catch (e) {
        console.error("Erreur exclusion " + v12 + " :", e);
      }
    }
    if (!v5) {
      ovl.sendMessage(
        dest,
        {
          text: "✅ " + v4.length + " membre(s) ont été exclus.",
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
    nom_cmd: "kickall2",
    classe: "Groupe",
    react: "🚫",
    desc: "Exclut tous les membres non administrateurs d’un coup.",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Ovl_Admin, infos_Groupe, dev_num, ms, auteur_Message, id_Bot } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = infos_Groupe.participants;
    let v2 = v1.find(v12 => v12.admin === "superadmin")?.jid;
    if (!v2) {
      v2 = v1[0]?.jid;
    }
    if (![v2, id_Bot, ...dev_num].includes(auteur_Message)) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Seul le superadmin, le créateur du groupe, le créateur du bot ou un dev peut utiliser cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Je dois être administrateur pour effectuer cette action.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v3 = await GroupSettings.findOne({
      where: {
        id: dest,
      },
    });
    if (v3?.goodbye === "oui") {
      return ovl.sendMessage(dest, {
        text: "❗ Désactivez d’abord le message de départ (goodbye off).",
        quoted: ms,
      });
    }
    const v4 = v1.filter(v12 => !v12.admin && !dev_num.includes(v12.jid)).map(v12 => v12.jid);
    if (v4.length === 0) {
      return ovl.sendMessage(
        dest,
        {
          text: "✅ Aucun membre non administrateur à exclure.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      await ovl.groupParticipantsUpdate(dest, v4, "remove");
      ovl.sendMessage(dest, {
        text: "✅ " + v4.length + " membre(s) ont été exclus.",
        quoted: ms,
      });
    } catch (e) {
      console.error("❌ Erreur exclusion en masse :", e);
      ovl.sendMessage(
        dest,
        {
          text: "❌ Échec de l’exclusion en masse. Certains membres n’ont peut-être pas été retirés.",
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
    nom_cmd: "ckick",
    classe: "Groupe",
    react: "🛑",
    desc: "Supprime tous les membres non administrateurs dont le JID commence par un indicatif spécifique.",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Ovl_Admin, infos_Groupe, arg, dev_num, ms, auteur_Message, id_Bot } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = infos_Groupe.participants;
    let v2 = v1.find(v12 => v12.admin === "superadmin")?.jid;
    if (!v2) {
      v2 = v1[0]?.jid;
    }
    if (![v2, id_Bot, ...dev_num].includes(auteur_Message)) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Seul le superadmin, le créateur du groupe, le créateur du bot ou un dev peut utiliser cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!arg[0]) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez spécifier l'indicatif.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je dois être administrateur pour effectuer cette action.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v3 = await GroupSettings.findOne({
      where: {
        id: dest,
      },
    });
    if (v3?.goodbye === "oui") {
      return ovl.sendMessage(
        dest,
        {
          text: "Désactivez le goodbye message (goodbye off) avant de continuer.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v4 = arg[0];
    const v5 = v1
      .filter(v12 => v12.jid.startsWith(v4) && !v12.admin && !dev_num.includes(v12.jid))
      .map(v12 => v12.jid);
    if (v5.length === 0) {
      return ovl.sendMessage(
        dest,
        {
          text: "Aucun membre non admin avec l'indicatif " + v4 + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    for (const v12 of v5) {
      try {
        await ovl.groupParticipantsUpdate(dest, [v12], "remove");
        await new Promise(v13 => setTimeout(v13, 500));
      } catch (e) {
        console.error("Erreur exclusion " + v12 + " :", e);
      }
    }
    ovl.sendMessage(
      dest,
      {
        text: "✅ " + v5.length + " membre(s) avec l'indicatif " + v4 + " ont été exclus.",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "promote",
    classe: "Groupe",
    react: "⬆️",
    desc: "Promouvoir un membre comme administrateur.",
  },
  async (dest, ovl, ctx) => {
    const {
      verif_Groupe,
      auteur_Msg_Repondu,
      arg,
      getJid,
      infos_Groupe,
      verif_Admin,
      prenium_id,
      verif_Ovl_Admin,
      ms,
    } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (verif_Admin || prenium_id) {
      const v1 = await infos_Groupe.participants;
      const v2 = v1.filter(v12 => v12.admin).map(v12 => v12.jid);
      const v3 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
      const v4 = await getJid(v3, dest, ovl);
      if (!verif_Ovl_Admin) {
        return ovl.sendMessage(
          dest,
          {
            text: "Je dois être administrateur pour effectuer cette action.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!v4) {
        return ovl.sendMessage(
          dest,
          {
            text: "Veuillez mentionner un membre à promouvoir.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!v1.find(v12 => v12.jid === v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "Membre introuvable dans ce groupe.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (v2.includes(v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "ce membre est déjà un administrateur du groupe.",
          },
          {
            quoted: ms,
          },
        );
      }
      try {
        await ovl.groupParticipantsUpdate(dest, [v4], "promote");
        ovl.sendMessage(
          dest,
          {
            text: "@" + v4.split("@")[0] + " a été promu administrateur.",
            mentions: [v4],
          },
          {
            quoted: ms,
          },
        );
      } catch (e) {
        console.error("Erreur :", e);
        ovl.sendMessage(
          dest,
          {
            text: "Une erreur est survenue lors de la promotion.",
          },
          {
            quoted: ms,
          },
        );
      }
    } else {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas la permission d'utiliser cette commande.",
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
    nom_cmd: "demote",
    classe: "Groupe",
    react: "⬇️",
    desc: "Retirer le rôle d'administrateur à un membre.",
  },
  async (dest, ovl, ctx) => {
    const {
      verif_Groupe,
      getJid,
      auteur_Msg_Repondu,
      arg,
      infos_Groupe,
      verif_Admin,
      prenium_id,
      verif_Ovl_Admin,
      dev_num,
      dev_id,
      ms,
    } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (verif_Admin || prenium_id) {
      const v1 = await infos_Groupe.participants;
      const v2 = v1.filter(v12 => v12.admin).map(v12 => v12.jid);
      const v3 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
      const v4 = await getJid(v3, dest, ovl);
      if (!verif_Ovl_Admin) {
        return ovl.sendMessage(
          dest,
          {
            text: "Je dois être administrateur pour effectuer cette action.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!v4) {
        return ovl.sendMessage(
          dest,
          {
            text: "Veuillez mentionner un membre à rétrograder.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!v1.find(v12 => v12.jid === v4)) {
        return ovl.sendMessage(dest, {
          text: "Membre introuvable dans ce groupe.",
        });
      }
      if (!v2.includes(v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "ce membre n'est pas un administrateur du groupe.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (dev_num.includes(v4)) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vous ne pouvez pas rétrograder un développeur.",
          },
          {
            quoted: ms,
          },
        );
      }
      try {
        await ovl.groupParticipantsUpdate(dest, [v4], "demote");
        ovl.sendMessage(
          dest,
          {
            text: "@" + v4.split("@")[0] + " a été rétrogradé.",
            mentions: [v4],
          },
          {
            quoted: ms,
          },
        );
      } catch (e) {
        console.error("Erreur :", e);
        ovl.sendMessage(
          dest,
          {
            text: "Une erreur est survenue lors de la rétrogradation.",
          },
          {
            quoted: ms,
          },
        );
      }
    } else {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas la permission d'utiliser cette commande.",
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
    nom_cmd: "gcreate",
    classe: "Groupe",
    react: "✅",
    desc: "Crée un groupe avec juste toi comme membre.",
  },
  async (dest, ovl, { arg, prenium_id, ms }) => {
    if (!prenium_id) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Vous n'avez pas les permissions pour créer un groupe.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (arg.length === 0) {
      return ovl.sendMessage(
        dest,
        {
          text: "⚠️ Veuillez fournir un nom pour le groupe. Exemple : *gcreate MonGroupe*",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg.join(" ");
    try {
      const v12 = await ovl.groupCreate(v1, []);
      await ovl.sendMessage(
        v12.id,
        {
          text: '🎉 Groupe *"' + v1 + '"* créé avec succès !',
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("❌ Erreur lors de la création du groupe :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur est survenue lors de la création du groupe.",
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
    nom_cmd: "gdesc",
    classe: "Groupe",
    react: "🔤",
    desc: "Permet de changer la description d'un groupe",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, msg_Repondu, arg, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (verif_Admin && verif_Ovl_Admin) {
      let v1;
      if (msg_Repondu) {
        v1 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
      } else if (arg) {
        v1 = arg.join(" ");
      } else {
        return ovl.sendMessage(
          dest,
          {
            text: "Entrez la nouvelle description.",
          },
          {
            quoted: ms,
          },
        );
      }
      await ovl.groupUpdateDescription(dest, v1);
    } else {
      ovl.sendMessage(
        dest,
        {
          text: "je n'ai pas les droits requis pour exécuter cette commande",
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
    nom_cmd: "gname",
    classe: "Groupe",
    react: "🔤",
    desc: "Permet de changer le nom d'un groupe",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, msg_Repondu, arg, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (verif_Admin && verif_Ovl_Admin) {
      let v1;
      if (msg_Repondu) {
        v1 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
      } else if (arg) {
        v1 = arg.join(" ");
      } else {
        return ovl.sendMessage(
          dest,
          {
            text: "Entrez un nouveau nom",
          },
          {
            quoted: ms,
          },
        );
      }
      await ovl.groupUpdateSubject(dest, v1);
    } else {
      ovl.sendMessage(
        dest,
        {
          text: "je n'ai pas les droits requis pour exécuter cette commande",
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
    nom_cmd: "close",
    classe: "Groupe",
    react: "✅",
    desc: "Seuls les admins peuvent envoyer des messages",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Admin || !verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je n'ai pas les droits requis pour exécuter cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    await ovl.groupSettingUpdate(dest, "announcement");
    return ovl.sendMessage(
      dest,
      {
        text: "Mode défini : seuls les admins peuvent envoyer des messages.",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "open",
    classe: "Groupe",
    react: "✅",
    desc: "Tout le monde peut envoyer des messages",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Admin || !verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je n'ai pas les droits requis pour exécuter cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    await ovl.groupSettingUpdate(dest, "not_announcement");
    return ovl.sendMessage(
      dest,
      {
        text: "Mode défini : tout le monde peut envoyer des messages.",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "lock",
    classe: "Groupe",
    react: "✅",
    desc: "Tout le monde peut modifier les paramètres du groupe",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Admin || !verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je n'ai pas les droits requis pour exécuter cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    await ovl.groupSettingUpdate(dest, "unlocked");
    return ovl.sendMessage(
      dest,
      {
        text: "Mode défini : tout le monde peut modifier les paramètres du groupe.",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "unlock",
    classe: "Groupe",
    react: "✅",
    desc: "Seuls les admins peuvent modifier les paramètres du groupe",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Admin || !verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je n'ai pas les droits requis pour exécuter cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    await ovl.groupSettingUpdate(dest, "locked");
    return ovl.sendMessage(
      dest,
      {
        text: "Mode défini : seuls les admins peuvent modifier les paramètres du groupe.",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "leave",
    classe: "Groupe",
    react: "😐",
    desc: "Commande pour quitter un groupe",
  },
  async (dest, ovl, ctx) => {
    const { prenium_id } = ctx;
    if (!prenium_id) {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas les permissions requises pour quitter ce groupe.",
        },
        {
          quoted: ctx.ms,
        },
      );
    }
    await ovl.sendMessage(
      dest,
      {
        text: "Sayonara",
      },
      {
        quoted: ctx.ms,
      },
    );
    await ovl.groupLeave(dest);
  },
);
ovlcmd(
  {
    nom_cmd: "link",
    classe: "Groupe",
    react: "🔗",
    desc: "Permet d'obtenir le lien d'invitation d'un groupe",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (verif_Admin && verif_Ovl_Admin) {
      const v1 = await ovl.groupInviteCode(dest);
      await ovl.sendMessage(
        dest,
        {
          text: "Lien d'invitation: https://chat.whatsapp.com/" + v1,
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
    nom_cmd: "revoke",
    classe: "Groupe",
    react: "🔗",
    desc: "Réinitialise le lien d'invitation d'un groupe",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Groupe) {
      return ovl.sendMessage(
        dest,
        {
          text: "Commande utilisable uniquement dans les groupes.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (verif_Admin && verif_Ovl_Admin) {
      await ovl.groupRevokeInvite(dest);
      await ovl.sendMessage(
        dest,
        {
          text: "Le lien d'invitation a été Réinitialisé.",
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
    nom_cmd: "ginfo",
    classe: "Groupe",
    react: "🔎",
    desc: "Affiche les informations du groupe",
  },
  async (dest, ovl, ctx) => {
    const v1 = await ovl.groupMetadata(dest);
    await ovl.sendMessage(
      dest,
      {
        text: "ID: " + v1.id + "\nNom: " + v1.subject + "\nDescription: " + v1.desc,
      },
      {
        quoted: ctx.ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "join",
    classe: "Groupe",
    react: "😶‍🌫",
    desc: "Permet de rejoindre un groupe via un lien d'invitation",
  },
  async (dest, ovl, ctx) => {
    const { prenium_id, arg, ms } = ctx;
    if (!prenium_id) {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas les permissions requises pour rejoindre un groupe.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!arg) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir le lien d'invitation du groupe.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg.join("");
    const v2 = v1.split("/")[3];
    await ovl.groupAcceptInvite(v2);
    await ovl.sendMessage(
      dest,
      {
        text: "Vous avez rejoint le groupe avec succès.",
      },
      {
        quoted: ms,
      },
    );
  },
);
async function gererDemandesIndividuellement(v1, v2, v3, v4) {
  const { verif_Admin, prenium_id, verif_Ovl_Admin, verif_Groupe, ms } = v4;
  if (!verif_Groupe) {
    return v3.sendMessage(
      v1,
      {
        text: "❌ Commande réservée aux groupes uniquement.",
      },
      {
        quoted: ms,
      },
    );
  }
  if (!verif_Admin && !prenium_id) {
    return v3.sendMessage(
      v1,
      {
        text: "❌ Vous n'avez pas les permissions pour utiliser cette commande.",
      },
      {
        quoted: ms,
      },
    );
  }
  if (!verif_Ovl_Admin) {
    return v3.sendMessage(
      v1,
      {
        text: "❌ Je dois être administrateur pour effectuer cette action.",
      },
      {
        quoted: ms,
      },
    );
  }
  try {
    const v12 = await v3.groupRequestParticipantsList(v1);
    if (!v12 || v12.length === 0) {
      return v3.sendMessage(
        v1,
        {
          text: "ℹ️ Aucune demande en attente.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v22 = v12.map(v13 => v13.jid);
    let v32 = 0;
    for (const v13 of v22) {
      try {
        await v3.groupRequestParticipantsUpdate(v1, [v13], v2);
        v32++;
        await new Promise(v14 => setTimeout(v14, 500));
      } catch (e) {
        console.error("❌ Erreur " + v2 + " pour " + v13 + " :", e.message);
      }
    }
    const v42 = v2 === "approve" ? "✅" : "❌";
    const v5 = v2 === "approve" ? "acceptée(s)" : "rejetée(s)";
    v3.sendMessage(v1, {
      text: v42 + " " + v32 + " demande(s) " + v5 + ".",
      quoted: ms,
    });
  } catch (e) {
    console.error("❌ Erreur générale :", e);
    v3.sendMessage(v1, {
      text: "❌ Une erreur est survenue.",
      quoted: ms,
    });
  }
}
ovlcmd(
  {
    nom_cmd: "acceptall",
    classe: "Groupe",
    react: "✅",
    desc: "Accepte toutes les demandes une par une.",
  },
  async (dest, ovl, ctx) => {
    await gererDemandesIndividuellement(dest, "approve", ovl, ctx);
  },
);
ovlcmd(
  {
    nom_cmd: "rejectall",
    classe: "Groupe",
    react: "❌",
    desc: "Rejette toutes les demandes une par une.",
  },
  async (dest, ovl, ctx) => {
    await gererDemandesIndividuellement(dest, "reject", ovl, ctx);
  },
);
ovlcmd(
  {
    nom_cmd: "getpp",
    classe: "Groupe",
    react: "🔎",
    desc: "Affiche la pp d'un groupe",
    alias: ["gpp"],
  },
  async (dest, ovl, ctx) => {
    try {
      const v1 = await ovl.profilePictureUrl(dest, "image");
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v1,
          },
        },
        {
          quoted: ctx.ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'obtention de la photo de profil :", e);
      await ovl.sendMessage(dest, "Désolé, je n'ai pas pu obtenir la photo de profil du groupe.", {
        quoted: ctx.ms,
      });
    }
  },
);
ovlcmd(
  {
    nom_cmd: "updatepp",
    classe: "Groupe",
    react: "🎨",
    desc: "Commande pour changer la photo de profil d'un groupe",
    alias: ["upp"],
  },
  async (dest, ovl, ctx) => {
    const { arg, verif_Groupe, msg_Repondu, verif_Admin, prenium_id, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Admin && !prenium_id) {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas les permissions requises pour modifier la photo du groupe.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je dois être administrateur pour effectuer cette action.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!msg_Repondu || !msg_Repondu.imageMessage) {
      return ovl.sendMessage(
        dest,
        {
          text: "Mentionnez une image.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      if (msg_Repondu?.imageMessage) {
        const v1 = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
        await ovl.updateProfilePicture(dest, {
          url: v1,
        });
        ovl.sendMessage(
          dest,
          {
            text: "✅ La photo de profil du groupe a été mise à jour avec succès.",
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      console.error("Erreur lors du changement de PP :", e);
      ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur est survenue lors de la modification de la photo du groupe.",
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
    nom_cmd: "removepp",
    classe: "Groupe",
    react: "🗑️",
    desc: "Commande pour supprimer la photo de profil d'un groupe",
    alias: ["rpp"],
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, verif_Admin, prenium_id, verif_Ovl_Admin, ms } = ctx;
    if (!verif_Admin && !prenium_id) {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas les permissions requises pour supprimer la photo du groupe.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!verif_Ovl_Admin) {
      return ovl.sendMessage(
        dest,
        {
          text: "Je dois être administrateur pour effectuer cette action.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      await ovl.removeProfilePicture(dest);
      ovl.sendMessage(
        dest,
        {
          text: "✅ La photo de profil du groupe a été supprimée avec succès.",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de la suppression de la PP :", e);
      ovl.sendMessage(
        dest,
        {
          text: "❌ Une erreur est survenue lors de la suppression de la photo du groupe.",
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
    nom_cmd: "warn",
    classe: "Groupe",
    react: "⚠️",
    desc: "Avertit un membre du groupe ou gère les avertissements.",
  },
  async (dest, ovl, ctx) => {
    const {
      verif_Groupe,
      getJid,
      infos_Groupe,
      arg,
      verif_Admin,
      verif_Ovl_Admin,
      prenium_id,
      dev_num,
      ms,
      auteur_Message,
      auteur_Msg_Repondu,
      repondre: repondre2,
    } = ctx;
    if (!verif_Groupe) {
      return repondre2("Commande utilisable uniquement dans les groupes.");
    }
    const v1 = await infos_Groupe.participants;
    const v2 = v1.filter(v12 => v12.admin).map(v12 => v12.phoneNumber);
    if (!arg[0] && !auteur_Msg_Repondu) {
      return repondre2(
        "⚠️ *Utilisation de la commande warn*\n\n• `warn @utilisateur` ou warn en répondant à un de ses messages : Ajouter un avertissement.\n• `warn reset @utilisateur` ou warn reset en répondant à un de ses messages : Réinitialiser les avertissements.\n• `warn limit <nombre>` : Définir la limite d'avertissements.",
      );
    }
    if (arg[0] === "limit") {
      if (!prenium_id && !verif_Admin) {
        return repondre2("Vous n'avez pas la permission.");
      }
      const v12 = parseInt(arg[1]);
      if (isNaN(v12) || v12 < 1) {
        return repondre2("Veuillez entrer une limite valide.");
      }
      await setLimit(v12);
      return repondre2("✅ Limite d'avertissements définie à " + v12 + ".");
    }
    if (arg[0] === "reset") {
      if (!prenium_id && !verif_Admin) {
        return repondre2("Vous n'avez pas la permission.");
      }
      const v12 = auteur_Msg_Repondu || (arg[1]?.includes("@") && arg[1].replace("@", "") + "@lid");
      const v22 = await getJid(v12, dest, ovl);
      await delWarn(v22);
      return ovl.sendMessage(
        dest,
        {
          text: "✅ Les avertissements de @" + v22.split("@")[0] + " ont été réinitialisés.",
          mentions: [v22],
        },
        {
          quoted: ms,
        },
      );
    }
    const v3 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
    const v4 = await getJid(v3, dest, ovl);
    if (!prenium_id && !verif_Admin) {
      return repondre2("Vous n'avez pas la permission.");
    }
    if (!verif_Ovl_Admin) {
      return repondre2("Je dois être administrateur pour effectuer cette action.");
    }
    if (v2.includes(v4)) {
      return repondre2("Impossible d'avertir un administrateur.");
    }
    if (dev_num.includes(v4)) {
      return repondre2("Impossible d'avertir un développeur.");
    }
    const v5 = await getLimit();
    const v6 = await setWarn(v4);
    const v7 = new Date().toLocaleString("fr-FR");
    await ovl.sendMessage(
      dest,
      {
        text:
          "⚠️ **Avertissement** ⚠️\n\n👤 Utilisateur : @" +
          v4.split("@")[0] +
          "\n📌 Warn par : @" +
          auteur_Message.split("@")[0] +
          "\n📅 Date : " +
          v7 +
          "\n📊 Total warns : " +
          v6.count +
          "/" +
          v5,
        mentions: [v4, auteur_Message],
      },
      {
        quoted: ms,
      },
    );
    if (v6.count >= v5) {
      try {
        await ovl.groupParticipantsUpdate(dest, [v4], "remove");
        ovl.sendMessage(
          dest,
          {
            text: "🚫 @" + v4.split("@")[0] + " a été exclu pour avoir atteint la limite d'avertissements.",
            mentions: [v4],
          },
          {
            quoted: ms,
          },
        );
        await delWarn(v4);
      } catch {
        repondre2("Erreur lors de l'exclusion.");
      }
    }
  },
);
ovlcmd(
  {
    nom_cmd: "vcf",
    classe: "Groupe",
    react: "📇",
    desc: "Enregistre les contacts de tous les membres du groupe dans un fichier VCF",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, prenium_id, ms } = ctx;
    try {
      if (!verif_Groupe) {
        return ovl.sendMessage(
          dest,
          {
            text: "Cette commande doit être utilisée dans un groupe.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!prenium_id) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vous n'avez pas les permissions requises pour utiliser cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = await ovl.groupMetadata(dest).catch(() => null);
      if (!v1 || !v1.participants) {
        return ovl.sendMessage(
          dest,
          {
            text: "Échec de la récupération des métadonnées du groupe ou de la liste des participants.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v2 = v1.participants;
      const v3 = [];
      for (const v12 of v2) {
        const v13 = v12.jid;
        const v22 = v13.split("@")[0];
        let v32 = v22;
        try {
          const v14 = await Ranks.findOne({
            where: {
              id: v13,
            },
          }).catch(() => null);
          if (v14 && v14.name) {
            v32 = v14.name;
          } else if (v12.notify) {
            v32 = v12.notify;
          }
        } catch {
          v32 = v22;
        }
        v3.push("BEGIN:VCARD\nVERSION:3.0\nFN:" + v32 + "\nTEL;TYPE=CELL:" + v22 + "\nEND:VCARD");
      }
      const v4 = v1.subject || "Groupe_" + dest.key.remoteJid.replace(/[@.]/g, "_");
      const v5 = "contacts_groupe_" + v4 + ".vcf";
      const v6 = "./" + v5;
      fs.writeFileSync(v6, v3.join("\n"));
      const v7 =
        "*TOUS LES CONTACTS DES MEMBRES ENREGISTRÉS*\nGroupe : *" + v4 + "*\nContacts : *" + v2.length + "*";
      await ovl.sendMessage(
        dest,
        {
          document: fs.readFileSync(v6),
          mimetype: "text/vcard",
          filename: v5,
          caption: v7,
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v6);
    } catch (e) {
      console.error("Erreur lors du traitement de la commande vcf:", e);
      return ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors du traitement de la commande vcf.",
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
    nom_cmd: "antilink",
    classe: "Groupe",
    react: "🔗",
    desc: "Active ou configure l'antilink pour les groupes",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre: repondre2, arg, verif_Groupe, verif_Admin } = ctx;
    try {
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes");
      }
      if (!verif_Admin) {
        return repondre2("Seuls les administrateurs peuvent utiliser cette commande");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = ["on", "off"];
      const v3 = ["supp", "warn", "kick"];
      const [v4] = await Antilink.findOrCreate({
        where: {
          id: dest,
        },
        defaults: {
          id: dest,
          mode: "non",
          type: "supp",
        },
      });
      if (v2.includes(v1)) {
        const v12 = v1 === "on" ? "oui" : "non";
        if (v4.mode === v12) {
          return repondre2("L'Antilink est déjà " + v1);
        }
        v4.mode = v12;
        await v4.save();
        return repondre2("L'Antilink " + (v1 === "on" ? "activé" : "désactivé") + " avec succès !");
      }
      if (v3.includes(v1)) {
        if (v4.mode !== "oui") {
          return repondre2("Veuillez activer l'antilink d'abord en utilisant `antilink on`");
        }
        if (v4.type === v1) {
          return repondre2("L'action antilink est déjà définie sur " + v1);
        }
        v4.type = v1;
        await v4.save();
        return repondre2("L'Action de l'antilink définie sur " + v1 + " avec succès !");
      }
      return repondre2(
        "Utilisation :\nantilink on/off: Activer ou désactiver l'antilink\nantilink supp/warn/kick: Configurer l'action antilink",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration d'antilink :", e);
      repondre2("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "antitag",
    classe: "Groupe",
    react: "🔗",
    desc: "Active ou configure l'antitag pour les groupes",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre: repondre2, arg, verif_Groupe, verif_Admin } = ctx;
    try {
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes");
      }
      if (!verif_Admin) {
        return repondre2("Seuls les administrateurs peuvent utiliser cette commande");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = ["on", "off"];
      const v3 = ["supp", "warn", "kick"];
      const [v4] = await Antitag.findOrCreate({
        where: {
          id: dest,
        },
        defaults: {
          id: dest,
          mode: "non",
          type: "supp",
        },
      });
      if (v2.includes(v1)) {
        const v12 = v1 === "on" ? "oui" : "non";
        if (v4.mode === v12) {
          return repondre2("L'Antitag est déjà " + v1);
        }
        v4.mode = v12;
        await v4.save();
        return repondre2("L'Antitag " + (v1 === "on" ? "activé" : "désactivé") + " avec succès !");
      }
      if (v3.includes(v1)) {
        if (v4.mode !== "oui") {
          return repondre2("Veuillez activer l'antitag d'abord en utilisant `antitag on`");
        }
        if (v4.type === v1) {
          return repondre2("L'action antitag est déjà définie sur " + v1);
        }
        v4.type = v1;
        await v4.save();
        return repondre2("L'Action de l'antitag définie sur " + v1 + " avec succès !");
      }
      return repondre2(
        "Utilisation :\nantitag on/off: Activer ou désactiver l'antitag\nantitag supp/warn/kick: Configurer l'action antitag",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration d'antitag :", e);
      repondre2("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "antispam",
    classe: "Groupe",
    react: "🔗",
    desc: "Active ou configure l'antispam pour les groupes",
  },
  async (dest, ovl, ctx) => {
    const { repondre: repondre2, arg, verif_Groupe, verif_Admin } = ctx;
    try {
      if (!verif_Groupe) {
        return repondre2("❌ Cette commande fonctionne uniquement dans les groupes.");
      }
      if (!verif_Admin) {
        return repondre2("❌ Seuls les administrateurs peuvent utiliser cette commande.");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = ["on", "off"];
      const v3 = ["supp", "warn", "kick"];
      const [v4] = await Antispam.findOrCreate({
        where: {
          id: dest,
        },
        defaults: {
          id: dest,
          mode: "non",
          type: "supp",
        },
      });
      if (v2.includes(v1)) {
        const v12 = v1 === "on" ? "oui" : "non";
        if (v4.mode === v12) {
          return repondre2("L'Antispam est déjà " + v1 + ".");
        }
        v4.mode = v12;
        await v4.save();
        return repondre2("L'Antispam a été " + (v1 === "on" ? "activé" : "désactivé") + " avec succès !");
      }
      if (v3.includes(v1)) {
        if (v4.mode !== "oui") {
          return repondre2("❌ Veuillez activer l'antispam d'abord avec `antispam on`.");
        }
        if (v4.type === v1) {
          return repondre2("⚠️ L'action antispam est déjà définie sur " + v1 + ".");
        }
        v4.type = v1;
        await v4.save();
        return repondre2("✅ L'action antispam est maintenant définie sur " + v1 + ".");
      }
      return repondre2(
        "Utilisation :\nantispam on/off : Activer ou désactiver l'antispam.\nantispam supp/warn/kick : Configurer l'action antispam.",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration d'antispam :", e);
      return repondre2("❌ Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "antibot",
    classe: "Groupe",
    react: "🔗",
    desc: "Active ou configure l'antibot pour les groupes",
  },
  async (dest, ovl, ctx) => {
    const { repondre: repondre2, arg, verif_Groupe, verif_Admin } = ctx;
    try {
      if (!verif_Groupe) {
        return repondre2("❌ Cette commande fonctionne uniquement dans les groupes.");
      }
      if (!verif_Admin) {
        return repondre2("❌ Seuls les administrateurs peuvent utiliser cette commande.");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = ["on", "off"];
      const v3 = ["supp", "warn", "kick"];
      const [v4] = await Antibot.findOrCreate({
        where: {
          id: dest,
        },
        defaults: {
          id: dest,
          mode: "non",
          type: "supp",
        },
      });
      if (v2.includes(v1)) {
        const v12 = v1 === "on" ? "oui" : "non";
        if (v4.mode === v12) {
          return repondre2("L'Antibot est déjà " + v1 + ".");
        }
        v4.mode = v12;
        await v4.save();
        return repondre2("L'Antibot a été " + (v1 === "on" ? "activé" : "désactivé") + " avec succès !");
      }
      if (v3.includes(v1)) {
        if (v4.mode !== "oui") {
          return repondre2("❌ Veuillez activer l'antibot d'abord avec `antibot on`.");
        }
        if (v4.type === v1) {
          return repondre2("⚠️ L'action antibot est déjà définie sur " + v1 + ".");
        }
        v4.type = v1;
        await v4.save();
        return repondre2("✅ L'action antibot est maintenant définie sur " + v1 + ".");
      }
      return repondre2(
        "Utilisation :\nantibot on/off : Activer ou désactiver l'antibot.\nantibot supp/warn/kick : Configurer l'action antibot.",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration d'antibot :", e);
      return repondre2("❌ Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "antimentiongc",
    classe: "Groupe",
    react: "📢",
    desc: "Active ou configure l'antimention pour les groupes",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre: repondre2, arg, verif_Groupe, verif_Admin } = ctx;
    try {
      if (!verif_Groupe) {
        return repondre2("Cette commande ne fonctionne que dans les groupes.");
      }
      if (!verif_Admin) {
        return repondre2("Seuls les administrateurs peuvent utiliser cette commande.");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = ["on", "off"];
      const v3 = ["supp", "warn", "kick"];
      const [v4] = await Antimention.findOrCreate({
        where: {
          id: dest,
        },
        defaults: {
          id: dest,
          mode: "non",
          type: "supp",
        },
      });
      if (v2.includes(v1)) {
        const v12 = v1 === "on" ? "oui" : "non";
        if (v4.mode === v12) {
          return repondre2("L'antimention est déjà " + v1 + ".");
        }
        v4.mode = v12;
        await v4.save();
        return repondre2("L'antimention a été " + (v1 === "on" ? "activé" : "désactivé") + " avec succès.");
      }
      if (v3.includes(v1)) {
        if (v4.mode !== "oui") {
          return repondre2("Veuillez d'abord activer l'antimention avec `antimention on`.");
        }
        if (v4.type === v1) {
          return repondre2("L'action antimention est déjà définie sur " + v1 + ".");
        }
        v4.type = v1;
        await v4.save();
        return repondre2("Action antimention définie sur " + v1 + " avec succès.");
      }
      return repondre2(
        "Utilisation :\n- antimention on/off : Activer ou désactiver l'antimention\n- antimention supp/warn/kick : Définir l'action à appliquer",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration d'antimention :", e);
      return repondre2("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
const welcomeGoodbyeCmd = v1 => {
  const v2 = v1 === "welcome";
  ovlcmd(
    {
      nom_cmd: v1,
      classe: "Groupe",
      react: "👋",
      desc: v2
        ? "Configurer ou activer les messages de bienvenue"
        : "Configurer ou activer les messages d’adieu",
    },
    async (dest, ovl, { repondre: repondre2, arg, verif_Admin, verif_Groupe, auteur_Message }) => {
      try {
        if (!verif_Groupe) {
          return repondre2("❌ Commande utilisable uniquement dans les groupes.");
        }
        if (!verif_Admin) {
          return repondre2("❌ Seuls les administrateurs peuvent utiliser cette commande.");
        }
        const v12 = arg[0]?.toLowerCase();
        const [v22] = await GroupSettings.findOrCreate({
          where: {
            id: dest,
          },
          defaults: {
            id: dest,
            [v1]: "non",
          },
        });
        const [v3] = await Events2.findOrCreate({
          where: {
            id: dest,
          },
          defaults: {
            id: dest,
          },
        });
        const v4 = v2 ? "welcome_msg" : "goodbye_msg";
        const v5 = v3[v4];
        if (!arg.length) {
          return repondre2(
            "🛠️ *Utilisation de la commande " +
              v1 +
              "* :\n\n1️⃣ *" +
              v1 +
              " on/off* – Active ou désactive les messages de " +
              (v2 ? "bienvenue" : "d’adieu") +
              ".\n2️⃣ *" +
              v1 +
              " get* – Affiche le message " +
              (v2 ? "de bienvenue" : "d’adieu") +
              " personnalisé.\n3️⃣ *" +
              v1 +
              " Votre message...* – Définir un message personnalisé.\n4️⃣ *" +
              v1 +
              " défaut* – Réinitialise le message " +
              (v2 ? "de bienvenue" : "d’adieu") +
              ".\n\n📌 Variables disponibles :\n@user → Mention du membre\n#groupe → Nom du groupe\n#membre → Nombre de membres\n#desc → Description du groupe\n#url=lien → Utilise un média (image, vidéo)\n#pp → Utilise la photo de profil du membre\n#gpp → Utilise la photo de profil du groupe\n#audio=url → Utilise un audio",
          );
        }
        if (["on", "off"].includes(v12)) {
          const v13 = v12 === "on" ? "oui" : "non";
          if (v22[v1] === v13) {
            return repondre2(
              "ℹ️ Le message " +
                (v2 ? "de bienvenue" : "d’adieu") +
                " est déjà " +
                (v12 === "on" ? "activé" : "désactivé") +
                ".",
            );
          }
          v22[v1] = v13;
          await v22.save();
          return repondre2(
            "✅ Message " +
              (v2 ? "de bienvenue" : "d’adieu") +
              " " +
              (v12 === "on" ? "activé" : "désactivé") +
              " avec succès.",
          );
        }
        if (v12 === "get") {
          if (!v5 || !v5.trim()) {
            return repondre2(
              "⚠️ Aucun message " + (v2 ? "de bienvenue" : "d’adieu") + " personnalisé configuré.",
            );
          }
          const v13 = await ovl.groupMetadata(dest);
          const v23 = v13.subject || "Groupe";
          const v32 = v13.participants.length;
          const v42 = v13.desc || "Aucune description";
          const v52 = "@" + auteur_Message.split("@")[0];
          let v62 = v5;
          const v7 = v62.match(/#url=(\S+)/i);
          const v8 = v62.match(/#audio=(\S+)/i);
          const v9 = v62.includes("#pp");
          const v10 = v62.includes("#gpp");
          v62 = v62
            .replace(/#url=\S+/i, "")
            .replace(/#audio=\S+/i, "")
            .replace(/#pp/gi, "")
            .replace(/#gpp/gi, "")
            .replace(/@user/gi, v52)
            .replace(/#groupe/gi, v23)
            .replace(/#membre/gi, v32)
            .replace(/#desc/gi, v42);
          let v11 = false;
          if (v7) {
            const v14 = v7[1];
            const v24 = v14.split(".").pop().toLowerCase();
            let v33 = null;
            if (["mp4", "mov", "webm"].includes(v24)) {
              v33 = {
                video: {
                  url: v14,
                },
                caption: v62.trim(),
                gifPlayback: true,
                mentions: [auteur_Message],
              };
            } else if (["jpg", "jpeg", "png", "webp"].includes(v24)) {
              v33 = {
                image: {
                  url: v14,
                },
                caption: v62.trim(),
                mentions: [auteur_Message],
              };
            }
            if (v33) {
              await ovl.sendMessage(dest, v33);
              v11 = true;
            }
          } else if (v9) {
            try {
              const v14 = await ovl.profilePictureUrl(auteur_Message, "image");
              await ovl.sendMessage(dest, {
                image: {
                  url: v14,
                },
                caption: v62.trim(),
                mentions: [auteur_Message],
              });
              v11 = true;
            } catch {}
          } else if (v10) {
            try {
              const v14 = await ovl.profilePictureUrl(dest, "image");
              await ovl.sendMessage(dest, {
                image: {
                  url: v14,
                },
                caption: v62.trim(),
                mentions: [auteur_Message],
              });
              v11 = true;
            } catch {}
          }
          if (v8) {
            const v14 = v8[1];
            await ovl.sendMessage(dest, {
              audio: {
                url: v14,
              },
              mimetype: "audio/mpeg",
            });
            v11 = true;
          }
          if (!v11 && v62.trim()) {
            await ovl.sendMessage(dest, {
              text: v62.trim(),
              mentions: [auteur_Message],
            });
          }
          return;
        }
        if (v12 === "défaut" || v12 === "default") {
          if (!v5) {
            return repondre2(
              "ℹ️ Aucun message " + (v2 ? "de bienvenue" : "d’adieu") + " n’est actuellement défini.",
            );
          }
          v3[v4] = null;
          await v3.save();
          return repondre2(
            "✅ Message " + (v2 ? "de bienvenue" : "d’adieu") + " réinitialisé aux paramètres par défaut.",
          );
        }
        const v6 = arg.join(" ").trim();
        if (!v6) {
          return repondre2("❌ Le message ne peut pas être vide.");
        }
        v3[v4] = v6;
        await v3.save();
        return repondre2(
          "✅ Nouveau message " + (v2 ? "de bienvenue" : "d’adieu") + " enregistré avec succès !",
        );
      } catch (e) {
        console.error("❌ Erreur " + v1 + " :", e);
        repondre2("❌ Une erreur s’est produite.");
      }
    },
  );
};
welcomeGoodbyeCmd("welcome");
welcomeGoodbyeCmd("goodbye");
const commands = [
  {
    nom_cmd: "antipromote",
    colonne: "antipromote",
    react: "🛑",
    desc: "Active ou désactive l'antipromotion",
    table: GroupSettings,
  },
  {
    nom_cmd: "antidemote",
    colonne: "antidemote",
    react: "🛑",
    desc: "Active ou désactive l'antidémotion",
    table: GroupSettings,
  },
  {
    nom_cmd: "promotealert",
    colonne: "promoteAlert",
    react: "⚠️",
    desc: "Active ou désactive l'alerte de promotion",
    table: Events2,
  },
  {
    nom_cmd: "demotealert",
    colonne: "demoteAlert",
    react: "⚠️",
    desc: "Active ou désactive l'alerte de rétrogradation",
    table: Events2,
  },
];
commands.forEach(({ nom_cmd, colonne, react, desc, table }) => {
  ovlcmd(
    {
      nom_cmd,
      classe: "Groupe",
      react,
      desc,
    },
    async (dest, ovl, { repondre: repondre2, arg, verif_Groupe, verif_Admin }) => {
      try {
        if (!verif_Groupe) {
          return repondre2("❌ Cette commande fonctionne uniquement dans les groupes.");
        }
        if (!verif_Admin) {
          return repondre2("❌ Seuls les administrateurs peuvent utiliser cette commande.");
        }
        const v1 = arg[0]?.toLowerCase();
        const v2 = ["on", "off"];
        const [v3] = await table.findOrCreate({
          where: {
            id: dest,
          },
          defaults: {
            id: dest,
            [colonne]: "non",
          },
        });
        if (v2.includes(v1)) {
          const v12 = v1 === "on" ? "oui" : "non";
          if (v3[colonne] === v12) {
            return repondre2("ℹ️ " + nom_cmd + " est déjà " + v1 + ".");
          }
          v3[colonne] = v12;
          await v3.save();
          return repondre2("✅ " + nom_cmd + " " + (v1 === "on" ? "activé" : "désactivé") + " avec succès.");
        }
        return repondre2("🛠️ Utilisation :\n> " + nom_cmd + " on/off – " + desc.toLowerCase());
      } catch (e) {
        console.error("Erreur lors de la configuration de " + nom_cmd + " :", e);
        return repondre2("❌ Une erreur s'est produite lors de l'exécution de la commande.");
      }
    },
  );
});
