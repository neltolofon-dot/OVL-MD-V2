const { Antitag, Antitag_warnings } = require("../../DataBase/antitag");
async function antitag(v1, v2, v3, v4, v5, v6, v7, v8) {
  if (v2.message?.[v4]?.contextInfo?.mentionedJid?.length > 30) {
    try {
      const v12 = await Antitag.findOne({
        where: {
          id: v3,
        },
      });
      if (v5 && v12 && v12.mode === "oui") {
        if (!v7 && v6) {
          const v13 = v8.split("@")[0];
          const v22 = {
            remoteJid: v3,
            fromMe: false,
            id: v2.key.id,
            participant: v8,
          };
          switch (v12.type) {
            case "supp":
              await v1.sendMessage(
                v3,
                {
                  text: "@" + v13 + ", l'envoi de tags multiples est interdit dans ce groupe.",
                  mentions: [v8],
                },
                {
                  quoted: v2,
                },
              );
              await v1.sendMessage(v3, {
                delete: v22,
              });
              break;
            case "kick":
              await v1.sendMessage(
                v3,
                {
                  text: "@" + v13 + " a été retiré du groupe pour avoir mentionné plus de 30 membres.",
                  mentions: [v8],
                },
                {
                  quoted: v2,
                },
              );
              await v1.sendMessage(v3, {
                delete: v22,
              });
              await v1.groupParticipantsUpdate(v3, [v8], "remove");
              break;
            case "warn":
              let v14 = await Antitag_warnings.findOne({
                where: {
                  groupId: v3,
                  userId: v8,
                },
              });
              if (!v14) {
                await Antitag_warnings.create({
                  groupId: v3,
                  userId: v8,
                });
                await v1.sendMessage(
                  v3,
                  {
                    text:
                      "@" +
                      v13 +
                      ", vous avez reçu un avertissement (1/3) pour avoir mentionné plus de 30 membres.",
                    mentions: [v8],
                  },
                  {
                    quoted: v2,
                  },
                );
                await v1.sendMessage(v3, {
                  delete: v22,
                });
              } else {
                v14.count += 1;
                await v14.save();
                if (v14.count >= 3) {
                  await v1.sendMessage(
                    v3,
                    {
                      text: "@" + v13 + " a été retiré du groupe après 3 avertissements.",
                      mentions: [v8],
                    },
                    {
                      quoted: v2,
                    },
                  );
                  await v1.sendMessage(v3, {
                    delete: v22,
                  });
                  await v1.groupParticipantsUpdate(v3, [v8], "remove");
                  await v14.destroy();
                } else {
                  await v1.sendMessage(
                    v3,
                    {
                      text:
                        "@" +
                        v13 +
                        ", avertissement " +
                        v14.count +
                        "/3 pour avoir mentionné plus de 30 membres.",
                      mentions: [v8],
                    },
                    {
                      quoted: v2,
                    },
                  );
                  await v1.sendMessage(v3, {
                    delete: v22,
                  });
                }
              }
              break;
            default:
              console.error("Action inconnue : " + v12.type);
          }
        }
      }
    } catch (e) {
      console.error("Erreur dans le système Antitag :", e);
    }
  }
}
module.exports = antitag;
