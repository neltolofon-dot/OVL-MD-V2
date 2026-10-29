const dotenv = require("dotenv");

dotenv.config({ override: true, quiet: true });

const config = {
  // Un préfixe vide ferait traiter tout message comme une commande.
  PREFIXE: process.env.PREFIXE || ".",
  NOM_OWNER: process.env.NOM_OWNER || "Owner",
  NUMERO_OWNER: (process.env.NUMERO_OWNER || "").replace(/[^0-9]/g, ""),
  MODE: process.env.MODE === "private" ? "private" : "public",
  SESSION_ID: (process.env.SESSION_ID || "").trim(),
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "OVL-MD-V2",
  STICKER_AUTHOR_NAME: process.env.STICKER_AUTHOR_NAME || "OVL-MD",
  DATABASE: process.env.DATABASE,
  NOM_BOT: process.env.NOM_BOT || "🤖 OVL-MD BOT V2",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

// Avertissements au démarrage plutôt qu'un échec silencieux plus tard.
if (!config.NUMERO_OWNER) {
  console.warn(
    "⚠️  NUMERO_OWNER n'est pas défini : personne ne pourra utiliser les commandes " +
      "réservées au propriétaire. Renseignez-le dans .env (format international, sans +).",
  );
}

module.exports = config;
