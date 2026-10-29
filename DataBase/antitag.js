const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Antitag = sequelize.define(
  "Antitag",
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
    tableName: "antitag",
    timestamps: false,
  },
);
const Antitag_warnings = sequelize.define(
  "Antitag_warnings",
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
    tableName: "antitag_warnings",
    timestamps: false,
  },
);
(async () => {
  await Antitag.sync();
  await Antitag_warnings.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (antitag.js) :", e.message),
);
module.exports = {
  Antitag,
  Antitag_warnings,
};
