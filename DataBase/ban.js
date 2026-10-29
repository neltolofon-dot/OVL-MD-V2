const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Bans = sequelize.define(
  "Bans",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("user", "group"),
      allowNull: false,
    },
  },
  {
    tableName: "bans",
    timestamps: false,
  },
);
const OnlyAdmins = sequelize.define(
  "OnlyAdmins",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    tableName: "onlyadmins",
    timestamps: false,
  },
);
(async () => {
  await Bans.sync();
  await OnlyAdmins.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (ban.js) :", e.message),
);
module.exports = {
  Bans,
  OnlyAdmins,
};
