const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const OvlCmd = sequelize.define(
  "OvlCmd",
  {
    nom_cmd: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "public_private_cmds",
    timestamps: false,
  },
);
(async () => {
  await OvlCmd.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (public_private_cmd.js) :", e.message),
);
async function set_cmd(v1, v2 = "public") {
  if (!v1 || !v2) {
    throw new Error("Données manquantes");
  }
  await OvlCmd.upsert({
    nom_cmd: v1,
    type: v2,
  });
}
async function del_cmd(v1, v2) {
  return await OvlCmd.destroy({
    where: {
      nom_cmd: v1,
      type: v2,
    },
  });
}
async function list_cmd(v1) {
  return await OvlCmd.findAll({
    where: {
      type: v1,
    },
  });
}
async function get_cmd(v1, v2) {
  return await OvlCmd.findOne({
    where: {
      nom_cmd: v1,
      type: v2,
    },
  });
}
module.exports = {
  set_cmd,
  del_cmd,
  list_cmd,
  get_cmd,
};
