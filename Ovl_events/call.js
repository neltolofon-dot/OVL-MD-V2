const { WA_CONF2 } = require("../DataBase/wa_conf");
async function call(v1, v2) {
  try {
    const v12 = v2[0];
    const v22 = v12?.from;
    const v3 = v12?.id;
    if (!v22 || !v3) {
      return;
    }
    const v4 = await WA_CONF2.findOne({
      where: {
        id: "1",
      },
    });
    if (!v4 || v4.anticall !== "oui") {
      return;
    }
    await v1.sendMessage(v22, {
      text: "❌ Les appels ne sont pas autorisés sur ce numéro !",
    });
    await v1.rejectCall(v3, v22);
  } catch (e) {
    console.error("Erreur lors du traitement de l’appel :", e);
  }
}
module.exports = call;
