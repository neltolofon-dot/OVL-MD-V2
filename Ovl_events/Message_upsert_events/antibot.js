const { Antibot, AntibotWarnings } = require("../../DataBase/antibot");
async function antibot(v1, v2, v3, v4, v5, v6, v7) {
  try {
    const v12 =
      v3.key.id.startsWith("BAES") ||
      v3.key.id.startsWith("BAE5") ||
      v3.key.id.startsWith("EVO") ||
      v3.key.id.startsWith("3EB0");
    if (v12) {
      const v13 = await Antibot.findOne({
        where: {
          id: v2,
        },
      });
      if (v4 && v13 && v13.mode === "oui") {
        if (!v5 && v6) {
          const v14 = {
            remoteJid: v2,
            fromMe: false,
            id: v3.key.id,
            participant: v7,
          };
          const v22 = v7.split("@")[0];
          switch (v13.type) {
            case "supp":
              await v1.sendMessage(
                v2,
                {
                  text: "@" + v22 + ", les bots ne sont pas autorisés ici.",
                  mentions: [v7],
                },
                {
                  quoted: v3,
                },
              );
              await v1.sendMessage(v2, {
                delete: v14,
              });
              break;
            case "kick":
              await v1.sendMessage(
                v2,
                {
                  text: "@" + v22 + " a été retiré pour avoir utilisé un bot.",
                  mentions: [v7],
                },
                {
                  quoted: v3,
                },
              );
              await v1.sendMessage(v2, {
                delete: v14,
              });
              await v1.groupParticipantsUpdate(v2, [v7], "remove");
              break;
            case "warn":
              let v15 = await AntibotWarnings.findOne({
                where: {
                  groupId: v2,
                  userId: v7,
                },
              });
              if (!v15) {
                await AntibotWarnings.create({
                  groupId: v2,
                  userId: v7,
                });
                await v1.sendMessage(v2, {
                  delete: v14,
                });
                await v1.sendMessage(
                  v2,
                  {
                    text: "@" + v22 + ", avertissement 1/3 pour utilisation de bot.",
                    mentions: [v7],
                  },
                  {
                    quoted: v3,
                  },
                );
              } else {
                v15.count += 1;
                await v15.save();
                if (v15.count >= 3) {
                  await v1.sendMessage(
                    v2,
                    {
                      text: "@" + v22 + " a été retiré après 3 avertissements.",
                      mentions: [v7],
                    },
                    {
                      quoted: v3,
                    },
                  );
                  await v1.sendMessage(v2, {
                    delete: v14,
                  });
                  await v1.groupParticipantsUpdate(v2, [v7], "remove");
                  await v15.destroy();
                } else {
                  await v1.sendMessage(v2, {
                    delete: v14,
                  });
                  await v1.sendMessage(
                    v2,
                    {
                      text: "@" + v22 + ", avertissement " + v15.count + "/3 pour utilisation de bot.",
                      mentions: [v7],
                    },
                    {
                      quoted: v3,
                    },
                  );
                }
              }
              break;
            default:
              console.error("Action inconnue : " + v13.type);
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur dans le système Anti-Bot :", e);
  }
}
module.exports = antibot;
