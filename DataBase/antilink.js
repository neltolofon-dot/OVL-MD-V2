const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Antilink = sequelize.define(
  "Antilink",
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
    tableName: "antilink",
    timestamps: false,
  },
);
const Antilink_warnings = sequelize.define(
  "Antilink_warnings",
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
    tableName: "antilink_warnings",
    timestamps: false,
  },
);
(async () => {
  await Antilink.sync();
  await Antilink_warnings.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (antilink.js) :", e.message),
);
module.exports = {
  Antilink,
  Antilink_warnings,
};
