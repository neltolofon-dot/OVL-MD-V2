const { WA_CONF } = require("../../DataBase/wa_conf");
async function dl_status(v1, v2, v3, v4) {
  const v5 = await WA_CONF.findOne({
    where: {
      id: "1",
    },
  });
  if (v5) {
    if (v2 === "status@broadcast" && v5.dl_status === "oui") {
      try {
        if (v3.message.extendedTextMessage) {
          await v1.sendMessage(
            v4,
            {
              text: v3.message.extendedTextMessage.text,
            },
            {
              quoted: v3,
            },
          );
        } else if (v3.message.imageMessage) {
          let v12 = await v1.dl_save_media_ms(v3.message.imageMessage);
          await v1.sendMessage(
            v4,
            {
              image: {
                url: v12,
              },
              caption: v3.message.imageMessage.caption,
            },
            {
              quoted: v3,
            },
          );
        } else if (v3.message.videoMessage) {
          let v12 = await v1.dl_save_media_ms(v3.message.videoMessage);
          await v1.sendMessage(
            v4,
            {
              video: {
                url: v12,
              },
              caption: v3.message.videoMessage.caption,
            },
            {
              quoted: v3,
            },
          );
        }
      } catch (e) {
        console.error("Erreur lors du traitement du message status:", e);
      }
    }
  }
}
module.exports = dl_status;
