const fs = require("fs");
const path = require("path");
const storeFilePath = path.resolve(__dirname, "store_msg.json");
const MAX_STORE_SIZE_MB = 5;
function checkAndResetStore() {
  try {
    const v1 = fs.statSync(storeFilePath);
    const v2 = v1.size / 1048576;
    if (v2 > MAX_STORE_SIZE_MB) {
      console.warn("Le fichier store_msg.json dépasse " + MAX_STORE_SIZE_MB + " Mo. Réinitialisation...");
      fs.writeFileSync(storeFilePath, JSON.stringify({}));
    }
  } catch (e) {
    console.error("Erreur lors de la vérification ou de la réinitialisation du fichier :", e);
  }
}
function getMessage(v1) {
  try {
    const v12 = JSON.parse(fs.readFileSync(storeFilePath, "utf8"));
    return v12[v1] || null;
  } catch (e) {
    console.error("Erreur lors de la lecture du fichier de stockage :", e);
    return null;
  }
}
function addMessage(v1, v2) {
  try {
    const v12 = JSON.parse(fs.readFileSync(storeFilePath, "utf8"));
    v12[v1] = v2;
    fs.writeFileSync(storeFilePath, JSON.stringify(v12, null, 2));
    checkAndResetStore();
  } catch (e) {
    console.error("Erreur lors de l’ajout du message dans le fichier de stockage :", e);
  }
}
module.exports = {
  getMessage,
  addMessage,
};
