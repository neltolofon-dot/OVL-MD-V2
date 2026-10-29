const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Plugin = sequelize.define(
  "Plugin",
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "plugin",
    timestamps: false,
  },
);
(async () => {
  await Plugin.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (plugin.js) :", e.message),
);
module.exports = {
  Plugin,
};
