const { Sequelize } = require("sequelize");
const config = require("../set");

// Une seule instance Sequelize pour tout le bot. Auparavant chaque fichier de
// DataBase/ créait la sienne, soit 18 pools de connexions : sur un PostgreSQL
// mutualisé (offres gratuites Supabase/Neon/Render), cela sature la limite de
// connexions et fait échouer les requêtes au hasard.
const url = config.DATABASE;

const sequelize = url
  ? new Sequelize(url, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      pool: { max: 5, min: 0, idle: 10000, acquire: 30000 },
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: "./database.db",
      logging: false,
    });

if (!url) {
  console.log("🗄️  Base de données : SQLite locale (./database.db).");
} else {
  console.log("🗄️  Base de données : PostgreSQL.");
}

module.exports = sequelize;
module.exports.sequelize = sequelize;
