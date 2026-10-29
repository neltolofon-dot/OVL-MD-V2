const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Mention = sequelize.define(
  "Mention",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    mode: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    url: {
      type: DataTypes.TEXT,
      defaultValue: "url",
    },
    text: {
      type: DataTypes.TEXT,
      defaultValue: "text",
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "texte",
    },
  },
  {
    tableName: "mention",
    timestamps: false,
  },
);
(async () => {
  await Mention.sync();
  const v1 = sequelize.getQueryInterface();
  const v2 = await v1.describeTable("mention");
  if (!v2.type) {
    await v1.addColumn("mention", "type", {
      type: DataTypes.STRING,
      defaultValue: "texte",
    });
  }
})();
async function setMention({ url = "url", text = "text", mode = "non", type = "texte" }) {
  await Mention.upsert({
    id: 1,
    url,
    text,
    mode,
    type,
  });
}
async function delMention() {
  const v1 = await Mention.findOne({
    where: {
      id: 1,
    },
  });
  if (v1) {
    v1.mode = "non";
    await v1.save();
  }
}
async function getMention() {
  return await Mention.findOne({
    where: {
      id: 1,
    },
  });
}
module.exports = {
  setMention,
  delMention,
  getMention,
};
