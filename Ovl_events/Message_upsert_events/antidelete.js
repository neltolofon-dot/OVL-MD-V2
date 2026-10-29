const { WA_CONF } = require("../../DataBase/wa_conf");
async function antidelete(v1, v2, v3, v4, v5, v6, v7) {
  const v8 = await WA_CONF.findOne({
    where: {
      id: "1",
    },
  });
  if (!v8) {
    return;
  }
  try {
    const v12 = v8.antidelete;
    const v22 = ["pm", "gc", "status", "all", "pm/gc", "pm/status", "gc/status"];
    const v32 = v22.some(v13 => v12.startsWith(v13));
    if (!v32) {
      return;
    }
    if (v4 === "protocolMessage") {
      const v13 = v2.message.protocolMessage;
      if (!v13?.key?.id) {
        return;
      }
      const v23 = v5(v13.key.id);
      if (!v23) {
        return;
      }
      const v33 = v23.key.remoteJidAlt || v23.key.remoteJid;
      const v42 = v33?.endsWith("@g.us");
      const v52 = v42 ? v23.key.participant || v23.participant : v33;
      const v62 = new Date().toISOString().substr(11, 8);
      if (!v23.key.fromMe) {
        function v14(v15) {
          return v12.includes(v15);
        }
        const v24 =
          (v14("gc") && v33.endsWith("@g.us")) ||
          (v14("pm") && v33.endsWith("@s.whatsapp.net")) ||
          (v14("status") && v33.endsWith("status@broadcast")) ||
          v14("all") ||
          (v14("pm/gc") && (v33.endsWith("@g.us") || v33.endsWith("@s.whatsapp.net"))) ||
          (v14("pm/status") && (v33.endsWith("status@broadcast") || v33.endsWith("@s.whatsapp.net"))) ||
          (v14("gc/status") && (v33.endsWith("@g.us") || v33.endsWith("status@broadcast")));
        if (!v24) {
          return;
        }
        if (v12.includes("-org")) {
          if (v12.includes("status") && v33.endsWith("status@broadcast")) {
            await v1.sendMessage(
              v7,
              {
                forward: v23,
                contextInfo: {
                  externalAdReply: {
                    title: "OVL-MD-V2-ANTIDELETE",
                  },
                },
              },
              {
                quoted: v23,
              },
            );
          } else {
            if (!v6) {
              return;
            }
            const v15 = v23.message;
            const v25 = Object.keys(v15 || {})[0];
            if (v25 === "conversation" || v25 === "extendedTextMessage") {
              const v16 = v15?.conversation || v15?.extendedTextMessage?.text || "📝 Message supprimé (vide)";
              await v1.sendMessage(
                v6,
                {
                  text: v16,
                  contextInfo: {
                    externalAdReply: {
                      title: "OVL-MD-V2-ANTIDELETE",
                    },
                  },
                },
                {
                  quoted: v23,
                },
              );
            } else {
              await v1.sendMessage(
                v6,
                {
                  forward: v23,
                  contextInfo: {
                    externalAdReply: {
                      title: "OVL-MD-V2-ANTIDELETE",
                    },
                  },
                },
                {
                  quoted: v23,
                },
              );
            }
          }
        } else {
          const v15 = v42
            ? "👥 Groupe : " + (await v1.groupMetadata(v33)).subject
            : "📩 Chat : @" + v33.split("@")[0];
          const v25 = (
            "\n✨ OVL-MD ANTI-DELETE MSG ✨\n👤 Envoyé par : @" +
            v52.split("@")[0] +
            "\n❌ Supprimé par : @" +
            v3.split("@")[0] +
            "\n⏰ Heure de suppression : " +
            v62 +
            "\n" +
            v15 +
            "\n          "
          ).trim();
          await v1.sendMessage(
            v7,
            {
              text: v25,
              mentions: [v52, v3],
            },
            {
              quoted: v23,
            },
          );
          await v1.sendMessage(
            v7,
            {
              forward: v23,
            },
            {
              quoted: v23,
            },
          );
        }
      }
    }
  } catch (e) {
    console.error("❌ Une erreur est survenue dans antidelete :", e);
  }
}
module.exports = antidelete;
