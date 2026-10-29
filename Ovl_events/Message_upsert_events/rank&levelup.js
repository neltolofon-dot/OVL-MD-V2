const { levels, calculateLevel } = require("../../DataBase/levels");
const { Ranks, Levelup } = require("../../DataBase/rank");
const { changerPseudo, ajouterUtilisateur, getInfosUtilisateur } = require("../../DataBase/economie");
async function rankAndLevelUp(v1, v2, v3, v4, v5) {
  if (!v3 || !v4) {
    return;
  }
  try {
    const v12 = v4;
    const v22 = await getInfosUtilisateur(v12);
    if (!v22) {
      await ajouterUtilisateur(v12, v5 || "ovl-user");
    }
    await changerPseudo(v12, v5 || "ovl-user");
    let v32 = await Ranks.findOne({
      where: {
        id: v12,
      },
    });
    if (!v32) {
      v32 = await Ranks.create({
        id: v12,
        name: v5 || "ovl-user",
        level: 0,
        exp: 10,
        messages: 1,
      });
    } else {
      v32.name = v5 || "ovl-user";
      v32.messages += 1;
      v32.exp += 10;
    }
    const v42 = calculateLevel(v32.exp);
    const v52 = await Levelup.findOne({
      where: {
        id: 1,
      },
    });
    const v6 = v52 && v52.levelup === "oui";
    if (v42 > v32.level && v6) {
      await v1.sendMessage(v2, {
        text: "Félicitations @" + (v12 || "").split("@")[0] + "! Vous avez atteint le niveau " + v42 + "! 🎉",
        mentions: [v12],
      });
    }
    v32.level = v42;
    await v32.save();
  } catch (e) {
    console.error("Erreur dans rankAndLevelUp:", e);
  }
}
module.exports = rankAndLevelUp;
