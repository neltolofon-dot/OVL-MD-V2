const { ovlcmd } = require("../lib/ovlcmd");
const { fbdl, ttdl, igdl, twitterdl, ytdl, apkdl } = require("../lib/dl");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
ovlcmd(
  {
    nom_cmd: "song",
    classe: "Telechargement",
    react: "🎵",
    desc: "Télécharge une chanson depuis YouTube avec un terme de recherche",
    alias: ["play"],
  },
  async (dest, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v2 = v13.find(v14 => v14.startsWith("https"));
        if (v2) {
          v1 = [v2];
        }
      }
    }
    if (!v1.length) {
      return repondre("Veuillez spécifier un titre ou un lien YouTube.");
    }
    try {
      const v12 = v1.join(" ");
      const v2 = await ytdl(v12, "audio");
      const v3 = v2.yts[0];
      const v4 =
        "*AUDIO* 𝙊𝙑𝙇-𝙈𝘿\n\n🎼 *Titre* : " +
        v3.title +
        "\n🕐 *Durée* : " +
        v3.duration +
        "\n👁️ *Vues* : " +
        v3.views +
        "\n🔗 *Lien* : " +
        v3.url +
        "\n\n🔊 *Powered by OVL-MD-V2*";
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v3.thumbnail,
          },
          caption: v4,
        },
        {
          quoted: ms,
        },
      );
      const v5 = await axios.get(
        "https://you-tube-dl-psi.vercel.app/youtube/download?url=" + encodeURIComponent(v2.ytdl.download),
        {
          responseType: "arraybuffer",
        },
      );
      const v6 = Buffer.from(v5.data);
      await ovl.sendMessage(
        dest,
        {
          audio: v6,
          mimetype: "audio/mpeg",
          caption: "```Powered by OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      repondre("❌ Erreur lors du téléchargement de la chanson.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "video",
    classe: "Telechargement",
    react: "🎥",
    desc: "Télécharge une vidéo depuis YouTube avec un terme de recherche",
  },
  async (dest, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v2 = v13.find(v14 => v14.startsWith("https"));
        if (v2) {
          v1 = [v2];
        }
      }
    }
    if (!v1.length) {
      return repondre("Veuillez spécifier un titre ou un lien YouTube.");
    }
    try {
      const v12 = v1.join(" ");
      const v2 = await ytdl(v12, "video");
      const v3 = v2.yts[0];
      const v4 =
        "*VIDÉO* 𝙊𝙑𝙇-𝙈𝘿\n\n🎼 *Titre* : " +
        v3.title +
        "\n🕐 *Durée* : " +
        v3.duration +
        "\n👁️ *Vues* : " +
        v3.views +
        "\n🔗 *Lien* : " +
        v3.url +
        "\n\n🎬 *Powered by OVL-MD-V2*";
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v3.thumbnail,
          },
          caption: v4,
        },
        {
          quoted: ms,
        },
      );
      const v5 = await axios.get(
        "https://you-tube-dl-psi.vercel.app/youtube/download?url=" + encodeURIComponent(v2.ytdl.download),
        {
          responseType: "arraybuffer",
        },
      );
      const v6 = Buffer.from(v5.data);
      await ovl.sendMessage(
        dest,
        {
          video: v6,
          mimetype: "video/mp4",
          caption: "```Powered by OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      repondre("❌ Erreur lors du téléchargement de la vidéo.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "yta",
    classe: "Telechargement",
    react: "🎧",
    desc: "Télécharge l'audio d'une vidéo YouTube à l'aide d'un lien",
    alias: ["ytmp3"],
  },
  async (dest, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v22 = v13.find(v14 => v14.startsWith("https"));
        if (v22) {
          v1 = [v22];
        }
      }
    }
    const v2 = v1.join(" ");
    if (!v2.startsWith("https://")) {
      return repondre("Exemple : *yta https://youtube.com/watch?v=xyz*");
    }
    try {
      const v12 = await ytdl(v2, "audio");
      const v22 = await axios.get(
        "https://you-tube-dl-psi.vercel.app/youtube/download?url=" + encodeURIComponent(v12.ytdl.download),
        {
          responseType: "arraybuffer",
        },
      );
      const v3 = Buffer.from(v22.data);
      await ovl.sendMessage(
        dest,
        {
          audio: v3,
          mimetype: "audio/mpeg",
          caption: "```Powered by OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      repondre("Impossible de télécharger l'audio.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "ytv",
    classe: "Telechargement",
    react: "🎬",
    desc: "Télécharge une vidéo YouTube à l'aide d'un lien",
    alias: ["ytmp4"],
  },
  async (dest, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v22 = v13.find(v14 => v14.startsWith("https"));
        if (v22) {
          v1 = [v22];
        }
      }
    }
    const v2 = v1.join(" ");
    if (!v2.startsWith("https://")) {
      return repondre("Exemple : *ytv https://youtube.com/watch?v=xyz*");
    }
    try {
      const v12 = await ytdl(v2, "video");
      const v22 = await axios.get(
        "https://you-tube-dl-psi.vercel.app/youtube/download?url=" + encodeURIComponent(v12.ytdl.download),
        {
          responseType: "arraybuffer",
        },
      );
      const v3 = Buffer.from(v22.data);
      await ovl.sendMessage(
        dest,
        {
          video: v3,
          mimetype: "video/mp4",
          caption: "```Powered by OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      repondre("Impossible de télécharger la vidéo.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "fbdl",
    classe: "Telechargement",
    react: "📥",
    alias: ["facebook", "facebockdl"],
    desc: "Télécharger ou envoyer directement une vidéo depuis Facebook",
  },
  async (dest, ovl, ctx) => {
    let { arg, ms, msg_Repondu } = ctx;
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v22 = v13.find(v14 => v14.startsWith("https"));
        if (v22) {
          v1 = [v22];
        }
      }
    }
    const v2 = v1.join(" ");
    if (!v2) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un lien vidéo, par exemple : fbdl https://www.facebook.com/video-link",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await fbdl(v2);
      const v22 = await axios.get(v12, {
        responseType: "arraybuffer",
        headers: {
          Accept: "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
      const v3 = Buffer.from(v22.data);
      return ovl.sendMessage(
        dest,
        {
          video: v3,
          caption: "```Powered By OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
        },
        {
          quoted: ms,
        },
      );
      console.error("Error:", e);
      return ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
async function extractLink(v1, v2) {
  let v3 = v1;
  if (!v3.length && v2) {
    const v12 = v2.conversation || v2.extendedTextMessage?.text || "";
    if (typeof v12 === "string") {
      const v13 = v12.split(/ +/);
      const v22 = v13.find(v14 => v14.startsWith("https"));
      if (v22) {
        v3 = [v22];
      }
    }
  }
  return v3.join(" ");
}
ovlcmd(
  {
    nom_cmd: "tiktok",
    classe: "Telechargement",
    react: "📥",
    alias: ["ttdl", "tiktokdl", "ttvideo", "tiktokvideo"],
    desc: "Télécharger une vidéo TikTok sans filigrane",
  },
  async (dest, ovl, ctx) => {
    let { arg, ms, msg_Repondu } = ctx;
    const v1 = await extractLink(arg, msg_Repondu);
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Lien TikTok requis.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await ttdl(v1);
      if (!v12.noWatermark) {
        return ovl.sendMessage(
          dest,
          {
            text: "Vidéo non disponible.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v2 = await axios.get(v12.noWatermark, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "GoogleBot",
        },
      });
      await ovl.sendMessage(
        dest,
        {
          video: Buffer.from(v2.data),
          caption: "```Powered By OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
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
    nom_cmd: "tiktokaudio",
    classe: "Telechargement",
    react: "🎵",
    alias: ["ttaudio", "ttmp3"],
    desc: "Télécharger l'audio TikTok en MP3",
  },
  async (dest, ovl, ctx) => {
    let { arg, ms, msg_Repondu } = ctx;
    const v1 = await extractLink(arg, msg_Repondu);
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Lien TikTok requis.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await ttdl(v1);
      if (!v12.mp3) {
        return ovl.sendMessage(
          dest,
          {
            text: "Audio non disponible.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v2 = await axios.get(v12.mp3, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "GoogleBot",
        },
      });
      await ovl.sendMessage(
        dest,
        {
          audio: Buffer.from(v2.data),
          mimetype: "audio/mp4",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
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
    nom_cmd: "tiktokimage",
    classe: "Telechargement",
    react: "🖼️",
    alias: ["ttimg", "ttslides"],
    desc: "Télécharger les images (slides) TikTok",
  },
  async (dest, ovl, ctx) => {
    let { arg, ms, msg_Repondu } = ctx;
    const v1 = await extractLink(arg, msg_Repondu);
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Lien TikTok requis.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await ttdl(v1);
      if (!v12.slides || v12.slides.length === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "Aucune image trouvée.",
          },
          {
            quoted: ms,
          },
        );
      }
      for (const v13 of v12.slides) {
        const v14 = await axios.get(v13, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "GoogleBot",
          },
        });
        await ovl.sendMessage(
          dest,
          {
            image: Buffer.from(v14.data),
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
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
    nom_cmd: "igdl",
    classe: "Telechargement",
    react: "📥",
    alias: ["insta", "instadl", "instagram", "instagramdl"],
    desc: "Télécharger ou envoyer directement une vidéo depuis Instagram",
  },
  async (dest, ovl, ctx) => {
    let { arg, ms, msg_Repondu } = ctx;
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v22 = v13.find(v14 => v14.startsWith("https"));
        if (v22) {
          v1 = [v22];
        }
      }
    }
    const v2 = v1.join(" ");
    if (!v2) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un lien vidéo Instagram, par exemple : igdl https://www.instagram.com/reel/...",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await igdl(v2);
      const v22 = await axios.get(v12.result.video, {
        responseType: "arraybuffer",
        headers: {
          Accept: "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
      return ovl.sendMessage(
        dest,
        {
          video: Buffer.from(v22.data),
          caption: "```Powered By OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
        },
        {
          quoted: ms,
        },
      );
      console.error("Error:", e);
    }
  },
);
ovlcmd(
  {
    nom_cmd: "twitterdl",
    classe: "Telechargement",
    react: "📥",
    alias: ["twitter", "twitdl"],
    desc: "Télécharger ou envoyer directement une vidéo depuis Twitter",
  },
  async (dest, ovl, ctx) => {
    let { arg, ms, msg_Repondu } = ctx;
    let v1 = arg;
    if (!v1.length && msg_Repondu) {
      const v12 = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof v12 === "string") {
        const v13 = v12.split(/ +/);
        const v22 = v13.find(v14 => v14.startsWith("https"));
        if (v22) {
          v1 = [v22];
        }
      }
    }
    const v2 = v1.join(" ");
    if (!v2) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez fournir un lien vidéo Twitter, par exemple : twitterdl https://twitter.com/...",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await twitterdl(v2);
      const v22 = await axios.get(v12.result.video, {
        responseType: "arraybuffer",
        headers: {
          Accept: "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
      return ovl.sendMessage(
        dest,
        {
          video: Buffer.from(v22.data),
          caption: "```Powered By OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      ovl.sendMessage(
        dest,
        {
          text: "Erreur: " + e.message,
        },
        {
          quoted: ms,
        },
      );
      console.error("Error:", e);
    }
  },
);
ovlcmd(
  {
    nom_cmd: "app",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger une application depuis Aptoide",
  },
  async (dest, ovl, ctx) => {
    const { repondre, arg, ms } = ctx;
    try {
      const v1 = arg.join(" ");
      if (!v1) {
        return repondre("*Entrer le nom de l'application à rechercher*");
      }
      const v2 = await apkdl(v1, 1);
      if (v2.length === 0) {
        return repondre("*Application non existante, veuillez entrer un autre nom*");
      }
      const v3 = v2[0];
      const v4 = parseFloat(v3.size);
      if (isNaN(v4)) {
        return repondre("*Erreur dans la taille du fichier*");
      }
      if (v4 > 300) {
        return repondre("Le fichier dépasse 300 Mo, impossible de le télécharger.");
      }
      const v5 = v3.dllink;
      const v6 =
        "『 *ᴏᴠʟ-ᴍᴅ-ᴠ𝟸 ᴀᴘᴋ-ᴅʟ* 』\n\n*📱ɴᴏᴍ :* " +
        v3.name +
        "\n*🆔ɪᴅ :* " +
        v3.package +
        "\n*📅ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ:* " +
        v3.lastup +
        "\n*📦ᴛᴀɪʟʟᴇ :* " +
        v3.size +
        " MB\n";
      const v7 = (v3?.name || "Downloader") + ".apk";
      const v8 = v7;
      const v9 = await axios.get(v5, {
        responseType: "stream",
      });
      const v10 = fs.createWriteStream(v8);
      v9.data.pipe(v10);
      await new Promise((v12, v22) => {
        v10.on("finish", v12);
        v10.on("error", v22);
      });
      const v11 = {
        document: fs.readFileSync(v8),
        mimetype: "application/vnd.android.package-archive",
        fileName: v7,
      };
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v3.icon,
          },
          caption: v6,
        },
        {
          quoted: ms,
        },
      );
      await ovl.sendMessage(dest, v11, {
        quoted: ms,
      });
      fs.unlinkSync(v8);
    } catch (e) {
      console.error("Erreur lors du traitement de la commande apk:", e);
      repondre("*Erreur lors du traitement de la commande apk*");
    }
  },
);
