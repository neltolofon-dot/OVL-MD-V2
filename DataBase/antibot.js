const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Antibot = sequelize.define(
  "Antibot",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    mode: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    type: {
      type: DataTypes.ENUM("supp", "warn", "kick"),
      defaultValue: "supp",
    },
  },
  {
    tableName: "antibot",
    timestamps: false,
  },
);
const AntibotWarnings = sequelize.define(
  "AntibotWarnings",
  {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "antibot_warnings",
    timestamps: false,
  },
);
(async () => {
  await Antibot.sync();
  await AntibotWarnings.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (antibot.js) :", e.message),
);
module.exports = {
  Antibot,
  AntibotWarnings,
};
