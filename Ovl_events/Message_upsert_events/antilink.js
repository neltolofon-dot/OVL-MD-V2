const { Antilink, Antilink_warnings } = require("../../DataBase/antilink");
function containsLink(v1) {
  const v2 = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
  return v2.test(v1);
}
async function antilink(v1, v2, v3, v4, v5, v6, v7, v8) {
  try {
    if (containsLink(v4)) {
      const v12 = await Antilink.findOne({
        where: {
          id: v2,
        },
      });
      if (v5 && v12 && v12.mode === "oui") {
        if (!v6 && v7) {
          const v13 = v8.split("@")[0];
          const v22 = {
            remoteJid: v2,
            fromMe: false,
            id: v3.key.id,
            participant: v8,
          };
          switch (v12.type) {
            case "supp":
              await v1.sendMessage(v2, {
                text: "@" + v13 + ", les liens ne sont pas autorisés ici.",
                mentions: [v8],
              });
              await v1.sendMessage(v2, {
                delete: v22,
              });
              break;
            case "kick":
              await v1.sendMessage(v2, {
                text: "@" + v13 + " a été retiré pour avoir envoyé un lien.",
                mentions: [v8],
              });
              await v1.sendMessage(v2, {
                delete: v22,
              });
              await v1.groupParticipantsUpdate(v2, [v8], "remove");
              break;
            case "warn":
              let v14 = await Antilink_warnings.findOne({
                where: {
                  groupId: v2,
                  userId: v8,
                },
              });
              if (!v14) {
                await Antilink_warnings.create({
                  groupId: v2,
                  userId: v8,
                });
                await v1.sendMessage(v2, {
                  delete: v22,
                });
                await v1.sendMessage(v2, {
                  text: "@" + v13 + ", avertissement 1/3 pour avoir envoyé un lien.",
                  mentions: [v8],
                });
              } else {
                v14.count += 1;
                await v14.save();
                if (v14.count >= 3) {
                  await v1.sendMessage(v2, {
                    text: "@" + v13 + " a été retiré après 3 avertissements.",
                    mentions: [v8],
                  });
                  await v1.sendMessage(v2, {
                    delete: v22,
                  });
                  await v1.groupParticipantsUpdate(v2, [v8], "remove");
                  await v14.destroy();
                } else {
                  await v1.sendMessage(v2, {
                    delete: v22,
                  });
                  await v1.sendMessage(v2, {
                    text: "@" + v13 + ", avertissement " + v14.count + "/3 pour avoir envoyé un lien.",
                    mentions: [v8],
                  });
                }
              }
              break;
            default:
              console.error("⚠️ Action inconnue : " + v12.type);
          }
        }
      }
    }
  } catch (e) {
    console.error("❌ Erreur dans le système Antilink :", e);
  }
}
module.exports = antilink;
