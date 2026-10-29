const { Antispam, AntispamWarnings } = require("../../DataBase/antispam");
const messageStore = {};
const advancedSurveillance = {};
async function antispam(v1, v2, v3, v4, v5, v6, v7) {
  try {
    if (!v5 || !v4 || !v3.key?.id) {
      return;
    }
    if (v6 || !v7) {
      return;
    }
    const v12 = Date.now();
    if (!messageStore[v2]) {
      messageStore[v2] = {};
    }
    if (!messageStore[v2][v4]) {
      messageStore[v2][v4] = [];
    }
    const v22 = messageStore[v2][v4];
    const v32 = advancedSurveillance[v2]?.[v4];
    if (v32 && v12 - v32 < 2500) {
      try {
        await v1.sendMessage(v2, {
          delete: {
            remoteJid: v2,
            fromMe: false,
            id: v3.key.id,
            participant: v4,
          },
        });
      } catch (e) {
        console.error(e);
      }
      return;
    }
    v22.push({
      id: v3.key.id,
      timestamp: v12,
    });
    if (v22.length > 10) {
      v22.shift();
    }
    const v42 = await Antispam.findOne({
      where: {
        id: v2,
      },
    });
    if (!v42 || v42.mode?.toLowerCase() !== "oui") {
      return;
    }
    for (let v13 = 0; v13 <= v22.length - 5; v13++) {
      const v14 = v22[v13];
      const v23 = v22[v13 + 4];
      const v33 = v23.timestamp - v14.timestamp;
      if (v33 < 15000) {
        advancedSurveillance[v2] ??= {};
        advancedSurveillance[v2][v4] = v12;
        for (let v16 = v13; v16 <= v13 + 4; v16++) {
          try {
            await v1.sendMessage(v2, {
              delete: {
                remoteJid: v2,
                fromMe: false,
                id: v22[v16].id,
                participant: v4,
              },
            });
          } catch (e) {
            console.error(e);
          }
        }
        const v15 = "@" + v4.split("@")[0];
        try {
          switch (v42.type) {
            case "supp":
              await v1.sendMessage(
                v2,
                {
                  text: v15 + ", le spam est interdit ici.",
                  mentions: [v4],
                },
                {
                  quoted: v3,
                },
              );
              break;
            case "kick":
              await v1.sendMessage(
                v2,
                {
                  text: v15 + " a été retiré pour spam.",
                  mentions: [v4],
                },
                {
                  quoted: v3,
                },
              );
              await v1.groupParticipantsUpdate(v2, [v4], "remove");
              break;
            case "warn":
              let v16 = await AntispamWarnings.findOne({
                where: {
                  groupId: v2,
                  userId: v4,
                },
              });
              if (!v16) {
                await AntispamWarnings.create({
                  groupId: v2,
                  userId: v4,
                  count: 1,
                });
                await v1.sendMessage(
                  v2,
                  {
                    text: v15 + ", avertissement 1/3 pour spam.",
                    mentions: [v4],
                  },
                  {
                    quoted: v3,
                  },
                );
              } else {
                v16.count += 1;
                await v16.save();
                if (v16.count >= 3) {
                  await v1.sendMessage(
                    v2,
                    {
                      text: v15 + " retiré après 3 avertissements.",
                      mentions: [v4],
                    },
                    {
                      quoted: v3,
                    },
                  );
                  await v1.groupParticipantsUpdate(v2, [v4], "remove");
                  await v16.destroy();
                } else {
                  await v1.sendMessage(
                    v2,
                    {
                      text: v15 + ", avertissement " + v16.count + "/3 pour spam.",
                      mentions: [v4],
                    },
                    {
                      quoted: v3,
                    },
                  );
                }
              }
              break;
          }
        } catch (e) {
          console.error(e);
        }
        messageStore[v2][v4] = v22.slice(-1);
        break;
      }
    }
  } catch (e) {
    console.error("Erreur dans Antispam:", e);
  }
}
module.exports = antispam;
