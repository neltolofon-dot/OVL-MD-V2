const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const ChatbotConf = sequelize.define(
  "ChatbotConf",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    chatbot_pm: {
      type: DataTypes.ENUM("oui", "non"),
      defaultValue: "non",
    },
    chatbot_gc: {
      type: DataTypes.ENUM("oui", "non"),
      defaultValue: "non",
    },
    enabled_ids: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
    },
  },
  {
    tableName: "chatbot_config",
    timestamps: false,
  },
);
(async () => {
  await ChatbotConf.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (chatbot.js) :", e.message),
);
module.exports = {
  ChatbotConf,
};
