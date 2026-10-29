const { exec } = require("child_process");
const { ovlcmd } = require("../lib/ovlcmd");
const { Bans, OnlyAdmins } = require("../DataBase/ban");
const { Sudo } = require("../DataBase/sudo");
const config = require("../set");
const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const cheerio = require("cheerio");
const { WA_CONF, WA_CONF2 } = require("../DataBase/wa_conf");
const { ChatbotConf } = require("../DataBase/chatbot");
const path = require("path");
const fs = require("fs");
const { saveSecondSession, getSecondAllSessions, deleteSecondSession } = require("../DataBase/connect");
const { setMention, delMention, getMention } = require("../DataBase/mention");
const { set_stick_cmd, del_stick_cmd, get_stick_cmd } = require("../DataBase/stick_cmd");
const { set_cmd, del_cmd, list_cmd } = require("../DataBase/public_private_cmd");
const { Plugin } = require("../DataBase/plugin");
const { extractNpmModules, installModules, reloadCommands } = require("../lib/plugin");
const { Levelup } = require("../DataBase/rank");
ovlcmd(
  {
    nom_cmd: "delete",
    classe: "Owner",
    react: "🗑️",
    desc: "Supprimer un message.",
    alias: ["del", "dlt"],
  },
  async (dest, ovl, ctx) => {
    const {
      msg_Repondu,
      ms,
      auteur_Msg_Repondu,
      mtype,
      verif_Admin,
      verif_Ovl_Admin,
      verif_Groupe,
      dev_num,
      dev_id,
      repondre,
      id_Bot,
      prenium_id,
    } = ctx;
    if (!msg_Repondu) {
      return repondre("Veuillez répondre à un message pour le supprimer.");
    }
    if (dev_num.includes(auteur_Msg_Repondu) && !dev_id) {
      return repondre("Vous ne pouvez pas supprimer le message d'un développeur.");
    }
    if (verif_Groupe) {
      if (!verif_Admin) {
        return repondre("Vous devez être administrateur pour supprimer un message dans le groupe.");
      }
      if (!verif_Ovl_Admin) {
        return repondre("Je dois être administrateur pour effectuer cette action.");
      }
    } else if (!prenium_id) {
      return repondre("Seuls les utilisateurs premium peuvent utiliser cette commande en privé.");
    }
    try {
      const v1 = {
        remoteJid: dest,
        fromMe: auteur_Msg_Repondu == id_Bot,
        id: ms.message?.[mtype]?.contextInfo?.stanzaId,
        ...(verif_Groupe && {
          participant: auteur_Msg_Repondu,
        }),
      };
      if (!v1.id) {
        return repondre("Impossible de trouver l'ID du message à supprimer.");
      }
      await ovl.sendMessage(dest, {
        delete: v1,
      });
    } catch (e) {
      repondre("Erreur : " + e.message);
    }
  },
);
ovlcmd(
  {
    nom_cmd: "clear",
    classe: "Owner",
    react: "🧹",
    desc: "Supprime tous les messages dans cette discussion",
  },
  async (dest, ovl, ctx) => {
    const { repondre, ms, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("🔒 Vous n'avez pas le droit d'exécuter cette commande.");
      }
      await ovl.chatModify(
        {
          delete: true,
          lastMessages: [
            {
              key: ms.key,
              messageTimestamp: ms.messageTimestamp,
            },
          ],
        },
        dest,
      );
      await repondre("🧹 Tous les messages ont été supprimés avec succès.");
    } catch (e) {
      console.error("Erreur lors de la suppression :", e);
      repondre("❌ Erreur lors de la suppression des messages.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "block",
    classe: "Owner",
    react: "⛔",
    desc: "Bloquer un utilisateur par son JID",
  },
  async (dest, ovl, ctx) => {
    const { repondre, verif_Groupe, prenium_id } = ctx;
    if (verif_Groupe) {
      return repondre("Veuillez vous diriger dans l'inbox de la personne à bloquer.");
    }
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    try {
      await ovl.updateBlockStatus(dest, "block");
      repondre("✅ Utilisateur bloqué avec succès.");
    } catch (e) {
      console.error("Erreur block:", e);
      repondre("Impossible de bloquer l'utilisateur.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "deblock",
    classe: "Owner",
    react: "✅",
    desc: "Débloquer un utilisateur par son JID",
  },
  async (dest, ovl, ctx) => {
    const { verif_Groupe, repondre, prenium_id } = ctx;
    if (verif_Groupe) {
      return repondre("Veuillez vous diriger dans l'inbox de la personne à bloquer.");
    }
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    try {
      await ovl.updateBlockStatus(dest, "unblock");
      repondre("✅ Utilisateur débloqué avec succès.");
    } catch (e) {
      console.error("Erreur deblock:", e);
      repondre("Impossible de débloquer l'utilisateur.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "ban",
    classe: "Owner",
    react: "🚫",
    desc: "Bannir un utilisateur des commandes du bot",
  },
  async (dest, ovl, ctx) => {
    const { repondre, ms, arg, getJid, auteur_Msg_Repondu, prenium_id, dev_num } = ctx;
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          ms_org,
          {
            text: "Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
      const v2 = await getJid(v1, dest, ovl);
      if (!v2) {
        return repondre("Mentionnez un utilisateur valide à bannir.");
      }
      if (dev_num.includes(v2)) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vous ne pouvez pas bannir un développeur.",
          },
          {
            quoted: ms,
          },
        );
      }
      const [v3] = await Bans.findOrCreate({
        where: {
          id: v2,
        },
        defaults: {
          id: v2,
          type: "user",
        },
      });
      if (!v3._options.isNewRecord) {
        return repondre("Cet utilisateur est déjà banni !");
      }
      return ovl.sendMessage(
        dest,
        {
          text: "Utilisateur @" + v2.split("@")[0] + " banni avec succès.",
          mentions: [v2],
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande ban :", e);
      return repondre("Une erreur s'est produite.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "levelup",
    classe: "Owner",
    react: "⚙️",
    desc: "Activer ou désactiver le message de level up",
  },
  async (dest, ovl, ctx) => {
    const { repondre, ms, arg } = ctx;
    try {
      if (!arg[0]) {
        return repondre("Veuillez préciser 'on' ou 'off'.");
      }
      const v1 = arg[0].toLowerCase();
      if (v1 !== "on" && v1 !== "off") {
        return repondre("Argument invalide, utilisez 'on' ou 'off'.");
      }
      const v2 = v1 === "on" ? "oui" : "non";
      let v3 = await Levelup.findOne({
        where: {
          id: 1,
        },
      });
      if (!v3) {
        v3 = await Levelup.create({
          id: 1,
          levelup: v2,
        });
      } else {
        v3.levelup = v2;
        await v3.save();
      }
      return ovl.sendMessage(
        dest,
        {
          text: "Le message de level up est maintenant " + (v2 === "oui" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur commande levelup :", e);
      return repondre("Une erreur est survenue.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "anticall",
    classe: "Owner",
    react: "📵",
    desc: "Active ou désactive le blocage automatique des appels.",
  },
  async (dest, ovl, ctx) => {
    const { repondre, ms, arg, prenium_id } = ctx;
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
    const v1 = await WA_CONF2.findOne({
      where: {
        id: "1",
      },
    });
    if (!arg[0]) {
      const v12 = v1 && v1.anticall === "oui" ? "activé" : "désactivé";
      return ovl.sendMessage(
        dest,
        {
          text: "Etat actuel de anticall : " + v12 + "\nUsage : anticall on/off",
        },
        {
          quoted: ms,
        },
      );
    }
    const v2 = arg[0].toLowerCase();
    if (v2 !== "on" && v2 !== "off") {
      return repondre("Merci d'utiliser : anticall on ou anticall off");
    }
    if (!v1) {
      await WA_CONF2.create({
        id: "1",
        anticall: v2 === "on" ? "oui" : "non",
      });
      return ovl.sendMessage(
        dest,
        {
          text: "anticall est maintenant " + (v2 === "on" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    if ((v2 === "on" && v1.anticall === "oui") || (v2 === "off" && v1.anticall === "non")) {
      return ovl.sendMessage(
        dest,
        {
          text: "anticall est déjà " + (v2 === "on" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    v1.anticall = v2 === "on" ? "oui" : "non";
    await v1.save();
    return ovl.sendMessage(
      dest,
      {
        text: "anticall est maintenant " + (v2 === "on" ? "activé" : "désactivé") + ".",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "lecture_msg",
    classe: "Owner",
    react: "📖",
    desc: "Active ou désactive la lecture automatique des messages.",
  },
  async (dest, ovl, ctx) => {
    const { repondre, ms, arg, prenium_id } = ctx;
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
    const v1 = await WA_CONF2.findOne({
      where: {
        id: "1",
      },
    });
    if (!arg[0]) {
      const v12 = v1 && v1.autoread_msg === "oui" ? "activé" : "désactivé";
      return ovl.sendMessage(
        dest,
        {
          text: "Etat actuel de lecture_msg : " + v12 + "\nUsage : lecture_msg on/off",
        },
        {
          quoted: ms,
        },
      );
    }
    const v2 = arg[0].toLowerCase();
    if (v2 !== "on" && v2 !== "off") {
      return repondre("Merci d'utiliser : lecture_msg on ou lecture_msg off");
    }
    if (!v1) {
      await WA_CONF2.create({
        id: "1",
        autoread_msg: v2 === "on" ? "oui" : "non",
      });
      return ovl.sendMessage(
        dest,
        {
          text: "lecture_msg est maintenant " + (v2 === "on" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    if ((v2 === "on" && v1.autoread_msg === "oui") || (v2 === "off" && v1.autoread_msg === "non")) {
      return ovl.sendMessage(
        dest,
        {
          text: "lecture_msg est déjà " + (v2 === "on" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    v1.autoread_msg = v2 === "on" ? "oui" : "non";
    await v1.save();
    return ovl.sendMessage(
      dest,
      {
        text: "lecture_msg est maintenant " + (v2 === "on" ? "activé" : "désactivé") + ".",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "react_msg",
    classe: "Owner",
    react: "🤖",
    desc: "Active ou désactive la réaction automatique aux messages.",
  },
  async (dest, ovl, ctx) => {
    const { repondre, ms, arg, prenium_id } = ctx;
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
    const v1 = await WA_CONF2.findOne({
      where: {
        id: "1",
      },
    });
    if (!arg[0]) {
      const v12 = v1 && v1.autoreact_msg === "oui" ? "activé" : "désactivé";
      return ovl.sendMessage(
        dest,
        {
          text: "Etat actuel de react_msg : " + v12 + "\nUsage : react_msg on/off",
        },
        {
          quoted: ms,
        },
      );
    }
    const v2 = arg[0].toLowerCase();
    if (v2 !== "on" && v2 !== "off") {
      return repondre("Merci d'utiliser : react_msg on ou react_msg off");
    }
    if (!v1) {
      await WA_CONF2.create({
        id: "1",
        autoreact_msg: v2 === "on" ? "oui" : "non",
      });
      return ovl.sendMessage(
        dest,
        {
          text: "react_msg est maintenant " + (v2 === "on" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    if ((v2 === "on" && v1.autoreact_msg === "oui") || (v2 === "off" && v1.autoreact_msg === "non")) {
      return ovl.sendMessage(
        dest,
        {
          text: "react_msg est déjà " + (v2 === "on" ? "activé" : "désactivé") + ".",
        },
        {
          quoted: ms,
        },
      );
    }
    v1.autoreact_msg = v2 === "on" ? "oui" : "non";
    await v1.save();
    return ovl.sendMessage(
      dest,
      {
        text: "react_msg est maintenant " + (v2 === "on" ? "activé" : "désactivé") + ".",
      },
      {
        quoted: ms,
      },
    );
  },
);
ovlcmd(
  {
    nom_cmd: "deban",
    classe: "Owner",
    react: "🚫",
    desc: "Débannir un utilisateur des commandes du bot",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, getJid, auteur_Msg_Repondu, prenium_id, ms } = ctx;
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          ms_org,
          {
            text: "Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
      const v2 = await getJid(v1, dest, ovl);
      if (!v2) {
        return repondre("Mentionnez un utilisateur valide à débannir.");
      }
      const v3 = await Bans.destroy({
        where: {
          id: v2,
          type: "user",
        },
      });
      if (v3 === 0) {
        return repondre("Cet utilisateur n'est pas banni.");
      }
      return ovl.sendMessage(
        dest,
        {
          text: "Utilisateur @" + v2.split("@")[0] + " débanni avec succès.",
          mentions: [v2],
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande debannir :", e);
      return repondre("Une erreur s'est produite.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "bangroup",
    classe: "Owner",
    react: "🚫",
    desc: "Bannir un groupe des commandes du bot",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, verif_Groupe, prenium_id, ms } = ctx;
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          ms_org,
          {
            text: "Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!verif_Groupe) {
        return repondre("Cette commande fonctionne uniquement dans les groupes.");
      }
      const v1 = dest;
      if (!v1) {
        return repondre("Impossible de récupérer l'identifiant du groupe.");
      }
      const [v2] = await Bans.findOrCreate({
        where: {
          id: v1,
        },
        defaults: {
          id: v1,
          type: "group",
        },
      });
      if (!v2._options.isNewRecord) {
        return repondre("Ce groupe est déjà banni !");
      }
      return repondre("Groupe banni avec succès.");
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande bangroup :", e);
      return repondre("Une erreur s'est produite.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "debangroup",
    classe: "Owner",
    react: "🚫",
    desc: "Débannir un groupe des commandes du bot",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, verif_Groupe, prenium_id, ms } = ctx;
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          ms_org,
          {
            text: "Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!verif_Groupe) {
        return repondre("Cette commande fonctionne uniquement dans les groupes.");
      }
      const v1 = dest;
      if (!v1) {
        return repondre("Impossible de récupérer l'identifiant du groupe.");
      }
      const v2 = await Bans.destroy({
        where: {
          id: v1,
          type: "group",
        },
      });
      if (v2 === 0) {
        return repondre("Ce groupe n'est pas banni.");
      }
      return repondre("Groupe débanni avec succès.");
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande debangroup :", e);
      return repondre("Une erreur s'est produite.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "onlyadmins",
    react: "🛡️",
    desc: "Activer ou désactiver le mode only-admins dans un groupe",
    classe: "Owner",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, verif_Groupe, ms, prenium_id } = ctx;
    try {
      if (!verif_Groupe) {
        return repondre("❌ Cette commande ne fonctionne que dans un groupe.");
      }
      if (!prenium_id) {
        return ovl.sendMessage(
          dest,
          {
            text: "⛔ Vous n'avez pas l'autorisation d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = arg[0]?.toLowerCase();
      if (!["add", "del"].includes(v1)) {
        return repondre("❓ Utilisation : `onlyadmins add` pour activer, `onlyadmins del` pour désactiver.");
      }
      const v2 = dest;
      const v3 = await OnlyAdmins.findOne({
        where: {
          id: v2,
        },
      });
      if (v1 === "add") {
        if (v3) {
          return repondre("⚠️ Le mode only-admin est **déjà activé** pour ce groupe.");
        }
        await OnlyAdmins.create({
          id: v2,
        });
        return repondre("✅ Mode only-admin **activé** pour ce groupe.");
      }
      if (v1 === "del") {
        if (!v3) {
          return repondre("⚠️ Ce groupe **n'était pas en mode only-admin**.");
        }
        await OnlyAdmins.destroy({
          where: {
            id: v2,
          },
        });
        return repondre("❌ Mode only-admin **désactivé** pour ce groupe.");
      }
    } catch (e) {
      console.error("Erreur onlyadmins:", e);
      return repondre("❌ Une erreur s'est produite. Veuillez réessayer.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "setsudo",
    classe: "Owner",
    react: "🔒",
    desc: "Ajoute un utilisateur dans la liste des utilisateurs premium.",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, getJid, auteur_Msg_Repondu, prenium_id, ms } = ctx;
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
    const v1 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
    const v2 = await getJid(v1, dest, ovl);
    if (!v2) {
      return repondre("Veuillez mentionner un utilisateur valide pour l'ajouter en premium.");
    }
    try {
      const [v12] = await Sudo.findOrCreate({
        where: {
          id: v2,
        },
        defaults: {
          id: v2,
        },
      });
      if (!v12._options.isNewRecord) {
        return ovl.sendMessage(
          dest,
          {
            text: "L'utilisateur @" + v2.split("@")[0] + " est déjà un utilisateur premium.",
            mentions: [v2],
          },
          {
            quoted: ms,
          },
        );
      }
      return ovl.sendMessage(
        dest,
        {
          text: "Utilisateur @" + v2.split("@")[0] + " ajouté avec succès en tant qu'utilisateur premium.",
          mentions: [v2],
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande setsudo :", e);
      return repondre("Une erreur est survenue lors de l'ajout de l'utilisateur en premium.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "sudolist",
    classe: "Owner",
    react: "📋",
    desc: "Affiche la liste des utilisateurs premium.",
  },
  async (dest, ovl, ctx) => {
    const { repondre, prenium_id, ms } = ctx;
    if (!prenium_id) {
      return ovl.sendMessage(
        dest,
        {
          text: "Vous n'avez pas la permission d'exécuter cette commande.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v1 = await Sudo.findAll();
      if (!v1.length) {
        return repondre("Aucun utilisateur premium n'est actuellement enregistré.");
      }
      const v2 = v1.map((v12, v22) => "🔹 *" + (v22 + 1) + ".* @" + v12.id.split("@")[0]).join("\n");
      const v3 = "✨ *Liste des utilisateurs Premium* ✨\n\n*Total*: " + v1.length + "\n\n" + v2;
      return ovl.sendMessage(
        dest,
        {
          text: v3,
          mentions: v1.map(v12 => v12.id),
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande sudolist :", e);
      return repondre("Une erreur est survenue lors de l'affichage de la liste des utilisateurs premium.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "delsudo",
    classe: "Owner",
    react: "❌",
    desc: "Supprime un utilisateur de la liste des utilisateurs premium.",
  },
  async (dest, ovl, ctx) => {
    const { repondre, getJid, arg, auteur_Msg_Repondu, prenium_id, ms } = ctx;
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
    const v1 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
    const v2 = await getJid(v1, dest, ovl);
    if (!v2) {
      return repondre("Veuillez mentionner un utilisateur");
    }
    try {
      const v12 = await Sudo.destroy({
        where: {
          id: v2,
        },
      });
      if (v12 === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "L'utilisateur @" + v2.split("@")[0] + " n'est pas un utilisateur premium.",
            mentions: [v2],
          },
          {
            quoted: ms,
          },
        );
      }
      return ovl.sendMessage(
        dest,
        {
          text: "Utilisateur @" + v2.split("@")[0] + " supprimé avec succès de la liste premium.",
          mentions: [v2],
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'exécution de la commande delsudo :", e);
      return repondre("Une erreur est survenue lors de la suppression de l'utilisateur de la liste premium.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "tgs",
    classe: "Owner",
    react: "🔍",
    desc: "Importe des stickers Telegram sur WhatsApp",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, prenium_id, ms } = ctx;
    if (!prenium_id) {
      return ovl.sendMessage(dest, {
        text: "❌ Vous n'avez pas le droit d'exécuter cette commande.",
      });
    }
    if (!arg[0]) {
      return repondre("Merci de fournir un lien de stickers Telegram valide.");
    }
    const v1 = arg[0];
    const v2 = v1.split("/addstickers/")[1];
    if (!v2) {
      return repondre("❌ Lien incorrect.");
    }
    const v3 = "8408302436:AAFAKAtwCOywhSW0vqm9VNK71huTi8pUp1k";
    const v4 = "https://api.telegram.org/bot" + v3 + "/getStickerSet?name=" + v2;
    try {
      const { data } = await axios.get(v4);
      const v12 = data.result.stickers;
      if (!v12 || v12.length === 0) {
        return repondre("Aucun sticker trouvé dans cet ensemble.");
      }
      repondre(
        "✅ Nom du pack: " +
          data.result.name +
          "\nType : " +
          (data.result.is_animated ? "animés" : "statiques") +
          "\nTotal : " +
          v12.length +
          " stickers\n",
      );
      for (const v13 of v12) {
        const v14 = await axios.get("https://api.telegram.org/bot" + v3 + "/getFile?file_id=" + v13.file_id);
        const v22 = await axios({
          method: "get",
          url: "https://api.telegram.org/file/bot" + v3 + "/" + v14.data.result.file_path,
          responseType: "arraybuffer",
        });
        const v32 = new Sticker(v22.data, {
          pack: config.STICKER_PACK_NAME,
          author: config.STICKER_AUTHOR_NAME,
          type: StickerTypes.FULL,
          quality: 10,
        });
        await ovl.sendMessage(
          dest,
          {
            sticker: await v32.toBuffer(),
          },
          {
            quoted: ms,
          },
        );
      }
      repondre("✅ Tous les stickers ont été envoyés.");
    } catch (e) {
      console.error(e);
      repondre("❌ Une erreur s'est produite lors du téléchargement des stickers.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "fetch_sc",
    classe: "Owner",
    react: "💻",
    desc: "Extrait les données d'une page web, y compris HTML, CSS, JavaScript et médias",
  },
  async (dest, ovl, ctx) => {
    const { arg, prenium_id, ms } = ctx;
    const v1 = arg[0];
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
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un lien valide. Le bot extraira le HTML, CSS, JavaScript, et les médias de la page web.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (!/^https?:\/\//i.test(v1)) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir une URL valide commençant par http:// ou https://",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await axios.get(v1);
      const v2 = v12.data;
      const v3 = cheerio.load(v2);
      const v4 = [];
      v3("img[src], video[src], audio[src]").each((v13, v22) => {
        let v32 = v3(v22).attr("src");
        if (v32) {
          v4.push(v32);
        }
      });
      const v5 = [];
      v3('link[rel="stylesheet"]').each((v13, v22) => {
        let v32 = v3(v22).attr("href");
        if (v32) {
          v5.push(v32);
        }
      });
      const v6 = [];
      v3("script[src]").each((v13, v22) => {
        let v32 = v3(v22).attr("src");
        if (v32) {
          v6.push(v32);
        }
      });
      await ovl.sendMessage(
        dest,
        {
          text: "**Contenu HTML**:\n\n" + v2,
        },
        {
          quoted: ms,
        },
      );
      if (v5.length > 0) {
        for (const v13 of v5) {
          const v14 = await axios.get(new URL(v13, v1));
          const v22 = v14.data;
          await ovl.sendMessage(
            dest,
            {
              text: "**Contenu du fichier CSS**:\n\n" + v22,
            },
            {
              quoted: ms,
            },
          );
        }
      } else {
        await ovl.sendMessage(
          dest,
          {
            text: "Aucun fichier CSS externe trouvé.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (v6.length > 0) {
        for (const v13 of v6) {
          const v14 = await axios.get(new URL(v13, v1));
          const v22 = v14.data;
          await ovl.sendMessage(
            dest,
            {
              text: "**Contenu du fichier JavaScript**:\n\n" + v22,
            },
            {
              quoted: ms,
            },
          );
        }
      } else {
        await ovl.sendMessage(
          dest,
          {
            text: "Aucun fichier JavaScript externe trouvé.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (v4.length > 0) {
        await ovl.sendMessage(
          dest,
          {
            text: "**Fichiers médias trouvés**:\n" + v4.join("\n"),
          },
          {
            quoted: ms,
          },
        );
      } else {
        await ovl.sendMessage(
          dest,
          {
            text: "Aucun fichier média (images, vidéos, audios) trouvé.",
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
          text: "Une erreur est survenue lors de l'extraction du contenu de la page web.",
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
    nom_cmd: "antidelete",
    classe: "Owner",
    react: "🔗",
    desc: "Configure ou désactive l'Antidelete",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("🔒 Cette commande est réservée aux utilisateurs premium.");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = arg[1]?.toLowerCase();
      const v3 = {
        1: "pm",
        2: "gc",
        3: "status",
        4: "all",
        5: "pm/gc",
        6: "pm/status",
        7: "gc/status",
      };
      const [v4] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          antidelete: "non",
        },
      });
      if (v1 === "off") {
        if (v4.antidelete === "non") {
          return repondre("❌ L'antidelete est déjà désactivé.");
        }
        v4.antidelete = "non";
        await v4.save();
        return repondre("✅ Antidelete désactivé avec succès.");
      }
      if (["pv", "org"].includes(v1)) {
        return repondre(
          "❌ Usage invalide.\nUtilisez : antidelete <numéro> [pv|org]\nExemple : antidelete 3 org",
        );
      }
      const v5 = parseInt(v1);
      if (!v3[v5]) {
        return repondre(
          "📌 *Utilisation de la commande antidelete :*\n\n🔹 antidelete off : Désactiver l'antidelete\n\n🔹 antidelete 1 : Activer sur les messages privés (pm)\n🔹 antidelete 2 : Activer sur les messages de groupe (gc)\n🔹 antidelete 3 : Activer sur les statuts (status)\n🔹 antidelete 4 : Activer sur tous les types (all)\n🔹 antidelete 5 : Activer sur pm + gc\n🔹 antidelete 6 : Activer sur pm + status\n🔹 antidelete 7 : Activer sur gc + status\n\n➕ Vous pouvez ajouter `pv` ou `org` après le numéro pour choisir où renvoyer le message supprimé.\n   Exemple : `antidelete 3 org`\n\n✳️ Par défaut, si rien n’est précisé, c’est `pv` (inbox) qui est utilisé.",
        );
      }
      if (v2 && !["pv", "org"].includes(v2)) {
        return repondre("❌ Mode invalide. Utilisez soit 'pv' soit 'org' après le numéro.");
      }
      let v6 = v3[v5];
      if (v2) {
        v6 += "-" + v2;
      } else {
        v6 += "-pv";
      }
      if (v4.antidelete === v6) {
        return repondre("⚠️ L'antidelete est déjà configuré sur '" + v6 + "'.");
      }
      v4.antidelete = v6;
      await v4.save();
      return repondre("✅ Antidelete configuré sur : *" + v6 + "*");
    } catch (e) {
      console.error("Erreur antidelete :", e);
      repondre("❌ Une erreur s'est produite lors de la configuration de l'antidelete.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "jid",
    classe: "Owner",
    react: "🆔",
    desc: "Fournit le JID d'une personne ou d'un groupe",
  },
  async (dest, ovl, ctx) => {
    const { repondre, auteur_Msg_Repondu, prenium_id, msg_Repondu, arg, getJid } = ctx;
    if (!prenium_id) {
      return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
    }
    let v1 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
    let v2;
    if (v1) {
      v2 = await getJid(v1, dest, ovl);
    } else {
      v2 = dest;
    }
    repondre(v2);
  },
);
ovlcmd(
  {
    nom_cmd: "restart",
    classe: "Owner",
    desc: "Redémarre le bot",
  },
  async (dest, ovl, ctx) => {
    const { ms, prenium_id } = ctx;
    if (!prenium_id) {
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
    await ovl.sendMessage(
      dest,
      {
        text: "♻️ Redémarrage du bot en cours...",
      },
      {
        quoted: ms,
      },
    );
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  },
);
ovlcmd(
  {
    nom_cmd: "connect",
    classe: "Owner",
    desc: "Connexion d’un compte avec le bot via session_id",
  },
  async (dest, ovl, ctx) => {
    try {
      const { arg, ms, prenium_id, repondre } = ctx;
      if (!prenium_id) {
        return ovl.sendMessage(
          dest,
          {
            text: "🚫 Vous n'avez pas le droit d'exécuter cette commande.",
          },
          {
            quoted: ms,
          },
        );
      }
      if (!arg || !arg[0]) {
        return ovl.sendMessage(
          dest,
          {
            text: "❗ Exemple : .connect SESSION_ID",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = arg[0].trim();
      console.log("🌀 Tentative de connexion par " + ms.sender + " pour session_id: " + v1);
      const v2 = await saveSecondSession(v1);
      if (!v2) {
        return repondre("❌ La session est invalide ou n’a pas pu être enregistrée.");
      }
      return ovl.sendMessage(
        dest,
        {
          text: "✅ Tentative de connexion enregistrée pour la session : " + v1,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      return ovl.sendMessage(dest, {
        text: "❌ Erreur : " + e.message,
      });
    }
  },
);
ovlcmd(
  {
    nom_cmd: "connect_session",
    classe: "Owner",
    desc: "Affiche la liste des numéros connectés",
  },
  async (dest, ovl, ctx) => {
    try {
      const { ms, prenium_id } = ctx;
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
      const v1 = await getSecondAllSessions();
      if (!v1 || v1.length === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "📭 Aucune session secondaire active pour le moment.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v2 = v1.map(v12 => v12.numero + "@s.whatsapp.net");
      const v3 = v2.map(v12 => "@" + v12.split("@")[0]).join("\n");
      await ovl.sendMessage(
        dest,
        {
          text: "📡 *Sessions secondaires connectées (" + v1.length + ")* :\n\n" + v3,
          mentions: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      return ovl.sendMessage(dest, {
        text: "❌ Erreur : " + e.message,
      });
    }
  },
);
ovlcmd(
  {
    nom_cmd: "disconnect",
    classe: "Owner",
    desc: "Supprime une session connectée par session_id",
  },
  async (dest, ovl, ctx) => {
    try {
      const { arg, ms, prenium_id } = ctx;
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
      if (!arg || !arg[0]) {
        return ovl.sendMessage(
          dest,
          {
            text: "Usage : .disconnect numero(sans le + et collé)",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = arg.join(" ");
      const v2 = v1.replace(/[^0-9]/g, "");
      const v3 = await deleteSecondSession(v2);
      if (v3 === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "Aucune session trouvée pour le numéro : " + v2,
          },
          {
            quoted: ms,
          },
        );
      }
      await ovl.sendMessage(
        dest,
        {
          text: "✅ Session pour le numéro: " + v2 + " supprimée avec succès.",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      return ovl.sendMessage(dest, {
        text: "❌ Erreur : " + e.message,
      });
    }
  },
);
ovlcmd(
  {
    nom_cmd: "setmention",
    classe: "Owner",
    react: "✅",
    desc: "Configurer le message d'antimention global",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, prenium_id } = ctx;
    if (!prenium_id) {
      return repondre("❌ Seuls les utilisateurs premium peuvent utiliser cette commande.");
    }
    try {
      const v1 = arg.join(" ");
      if (!v1) {
        return repondre(
          "🛠️ Utilisation de la commande *setmention* :\n\n1️⃣ Pour une image, vidéo, audio ou texte avec type spécifié :\n> *setmention type=audio url=https://exemple.com/fichier.opus*\n> *setmention type=video url=https://exemple.com/video.mp4 text=Votre_message_ici*\n> *setmention type=texte text=Votre_message_ici*\n> *setmention type=image url=https://exemple.com/image.jpg text=Votre_message_ici*\n\n📌 Les types valides sont : audio, video, texte, image.",
        );
      }
      let v2 = "";
      let v3 = "";
      let v4 = "";
      const v5 = /(type|url|text)=(.*?)(?=\s(?:type=|url=|text=)|$)/gis;
      let v6;
      while ((v6 = v5.exec(v1)) !== null) {
        const v12 = v6[1].toLowerCase();
        const v22 = v6[2].trim();
        if (v12 === "type") {
          v4 = v22.toLowerCase();
        } else if (v12 === "url") {
          v2 = v22;
        } else if (v12 === "text") {
          v3 = v22.replace(/_/g, " ");
        }
      }
      if (!v4) {
        return repondre(
          "❌ Vous devez préciser le type avec 'type=audio', 'type=video', 'type=texte' ou 'type=image'.",
        );
      }
      await setMention({
        url: v2,
        text: v3,
        type: v4,
        mode: "oui",
      });
      const v7 = "✅ Mention de type '" + v4 + "' enregistrée avec succès.";
      return repondre(v7);
    } catch (e) {
      console.error("Erreur dans setmention:", e);
      repondre("Une erreur s'est produite lors de la configuration.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "delmention",
    classe: "Owner",
    react: "🚫",
    desc: "Désactiver le système d'antimention",
  },
  async (dest, ovl, ctx) => {
    const { repondre, prenium_id } = ctx;
    if (!prenium_id) {
      return repondre("Seuls les utilisateurs premium peuvent utiliser cette commande.");
    }
    try {
      await delMention();
      return repondre("✅ mention désactivé.");
    } catch (e) {
      console.error("Erreur dans delmention:", e);
      repondre("Une erreur s'est produite.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "getmention",
    classe: "Owner",
    react: "📄",
    desc: "Afficher la configuration actuelle de l'antimention",
  },
  async (dest, ovl, ctx) => {
    const { repondre, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs premium peuvent utiliser cette commande.");
      }
      const v1 = await getMention();
      if (!v1 || v1.mode === "non") {
        return repondre("ℹ️ Antimention désactivé ou non configuré.");
      }
      const { mode, url, text, type } = v1;
      if ((!url || url === "") && (!text || text === "")) {
        return repondre("ℹ️ Antimention activé mais aucun contenu défini.");
      }
      switch (type) {
        case "audio":
          if (!url) {
            return repondre(text || "Aucun contenu audio défini.");
          }
          return await ovl.sendMessage(
            dest,
            {
              audio: {
                url,
              },
              mimetype: "audio/mp4",
              ptt: true,
            },
            {
              quoted: null,
            },
          );
        case "image":
          if (!url) {
            return repondre(text || "Aucun contenu image défini.");
          }
          return await ovl.sendMessage(
            dest,
            {
              image: {
                url,
              },
              caption: text || undefined,
            },
            {
              quoted: null,
            },
          );
        case "video":
          if (!url) {
            return repondre(text || "Aucun contenu vidéo défini.");
          }
          return await ovl.sendMessage(
            dest,
            {
              video: {
                url,
              },
              caption: text || undefined,
            },
            {
              quoted: null,
            },
          );
        case "texte":
          return repondre(text || "Aucun message texte défini.");
        default:
          return repondre("Le type de média est inconnu ou non pris en charge.");
      }
    } catch (e) {
      console.error("Erreur dans getmention:", e);
      repondre("Impossible d'afficher la configuration.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "addstickcmd",
    classe: "Owner",
    react: "✨",
    alias: ["setstickcmd", "addcmd", "setcmd"],
    desc: "Associer une commande à un sticker (réponds à un sticker)",
  },
  async (dest, ovl, { repondre, msg_Repondu, arg, prenium_id }) => {
    if (!prenium_id) {
      return repondre("Pas autorisé.");
    }
    const v1 = arg[0];
    if (!v1) {
      return repondre("Tu dois donner un nom à la commande.\nExemple : `addstickcmd test`");
    }
    if (!msg_Repondu || !msg_Repondu.stickerMessage || !msg_Repondu.stickerMessage.url) {
      return repondre("Tu dois répondre à un *sticker* pour l'enregistrer.");
    }
    const v2 = msg_Repondu.stickerMessage.fileSha256?.toString("base64");
    try {
      await set_stick_cmd(v1.toLowerCase(), v2);
      repondre("✅ Le sticker a été associé à la commande *" + v1 + "*");
    } catch (e) {
      console.error(e);
      repondre("Erreur lors de l'enregistrement.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "delstickcmd",
    classe: "Owner",
    react: "🗑️",
    alias: ["delcmd"],
    desc: "Supprimer une commande sticker",
  },
  async (dest, ovl, { repondre, arg, prenium_id }) => {
    if (!prenium_id) {
      return repondre("Pas autorisé.");
    }
    const v1 = arg[0];
    if (!v1) {
      return repondre("Exemple : `delstickcmd test`");
    }
    const v2 = await del_stick_cmd(v1.toLowerCase());
    repondre(
      v2 ? "🗑️ La commande *" + v1 + "* a été supprimée." : "Aucune commande nommée *" + v1 + "* trouvée.",
    );
  },
);
ovlcmd(
  {
    nom_cmd: "getstickcmd",
    classe: "Owner",
    react: "📋",
    alias: ["getcmd"],
    desc: "Liste des commandes stickers",
  },
  async (dest, ovl, { repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("Pas autorisé.");
    }
    const v1 = await get_stick_cmd();
    if (!v1.length) {
      return repondre("Aucune commande sticker trouvée.");
    }
    let v2 = "*📌 Liste des commandes stickers :*\n\n";
    for (const { no_cmd, stick_hash } of v1) {
      v2 += "• *" + no_cmd + "*\n";
    }
    repondre(v2);
  },
);
ovlcmd(
  {
    nom_cmd: "setpublic_cmd",
    classe: "Owner",
    react: "✅",
    desc: "Ajoute une commande publique utilisable par tout le monde quand le bot est en mode privé",
  },
  async (dest, ovl, { arg, repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("❌ Vous n'avez pas la permission d'exécuter cette commande.");
    }
    const v1 = arg[0];
    if (!v1) {
      return repondre("❌ Utilisation: setpublic_cmd nom_cmd");
    }
    try {
      await set_cmd(v1, "public");
      repondre("✅ Commande publique '" + v1 + "' enregistrée.");
    } catch {
      repondre("❌ Erreur lors de l'enregistrement.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "delpublic_cmd",
    classe: "Owner",
    react: "🗑️",
    desc: "Supprime une commande des commandes publiques.",
  },
  async (dest, ovl, { arg, repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("❌ Vous n'avez pas la permission d'exécuter cette commande.");
    }
    const v1 = arg[0];
    if (!v1) {
      return repondre("❌ Utilisation: delpublic_cmd nom_cmd");
    }
    try {
      const v12 = await del_cmd(v1, "public");
      repondre(v12 ? "✅ Commande '" + v1 + "' supprimée." : "❌ Commande '" + v1 + "' introuvable.");
    } catch {
      repondre("❌ Erreur lors de la suppression.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "listpublic_cmd",
    classe: "Owner",
    react: "📜",
    desc: "Liste les commandes publiques utilisablent quand le bot est en mode privé",
  },
  async (dest, ovl, { repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("❌ Vous n'avez pas la permission d'exécuter cette commande.");
    }
    const v1 = await list_cmd("public");
    if (!v1.length) {
      return repondre("❌ Aucune commande publique enregistrée.");
    }
    const v2 = v1.map((v12, v22) => "🔹 *" + (v22 + 1) + ".* " + v12.nom_cmd).join("\n");
    repondre("📖 *Commandes publiques enregistrées :*\n\n" + v2);
  },
);
ovlcmd(
  {
    nom_cmd: "setprivate_cmd",
    classe: "Owner",
    react: "🔒",
    desc: "Ajoute une commande privée utilisable par les utilisateurs premiums quand le bot est en mode public",
  },
  async (dest, ovl, { arg, repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("❌ Vous n'avez pas la permission d'exécuter cette commande.");
    }
    const v1 = arg[0];
    if (!v1) {
      return repondre("❌ Utilisation: setprivate_cmd nom_cmd");
    }
    try {
      await set_cmd(v1, "private");
      repondre("🔐 Commande privée '" + v1 + "' enregistrée.");
    } catch {
      repondre("❌ Erreur lors de l'enregistrement.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "delprivate_cmd",
    classe: "Owner",
    react: "🗑️",
    desc: "Supprime une commande des commandes privée",
  },
  async (dest, ovl, { arg, repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("❌ Vous n'avez pas la permission d'exécuter cette commande.");
    }
    const v1 = arg[0];
    if (!v1) {
      return repondre("❌ Utilisation: delprivate_cmd nom_cmd");
    }
    try {
      const v12 = await del_cmd(v1, "private");
      repondre(v12 ? "✅ Commande '" + v1 + "' supprimée." : "❌ Commande '" + v1 + "' introuvable.");
    } catch {
      repondre("❌ Erreur lors de la suppression.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "listprivate_cmd",
    classe: "Owner",
    react: "📃",
    desc: "Liste les commandes privées utilisablent par les utilisateurs premiums quand le bot est en mode public",
  },
  async (dest, ovl, { repondre, prenium_id }) => {
    if (!prenium_id) {
      return repondre("❌ Vous n'avez pas la permission d'exécuter cette commande.");
    }
    const v1 = await list_cmd("private");
    if (!v1.length) {
      return repondre("❌ Aucune commande privée enregistrée.");
    }
    const v2 = v1.map((v12, v22) => "🔹 *" + (v22 + 1) + ".* " + v12.nom_cmd).join("\n");
    repondre("🔒 *Commandes privées enregistrées :*\n\n" + v2);
  },
);
ovlcmd(
  {
    nom_cmd: "chatbot",
    classe: "Owner",
    react: "🤖",
    desc: "Active ou désactive le chatbot ici ou globalement.",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, verif_Groupe, prenium_id } = ctx;
    const v1 = arg[0]?.toLowerCase();
    if (!prenium_id) {
      repondre("❌ Pas autorisé.");
      return;
    }
    try {
      const [v12] = await ChatbotConf.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          chatbot_pm: "non",
          chatbot_gc: "non",
          enabled_ids: JSON.stringify([]),
        },
      });
      let v2 = [];
      try {
        v2 = JSON.parse(v12.enabled_ids || "[]");
      } catch {
        v2 = [];
      }
      if (v1 === "on") {
        if (v2.includes(dest)) {
          repondre("🔁 Le chatbot est *déjà activé ici*.");
        } else {
          v2.push(dest);
          v12.enabled_ids = JSON.stringify([...new Set(v2)]);
          v12.chatbot_pm = "non";
          v12.chatbot_gc = "non";
          await v12.save();
          repondre("✅ Le chatbot est maintenant activé *dans cette discussion*.");
        }
      } else if (v1 === "off") {
        v12.chatbot_pm = "non";
        v12.chatbot_gc = "non";
        v12.enabled_ids = JSON.stringify([]);
        await v12.save();
        repondre("⛔️ Le chatbot est maintenant désactivé *partout*.");
      } else if (["pm", "gc", "all"].includes(v1)) {
        v12.chatbot_pm = v1 === "pm" || v1 === "all" ? "oui" : "non";
        v12.chatbot_gc = v1 === "gc" || v1 === "all" ? "oui" : "non";
        v12.enabled_ids = JSON.stringify([]);
        await v12.save();
        const v13 = {
          pm: "✅ Le chatbot est maintenant activé *dans tous les chats privés*.",
          gc: "✅ Le chatbot est maintenant activé *dans tous les groupes*.",
          all: "✅ Le chatbot est maintenant activé *partout*.",
        };
        repondre(v13[v1]);
      } else {
        repondre(
          "🤖 *Gestion du Chatbot*\n\n`chatbot on` - Active ici uniquement\n`chatbot off` - Désactive *partout*\n`chatbot pm` - Active dans *tous les chats privés*\n`chatbot gc` - Active dans *tous les groupes*\n`chatbot all` - Active *partout*",
        );
      }
    } catch (e) {
      console.error("❌ Erreur dans la commande chatbot :", e);
      repondre("Une erreur est survenue.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "pglist",
    classe: "Owner",
    react: "🧩",
    desc: "Affiche la liste des plugins disponibles avec statut d'installation.",
    alias: ["pgl", "plist"],
  },
  async (dest, ovl, { repondre }) => {
    try {
      const { data } = await axios.get("https://pastebin.com/raw/5UA0CYYR");
      const v1 = await Plugin.findAll();
      const v2 = v1.map(v12 => v12.name.toLowerCase());
      let v3 = [];
      if (Array.isArray(data)) {
        v3 = data.map((v12, v22) => {
          const v32 = v2.includes(v12.name.toLowerCase());
          const v42 = v32 ? "✅" : "❌";
          return (
            "*" +
            v42 +
            " Plugin #" +
            (v22 + 1) +
            "*\n🧩 *Nom:* " +
            v12.name +
            "\n👤 *Auteur:* " +
            v12.author +
            "\n📦 *Installé:* " +
            (v32 ? "Oui ✅" : "Non ❌") +
            "\n🔗 *Lien:* " +
            v12.url +
            "\n📝 *Description:* " +
            (v12.description || "Aucune description")
          );
        });
      }
      const v4 = v1.filter(v12 => {
        return !data?.some(v13 => v13.name.toLowerCase() === v12.name.toLowerCase());
      });
      v4.forEach(v12 => {
        v3.push("*✅ Plugin personnalisé*\n🧩 *Nom:* " + v12.name + "\n");
      });
      const v5 =
        v3.length > 0 ? "📦 *Plugins disponibles :*\n\n" + v3.join("\n\n") : "❌ Aucun plugin disponible.";
      await repondre(v5);
    } catch (e) {
      console.error("Erreur pluginlist :", e);
      await repondre("❌ Une erreur est survenue lors du chargement des plugins.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "pgremove",
    classe: "Owner",
    react: "🗑️",
    desc: "Supprime un plugin installé par nom ou tape `remove all` pour tous.",
    alias: ["pgr"],
  },
  async (dest, ovl, { arg, repondre }) => {
    const v1 = arg[0];
    if (!v1) {
      return repondre("❌ Utilise `remove nom_plugin` ou `remove all`.");
    }
    if (v1 === "all") {
      const v12 = await Plugin.findAll();
      for (const v13 of v12) {
        const v14 = path.join(__dirname, "../plugins", v13.name + ".js");
        if (fs.existsSync(v14)) {
          fs.unlinkSync(v14);
        }
        await Plugin.destroy({
          where: {
            name: v13.name,
          },
        });
      }
      await reloadCommands();
      return repondre("🗑️ Tous les plugins ont été supprimés.");
    }
    const v2 = await Plugin.findOne({
      where: {
        name: v1,
      },
    });
    if (!v2) {
      return repondre("❌ Plugin non trouvé dans la base.");
    }
    const v3 = path.join(__dirname, "../plugins", v2.name + ".js");
    if (fs.existsSync(v3)) {
      fs.unlinkSync(v3);
    }
    await Plugin.destroy({
      where: {
        name: v1,
      },
    });
    await reloadCommands();
    return repondre("🗑️ Plugin *" + v1 + "* supprimé.");
  },
);
ovlcmd(
  {
    nom_cmd: "pginstall",
    classe: "Owner",
    react: "📥",
    desc: "Installe un plugin.",
    alias: ["pgi"],
  },
  async (dest, ovl, { arg, repondre }) => {
    const v1 = arg[0];
    if (!v1) {
      return repondre("❌ Donne un lien direct vers un plugin ou tape `pginstall all` pour tout installer.");
    }
    const v2 = async (v12, v22) => {
      try {
        const v13 = await Plugin.findOne({
          where: {
            name: v22,
          },
        });
        if (v13) {
          await repondre("⚠️ Plugin *" + v22 + "* déjà installé. Ignoré.");
          return;
        }
        const v23 = await axios.get(v12);
        const v3 = v23.data;
        const v4 = path.join(__dirname, "../plugins", v22 + ".js");
        fs.writeFileSync(v4, v3);
        const v5 = extractNpmModules(v3);
        if (v5.length > 0) {
          await repondre("⚙️ Installation des dépendances npm : " + v5.join(", "));
          await installModules(v5);
        }
        await Plugin.findOrCreate({
          where: {
            name: v22,
          },
          defaults: {
            url: v12,
          },
        });
        await repondre("✅ Plugin *" + v22 + "* installé avec succès.");
        await reloadCommands();
      } catch (e) {
        await repondre("❌ Erreur installation *" + v22 + "* : " + e.message);
      }
    };
    if (v1 === "all") {
      try {
        const { data } = await axios.get("https://pastebin.com/raw/5UA0CYYR");
        const v12 = await Plugin.findAll();
        const v22 = v12.map(v13 => v13.name.toLowerCase());
        const v3 = data.filter(v13 => !v22.includes(v13.name.toLowerCase()));
        if (v3.length === 0) {
          return await repondre("✅ Tous les plugins sont déjà installés.");
        }
        for (const v13 of v3) {
          await v2(v13.url, v13.name);
        }
        await repondre("✅ Installation terminée pour tous les plugins disponibles.");
      } catch (e) {
        await repondre("❌ Erreur de récupération des plugins : " + e.message);
      }
    } else {
      const v12 = v1;
      const v22 = path.basename(v12).replace(".js", "");
      await v2(v12, v22);
    }
  },
);
