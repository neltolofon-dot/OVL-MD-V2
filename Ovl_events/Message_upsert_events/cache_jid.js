const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../../lib/cache_jid.json");
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}
function readCache() {
  const v1 = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(v1);
}
function writeCache(v1) {
  fs.writeFileSync(filePath, JSON.stringify(v1, null, 2));
}
async function getJid(v1, v2, v3, v4 = 0) {
  try {
    if (!v1 || typeof v1 !== "string") {
      return null;
    }
    if (v1.endsWith("@s.whatsapp.net")) {
      return v1;
    }
    const v12 = readCache();
    if (v12[v1]) {
      return v12[v1];
    }
    const v22 = await v3.groupMetadata(v2);
    if (!v22 || !Array.isArray(v22.participants)) {
      return null;
    }
    const v32 = v22.participants.find(v13 => v13.id == v1);
    if (!v32) {
      return null;
    }
    const v42 = v32.jid || v32.phoneNumber;
    v12[v1] = v42;
    writeCache(v12);
    return v42;
  } catch (e) {
    if (v4 < 2) {
      return getJid(v1, v2, v3, v4 + 1);
    }
    console.error("❌ Erreur dans getJid après 3 tentatives:", e.message);
    return null;
  }
}
module.exports = getJid;
