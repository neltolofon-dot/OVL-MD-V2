const { groupCache } = require("../lib/groupeCache");
async function group_update(v1, v2) {
  try {
    const v12 = await v2.groupMetadata(v1.id);
    groupCache.set(v1.id, v12);
  } catch (e) {
    console.error("Erreur lors de la mise à jour du groupe :", e);
  }
}
module.exports = group_update;
