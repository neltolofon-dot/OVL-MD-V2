const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const ENV_FILE = path.join(process.cwd(), ".env");
const CONFIG_ENV_FILE = path.join(process.cwd(), "config_env.json");
const keysToSync = [
  "PREFIXE",
  "NOM_OWNER",
  "NUMERO_OWNER",
  "MODE",
  "SESSION_ID",
  "STICKER_PACK_NAME",
  "STICKER_AUTHOR_NAME",
  "DATABASE",
  "NOM_BOT",
  "GEMINI_API_KEY",
];
function manage_env() {
  const v1 = {};
  keysToSync.forEach(v12 => {
    v1[v12] = process.env[v12] || "";
  });
  dotenv.config({
    override: true,
  });
  if (!fs.existsSync(CONFIG_ENV_FILE)) {
    fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(v1, null, 2), "utf8");
  }
  if (!fs.existsSync(ENV_FILE)) {
    let v12 = "";
    keysToSync.forEach(v13 => {
      v12 += v13 + "=" + (v1[v13] || "") + "\n";
    });
    fs.writeFileSync(ENV_FILE, v12, "utf8");
  }
  let v2 = JSON.parse(fs.readFileSync(CONFIG_ENV_FILE, "utf8"));
  let v3 = false;
  keysToSync.forEach(v12 => {
    if (v2[v12] !== v1[v12]) {
      v3 = true;
      v2[v12] = v1[v12];
      updateEnvFile(ENV_FILE, v12, v1[v12]);
    }
  });
  if (v3) {
    fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(v2, null, 2), "utf8");
  }
}
function updateEnvFile(v1, v2, v3) {
  let v4 = fs.existsSync(v1) ? fs.readFileSync(v1, "utf8") : "";
  const v5 = new RegExp("^" + v2 + "=.*$", "m");
  if (v3 === null) {
    if (v5.test(v4)) {
      v4 =
        v4
          .replace(v5, "")
          .replace(/\n{2,}/g, "\n")
          .trim() + "\n";
    }
  } else if (v5.test(v4)) {
    v4 = v4.replace(v5, v2 + "=" + (v3 || ""));
  } else {
    if (v4.length > 0 && !v4.endsWith("\n")) {
      v4 += "\n";
    }
    v4 += v2 + "=" + (v3 || "") + "\n";
  }
  fs.writeFileSync(v1, v4, "utf8");
}
module.exports = {
  manage_env,
  updateEnvFile,
};
