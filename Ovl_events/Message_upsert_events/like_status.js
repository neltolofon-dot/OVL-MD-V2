const { WA_CONF } = require("../../DataBase/wa_conf");
async function like_status(v1, v2, v3, v4, v5) {
  try {
    const v12 = await WA_CONF.findOne({
      where: {
        id: "1",
      },
    });
    if (!v12) {
      return;
    }
    const v22 = v12.like_status;
    const v32 = v22 && v22 !== "non";
    if (v2.key.remoteJid === "status@broadcast" && v32) {
      await v1.sendMessage(
        v2.key.remoteJid,
        {
          react: {
            key: v2.key,
            text: v22,
          },
        },
        {
          statusJidList: [v5, v4],
          broadcast: true,
        },
      );
    }
  } catch (e) {
    console.error("Erreur dans like_status :", e);
  }
}
module.exports = like_status;
