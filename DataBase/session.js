const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DOSSIER_AUTH = path.join(__dirname, "../auth");

// Service par défaut qui héberge les sessions générées sur https://ovl-web.koyeb.app/.
// Attention : vos identifiants WhatsApp transitent par ce service. Vous pouvez
// pointer SESSION_API vers votre propre instance, ou vous en passer complètement
// en déposant vos identifiants dans auth/principale/creds.json.
const SESSION_API = process.env.SESSION_API || "https://ovl-web.koyeb.app/getsession?id=";

/** Vrai si la session dispose déjà d'identifiants locaux utilisables. */
function authLocaleExiste(nomSession) {
  try {
    const creds = path.join(DOSSIER_AUTH, nomSession, "creds.json");
    if (!fs.existsSync(creds)) return false;
    const contenu = JSON.parse(fs.readFileSync(creds, "utf8"));
    return !!contenu?.me?.id || !!contenu?.noiseKey;
  } catch {
    return false;
  }
}

/** Tente de lire un SESSION_ID qui contiendrait directement les creds. */
function litSessionLocale(sessionId) {
  const essais = [sessionId];
  if (/^[A-Za-z0-9+/=]+$/.test(sessionId) && sessionId.length > 80) {
    try {
      essais.push(Buffer.from(sessionId, "base64").toString("utf8"));
    } catch {
      /* ignoré : ce n'était pas du base64 valide */
    }
  }
  for (const candidat of essais) {
    if (typeof candidat !== "string" || !candidat.trim().startsWith("{")) continue;
    try {
      const parsed = JSON.parse(candidat);
      if (parsed?.creds) return { creds: parsed.creds, keys: parsed.keys };
      if (parsed?.noiseKey || parsed?.me) return { creds: parsed, keys: undefined };
    } catch {
      /* ignoré : ce n'était pas du JSON de session */
    }
  }
  return null;
}

/**
 * Récupère les identifiants d'une session.
 * Accepte un SESSION_ID du service distant, ou directement du JSON de creds
 * (brut ou encodé en base64), ce qui évite tout appel réseau.
 */
async function get_session(sessionId) {
  if (!sessionId) throw new Error("SESSION_ID requis");

  const local = litSessionLocale(sessionId);
  if (local) return local;

  const url = SESSION_API + encodeURIComponent(sessionId);
  try {
    const reponse = await axios.get(url, { timeout: 20000 });
    if (!reponse.data) return null;
    return { creds: reponse.data.creds, keys: reponse.data.keys };
  } catch (e) {
    if (e.response && e.response.status === 404) return null;
    throw new Error("Erreur API session : " + e.message);
  }
}

/** Écrit les identifiants dans auth/<nomSession>/ au format attendu par Baileys. */
async function restaureAuth(nomSession, creds, keys) {
  if (!creds) throw new Error("Identifiants de session absents");

  if (!fs.existsSync(DOSSIER_AUTH)) fs.mkdirSync(DOSSIER_AUTH, { recursive: true });
  const dossier = path.join(DOSSIER_AUTH, nomSession);
  if (!fs.existsSync(dossier)) fs.mkdirSync(dossier, { recursive: true });

  const credsObjet = typeof creds === "string" ? JSON.parse(creds) : creds;
  fs.writeFileSync(path.join(dossier, "creds.json"), JSON.stringify(credsObjet));

  if (keys && Object.keys(keys).length > 0) {
    for (const nomFichier of Object.keys(keys)) {
      // Un nom de clé venant d'une réponse distante ne doit pas pouvoir
      // s'échapper du dossier (traversée de chemin).
      const sain = path.basename(String(nomFichier)).replace(/[^A-Za-z0-9._-]/g, "_");
      if (!sain || sain === "." || sain === "..") continue;
      fs.writeFileSync(path.join(dossier, sain + ".json"), JSON.stringify(keys[nomFichier]));
    }
  }
}

module.exports = { get_session, restaureAuth, authLocaleExiste };
