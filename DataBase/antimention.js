const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Antimention = sequelize.define(
  "Antimention",
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
    tableName: "antimention",
    timestamps: false,
  },
);
const Antimention_warnings = sequelize.define(
  "Antimention_warnings",
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
    tableName: "antimention_warnings",
    timestamps: false,
  },
);
(async () => {
  await Antimention.sync();
  await Antimention_warnings.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (antimention.js) :", e.message),
);
module.exports = {
  Antimention,
  Antimention_warnings,
};
