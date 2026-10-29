const { WA_CONF } = require("../../DataBase/wa_conf");
async function lecture_status(v1, v2, v3) {
  const v4 = await WA_CONF.findOne({
    where: {
      id: "1",
    },
  });
  if (v4) {
    if (v2.key.remoteJid === "status@broadcast" && v4.lecture_status === "oui") {
      await v1.readMessages([v2.key]);
    }
  }
}
module.exports = lecture_status;
