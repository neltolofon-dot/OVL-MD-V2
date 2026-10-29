const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Sudo = sequelize.define(
  "Sudo",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    tableName: "sudo",
    timestamps: false,
  },
);
(async () => {
  await Sudo.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (sudo.js) :", e.message),
);
module.exports = {
  Sudo,
};
