const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
const db = config.DATABASE;
let sequelize;
if (!db) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.db",
    logging: false,
  });
} else {
  sequelize = new Sequelize(db, {
    dialect: "postgres",
    ssl: true,
    protocol: "postgres",
    dialectOptions: {
      native: true,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
}
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
})();
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
