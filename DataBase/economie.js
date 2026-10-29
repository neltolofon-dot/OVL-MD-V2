const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
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
const ECONOMIE = sequelize.define(
  "ECONOMIE",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    pseudo: {
      type: DataTypes.STRING,
      defaultValue: "Utilisateur",
    },
    portefeuille: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    banque: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    capacite_banque: {
      type: DataTypes.BIGINT,
      defaultValue: 10000,
    },
    last_bonus: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "economie",
    timestamps: false,
  },
);
(async () => {
  await ECONOMIE.sync();
})();
async function ajouterUtilisateur(v1, v2 = "Utilisateur") {
  return await ECONOMIE.findOrCreate({
    where: {
      id: v1,
    },
    defaults: {
      pseudo: v2,
      portefeuille: 0,
      banque: 0,
      capacite_banque: 1000,
      last_bonus: 0,
    },
  });
}
async function supprimerUtilisateur(v1) {
  return await ECONOMIE.destroy({
    where: {
      id: v1,
    },
  });
}
async function getInfosUtilisateur(v1) {
  const v2 = await ECONOMIE.findOne({
    where: {
      id: v1,
    },
  });
  if (!v2) {
    return null;
  }
  return v2.dataValues;
}
async function modifierSolde(v1, v2 = "portefeuille", v3 = 0) {
  const v4 = await ECONOMIE.findOne({
    where: {
      id: v1,
    },
  });
  if (!v4) {
    return null;
  }
  if (!["portefeuille", "banque"].includes(v2)) {
    throw new Error("Type de solde invalide. Utilise 'portefeuille' ou 'banque'.");
  }
  const v5 = Number(v4[v2]);
  const v6 = Math.abs(Number(v3));
  const v7 = v3 < 0 ? Math.max(v5 - v6, 0) : v5 + v6;
  v4[v2] = v7;
  await v4.save();
  return {
    nouveauSolde: v7,
  };
}
async function mettreAJourCapaciteBanque(v1, v2) {
  const v3 = await ECONOMIE.findOne({
    where: {
      id: v1,
    },
  });
  if (!v3) {
    return null;
  }
  v3.capacite_banque = v2;
  await v3.save();
  return v3.capacite_banque;
}
async function changerPseudo(v1, v2) {
  const v3 = await ECONOMIE.findOne({
    where: {
      id: v1,
    },
  });
  if (!v3) {
    return null;
  }
  v3.pseudo = v2;
  await v3.save();
  return v3.pseudo;
}
async function resetEconomie(
  v1,
  v2 = {
    wallet: false,
    banque: false,
    capacite: false,
  },
) {
  const v3 = await ECONOMIE.findOne({
    where: {
      id: v1,
    },
  });
  if (!v3) {
    return null;
  }
  if (v2.wallet) {
    v3.portefeuille = 0;
  }
  if (v2.banque) {
    v3.banque = 0;
  }
  if (v2.capacite) {
    v3.capacite_banque = 10000;
  }
  await v3.save();
  return v3.dataValues;
}
async function TopBanque() {
  try {
    const v1 = await ECONOMIE.findAll({
      order: [["banque", "DESC"]],
      limit: 10,
      attributes: ["id", "portefeuille", "banque", "capacite"],
    });
    return v1.map(v12 => ({
      id: v12.id,
      portefeuille: v12.portefeuille,
      banque: v12.banque,
      capacite: v12.capacite,
    }));
  } catch (e) {
    console.error("Erreur lors de la récupération du top banque :", e);
    return [];
  }
}
module.exports = {
  TopBanque,
  ECONOMIE,
  ajouterUtilisateur,
  supprimerUtilisateur,
  getInfosUtilisateur,
  modifierSolde,
  mettreAJourCapaciteBanque,
  changerPseudo,
  resetEconomie,
};
