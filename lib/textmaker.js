const cheerio = require("cheerio");
const fetch = (...v1) => import("node-fetch").then(({ default: v12 }) => v12(...v1));
const FormData = require("form-data");
const cookie = require("cookie");
const textmaker = async (v1, v2, v3 = "") => {
  v2 = v2.split(";");
  const v4 = await fetch(v1, {
    method: "GET",
    headers: {
      "User-Agent": "GoogleBot",
    },
  });
  const v5 = await v4.text();
  const v6 = v4.headers
    .get("set-cookie")
    .split(",")
    .map(cookie.parse)
    .reduce(
      (v110, v22) => ({
        ...v110,
        ...v22,
      }),
      {},
    );
  const v7 = Object.entries({
    __cfduid: v6.__cfduid,
    PHPSESSID: v6.PHPSESSID,
  })
    .map(([v110, v22]) => cookie.serialize(v110, v22))
    .join("; ");
  const v8 = cheerio.load(v5);
  const v9 = v8('input[name="token"]').attr("value");
  const v10 = v8('input[name="build_server"]').attr("value");
  const v11 = v8('input[name="build_server_id"]').attr("value");
  const v12 = v8("input[name^='radio0[radio]']")
    .map((v110, v22) => v8(v22).val())
    .get();
  if (v12.length > 0 && !v3) {
    const v110 = Math.floor(Math.random() * v12.length);
    v3 = v12[v110];
    console.log("Option radio sélectionnée aléatoirement : " + v3);
  }
  const v13 = new FormData();
  v2.forEach(v110 => v13.append("text[]", v110.trim()));
  v13.append("submit", "Go");
  if (v3) {
    v13.append("radio0[radio]", v3);
  }
  v13.append("token", v9);
  v13.append("build_server", v10);
  v13.append("build_server_id", v11);
  const v14 = await fetch(v1, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "GoogleBot",
      Cookie: v7,
      ...v13.getHeaders(),
    },
    body: v13.getBuffer(),
  });
  const v15 = await v14.text();
  const v16 = cheerio.load(v15);
  const v17 = v1.includes("en.ephoto360.com")
    ? v16('input[name="form_value_input"]').attr("value")
    : v16("#form_value").first().text();
  if (!v17) {
    return {
      status: false,
    };
  }
  const v18 = JSON.parse(v17);
  const v19 = new FormData();
  v19.append("id", v18.id);
  v18.text.forEach(v110 => v19.append("text[]", v110));
  v19.append("token", v18.token);
  v19.append("build_server", v18.build_server);
  v19.append("build_server_id", v18.build_server_id);
  if (v18.radio0) {
    v19.append("radio0[radio]", v18.radio0.radio);
  }
  const v20 = await fetch(v1.split("/").slice(0, 3).join("/") + "/effect/create-image", {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "GoogleBot",
      Cookie: v7,
      ...v19.getHeaders(),
    },
    body: v19.getBuffer(),
  });
  const v21 = await v20.json();
  if (!v21.image) {
    throw new Error("textmaker: Erreur lors de la génération de l'image");
  }
  return {
    status: v21.success,
    url: "" + v10 + v21.image,
  };
};
module.exports = textmaker;
