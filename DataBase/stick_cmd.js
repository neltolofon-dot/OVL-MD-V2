const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const StickCmds = sequelize.define(
  "StickCmds",
  {
    no_cmd: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    stick_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "stickcmds",
    timestamps: false,
  },
);
(async () => {
  await StickCmds.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (stick_cmd.js) :", e.message),
);
async function set_stick_cmd(v1, v2) {
  if (!v1 || !v2) {
    throw new Error("Commande ou URL manquante");
  }
  await StickCmds.upsert({
    no_cmd: v1,
    stick_hash: v2,
  });
  return true;
}
async function del_stick_cmd(v1) {
  if (!v1) {
    throw new Error("Commande manquante");
  }
  const v2 = await StickCmds.destroy({
    where: {
      no_cmd: v1,
    },
  });
  return v2 > 0;
}
async function get_stick_cmd() {
  const v1 = await StickCmds.findAll();
  return v1.map(({ no_cmd, stick_hash }) => ({
    no_cmd,
    stick_hash,
  }));
}
module.exports = {
  set_stick_cmd,
  del_stick_cmd,
  get_stick_cmd,
};
