const { ovlcmd, cmd } = require("../lib/ovlcmd");
const axios = require("axios");
const gis = require("g-i-s");
const wiki = require("wikipedia");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const config = require("../set");
const { translate } = require("@vitalets/google-translate-api");
const FormData = require("form-data");
const { ytdl } = require("../lib/dl");
const acrcloud = require("acrcloud");
const fs = require("fs");
ovlcmd(
  {
    nom_cmd: "img",
    classe: "Search",
    react: "🔍",
    desc: "Recherche d'images",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    const v1 = arg.join(" ");
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un terme de recherche, par exemple : img ovl-Md",
        },
        {
          quoted: ms,
        },
      );
    }
    gis(v1, async (v12, v2) => {
      if (v12) {
        console.error("Erreur lors de la recherche d'images:", v12);
        return ovl.sendMessage(
          dest,
          {
            text: "Erreur lors de la recherche d'images.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v3 = v2.slice(0, 5);
      if (v3.length === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "Aucune image trouvée pour ce terme de recherche.",
          },
          {
            quoted: ms,
          },
        );
      }
      for (const v13 of v3) {
        try {
          await ovl.sendMessage(
            dest,
            {
              image: {
                url: v13.url,
              },
              caption: "```Powered By OVL-MD-v2```",
            },
            {
              quoted: ms,
            },
          );
        } catch (e) {
          console.error("Erreur lors de l'envoi de l'image:", e);
        }
      }
    });
  },
);
ovlcmd(
  {
    nom_cmd: "google",
    classe: "Search",
    desc: "Recherche sur Google.",
    alias: ["search"],
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    if (!arg[0]) {
      return await ovl.sendMessage(
        dest,
        {
          text: "❗ Entrez un terme à rechercher sur Google.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg.join(" ");
    try {
      const v12 = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
          q: v1,
          key: "AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI",
          cx: "baf9bdb0c631236e5",
        },
      });
      if (!v12.data.items || v12.data.items.length === 0) {
        return await ovl.sendMessage(
          dest,
          {
            text: "❗ Aucun résultat trouvé pour cette recherche.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v2 = v12.data.items.slice(0, 3);
      let v3 = "*🔍 Résultats de recherche pour : " + v1 + "*\n\n";
      v2.forEach((v13, v22) => {
        v3 +=
          v22 +
          1 +
          ".\n *📌Titre:* " +
          v13.title +
          "\n*📃Description:* " +
          v13.snippet +
          "\n*🌐Lien:* " +
          v13.link +
          "\n\n";
      });
      await ovl.sendMessage(
        dest,
        {
          text: v3,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur dans la recherche Google :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "❗ Une erreur est survenue lors de la recherche sur Google. Veuillez réessayer.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "wiki",
    classe: "Search",
    react: "📖",
    desc: "Recherche sur Wikipédia.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    if (!arg[0]) {
      return await ovl.sendMessage(
        dest,
        {
          text: "❗ Entrez un terme à rechercher sur Wikipédia.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = arg.join(" ");
    try {
      const v12 = await wiki.summary(v1);
      const v2 =
        "*📖Wikipédia :*\n\n*📌Titre:* " +
        v12.title +
        "\n\n*📃Description:* " +
        v12.description +
        "\n\n*📄Résumé:* " +
        v12.extract +
        "\n\n*🌐Lien:* " +
        v12.content_urls.mobile.page;
      await ovl.sendMessage(
        dest,
        {
          text: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur dans la recherche Wikipédia :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "❗ Une erreur est survenue lors de la recherche sur Wikipédia. Veuillez réessayer.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "github",
    classe: "Search",
    react: "🔍",
    desc: "Récupère les informations d'un utilisateur GitHub",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    const v1 = arg.join(" ");
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "❗ Veuillez fournir un nom d'utilisateur GitHub à rechercher.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await axios.get("https://api.github.com/users/" + encodeURIComponent(v1));
      const v2 = v12.data;
      const v3 =
        "*👤 Nom d'utilisateur :* " +
        v2.login +
        "\n" +
        ("*📛 Nom affiché :* " + (v2.name || "Non spécifié") + "\n") +
        ("*📝 Bio :* " + (v2.bio || "Aucune bio") + "\n") +
        ("*🏢 Entreprise :* " + (v2.company || "Non spécifiée") + "\n") +
        ("*📍 Localisation :* " + (v2.location || "Non spécifiée") + "\n") +
        ("*🔗 Lien :* " + v2.html_url + "\n") +
        ("*👥 Followers :* " + v2.followers + "\n") +
        ("*👤 Following :* " + v2.following + "\n") +
        ("*📦 Repos publics :* " + v2.public_repos + "\n") +
        ("*🕰️ Créé le :* " + v2.created_at.split("T")[0]);
      if (v2.avatar_url) {
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v2.avatar_url,
            },
            caption: v3,
          },
          {
            quoted: ms,
          },
        );
      } else {
        await ovl.sendMessage(
          dest,
          {
            text: v3,
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des données GitHub :", e.message);
      ovl.sendMessage(
        dest,
        {
          text: "❗ Impossible de récupérer les données GitHub.\n" + e.message,
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "imdb",
    classe: "Search",
    react: "🎬",
    desc: "Recherche des informations sur un film ou une série via IMDB",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    const v1 = arg.join(" ");
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "❗ Veuillez fournir un nom de film ou de série à rechercher.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await axios.get(
        "http://www.omdbapi.com/?apikey=742b2d09&t=" + encodeURIComponent(v1) + "&plot=full&lang=fr",
      );
      const v2 = v12.data;
      if (v2.Response === "False") {
        return ovl.sendMessage(
          dest,
          {
            text: "❗ Impossible de trouver ce film ou cette série.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v3 = await translate(v2.Plot, {
        to: "fr",
      })
        .then(v13 => v13.text)
        .catch(() => v2.Plot);
      const v4 = await translate(v2.Language, {
        to: "fr",
      })
        .then(v13 => v13.text)
        .catch(() => v2.Language);
      const v5 = await translate(v2.Country, {
        to: "fr",
      })
        .then(v13 => v13.text)
        .catch(() => v2.Country);
      const v6 = await translate(v2.Awards, {
        to: "fr",
      })
        .then(v13 => v13.text)
        .catch(() => v2.Awards);
      const v7 =
        "⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n🎬 *IMDB MOVIE SEARCH*\n⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n" +
        ("*🎞️ Titre :* " + v2.Title + "\n") +
        ("*📅 Année :* " + v2.Year + "\n") +
        ("*⭐ Classement :* " + v2.Rated + "\n") +
        ("*📆 Sortie :* " + v2.Released + "\n") +
        ("*⏳ Durée :* " + v2.Runtime + "\n") +
        ("*🌀 Genre :* " + v2.Genre + "\n") +
        ("*👨🏻‍💻 Réalisateur :* " + v2.Director + "\n") +
        ("*✍ Scénariste :* " + v2.Writer + "\n") +
        ("*👨 Acteurs :* " + v2.Actors + "\n") +
        ("*📃 Synopsis :* " + v3 + "\n") +
        ("*🌐 Langue :* " + v4 + "\n") +
        ("*🌍 Pays :* " + v5 + "\n") +
        ("*🎖️ Récompenses :* " + (v6 || "Aucune") + "\n") +
        ("*📦 Box-office :* " + (v2.BoxOffice || "Non disponible") + "\n") +
        ("*🏙️ Production :* " + (v2.Production || "Non spécifiée") + "\n") +
        ("*🌟 Note IMDb :* " + v2.imdbRating + " ⭐\n") +
        ("*❎ Votes IMDb :* " + v2.imdbVotes);
      if (v2.Poster && v2.Poster !== "N/A") {
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v2.Poster,
            },
            caption: v7,
          },
          {
            quoted: ms,
          },
        );
      } else {
        await ovl.sendMessage(
          dest,
          {
            text: v7,
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des données IMDB :", e.message);
      ovl.sendMessage(
        dest,
        {
          text: "❗ Une erreur s'est produite lors de la recherche du film.\n" + e.message,
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "stickersearch",
    classe: "Search",
    react: "🖼️",
    desc: "Recherche et envoie des stickers animés basés sur un mot-clé.",
    alias: ["sstick"],
  },
  async (dest, ovl, ctx) => {
    const { arg, auteur_Message, ms } = ctx;
    if (!arg.length) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un terme de recherche pour le sticker !",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
    const v2 = encodeURIComponent(arg.join(" "));
    try {
      const v12 = await axios.get(
        "https://tenor.googleapis.com/v2/search?q=" +
          v2 +
          "&key=" +
          v1 +
          "&client_key=my_project&limit=8&media_filter=gif",
      );
      const v22 = v12.data.results;
      if (!v22.length) {
        return ovl.sendMessage(
          dest,
          {
            text: "Aucun sticker trouvé pour cette recherche.",
          },
          {
            quoted: ms,
          },
        );
      }
      for (let v13 = 0; v13 < Math.min(8, v22.length); v13++) {
        const v14 = v22[v13].media_formats.gif.url;
        const v23 = new Sticker(v14, {
          pack: config.STICKER_PACK_NAME,
          author: config.STICKER_AUTHOR_NAME,
          type: StickerTypes.FULL,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 60,
          background: "transparent",
        });
        const v3 = await v23.toBuffer();
        await ovl.sendMessage(
          dest,
          {
            sticker: v3,
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      console.error(e);
      ovl.sendMessage(
        dest,
        {
          text: "Une erreur s'est produite lors de la récupération des stickers.",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "meteo",
    classe: "Search",
    react: "🌦️",
    desc: "Affiche la météo d'une ville.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms } = ctx;
    const v1 = arg.join(" ");
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "❗ Veuillez fournir un nom de ville.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = "1ad47ec6172f19dfaf89eb3307f74785";
      const v2 =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        encodeURIComponent(v1) +
        "&units=metric&appid=" +
        v12;
      const v3 = await axios.get(v2);
      const v4 = v3.data;
      const v5 = v4.name;
      const v6 = v4.sys.country;
      const v7 = v4.main.temp;
      const v8 = v4.main.feels_like;
      const v9 = v4.main.temp_min;
      const v10 = v4.main.temp_max;
      const v11 = v4.weather[0].description;
      const v122 = v4.main.humidity;
      const v13 = v4.wind.speed;
      const v14 = v4.rain ? v4.rain["1h"] || 0 : 0;
      const v15 = v4.clouds.all;
      const v16 = new Date(v4.sys.sunrise * 1000);
      const v17 = new Date(v4.sys.sunset * 1000);
      const v18 = v110 => {
        const v22 = v110.getUTCHours().toString().padStart(2, "0");
        const v32 = v110.getUTCMinutes().toString().padStart(2, "0");
        const v42 = v110.getUTCSeconds().toString().padStart(2, "0");
        return v22 + ":" + v32 + ":" + v42;
      };
      const v19 = v18(v16);
      const v20 = v18(v17);
      const v21 =
        "🌍 *Météo à " +
        v5 +
        ", " +
        v6 +
        "*  \n\n🌡️ *Température :* " +
        v7 +
        "°C  \n🌡️ *Ressenti :* " +
        v8 +
        "°C  \n📉 *Température min :* " +
        v9 +
        "°C  \n📈 *Température max :* " +
        v10 +
        "°C  \n📝 *Description :* " +
        (v11.charAt(0).toUpperCase() + v11.slice(1)) +
        "  \n💧 *Humidité :* " +
        v122 +
        "%  \n💨 *Vent :* " +
        v13 +
        " m/s  \n🌧️ *Précipitations (1h) :* " +
        v14 +
        " mm  \n☁️ *Nébulosité :* " +
        v15 +
        "%  \n🌄 *Lever du soleil (GMT) :* " +
        v19 +
        "  \n🌅 *Coucher du soleil (GMT) :* " +
        v20;
      await ovl.sendMessage(
        dest,
        {
          text: v21,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de la récupération des données météo :", e.message);
      await ovl.sendMessage(
        dest,
        {
          text: "❗ Impossible de trouver cette ville. Vérifiez l'orthographe et réessayez !",
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "anime",
    classe: "Search",
    react: "📺",
    desc: "Recherche un anime aléatoire avec un résumé et un lien vers MyAnimeList.",
  },
  async (dest, ovl, ctx) => {
    const v1 = "https://api.jikan.moe/v4/random/anime";
    try {
      const v12 = await axios.get(v1);
      const v2 = v12.data.data;
      const v3 = v2.title;
      let v4 = v2.synopsis;
      const v5 = v2.images.jpg.image_url;
      const v6 = v2.episodes;
      const v7 = v2.status;
      const v8 = await translate(v4, {
        to: "fr",
      })
        .then(v13 => v13.text)
        .catch(() => v4);
      const v9 = await translate(v7, {
        to: "fr",
      })
        .then(v13 => v13.text)
        .catch(() => v7);
      const v10 =
        "✨ *ANIME ALÉATOIRE* ✨\n\n" +
        ("📺 *Titre* : " + v3 + "\n") +
        ("🎬 *Épisodes* : " + v6 + "\n") +
        ("📡 *Statut* : " + v9 + "\n") +
        ("🔗 *URL* : " + v2.url + "\n") +
        ("📝 *Synopsis* : " + v8 + "\n");
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v5,
          },
          caption: v10,
        },
        {
          quoted: ctx.ms,
        },
      );
    } catch (e) {
      console.error(e);
      ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de la récupération des informations de l'anime.",
        },
        {
          quoted: ctx.ms,
        },
      );
    }
  },
);
ovlcmd(
  {
    nom_cmd: "lyrics",
    classe: "Search",
    react: "🎵",
    desc: "Cherche les paroles d'une chanson",
  },
  async (dest, ovl, { arg, ms, repondre }) => {
    const v1 = arg.join(" ");
    if (!v1) {
      return repondre("❌ Veuillez fournir un nom de chanson.");
    }
    try {
      const v12 = "https://api.delirius.store/search/lyrics?query=" + encodeURIComponent(v1);
      const { data } = await axios.get(v12);
      if (!data.status || !data.data?.lyrics) {
        return repondre("❌ Paroles introuvables pour cette chanson.");
      }
      const { title, artists, album, duration, lyrics } = data.data;
      const v2 =
        "╭──〔 *🎵 OVL-MD-LYRICS* 〕──⬣\n⬡ 🎧 *Titre* : " +
        title +
        "\n⬡ 👤 *Artiste* : " +
        artists +
        "\n⬡ 💿 *Album* : " +
        (album || "N/A") +
        "\n⬡ ⏱️ *Durée* : " +
        (duration || "N/A") +
        "\n╰───────────────────⬣\n\n🎼 *Paroles :*\n\n" +
        lyrics;
      await ovl.sendMessage(
        dest,
        {
          text: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur API Lyrics :", e.message);
      repondre("❌ Une erreur s'est produite lors de la récupération des paroles.");
    }
  },
);
const acr = new acrcloud({
  host: "identify-eu-west-1.acrcloud.com",
  access_key: "12e1a7cd0396b0c7419792fe23161175",
  access_secret: "IFXo3K5j6dwpFXMRR7FFitF1LWqx9jqj8KE6Cztj",
});
ovlcmd(
  {
    nom_cmd: "shazam",
    classe: "Search",
    react: "🎵",
    desc: "Identifier une musique depuis un audio/vidéo",
    alias: [],
  },
  async (dest, ovl, { msg_Repondu, ms, repondre }) => {
    let v1 = null;
    if (msg_Repondu?.audioMessage) {
      v1 = msg_Repondu.audioMessage;
    } else if (msg_Repondu?.videoMessage) {
      v1 = msg_Repondu.videoMessage;
    } else if (ms.message?.videoMessage) {
      v1 = ms.message.videoMessage;
    }
    if (!v1) {
      return repondre("Répondez à un audio ou une courte vidéo");
    }
    try {
      const v12 = await ovl.dl_save_media_ms(v1);
      let v2 = fs.readFileSync(v12);
      const v3 = 1048576;
      if (v2.length > v3) {
        v2 = v2.slice(0, v3);
      }
      const v4 = await acr.identify(v2);
      if (v4.status.code !== 0 || !v4.metadata?.music?.length) {
        return repondre("Impossible d’identifier la musique.");
      }
      const v5 = v4.metadata.music[0];
      const v6 = v5.title || "Inconnu";
      const v7 = v5.artists?.map(v14 => v14.name).join(", ") || "Inconnu";
      const v8 = v5.album?.name || "Inconnu";
      const v9 = v5.genres?.map(v14 => v14.name).join(", ") || "N/A";
      const v10 = v5.release_date || "N/A";
      const v11 = await ytdl(v6 + " " + v7, "audio");
      const v122 = v11.yts[0].url || "Aucun lien trouvé";
      const v13 =
        "╭━━〔 🎧 *OVL • SHAZAM* 〕━━╮\n\n🎵 *Titre* : " +
        v6 +
        "\n👤 *Artiste* : " +
        v7 +
        "\n💿 *Album* : " +
        v8 +
        "\n🎼 *Genre* : " +
        v9 +
        "\n📅 *Sortie* : " +
        v10 +
        "\n\n🌐 *YouTube* :\n" +
        v122 +
        "\n\n╰━━━━━━━━━━━━━━━━━━╯";
      await ovl.sendMessage(
        dest,
        {
          text: v13,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur Shazam :", e);
      repondre("Échec de la reconnaissance.");
    }
  },
);
