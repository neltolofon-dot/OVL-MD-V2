const { GroupSettings, Events2 } = require("../DataBase/events");
const { jidDecode } = require("@whiskeysockets/baileys");
const { getJid } = require("./Message_upsert_events");
const { groupCache } = require("../lib/groupeCache");
const config = require("../set");
const parseID = v1 => {
  if (!v1) {
    return v1;
  }
  if (/:\d+@/gi.test(v1)) {
    const v12 = jidDecode(v1) || {};
    return (v12.user && v12.server && v12.user + "@" + v12.server) || v1;
  }
  return v1;
};
async function envoyerWelcomeGoodbye(v1, v2, v3, v4, v5) {
  const v6 = await v5.groupMetadata(v1);
  const v7 = v6.subject || "Groupe";
  const v8 = v6.participants.length;
  const v9 = v6.desc || "Aucune description";
  const v10 = "@" + v2.split("@")[0];
  const v11 = {
    welcome:
      v4.welcome_msg ||
      "🎉Bienvenue @user\n👥Groupe: #groupe\n🔆Membres: #membre\n📃Description: " + v9 + " #pp",
    goodbye: v4.goodbye_msg || "👋Au revoir @user #pp",
  }[v3];
  const v12 = v11.match(/#audio=(\S+)/i);
  const v13 = v11.match(/#url=(\S+)/i);
  const v14 = v11.includes("#pp");
  const v15 = v11.includes("#gpp");
  let v16 = v11
    .replace(/#audio=\S+/i, "")
    .replace(/#url=\S+/i, "")
    .replace(/#pp/gi, "")
    .replace(/#gpp/gi, "")
    .replace(/@user/gi, v10)
    .replace(/#groupe/gi, v7)
    .replace(/#membre/gi, v8)
    .replace(/#desc/gi, v9);
  const v17 = [v2];
  const v18 = {
    mentionedJid: v17,
  };
  let v19 = null;
  let v20 = null;
  if (v13) {
    v20 = v13[1];
    const v110 = v20.split(".").pop().toLowerCase();
    if (["mp4", "mov", "webm"].includes(v110)) {
      v19 = "video";
    } else if (["jpg", "jpeg", "png", "webp"].includes(v110)) {
      v19 = "image";
    } else {
      v19 = "document";
    }
  } else if (v14) {
    try {
      v20 = await v5.profilePictureUrl(v2, "image");
    } catch {
      v20 = "https://files.catbox.moe/82g8ey.jpg";
    }
    v19 = "image";
  } else if (v15) {
    try {
      v20 = await v5.profilePictureUrl(v1, "image");
    } catch {
      v20 = "https://files.catbox.moe/82g8ey.jpg";
    }
    v19 = "image";
  }
  if (v20 && v19) {
    const v110 = {
      [v19]: {
        url: v20,
      },
      caption: v16.trim() || undefined,
      mentions: v17,
      contextInfo: v18,
    };
    if (v19 === "video") {
      v110.video.gifPlayback = true;
    }
    await v5.sendMessage(v1, v110);
  } else if (v16.trim()) {
    await v5.sendMessage(v1, {
      text: v16.trim(),
      mentions: v17,
      contextInfo: v18,
    });
  }
  if (v12) {
    const v110 = v12[1];
    await v5.sendMessage(v1, {
      audio: {
        url: v110,
      },
      mimetype: "audio/mpeg",
    });
  }
}
async function group_participants_update(v1, v2) {
  try {
    const v12 = await v2.groupMetadata(v1.id);
    groupCache.set(v1.id, v12);
    const v22 = v12;
    const v3 = await GroupSettings.findOne({
      where: {
        id: v1.id,
      },
    });
    const v4 = await Events2.findOne({
      where: {
        id: v1.id,
      },
    });
    if (!v3) {
      return;
    }
    const { welcome, goodbye, antipromote, antidemote } = v3;
    const v5 = v4?.promoteAlert || "non";
    const v6 = v4?.demoteAlert || "non";
    for (const v13 of v1.participants) {
      const v14 = v1.author;
      const v23 = v14 ? "@" + v14.split("@")[0] : "quelqu’un";
      const v32 = "@" + v13.split("@")[0];
      const v42 = v14 ? [v13, v14] : [v13];
      const v52 = {
        mentionedJid: v42,
      };
      if (v1.action == "add" && welcome == "oui") {
        if (v4) {
          await envoyerWelcomeGoodbye(v1.id, v13, "welcome", v4, v2);
        }
      }
      if (v1.action == "remove" && goodbye == "oui") {
        if (v4) {
          await envoyerWelcomeGoodbye(v1.id, v13, "goodbye", v4, v2);
        }
      }
      if (v1.action == "promote" || v1.action == "demote") {
        const v15 = await getJid(v1.author, v1.id, v2);
        const v24 = await getJid(v22.owner, v1.id, v2);
        const v33 = await getJid(parseID(v2.user.id), v1.id, v2);
        const v43 = await getJid(v13, v1.id, v2);
        const v53 = config.NUMERO_OWNER
          ? await getJid(config.NUMERO_OWNER + "@s.whatsapp.net", v1.id, v2)
          : null;
        // Exemptés d'antipromote : le créateur du groupe, le bot, le
        // propriétaire du bot et la personne concernée. Aucun numéro tiers.
        const v8 = [v24, v33, v53, v43].filter(Boolean).includes(v15);
        if (v1.action == "promote") {
          if (antipromote == "oui" && v8) {
            continue;
          }
          if (antipromote == "oui") {
            await v2.groupParticipantsUpdate(v1.id, [v13], "demote");
            await v2.sendMessage(v1.id, {
              text: "🚫 *Promotion refusée !*\n" + v23 + " n’a pas le droit de promouvoir " + v32 + ".",
              mentions: v42,
              contextInfo: v52,
            });
          } else if (v5 == "oui") {
            let v16 = "https://files.catbox.moe/82g8ey.jpg";
            try {
              v16 = await v2.profilePictureUrl(v13, "image");
            } catch {}
            await v2.sendMessage(v1.id, {
              image: {
                url: v16,
              },
              caption: "🆙 " + v32 + " a été promu par " + v23 + ".",
              mentions: v42,
              contextInfo: v52,
            });
          }
        }
        if (v1.action == "demote") {
          if (antidemote == "oui" && v8) {
            continue;
          }
          if (antidemote == "oui") {
            await v2.groupParticipantsUpdate(v1.id, [v13], "promote");
            await v2.sendMessage(v1.id, {
              text: "🚫 *Rétrogradation refusée !*\n" + v23 + " ne peut pas rétrograder " + v32 + ".",
              mentions: v42,
              contextInfo: v52,
            });
          } else if (v6 == "oui") {
            let v16 = "https://files.catbox.moe/82g8ey.jpg";
            try {
              v16 = await v2.profilePictureUrl(v13, "image");
            } catch {}
            await v2.sendMessage(v1.id, {
              image: {
                url: v16,
              },
              caption: "⬇️ " + v32 + " a été rétrogradé par " + v23 + ".",
              mentions: v42,
              contextInfo: v52,
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("❌ Erreur group_participants_update :", e);
  }
}
module.exports = group_participants_update;
