const { WA_CONF } = require("../../DataBase/wa_conf");
async function presence(v1, v2) {
  const v3 = await WA_CONF.findOne({
    where: {
      id: "1",
    },
  });
  if (v3) {
    if (v3.presence === "enligne") {
      await v1.sendPresenceUpdate("available", v2);
    } else if (v3.presence === "ecrit") {
      await v1.sendPresenceUpdate("composing", v2);
    } else if (v3.presence === "enregistre") {
      await v1.sendPresenceUpdate("recording", v2);
    }
  }
}
module.exports = presence;
