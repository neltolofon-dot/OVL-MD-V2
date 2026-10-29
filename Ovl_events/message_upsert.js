const {
  rankAndLevelUp,
  lecture_status,
  like_status,
  presence,
  dl_status,
  antidelete,
  antitag,
  antilink,
  antibot,
  autoread_msg,
  getJid,
  mention,
  eval_exec,
  antimention,
  chatbot,
  antispam,
  autoreact_msg,
} = require("./Message_upsert_events");
const { Bans, OnlyAdmins } = require("../DataBase/ban");
const { Sudo } = require("../DataBase/sudo");
const { getMessage, addMessage } = require("../lib/store");
const { jidDecode, getContentType } = require("@whiskeysockets/baileys");
const evt = require("../lib/ovlcmd");
const config = require("../set");
const { get_stick_cmd } = require("../DataBase/stick_cmd");
const { list_cmd } = require("../DataBase/public_private_cmd");
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
async function getSudoUsers() {
  try {
    const v1 = await Sudo.findAll({
      attributes: ["id"],
    });
    return v1.map(v12 => v12.id.replace(/@s\.whatsapp\.net$/, ""));
  } catch {
    return [];
  }
}
async function isBanned(v1, v2) {
  const v3 = await Bans.findOne({
    where: {
      id: v2,
      type: v1,
    },
  });
  return !!v3;
}
async function message_upsert(v1, v2) {
  try {
    if (v1.type !== "notify") {
      return;
    }
    const v12 = v1.messages?.[0];
    if (!v12?.message) {
      return;
    }
    addMessage(v12.key.id, v12);
    const v22 = getContentType(v12.message);
    const v3 =
      {
        conversation: v12.message.conversation,
        imageMessage: v12.message.imageMessage?.caption,
        videoMessage: v12.message.videoMessage?.caption,
        extendedTextMessage: v12.message.extendedTextMessage?.text,
        buttonsResponseMessage: v12.message.buttonsResponseMessage?.selectedButtonId,
        listResponseMessage: v12.message.listResponseMessage?.singleSelectReply?.selectedRowId,
        messageContextInfo:
          v12.message.buttonsResponseMessage?.selectedButtonId ||
          v12.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
          v12.text,
      }[v22] || "";
    const v4 = decodeJid(v2.user.id);
    const v5 = v4.split("@")[0];
    const v6 =
      (v12.key.remoteJidAlt || v12.key.remoteJid) === decodeJid(v2.user.lid)
        ? v4
        : v12.key.remoteJidAlt || v12.key.remoteJid;
    const v7 = v6.endsWith("@g.us");
    const v8 = v7 ? await v2.groupMetadata(v6) : {};
    const v9 = v8.subject || "";
    const v10 = v7 ? v8.participants : [];
    const v11 = v10.filter(v110 => v110.admin).map(v110 => v110.jid);
    const v122 = v7 && v11.includes(v4);
    const v13 = v7
      ? await getJid(decodeJid(v12.key.participantAlt || v12.key.participant), v6, v2)
      : v12.key.fromMe
        ? v4
        : decodeJid(
            v12.key.participantPn ||
              v12.key.participant ||
              v12.key.remoteJidAlt ||
              v12.key.senderPn ||
              v12.key.remoteJid,
          );
    const v14 = v12.message?.[v22]?.contextInfo?.quotedMessage;
    const v15 = v12.message?.[v22]?.contextInfo;
    const v16 = v12.message?.[v22]?.contextInfo?.participant;
    const v17 = v16 == decodeJid(v2.user.lid) ? v4 : await getJid(decodeJid(v16), v6, v2);
    const v18 = v12.message?.[v22]?.contextInfo?.mentionedJid || [];
    const v19 = await Promise.all(v18.map(v110 => getJid(v110, v6, v2)));
    const v20 = v12.pushName;
    const v21 = v3.trimStart().startsWith(config.PREFIXE);
    const v222 = v21 ? v3.trimStart().slice(config.PREFIXE.length).trimStart().split(/ +/).slice(1) : [];
    const v23 = v21 ? v3.slice(config.PREFIXE.length).trim().split(/ +/)[0].toLowerCase() : "";
    const v24 = "22651463203";
    const v25 = "22605463559";
    const v26 = "221772430620";
    const v27 = [v24, v25];
    const v28 = await getSudoUsers();
    const v29 = [v24, v25, v5, config.NUMERO_OWNER, ...v28].map(v110 => v110 + "@s.whatsapp.net");
    const v30 = v29.includes(v13);
    const v31 = v27.map(v110 => v110 + "@s.whatsapp.net");
    const v32 = v31.includes(v13);
    const v33 = v7 && (v11.includes(v13) || v30);
    const v34 = (v110, v210) => {
      const v39 = v210 || v6;
      return v2.sendMessage(
        v39,
        {
          text: v110,
        },
        {
          quoted: v12,
        },
      );
    };
    const v35 = v7 ? "👥 " + v9 : "💬 Privé";
    console.log(
      "\n━━━━━━━[ OVL-LOG-MSG ]━━━━━━\n" +
        ("👤 Auteur  : " + v20 + " (" + v13 + ")\n") +
        ("🏷️ Source  : " + v35 + "\n") +
        ("📩 Type    : " + v22 + "\n") +
        (v3 && v3.trim() !== "" ? "📝 Texte   : " + v3 + "\n" : "") +
        "━━━━━━━━━━━━━━━━━━━━━━━\n",
    );
    const v36 = {
      verif_Groupe: v7,
      mbre_membre: v10,
      membre_Groupe: v13,
      verif_Admin: v33,
      infos_Groupe: v8,
      nom_Groupe: v9,
      auteur_Message: v13,
      nom_Auteur_Message: v20,
      mtype: v22,
      id_Bot: v4,
      prenium_id: v30,
      dev_id: v32,
      dev_num: v31,
      id_Bot_N: v5,
      verif_Ovl_Admin: v122,
      prefixe: config.PREFIXE,
      arg: v222,
      repondre: v34,
      groupe_Admin: () => v11,
      msg_Repondu: v14,
      auteur_Msg_Repondu: v17,
      ms: v12,
      ms_org: v6,
      texte: v3,
      getJid,
      quote: v15,
    };
    const v37 = async (v110, v210 = false) => {
      const v39 = await list_cmd("private");
      const v42 = await list_cmd("public");
      const v52 = v39.some(v111 => v111.nom_cmd === v110.nom_cmd || v110.alias?.includes(v111.nom_cmd));
      const v62 = v42.some(v111 => v111.nom_cmd === v110.nom_cmd || v110.alias?.includes(v111.nom_cmd));
      if (!v6.endsWith("@newsletter")) {
        if (config.MODE !== "public" && !v30 && !v62) {
          return;
        }
        if (config.MODE === "public" && !v30 && v52) {
          return;
        }
        const v111 = ["120363314687943170@g.us", "120363404635307998@g.us"];
        if (v111.includes(v6) && v13 !== "221772430620@s.whatsapp.net" && v13 !== v32) {
          return;
        }
        if (!v30 && (await isBanned("user", v13))) {
          return;
        }
        if (!v30 && v7 && (await isBanned("group", v6))) {
          return;
        }
        if (
          !v33 &&
          v7 &&
          (await OnlyAdmins.findOne({
            where: {
              id: v6,
            },
          }))
        ) {
          return;
        }
      }
      if (!v210) {
        await v2.sendMessage(v6, {
          react: {
            text: v110.react || "🪄",
            key: v12.key,
          },
        });
      }
      await v110.fonction(v6, v2, v36);
    };
    if (v21) {
      const v110 = evt.cmd.find(v111 => v111.nom_cmd === v23 || v111.alias?.includes(v23));
      if (v110) {
        await v37(v110);
      }
    }
    if (v12?.message?.stickerMessage) {
      try {
        const v110 = await get_stick_cmd();
        const v210 = v110.find(
          v111 => v111.stick_hash === v12.message.stickerMessage.fileSha256?.toString("base64"),
        );
        if (v210) {
          const v111 = evt.cmd.find(
            v112 => v112.nom_cmd === v210.no_cmd || v112.alias?.includes(v210.no_cmd),
          );
          if (v111) {
            await v37(v111, true);
          }
        }
      } catch (e) {
        console.error("Erreur sticker command:", e);
      }
    }
    const v38 = ["120363314687943170@g.us", "120363404635307998@g.us"];
    if (!v32 && v13 !== "221772430620@s.whatsapp.net" && !v31.includes(v4) && v38.includes(v6)) {
      return;
    }
    rankAndLevelUp(v2, v6, v3, v13, v20, config, v12);
    presence(v2, v6);
    lecture_status(v2, v12, v6);
    like_status(v2, v12, v6, v4, v13);
    dl_status(v2, v6, v12, v4);
    eval_exec(v2, v36, {
      ...v36,
    });
    chatbot(v6, v7, v3, v34, v19, v4, v17, v13);
    antidelete(v2, v12, v13, v22, getMessage, v6, v4);
    antimention(v2, v6, v12, v7, v33, v122, v13);
    antitag(v2, v12, v6, v22, v7, v122, v33, v13);
    mention(v2, v6, v12, v22, v7, v4, v34, v19);
    antilink(v2, v6, v12, v3, v7, v33, v122, v13);
    antibot(v2, v6, v12, v7, v33, v122, v13);
    antispam(v2, v6, v12, v13, v7, v33, v122);
    autoread_msg(v2, v12.key);
    autoreact_msg(v2, v12, v6);
    for (const v110 of evt.func) {
      try {
        await v110.fonction(v6, v2, v36);
      } catch (e) {
        console.error("Erreur dans la fonction isfunc '" + v110.nom_cmd + "':", e);
      }
    }
  } catch (e) {
    console.error("❌ Erreur(message.upsert):", e);
  }
}
module.exports = message_upsert;
