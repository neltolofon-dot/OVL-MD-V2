const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
const { get_session } = require("./session");
const db = config.DATABASE;
let sequelize;
if (!db) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.db",
    logging: false,
  });
} else {
  sequelize = new Sequelize(db, {
    dialect: "postgres",
    ssl: true,
    protocol: "postgres",
    dialectOptions: {
      native: true,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
}
const Connect = sequelize.define(
  "Connect",
  {
    numero: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "connect",
    timestamps: false,
  },
);
(async () => {
  await Connect.sync();
})();
async function saveSecondSession(v1) {
  let v2 = await get_session(v1);
  let v3 = v2.creds;
  if (!v3) {
    console.error("❌ Session invalide pour l’ID : " + v1);
    return false;
  }
  let v4;
  try {
    v4 = typeof v3 === "string" ? JSON.parse(v3) : v3;
  } catch (e) {
    console.error("❌ Erreur de parsing JSON :", e.message);
    return false;
  }
  if (!v4?.me?.id) {
    console.error("❌ Numéro introuvable dans les creds");
    return false;
  }
  const v5 = v4.me.id.split(":")[0];
  try {
    await Connect.upsert({
      numero: v5,
      session_id: v1,
    });
    console.log("✅ Session enregistrée : " + v5 + " ➜ " + v1);
    return true;
  } catch (e) {
    console.error("❌ Erreur lors de l'enregistrement :", e.message);
    return false;
  }
}
async function getSecondSession(v1) {
  const v2 = await Connect.findByPk(v1);
  if (!v2) {
    return null;
  }
  const v3 = await get_session(v2.session_id);
  return v3 || null;
}
async function getSecondAllSessions() {
  const v1 = await Connect.findAll({
    attributes: ["numero", "session_id"],
  });
  return v1.map(v12 => ({
    numero: v12.numero,
    session_id: v12.session_id,
  }));
}
async function deleteSecondSession(v1) {
  return await Connect.destroy({
    where: {
      numero: v1,
    },
  });
}
module.exports = {
  saveSecondSession,
  getSecondSession,
  getSecondAllSessions,
  deleteSecondSession,
};
