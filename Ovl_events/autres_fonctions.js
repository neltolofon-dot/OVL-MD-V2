const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys");
const FileType = require("file-type");
const { getJid } = require("./Message_upsert_events");
async function dl_save_media_ms(v1, v2) {
  const v3 = v2.msg || v2;
  const v4 = v3.mimetype || "";
  const v5 = v3.mtype ? v3.mtype.replace(/Message/gi, "") : v4.split("/")[0];
  if (!v4) {
    throw new Error("MIME type manquant");
  }
  const v6 = await downloadContentFromMessage(v3, v5);
  const v7 = [];
  for await (const v12 of v6) {
    v7.push(v12);
  }
  const v8 = Buffer.concat(v7);
  const v9 = await FileType.fromBuffer(v8);
  if (!v9) {
    throw new Error("Type de fichier inconnu");
  }
  const v10 = "./downloads";
  if (!fs.existsSync(v10)) {
    fs.mkdirSync(v10, {
      recursive: true,
    });
  }
  const v11 = path.join(v10, "media_" + Date.now() + "." + v9.ext);
  await fs.promises.writeFile(v11, v8);
  setTimeout(() => {
    fs.unlink(v11, () => {});
  }, 300000);
  return v11;
}
const decodeJid = v1 => {
  if (!v1) {
    return v1;
  }
  if (/:\d+@/gi.test(v1)) {
    const v12 = jidDecode(v1) || {};
    return (v12.user && v12.server && v12.user + "@" + v12.server) || v1;
  }
  return v1;
};
async function recup_msg({ ovl, auteur, ms_org, temps = 30000 } = {}) {
  return new Promise(async (v1, v2) => {
    if (auteur !== undefined && typeof auteur !== "string") {
      return v2(new Error("L'auteur doit être une chaîne si défini."));
    }
    if (ms_org !== undefined && typeof ms_org !== "string") {
      return v2(new Error("Le ms_org doit être une chaîne si défini."));
    }
    if (typeof temps !== "number") {
      return v2(new Error("Le temps doit être un nombre."));
    }
    const v3 = auteur && ms_org ? await getJid(auteur, ms_org, ovl) : auteur;
    let v4;
    const v5 = async ({ type, messages }) => {
      if (type !== "notify") {
        return;
      }
      for (const v12 of messages) {
        const v13 = v12.key.remoteJidAlt || v12.key.remoteJid;
        let v22 = v12.key.fromMe
          ? decodeJid(ovl.user.id)
          : v12.key.senderPn || v12.key.participantAlt || v12.key.participant
            ? await getJid(v12.key.senderPn || v12.key.participantAlt || v12.key.participant, v13, ovl)
            : v13;
        const v32 =
          (v3 && ms_org && v22 == v3 && v13 == ms_org) ||
          (v3 && !ms_org && v22 == v3) ||
          (!v3 && ms_org && v13 == ms_org) ||
          (!v3 && !ms_org);
        if (v32) {
          ovl.ev.off("messages.upsert", v5);
          if (v4) {
            clearTimeout(v4);
          }
          if ((v12.key.participantAlt || v12.key.participant) && !v12.key.fromMe) {
            v12.key.participant = await getJid(v12.key.participantAlt || v12.key.participant, v13, ovl);
          }
          v12.key.remoteJid = v13;
          return v1(v12);
        }
      }
    };
    ovl.ev.on("messages.upsert", v5);
    if (temps > 0) {
      v4 = setTimeout(() => {
        ovl.ev.off("messages.upsert", v5);
        v2(new Error("Timeout"));
      }, temps);
    }
  });
}
module.exports = {
  dl_save_media_ms,
  recup_msg,
};
