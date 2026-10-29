const fs = require("fs");
const path = require("path");
const pino = require("pino");
const axios = require("axios");
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
const { get_session, restaureAuth, authLocaleExiste } = require("./DataBase/session");
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
const DELAI_DEMARRAGE_MS = Number(process.env.DELAI_DEMARRAGE_MS || 2000);

const sessionsActives = new Set();
const instancesSessions = new Map();

// Baileys est très bavard sur des incidents bénins (sessions Signal rejouées,
// avertissement `punycode` de Node). On filtre ce bruit sans masquer le reste :
// les vraies erreurs continuent de partir sur stderr.
const BRUIT_BAILEYS = [
  /^Closing/,
  /^Removing old/,
  /^Decrypted/,
  /^Session error/,
  /^Failed to decrypt/,
  /`punycode`/,
];
const estDuBruit = parts => {
  const ligne = parts.map(p => (typeof p === "string" ? p : "")).join(" ");
  return BRUIT_BAILEYS.some(re => re.test(ligne));
};
const logOriginal = { info: console.info, warn: console.warn, error: console.error };
console.info = (...a) => (estDuBruit(a) ? undefined : logOriginal.info(...a));
console.warn = (...a) => (estDuBruit(a) ? undefined : logOriginal.warn(...a));
console.error = (...a) => (estDuBruit(a) ? undefined : logOriginal.error(...a));

async function startGenericSession({ numero, isPrincipale = false, sessionId = null }) {
  const nomSession = isPrincipale ? "principale" : numero;
  try {
    // Si un dossier auth/<session>/creds.json existe déjà, on l'utilise tel quel :
    // aucune requête vers un service tiers, et la session survit aux redémarrages.
    if (!authLocaleExiste(nomSession)) {
      const session = await get_session(sessionId);
      if (!session?.creds) {
        console.error(
          `❌ Session "${nomSession}" introuvable (SESSION_ID invalide, expiré, ou service de ` +
            `sessions injoignable). Régénérez un SESSION_ID, ou placez vos identifiants dans ` +
            `auth/${nomSession}/creds.json.`,
        );
        return null;
      }
      await restaureAuth(nomSession, session.creds, session.keys);
    } else {
      console.log(`🔐 Identifiants locaux détectés pour "${nomSession}" (auth/${nomSession}).`);
    }

    const { state, saveCreds } = await useMultiFileAuthState("./auth/" + nomSession);
    const { version } = await fetchLatestBaileysVersion();

    const ovl = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
      },
      logger: pino({ level: "silent" }),
      browser: Browsers.ubuntu("Chrome"),
      printQRInTerminal: false,
      keepAliveIntervalMs: 10000,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      cachedGroupMetadata: async jid => groupCache.get(jid),
      getMessage: async key => {
        const msg = getMessage(key.id);
        return msg?.message || undefined;
      },
    });

    ovl.ev.on("messages.upsert", up => message_upsert(up, ovl));
    ovl.ev.on("group-participants.update", up => group_participants_update(up, ovl));
    ovl.ev.on("groups.update", up => group_update(up, ovl));
    ovl.ev.on("connection.update", up =>
      connection_update(
        up,
        ovl,
        () => startGenericSession({ numero, isPrincipale, sessionId }),
        isPrincipale ? async () => await startSecondarySessions() : undefined,
      ),
    );
    ovl.ev.on("creds.update", saveCreds);
    ovl.ev.on("call", appel => call(ovl, appel));

    ovl.dl_save_media_ms = (ms, nom = "", enregistrer = true, dossier = "./downloads") =>
      dl_save_media_ms(ovl, ms, nom, enregistrer, dossier);
    ovl.recup_msg = options => recup_msg({ ovl, ...options });

    instancesSessions.set(nomSession, ovl);
    sessionsActives.add(nomSession);
    console.log(`✅ Session ${isPrincipale ? "principale" : "secondaire " + numero} démarrée`);
    return ovl;
  } catch (e) {
    console.error(`❌ Erreur session ${nomSession} :`, e.message);
    return null;
  }
}

async function stopSession(nomSession) {
  if (!instancesSessions.has(nomSession)) return;
  const ovl = instancesSessions.get(nomSession);
  try {
    await ovl.end();
    const dossierAuth = path.join(__dirname, "./auth", nomSession);
    if (fs.existsSync(dossierAuth)) {
      await fs.promises.rm(dossierAuth, { recursive: true, force: true });
      console.log(`🗑️ Dossier auth/${nomSession} supprimé`);
    }
    console.log(`🛑 Session ${nomSession} arrêtée`);
  } catch (e) {
    console.error(`❌ Erreur arrêt session ${nomSession} :`, e.message);
  }
  instancesSessions.delete(nomSession);
  sessionsActives.delete(nomSession);
}

async function startSecondarySessions() {
  let sessionsEnregistrees;
  try {
    sessionsEnregistrees = await getSecondAllSessions();
  } catch (e) {
    console.error("❌ Lecture des sessions secondaires impossible :", e.message);
    return;
  }

  const numerosEnregistres = new Set(sessionsEnregistrees.map(s => s.numero));

  for (const nomSession of sessionsActives) {
    if (nomSession === "principale") continue;
    if (!numerosEnregistres.has(nomSession)) {
      console.log(`⚠️ Session supprimée détectée : ${nomSession}`);
      await stopSession(nomSession);
    }
  }

  for (const { numero, session_id } of sessionsEnregistrees) {
    if (sessionsActives.size >= MAX_SESSIONS) {
      console.warn(`⚠️ Limite de ${MAX_SESSIONS} sessions atteinte, ${numero} n'est pas démarré.`);
      break;
    }
    if (sessionsActives.has(numero)) continue;
    try {
      await startGenericSession({ numero, isPrincipale: false, sessionId: session_id });
    } catch (e) {
      console.error(`❌ Échec session ${numero} :`, e.message);
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
  await delay(DELAI_DEMARRAGE_MS);

  // Charger les commandes avant la connexion : une erreur dans un fichier de
  // cmd/ se voit tout de suite, au lieu d'apparaître après l'appairage.
  try {
    await require("./lib/plugin").reloadCommands();
  } catch (e) {
    console.error("⚠️ Chargement initial des commandes échoué :", e.message);
  }

  const aSessionLocale = authLocaleExiste("principale");

  if (!aSessionLocale && !config.SESSION_ID) {
    console.error(
      "⛔ Aucune session : SESSION_ID est vide et aucun fichier auth/principale/creds.json " +
        "n'existe. Renseignez SESSION_ID dans votre .env, ou déposez vos identifiants " +
        "Baileys dans auth/principale/creds.json. Le bot ne démarrera pas.",
    );
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

app.get("/", (req, res) => {
  res.send(
    '<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8" />\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
      "<title>OVL-Bot Web Page</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\n" +
      "body{display:flex;justify-content:center;align-items:center;height:100vh;" +
      "background:#121212;color:#fff;font-family:Arial}\n" +
      ".content{padding:30px;background:#1e1e1e;border-radius:12px}\n</style>\n</head>\n" +
      '<body>\n<div class="content">\n<h1>Bienvenue sur OVL-MD-V2</h1>\n' +
      "<p>Votre assistant WhatsApp</p>\n</div>\n</body>\n</html>",
  );
});

app.get("/health", (req, res) => {
  res.json({
    ok: sessionsActives.size > 0,
    sessions: [...sessionsActives],
    commandes: require("./lib/ovlcmd").cmd.length,
    uptime_s: Math.round(process.uptime()),
  });
});

let publicURL;
if (process.env.RENDER_EXTERNAL_URL) {
  publicURL = process.env.RENDER_EXTERNAL_URL;
} else if (process.env.KOYEB_PUBLIC_DOMAIN) {
  publicURL = "https://" + process.env.KOYEB_PUBLIC_DOMAIN;
} else {
  publicURL = "http://localhost:" + port;
}

const serveur = app.listen(port, () => {
  console.log("Listening on port: " + port);
  // Auto-ping sur notre propre URL uniquement, pour empêcher la mise en veille
  // des hébergeurs gratuits. Inutile en local, et désactivable.
  if (process.env.AUTO_PING !== "off" && !publicURL.includes("localhost")) {
    setupAutoPing(publicURL);
  }
});

serveur.on("error", e => {
  if (e.code === "EADDRINUSE") {
    console.error(
      `⛔ Le port ${port} est déjà utilisé : une autre instance du bot tourne ` +
        `probablement déjà. Arrêtez-la (npm run stop), ou choisissez un autre ` +
        `port avec PORT=3001 dans votre .env.`,
    );
    process.exit(1);
  }
  console.error("⛔ Erreur du serveur web :", e.message);
});

function setupAutoPing(url) {
  setInterval(async () => {
    try {
      await axios.get(url, { timeout: 10000 });
    } catch {
      /* l'hébergeur peut être momentanément indisponible, sans conséquence */
    }
  }, 30000);
}

process.on("uncaughtException", e => {
  console.error("Une erreur inattendue est survenue :", e);
});
process.on("unhandledRejection", e => {
  console.error("Rejection non gérée :", e);
});
