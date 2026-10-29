const fs = require("fs");
const path = require("path");
const axios = require("axios");
async function get_session(v1) {
  if (!v1) {
    throw new Error("ID requis");
  }
  const v2 = "https://ovl-web.koyeb.app/getsession?id=" + v1;
  try {
    const v12 = await axios.get(v2);
    if (!v12.data) {
      return null;
    }
    return {
      creds: v12.data.creds,
      keys: v12.data.keys,
    };
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return null;
    }
    throw new Error("Erreur API: " + e.message);
  }
}
async function restaureAuth(v1, v2, v3) {
  const v4 = path.join(__dirname, "../auth");
  if (!fs.existsSync(v4)) {
    fs.mkdirSync(v4, {
      recursive: true,
    });
  }
  const v5 = path.join(v4, v1);
  if (!fs.existsSync(v5)) {
    fs.mkdirSync(v5, {
      recursive: true,
    });
  }
  fs.writeFileSync(path.join(v5, "creds.json"), JSON.stringify(v2));
  if (v3 && Object.keys(v3).length > 0) {
    for (const v12 in v3) {
      fs.writeFileSync(path.join(v5, v12 + ".json"), JSON.stringify(v3[v12]));
    }
  }
}
module.exports = {
  get_session,
  restaureAuth,
};
