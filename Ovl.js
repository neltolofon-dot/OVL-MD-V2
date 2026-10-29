const fs = require("fs");
const path = require("path");
const pino = require("pino");
const axios = require("axios");
const { exec } = require("child_process");
const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  delay,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const { getMessage } = require("./lib/store");
const { groupCache } = require("./lib/groupeCache");
const { get_session, restaureAuth } = require("./DataBase/session");
const config = require("./set");
const {
  message_upsert,
  group_participants_update,
  group_update,
  connection_update,
  call,
  dl_save_media_ms,
  recup_msg,
} = require("./Ovl_events");
const { getSecondAllSessions } = require("./DataBase/connect");
const MAX_SESSIONS = 15;
const sessionsActives = new Set();
const instancesSessions = new Map();
console.info = function (...v1) {
  const v2 = v1.join(" ");
  if (!v2.startsWith("Closing") && !v2.startsWith("Removing old")) {
    console.log(...v1);
  }
};
console.warn = function (...v1) {
  const v2 = v1.join(" ");
  if (!v2.startsWith("Closing") && !v2.startsWith("Decrypted")) {
    console.log(...v1);
  }
};
console.error = function (...v1) {
  const v2 = v1.join(" ");
  if (!v2.startsWith("Session error") && !v2.startsWith("Failed to decrypt") && !v2.includes("`punycode`")) {
    console.log(...v1);
  }
};
async function startGenericSession({ numero, isPrincipale = false, sessionId = null }) {
  try {
    const v1 = isPrincipale ? "principale" : numero;
    const v2 = await get_session(sessionId);
    await restaureAuth(v1, v2.creds, v2.keys);
    const { state, saveCreds } = await useMultiFileAuthState("./auth/" + v1);
    const { version } = await fetchLatestBaileysVersion();
    const v3 = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({
            level: "silent",
          }).child({
            level: "silent",
          }),
        ),
      },
      logger: pino({
        level: "silent",
      }),
      browser: Browsers.ubuntu("Chrome"),
      printQRInTerminal: false,
      keepAliveIntervalMs: 10000,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      cachedGroupMetadata: async v12 => groupCache.get(v12),
      getMessage: async v12 => {
        const v22 = getMessage(v12.id);
        return v22?.message || undefined;
      },
    });
    v3.ev.on("messages.upsert", v12 => message_upsert(v12, v3));
    v3.ev.on("group-participants.update", v12 => group_participants_update(v12, v3));
    v3.ev.on("groups.update", v12 => group_update(v12, v3));
    v3.ev.on("connection.update", v12 =>
      connection_update(
        v12,
        v3,
        () =>
          startGenericSession({
            numero,
            isPrincipale,
            sessionId,
          }),
        isPrincipale ? async () => await startSecondarySessions() : undefined,
      ),
    );
    v3.ev.on("creds.update", saveCreds);
    v3.ev.on("call", v12 => call(v3, v12));
    v3.dl_save_media_ms = (v12, v22 = "", v32 = true, v4 = "./downloads") =>
      dl_save_media_ms(v3, v12, v22, v32, v4);
    v3.recup_msg = v12 =>
      recup_msg({
        ovl: v3,
        ...v12,
      });
    instancesSessions.set(numero, v3);
    sessionsActives.add(numero);
    console.log("✅ Session " + (isPrincipale ? "principale" : "secondaire " + numero) + " démarrée");
    return v3;
  } catch (e) {
    console.error("❌ Erreur session " + (isPrincipale ? "principale" : numero) + " :", e.message);
    return null;
  }
}
async function stopSession(v1) {
  if (!instancesSessions.has(v1)) {
    return;
  }
  const v2 = instancesSessions.get(v1);
  try {
    await v2.end();
    const v12 = path.join(__dirname, "./auth", v1);
    if (fs.existsSync(v12)) {
      await fs.promises.rm(v12, {
        recursive: true,
        force: true,
      });
    }
    console.log("🗑️ Dossier auth/" + v1 + " supprimé");
    console.log("🛑 Session " + v1 + " arrêtée");
  } catch (e) {
    console.error("❌ Erreur arrêt session " + v1 + " :", e.message);
  }
  instancesSessions.delete(v1);
  sessionsActives.delete(v1);
}
async function startSecondarySessions() {
  const v1 = await getSecondAllSessions();
  const v2 = new Set(v1.map(v12 => v12.numero));
  for (const v12 of sessionsActives) {
    if (v12 === "principale") {
      continue;
    }
    if (!v2.has(v12)) {
      console.log("⚠️ Session supprimée détectée : " + v12);
      await stopSession(v12);
    }
  }
  for (const { numero, session_id } of v1) {
    if (sessionsActives.size >= MAX_SESSIONS) {
      break;
    }
    if (!sessionsActives.has(numero)) {
      try {
        await startGenericSession({
          numero,
          isPrincipale: false,
          sessionId: session_id,
        });
      } catch (e) {
        console.error("❌ Échec session " + numero + " :", e.message);
      }
    }
  }
}
function surveillerNouvellesSessions() {
  setInterval(async () => {
    try {
      await startSecondarySessions();
    } catch (e) {
      console.error("❌ Erreur vérification sessions secondaires :", e.message);
    }
  }, 10000);
}
async function startPrincipalSession() {
  await delay(45000);
  if (
    !config.SESSION_ID ||
    !config.SESSION_ID.startsWith("Ovl-MD_") ||
    !config.SESSION_ID.endsWith("_SESSION-ID")
  ) {
    return;
  }
  await startGenericSession({
    numero: "principale",
    isPrincipale: true,
    sessionId: config.SESSION_ID,
  });
  surveillerNouvellesSessions();
}
(async () => {
  await startPrincipalSession();
})();
const expressApp = require("express");
const app = expressApp();
const port = process.env.PORT || 3000;
let dernierPingRecu = Date.now();
app.get("/", (v1, v2) => {
  dernierPingRecu = Date.now();
  v2.send(
    '<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>OVL-Bot Web Page</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{display:flex;justify-content:center;align-items:center;height:100vh;background:#121212;color:#fff;font-family:Arial}\n.content{padding:30px;background:#1e1e1e;border-radius:12px}\n</style>\n</head>\n<body>\n<div class="content">\n<h1>Bienvenue sur OVL-MD-V2</h1>\n<p>Votre assistant WhatsApp</p>\n</div>\n</body>\n</html>',
  );
});
let publicURL;
if (process.env.RENDER_EXTERNAL_URL) {
  publicURL = process.env.RENDER_EXTERNAL_URL;
} else if (process.env.KOYEB_PUBLIC_DOMAIN) {
  publicURL = "https://" + process.env.KOYEB_PUBLIC_DOMAIN;
} else {
  publicURL = "http://localhost:" + port;
}
function detectPlatform() {
  if (process.env.GITHUB_ACTIONS) {
    return "GitHub Actions";
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return "Render";
  }
  if (process.env.KOYEB_PUBLIC_DOMAIN) {
    return "Koyeb";
  }
  if (process.env.TALKDROVE_APP_ID || process.env.TALKDROVE) {
    return "Talkdrove";
  }
  if (process.env.DYNO) {
    return "Heroku";
  }
  if (process.env.STARTUP) {
    return "Vps";
  }
  return "Inconnu";
}
app.listen(port, () => {
  console.log("Listening on port: " + port);
  setupAutoPing(publicURL);
});
function setupAutoPing(v1) {
  setInterval(async () => {
    try {
      const v12 = await axios.get(v1);
      if (v12.data) {
        console.log("Ping: OVL-MD-V2 ✅");
      }
      for (const [, v13] of instancesSessions) {
        if (v13?.user?.id) {
          const v14 = "https://wa.me/" + v13.user.id.split(":")[0];
          await axios.post("https://dsh-u1dn.onrender.com/ping", {
            id: v14,
            prefixe: config.PREFIXE,
            nom: config.NOM_BOT,
            platform: detectPlatform(),
          });
        }
      }
    } catch {}
  }, 30000);
}
process.on("uncaughtException", v1 => {
  console.log("Une erreur inattendue est survenue :", v1.message);
});
process.on("unhandledRejection", v1 => {
  console.error("Rejection non gérée :", v1);
});
