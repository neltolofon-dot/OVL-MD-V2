const fs = require("fs");
const path = require("path");

const storeFilePath = path.resolve(__dirname, "store_msg.json");

// Nombre de messages conservés en mémoire. Sert à l'antidelete et au renvoi de
// médias : au-delà, les plus anciens sont oubliés.
const MAX_MESSAGES = Number(process.env.STORE_MAX_MESSAGES || 2000);
// Délai avant écriture sur disque. L'ancienne version relisait et réécrivait
// tout le fichier (jusqu'à 5 Mo) à chaque message reçu.
const DELAI_ECRITURE_MS = 3000;

/** @type {Map<string, object>} */
let messages = new Map();
let minuterieEcriture = null;

function charger() {
  try {
    if (!fs.existsSync(storeFilePath)) {
      fs.writeFileSync(storeFilePath, "{}");
      return;
    }
    const contenu = JSON.parse(fs.readFileSync(storeFilePath, "utf8"));
    const entrees = Object.entries(contenu || {});
    messages = new Map(entrees.slice(-MAX_MESSAGES));
  } catch (e) {
    console.error("⚠️ store_msg.json illisible, réinitialisation :", e.message);
    messages = new Map();
    try {
      fs.writeFileSync(storeFilePath, "{}");
    } catch {
      /* disque en lecture seule : on continue en mémoire uniquement */
    }
  }
}

function ecrireMaintenant() {
  minuterieEcriture = null;
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(Object.fromEntries(messages)));
  } catch (e) {
    console.error("⚠️ Écriture de store_msg.json impossible :", e.message);
  }
}

function planifierEcriture() {
  if (minuterieEcriture) return;
  minuterieEcriture = setTimeout(ecrireMaintenant, DELAI_ECRITURE_MS);
  // Ne pas retenir le processus en vie uniquement pour cette minuterie.
  if (minuterieEcriture.unref) minuterieEcriture.unref();
}

function getMessage(id) {
  if (!id) return null;
  return messages.get(id) || null;
}

function addMessage(id, message) {
  if (!id || !message) return;
  messages.set(id, message);
  // Map conserve l'ordre d'insertion : la première clé est la plus ancienne.
  while (messages.size > MAX_MESSAGES) {
    messages.delete(messages.keys().next().value);
  }
  planifierEcriture();
}

charger();

// Sauvegarde avant un arrêt propre, pour ne pas perdre les derniers messages.
for (const signal of ["SIGINT", "SIGTERM", "beforeExit"]) {
  process.on(signal, () => {
    if (minuterieEcriture) {
      clearTimeout(minuterieEcriture);
      ecrireMaintenant();
    }
  });
}

module.exports = { getMessage, addMessage };
