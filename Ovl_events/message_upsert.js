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

const decodeJid = jid => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const decoded = jidDecode(jid) || {};
    return (decoded.user && decoded.server && decoded.user + "@" + decoded.server) || jid;
  }
  return jid;
};

async function getSudoUsers() {
  try {
    const rows = await Sudo.findAll({ attributes: ["id"] });
    return rows.map(row => row.id.replace(/@s\.whatsapp\.net$/, ""));
  } catch {
    return [];
  }
}

async function isBanned(type, id) {
  const ban = await Bans.findOne({ where: { id, type } });
  return !!ban;
}

function extraireTexte(message, mtype) {
  return (
    {
      conversation: message.conversation,
      imageMessage: message.imageMessage?.caption,
      videoMessage: message.videoMessage?.caption,
      extendedTextMessage: message.extendedTextMessage?.text,
      buttonsResponseMessage: message.buttonsResponseMessage?.selectedButtonId,
      listResponseMessage: message.listResponseMessage?.singleSelectReply?.selectedRowId,
      messageContextInfo:
        message.buttonsResponseMessage?.selectedButtonId ||
        message.listResponseMessage?.singleSelectReply?.selectedRowId ||
        message.text,
    }[mtype] || ""
  );
}

async function message_upsert(upsert, ovl) {
  try {
    if (upsert.type !== "notify") return;

    const ms = upsert.messages?.[0];
    if (!ms?.message) return;

    addMessage(ms.key.id, ms);

    const mtype = getContentType(ms.message);
    const texte = extraireTexte(ms.message, mtype);

    const id_Bot = decodeJid(ovl.user.id);
    const id_Bot_N = id_Bot.split("@")[0];

    const ms_org =
      (ms.key.remoteJidAlt || ms.key.remoteJid) === decodeJid(ovl.user.lid)
        ? id_Bot
        : ms.key.remoteJidAlt || ms.key.remoteJid;

    const verif_Groupe = ms_org.endsWith("@g.us");
    const infos_Groupe = verif_Groupe ? await ovl.groupMetadata(ms_org) : {};
    const nom_Groupe = infos_Groupe.subject || "";
    const mbre_membre = verif_Groupe ? infos_Groupe.participants : [];
    const admins_Groupe = mbre_membre.filter(p => p.admin).map(p => p.jid);
    const verif_Ovl_Admin = verif_Groupe && admins_Groupe.includes(id_Bot);

    const auteur_Message = verif_Groupe
      ? await getJid(decodeJid(ms.key.participantAlt || ms.key.participant), ms_org, ovl)
      : ms.key.fromMe
        ? id_Bot
        : decodeJid(
            ms.key.participantPn ||
              ms.key.participant ||
              ms.key.remoteJidAlt ||
              ms.key.senderPn ||
              ms.key.remoteJid,
          );

    const msg_Repondu = ms.message?.[mtype]?.contextInfo?.quotedMessage;
    const quote = ms.message?.[mtype]?.contextInfo;
    const participant_Repondu = ms.message?.[mtype]?.contextInfo?.participant;
    const auteur_Msg_Repondu =
      participant_Repondu == decodeJid(ovl.user.lid)
        ? id_Bot
        : await getJid(decodeJid(participant_Repondu), ms_org, ovl);

    const mentionnes = ms.message?.[mtype]?.contextInfo?.mentionedJid || [];
    const jids_Mentionnes = await Promise.all(mentionnes.map(jid => getJid(jid, ms_org, ovl)));
    const nom_Auteur_Message = ms.pushName;

    // Un préfixe vide ferait passer *tout* message pour une commande.
    const prefixe = config.PREFIXE || ".";
    const est_Commande = prefixe.length > 0 && texte.trimStart().startsWith(prefixe);
    const arg = est_Commande
      ? texte.trimStart().slice(prefixe.length).trimStart().split(/ +/).slice(1)
      : [];
    const nom_Commande = est_Commande
      ? texte.trimStart().slice(prefixe.length).trim().split(/ +/)[0].toLowerCase()
      : "";

    // Droits : le propriétaire du bot, le bot lui-même et les sudo. Rien d'autre.
    const sudos = await getSudoUsers();
    const numeros_Prenium = [id_Bot_N, config.NUMERO_OWNER, ...sudos].filter(Boolean);
    const jids_Prenium = numeros_Prenium.map(n => n + "@s.whatsapp.net");
    const prenium_id = jids_Prenium.includes(auteur_Message);
    const verif_Admin = verif_Groupe && (admins_Groupe.includes(auteur_Message) || prenium_id);

    const repondre = (texte_Reponse, jid_Cible) =>
      ovl.sendMessage(jid_Cible || ms_org, { text: texte_Reponse }, { quoted: ms });

    const source = verif_Groupe ? "👥 " + nom_Groupe : "💬 Privé";
    console.log(
      "\n━━━━━━━[ OVL-LOG-MSG ]━━━━━━\n" +
        `👤 Auteur  : ${nom_Auteur_Message} (${auteur_Message})\n` +
        `🏷️ Source  : ${source}\n` +
        `📩 Type    : ${mtype}\n` +
        (texte && texte.trim() !== "" ? `📝 Texte   : ${texte}\n` : "") +
        "━━━━━━━━━━━━━━━━━━━━━━━\n",
    );

    const commandeOptions = {
      verif_Groupe,
      mbre_membre,
      membre_Groupe: auteur_Message,
      verif_Admin,
      infos_Groupe,
      nom_Groupe,
      auteur_Message,
      nom_Auteur_Message,
      mtype,
      id_Bot,
      prenium_id,
      // Conservé pour la compatibilité des commandes existantes : identique à
      // prenium_id, aucun numéro de "développeur" n'est codé en dur.
      dev_id: prenium_id,
      dev_num: jids_Prenium,
      id_Bot_N,
      verif_Ovl_Admin,
      prefixe,
      arg,
      repondre,
      groupe_Admin: () => admins_Groupe,
      msg_Repondu,
      auteur_Msg_Repondu,
      ms,
      ms_org,
      texte,
      getJid,
      quote,
    };

    const executerCommande = async (commande, sansReaction = false) => {
      const cmds_Privees = await list_cmd("private");
      const cmds_Publiques = await list_cmd("public");
      const est_Privee = cmds_Privees.some(
        c => c.nom_cmd === commande.nom_cmd || commande.alias?.includes(c.nom_cmd),
      );
      const est_Publique = cmds_Publiques.some(
        c => c.nom_cmd === commande.nom_cmd || commande.alias?.includes(c.nom_cmd),
      );

      if (!ms_org.endsWith("@newsletter")) {
        if (config.MODE !== "public" && !prenium_id && !est_Publique) return;
        if (config.MODE === "public" && !prenium_id && est_Privee) return;
        if (!prenium_id && (await isBanned("user", auteur_Message))) return;
        if (!prenium_id && verif_Groupe && (await isBanned("group", ms_org))) return;
        if (!verif_Admin && verif_Groupe && (await OnlyAdmins.findOne({ where: { id: ms_org } }))) return;
      }

      if (!sansReaction) {
        await ovl.sendMessage(ms_org, {
          react: { text: commande.react || "🪄", key: ms.key },
        });
      }
      await commande.fonction(ms_org, ovl, commandeOptions);
    };

    if (est_Commande) {
      const commande = evt.cmd.find(
        c => c.nom_cmd === nom_Commande || c.alias?.includes(nom_Commande),
      );
      if (commande) await executerCommande(commande);
    }

    if (ms?.message?.stickerMessage) {
      try {
        const stick_cmds = await get_stick_cmd();
        const assoc = stick_cmds.find(
          s => s.stick_hash === ms.message.stickerMessage.fileSha256?.toString("base64"),
        );
        if (assoc) {
          const commande = evt.cmd.find(
            c => c.nom_cmd === assoc.no_cmd || c.alias?.includes(assoc.no_cmd),
          );
          if (commande) await executerCommande(commande, true);
        }
      } catch (e) {
        console.error("Erreur sticker command:", e);
      }
    }

    rankAndLevelUp(ovl, ms_org, texte, auteur_Message, nom_Auteur_Message, config, ms);
    presence(ovl, ms_org);
    lecture_status(ovl, ms, ms_org);
    like_status(ovl, ms, ms_org, id_Bot, auteur_Message);
    dl_status(ovl, ms_org, ms, id_Bot);
    chatbot(
      ms_org,
      verif_Groupe,
      texte,
      repondre,
      jids_Mentionnes,
      id_Bot,
      auteur_Msg_Repondu,
      auteur_Message,
    );
    antidelete(ovl, ms, auteur_Message, mtype, getMessage, ms_org, id_Bot);
    antimention(ovl, ms_org, ms, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message);
    antitag(ovl, ms, ms_org, mtype, verif_Groupe, verif_Ovl_Admin, verif_Admin, auteur_Message);
    mention(ovl, ms_org, ms, mtype, verif_Groupe, id_Bot, repondre, jids_Mentionnes);
    antilink(ovl, ms_org, ms, texte, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message);
    antibot(ovl, ms_org, ms, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message);
    antispam(ovl, ms_org, ms, auteur_Message, verif_Groupe, verif_Admin, verif_Ovl_Admin);
    autoread_msg(ovl, ms.key);
    autoreact_msg(ovl, ms, ms_org);

    for (const fonction of evt.func) {
      try {
        await fonction.fonction(ms_org, ovl, commandeOptions);
      } catch (e) {
        console.error(`Erreur dans la fonction isfunc '${fonction.nom_cmd}':`, e);
      }
    }
  } catch (e) {
    console.error("❌ Erreur(message.upsert):", e);
  }
}

module.exports = message_upsert;
