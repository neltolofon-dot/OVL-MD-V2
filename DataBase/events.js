const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const GroupSettings = sequelize.define(
  "GroupSettings",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    welcome: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    goodbye: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antipromote: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antidemote: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
  },
  {
    tableName: "group_settings",
    timestamps: false,
  },
);
const Events2 = sequelize.define(
  "Events2",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    welcome_msg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goodbye_msg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    promoteAlert: {
      type: DataTypes.TEXT,
      defaultValue: "non",
    },
    demoteAlert: {
      type: DataTypes.TEXT,
      defaultValue: "non",
    },
  },
  {
    tableName: "events2",
    timestamps: false,
  },
);
(async () => {
  await GroupSettings.sync();
  await Events2.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (events.js) :", e.message),
);
module.exports = {
  GroupSettings,
  Events2,
};
