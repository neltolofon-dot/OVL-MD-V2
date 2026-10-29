const { ovlcmd } = require("../lib/ovlcmd");
const { WA_CONF } = require("../DataBase/wa_conf");
const config = require("../set");
ovlcmd(
  {
    nom_cmd: "save",
    classe: "Status",
    react: "💾",
    desc: "Télécharge un statut WhatsApp",
  },
  async (dest, ovl, ctx) => {
    const { ms, msg_Repondu, repondre, quote, id_Bot } = ctx;
    try {
      if (!msg_Repondu || !quote?.remoteJid || quote.remoteJid !== "status@broadcast") {
        return repondre("Merci de répondre à un statut WhatsApp.");
      }
      let v1;
      let v2 = {
        quoted: ms,
      };
      if (msg_Repondu.extendedTextMessage) {
        await ovl.sendMessage(
          id_Bot,
          {
            text: msg_Repondu.extendedTextMessage.text,
          },
          v2,
        );
      } else if (msg_Repondu.imageMessage) {
        v1 = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
        await ovl.sendMessage(
          id_Bot,
          {
            image: {
              url: v1,
            },
            caption: msg_Repondu.imageMessage.caption,
          },
          v2,
        );
      } else if (msg_Repondu.videoMessage) {
        v1 = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
        await ovl.sendMessage(
          id_Bot,
          {
            video: {
              url: v1,
            },
            caption: msg_Repondu.videoMessage.caption,
          },
          v2,
        );
      } else if (msg_Repondu.audioMessage) {
        v1 = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
        await ovl.sendMessage(
          id_Bot,
          {
            audio: {
              url: v1,
            },
            mimetype: "audio/mp4",
            ptt: false,
          },
          v2,
        );
      } else {
        return repondre("Ce type de statut n'est pas pris en charge.");
      }
    } catch (e) {
      console.error("Erreur lors du téléchargement du statut :", e);
    }
  },
);
ovlcmd(
  {
    nom_cmd: "sendme",
    classe: "Status",
    react: "📤",
    desc: "Renvoie un statut mentionné par l'utilisateur",
  },
  async (dest, ovl, ctx) => {
    const { ms, msg_Repondu, repondre, quote } = ctx;
    try {
      if (!msg_Repondu || !quote?.remoteJid || quote.remoteJid !== "status@broadcast") {
        return repondre("❌ Réponds à un statut WhatsApp pour l'envoyer ici.");
      }
      let v1;
      const v2 = {
        quoted: ms,
      };
      if (msg_Repondu.extendedTextMessage) {
        const v12 = msg_Repondu.extendedTextMessage.text;
        await ovl.sendMessage(
          dest,
          {
            text: v12,
          },
          v2,
        );
      } else if (msg_Repondu.imageMessage) {
        v1 = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v1,
            },
            caption: msg_Repondu.imageMessage.caption || "",
          },
          v2,
        );
      } else if (msg_Repondu.videoMessage) {
        v1 = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
        await ovl.sendMessage(
          dest,
          {
            video: {
              url: v1,
            },
            caption: msg_Repondu.videoMessage.caption || "",
          },
          v2,
        );
      } else if (msg_Repondu.audioMessage) {
        v1 = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
        await ovl.sendMessage(
          dest,
          {
            audio: {
              url: v1,
            },
            mimetype: "audio/mp4",
            ptt: false,
          },
          v2,
        );
      } else {
        return repondre("❌ Ce type de statut n'est pas pris en charge.");
      }
    } catch (e) {
      console.error("Erreur lors du renvoi du statut :", e.message || e);
      return repondre("❌ Une erreur est survenue pendant le traitement.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "lecture_status",
    classe: "Status",
    react: "📖",
    desc: "Active ou désactive la lecture auto des status",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }
      const v1 = arg[0]?.toLowerCase();
      const [v2] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          lecture_status: "non",
        },
      });
      if (v1 === "off") {
        v2.lecture_status = "non";
        await v2.save();
        return repondre("La lecture du statut est maintenant désactivée.");
      }
      if (v1 === "on") {
        v2.lecture_status = "oui";
        await v2.save();
        return repondre("La lecture du statut est maintenant activée.");
      }
      return repondre(
        "Utilisation :\nlecture_status on: Activer la lecture du statut\nlecture_status off: Désactiver la lecture du statut",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration de lecture_status :", e);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "dl_status",
    classe: "Status",
    react: "📥",
    desc: "Active ou désactive le téléchargement auto des status",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }
      const v1 = arg[0]?.toLowerCase();
      const [v2] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          dl_status: "non",
        },
      });
      if (v1 === "off") {
        v2.dl_status = "non";
        await v2.save();
        return repondre("Le téléchargement du statut est maintenant désactivé.");
      }
      if (v1 === "on") {
        v2.dl_status = "oui";
        await v2.save();
        return repondre("Le téléchargement du statut est maintenant activé.");
      }
      return repondre(
        "Utilisation :\ndl_status on: Activer le téléchargement du statut\ndl_status off: Désactiver le téléchargement du statut",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration de dl_status :", e);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "likestatus",
    classe: "Status",
    react: "👍",
    desc: "Active ou désactive les likes automatiques sur les statuts",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("❌ Seuls les utilisateurs *premium* peuvent utiliser cette commande.");
      }
      const v1 = arg[0]?.toLowerCase();
      const [v2] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          like_status: "non",
        },
      });
      const v3 = () => {
        return repondre(
          "🔧 *Paramètres des Likes Auto sur Statuts :*\n\n" +
            ("• *" + config.PREFIXE + "likestatus <emojie>* : Active avec <emojie>\n") +
            ("• *" + config.PREFIXE + "likestatus off* : Désactive les likes automatiques\n\n") +
            ("📌 *Exemple :* " + config.PREFIXE + "likestatus 🤣\n") +
            ("📊 Statut actuel : *" +
              (v2.like_status === "non" ? "Désactivé" : "Activé (" + v2.like_status + ")") +
              "*"),
        );
      };
      if (!v1 || v1 === "") {
        return v3();
      }
      if (v1 === "off") {
        v2.like_status = "non";
        await v2.save();
        return repondre("👍 Les likes automatiques ont été *désactivés*.");
      }
      const v4 = /^(?:\p{Emoji}(?:\p{Emoji_Modifier}?|\uFE0F)?(?:\u200D\p{Emoji})*)$/u;
      if (!v4.test(v1)) {
        return v3();
      }
      v2.like_status = v1;
      await v2.save();
      return repondre("✅ Les likes automatiques sont maintenant activés avec l'emoji " + v1);
    } catch (e) {
      console.error("❌ Erreur dans likestatus :", e);
      return repondre("❌ Une erreur s'est produite lors de la configuration.");
    }
  },
);
