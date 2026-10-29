const { Antimention, Antimention_warnings } = require("../../DataBase/antimention");
async function antimention(v1, v2, v3, v4, v5, v6, v7) {
  try {
    const v12 = v3.message?.groupStatusMentionMessage;
    if (v12) {
      const v13 = await Antimention.findOne({
        where: {
          id: v2,
        },
      });
      if (v4) {
        if (v13 && v13.mode === "oui") {
          if (!v5 && v6) {
            const v14 = v7.split("@")[0];
            const v22 = {
              remoteJid: v2,
              fromMe: false,
              id: v3.key.id,
              participant: v7,
            };
            if (v13.type === "supp") {
              await v1.sendMessage(
                v2,
                {
                  text: "@" + v14 + ", la mention du groupe est interdite.",
                  mentions: [v7],
                },
                {
                  quoted: v3,
                },
              );
              await v1.sendMessage(v2, {
                delete: v22,
              });
            }
            if (v13.type === "kick") {
              await v1.sendMessage(
                v2,
                {
                  text: "@" + v14 + " a été retiré pour avoir mentionné tout le groupe.",
                  mentions: [v7],
                },
                {
                  quoted: v3,
                },
              );
              await v1.sendMessage(v2, {
                delete: v22,
              });
              await v1.groupParticipantsUpdate(v2, [v7], "remove");
            }
            if (v13.type === "warn") {
              let v15 = await Antimention_warnings.findOne({
                where: {
                  groupId: v2,
                  userId: v7,
                },
              });
              if (!v15) {
                await Antimention_warnings.create({
                  groupId: v2,
                  userId: v7,
                });
                await v1.sendMessage(v2, {
                  delete: v22,
                });
                await v1.sendMessage(
                  v2,
                  {
                    text: "@" + v14 + ", avertissement 1/3 pour mention abusive.",
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
                      text: "@" + v14 + " a été retiré après 3 avertissements.",
                      mentions: [v7],
                    },
                    {
                      quoted: v3,
                    },
                  );
                  await v1.sendMessage(v2, {
                    delete: v22,
                  });
                  await v1.groupParticipantsUpdate(v2, [v7], "remove");
                  await v15.destroy();
                } else {
                  await v1.sendMessage(v2, {
                    delete: v22,
                  });
                  await v1.sendMessage(
                    v2,
                    {
                      text: "@" + v14 + ", avertissement " + v15.count + "/3 pour mention abusive.",
                      mentions: [v7],
                    },
                    {
                      quoted: v3,
                    },
                  );
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur dans le système Antimention :", e);
  }
}
module.exports = antimention;
