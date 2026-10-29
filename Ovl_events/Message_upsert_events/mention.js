const { getMention } = require("../../DataBase/mention");
const getJid = require("./cache_jid");
async function mention(v1, v2, v3, v4, v5, v6, v7, v8) {
  try {
    if (v8 && v8.includes(v6)) {
      if (v5) {
        const v12 = await getMention();
        if (v12 && v12.mode === "oui") {
          const { url, text, type } = v12;
          if ((!url || url === "") && (!text || text === "")) {
            v7("Mention activée mais aucun contenu défini.");
            return;
          }
          switch (type) {
            case "audio":
              if (!url) {
                return v7(text || "Aucun contenu audio défini.");
              }
              v1.sendMessage(
                v2,
                {
                  audio: {
                    url,
                  },
                  mimetype: "audio/mpeg",
                },
                {
                  quoted: v3,
                },
              );
              break;
            case "image":
              if (!url) {
                return v7(text || "Aucun contenu image défini.");
              }
              v1.sendMessage(
                v2,
                {
                  image: {
                    url,
                  },
                  caption: text || undefined,
                },
                {
                  quoted: v3,
                },
              );
              break;
            case "video":
              if (!url) {
                return v7(text || "Aucun contenu vidéo défini.");
              }
              v1.sendMessage(
                v2,
                {
                  video: {
                    url,
                  },
                  caption: text || undefined,
                },
                {
                  quoted: v3,
                },
              );
              break;
            case "texte":
              return v7(text || "Aucun message texte défini.");
            default:
              v7("Le type de média est inconnu ou non pris en charge.");
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur dans mention:", e);
  }
}
module.exports = mention;
