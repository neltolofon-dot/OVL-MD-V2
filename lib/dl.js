const axios = require("axios");
const cheerio = require("cheerio");
const cookie = require("cookie");
const ytdl = async (v1, v2 = "video") => {
  try {
    const v12 = "https://you-tube-dl-psi.vercel.app/youtube";
    const v22 = await axios.get(v12, {
      params: {
        url: v1,
        format: v2,
      },
    });
    if (!v22.data || !v22.data.status) {
      return null;
    }
    return v22.data.data;
  } catch (e) {
    console.error("Erreur lors de la récupération via Vercel:", e.message);
    return null;
  }
};
async function fbdl(v1) {
  try {
    const v12 = {
      id: v1,
      locale: "en",
    };
    const v2 = await axios.post("https://getmyfb.com/process", new URLSearchParams(v12), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "user-agent": "GoogleBot",
      },
    });
    const v3 = cheerio.load(v2.data);
    const v4 = v3(".results-list-item a").first().attr("href");
    if (v4) {
      return v4;
    } else {
      return "Aucun lien de téléchargement trouvé.";
    }
  } catch (e) {
    return "Erreur : " + e.message;
  }
}
async function ttdl(v1) {
  let v2 = 0;
  let v3;
  while (v2 < 5) {
    try {
      const v12 = await axios.get("https://ssstik.io/fr", {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
          "user-agent": "GoogleBot",
        },
        maxRedirects: 5,
      });
      const v22 = v12.headers["set-cookie"] || [];
      const v32 = v22
        .map(v13 => cookie.parse(v13))
        .reduce(
          (v13, v23) => ({
            ...v13,
            ...v23,
          }),
          {},
        );
      const v4 = cheerio.load(v12.data);
      const v5 = v4("#token").attr("value");
      const v6 = Object.entries({
        __cfduid: v32.__cfduid || "",
        PHPSESSID: v32.PHPSESSID || "",
      })
        .map(([v13, v23]) => cookie.serialize(v13, v23))
        .join("; ");
      const { data } = await axios.post(
        "https://ssstik.io/abc?url=dl",
        new URLSearchParams({
          id: v1,
          locale: "fr",
          tt: v5,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            cookie: v6,
            "User-Agent": "GoogleBot",
          },
        },
      );
      const v7 = cheerio.load(data);
      const v8 =
        v7("a.download_link.without_watermark").attr("href") || v7("a.slides_video").attr("href") || null;
      const v9 = v7("a.download_link.music").attr("href") || null;
      const v10 = [];
      v7("a.download_link.slide").each((v13, v23) => {
        const v33 = v7(v23).attr("href");
        if (v33) {
          v10.push(v33);
        }
      });
      const v11 = {
        noWatermark: v8,
        mp3: v9,
        slides: v10,
      };
      console.log(v11);
      return v11;
    } catch (e) {
      v3 = e;
      v2++;
      if (v2 < 5) {
        await new Promise(v12 => setTimeout(v12, 1000));
      }
    }
  }
  throw new Error("Échec après 5 tentatives : " + v3);
}
async function igdl(v1, v2 = 5) {
  let v3 = 0;
  while (v3 < v2) {
    try {
      v3++;
      const v12 = await axios.get("https://downloadgram.org/", {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "user-agent": "GoogleBot",
        },
        maxRedirects: 5,
      });
      const v22 = v12.headers["set-cookie"] || [];
      const v32 = v22
        .map(v13 => cookie.parse(v13))
        .reduce(
          (v13, v23) => ({
            ...v13,
            ...v23,
          }),
          {},
        );
      const v4 = cheerio.load(v12.data);
      const v5 = v4("#token").attr("value");
      const v6 = Object.entries({
        __cfduid: v32.__cfduid || "",
        PHPSESSID: v32.PHPSESSID || "",
      })
        .map(([v13, v23]) => cookie.serialize(v13, v23))
        .join("; ");
      const v7 = await axios.post(
        "https://api.downloadgram.org/media",
        new URLSearchParams({
          url: v1,
          v: "3",
          lang: "en",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "GoogleBot",
            cookie: v6,
          },
        },
      );
      const v8 = cheerio.load(v7.data);
      let v9 = v8("video source").attr("src");
      if (v9) {
        v9 = v9.replace(/^\\\"|\\\"$/g, "");
        return {
          status: v7.status,
          result: {
            video: v9,
          },
        };
      } else {
        throw new Error("Lien de vidéo introuvable.");
      }
    } catch (e) {
      if (v3 >= v2) {
        throw e;
      }
      await new Promise(v12 => setTimeout(v12, 2000));
    }
  }
}
async function twitterdl(v1, v2 = 5) {
  let v3 = 0;
  while (v3 < v2) {
    try {
      v3++;
      const v12 = await axios.get("https://twitsave.com/info?url=" + v1, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "user-agent": "GoogleBot",
        },
      });
      const v22 = cheerio.load(v12.data);
      const v32 = v22("video").attr("src");
      if (v32) {
        return {
          status: v12.status,
          result: {
            video: v32,
          },
        };
      } else {
        throw new Error("Lien vidéo introuvable.");
      }
    } catch (e) {
      if (v3 >= v2) {
        throw e;
      }
      await new Promise(v12 => setTimeout(v12, 2000));
    }
  }
}
async function apkdl(v1, v2 = 1) {
  const { data } = await axios.get("https://ws75.aptoide.com/api/7/apps/search", {
    params: {
      query: v1,
      limit: v2,
    },
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "User-Agent": "GoogleBot",
    },
  });
  const v3 = data?.datalist?.list || [];
  return v3.map(v12 => ({
    name: v12.name,
    icon: v12.icon,
    size: formatSize(v12.file?.filesize),
    dllink: v12.file?.path,
    package: v12.package,
    lastup: v12.updated || "N/A",
  }));
}
function formatSize(v1) {
  if (!v1) {
    return "0 MB";
  }
  const v2 = v1 / 1048576;
  return v2.toFixed(2) + " MB";
}
module.exports = {
  fbdl,
  ttdl,
  igdl,
  twitterdl,
  ytdl,
  apkdl,
};
