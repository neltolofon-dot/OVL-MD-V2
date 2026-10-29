const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const { get_session } = require("./session");
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
})().catch(e =>
  console.error("❌ Synchronisation de la base impossible (connect.js) :", e.message),
);
async function saveSecondSession(sessionId) {
  let session;
  try {
    session = await get_session(sessionId);
  } catch (e) {
    console.error("❌ Récupération de la session impossible :", e.message);
    return false;
  }
  if (!session?.creds) {
    console.error("❌ Session invalide ou introuvable pour l’ID : " + sessionId);
    return false;
  }

  let creds;
  try {
    creds = typeof session.creds === "string" ? JSON.parse(session.creds) : session.creds;
  } catch (e) {
    console.error("❌ Erreur de parsing JSON :", e.message);
    return false;
  }
  if (!creds?.me?.id) {
    console.error("❌ Numéro introuvable dans les creds");
    return false;
  }

  const numero = creds.me.id.split(":")[0];
  try {
    await Connect.upsert({ numero, session_id: sessionId });
    console.log(`✅ Session enregistrée : ${numero} ➜ ${sessionId}`);
    return true;
  } catch (e) {
    console.error("❌ Erreur lors de l'enregistrement :", e.message);
    return false;
  }
}

async function getSecondSession(numero) {
  const ligne = await Connect.findByPk(numero);
  if (!ligne) return null;
  const session = await get_session(ligne.session_id);
  return session || null;
}

async function getSecondAllSessions() {
  const lignes = await Connect.findAll({ attributes: ["numero", "session_id"] });
  return lignes.map(l => ({ numero: l.numero, session_id: l.session_id }));
}

async function deleteSecondSession(numero) {
  return await Connect.destroy({ where: { numero } });
}
module.exports = {
  saveSecondSession,
  getSecondSession,
  getSecondAllSessions,
  deleteSecondSession,
};
