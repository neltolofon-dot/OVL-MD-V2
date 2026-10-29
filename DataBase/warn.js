const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Warn = sequelize.define(
  "Warn",
  {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "warn",
    timestamps: false,
  },
);
const WarnConfig = sequelize.define(
  "WarnConfig",
  {
    limit: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
    },
  },
  {
    tableName: "warn_config",
    timestamps: false,
  },
);
(async () => {
  await Warn.sync();
  await WarnConfig.sync();
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (warn.js) :", e.message),
);
async function delWarn(v1) {
  return await Warn.destroy({
    where: {
      userId: v1,
    },
  });
}
async function getLimit() {
  const v1 = await WarnConfig.findOne();
  if (v1) {
    return v1.limit;
  } else {
    return 3;
  }
}
async function setLimit(v1) {
  const v2 = await WarnConfig.findOne();
  if (v2) {
    v2.limit = v1;
    await v2.save();
  } else {
    await WarnConfig.create({
      limit: v1,
    });
  }
}
async function setWarn(v1) {
  const [v2, v3] = await Warn.findOrCreate({
    where: {
      userId: v1,
    },
    defaults: {
      count: 1,
    },
  });
  if (!v3) {
    v2.count += 1;
    await v2.save();
  }
  return v2;
}
module.exports = {
  delWarn,
  setWarn,
  getLimit,
  setLimit,
};
