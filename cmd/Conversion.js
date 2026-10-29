const { ovlcmd } = require("../lib/ovlcmd");
const fs = require("fs");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { execSync, exec, spawn } = require("child_process");
const path = require("path");
const config = require("../set");
const gTTS = require("gtts");
const axios = require("axios");
const FormData = require("form-data");
const { readFileSync } = require("fs");
const sharp = require("sharp");
const { Ranks } = require("../DataBase/rank");
const os = require("os");
let fusionCache = {};
async function uploadToCatbox(v1) {
  try {
    const v12 = new FormData();
    v12.append("reqtype", "fileupload");
    v12.append("fileToUpload", fs.createReadStream(v1));
    const v2 = await axios.post("https://catbox.moe/user/api.php", v12, {
      headers: v12.getHeaders(),
    });
    return v2.data;
  } catch (e) {
    console.error("Erreur lors de l'upload sur Catbox:", e);
    throw new Error("Une erreur est survenue lors de l'upload du fichier.");
  }
}
const alea = v1 => "" + Math.floor(Math.random() * 10000) + v1;
const isSupportedFile = v1 => {
  const v2 = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".gif"];
  return v2.some(v12 => v1.endsWith(v12));
};
ovlcmd(
  {
    nom_cmd: "url",
    classe: "Conversion",
    react: "📤",
    desc: "Upload un fichier (image, vidéo, audio) sur Catbox et renvoie le lien",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, ms } = ctx;
    const v1 = msg_Repondu || ms.message;
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez mentionner un fichier (image, vidéo, audio ou document).",
        },
        {
          quoted: ms,
        },
      );
    }
    const v2 = v1.imageMessage || v1.videoMessage || v1.documentMessage || v1.audioMessage;
    if (!v2) {
      return ovl.sendMessage(
        dest,
        {
          text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou audio.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await ovl.dl_save_media_ms(v2);
      const v22 = await uploadToCatbox(v12);
      await ovl.sendMessage(
        dest,
        {
          text: v22,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur lors de l'upload sur Catbox:", e);
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la création du lien Catbox.",
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
    nom_cmd: "sticker",
    classe: "Conversion",
    react: "✍️",
    desc: "Crée un sticker à partir d'une image, vidéo ou GIF",
    alias: ["s", "stick"],
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, arg, ms } = ctx;
    const v1 = msg_Repondu || ms.message;
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Répondez à une image, vidéo ou GIF pour créer un sticker.",
        },
        {
          quoted: ms,
        },
      );
    }
    let v2;
    try {
      const v12 = v1.imageMessage || v1.videoMessage;
      if (!v12) {
        return ovl.sendMessage(
          dest,
          {
            text: "Veuillez répondre à une image, vidéo ou GIF valide.",
          },
          {
            quoted: ms,
          },
        );
      }
      v2 = await ovl.dl_save_media_ms(v12);
      if (!v2) {
        throw new Error("Impossible de télécharger le fichier.");
      }
      const v22 = fs.readFileSync(v2);
      const v3 = new Sticker(v22, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: v1.imageMessage ? 100 : 30,
      });
      const v4 = Math.floor(Math.random() * 10000) + ".webp";
      await v3.toFile(v4);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v4),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v2);
      fs.unlinkSync(v4);
    } catch (e) {
      console.error("Erreur lors de la création du sticker:", e);
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la création du sticker : " + e.message,
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
    nom_cmd: "crop",
    classe: "Conversion",
    react: "✂️",
    desc: "Crée un sticker croppé à partir d'une image ou vidéo",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, ms } = ctx;
    const v1 = msg_Repondu || ms.message;
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Répondez à une image ou vidéo.",
        },
        {
          quoted: ms,
        },
      );
    }
    let v2;
    try {
      const v12 = v1.imageMessage || v1.videoMessage;
      if (!v12) {
        return ovl.sendMessage(
          dest,
          {
            text: "Veuillez répondre à une image ou vidéo valide.",
          },
          {
            quoted: ms,
          },
        );
      }
      v2 = await ovl.dl_save_media_ms(v12);
      const v22 = fs.readFileSync(v2);
      const v3 = new Sticker(v22, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.CROPPED,
        quality: v1.imageMessage ? 100 : 30,
      });
      const v4 = Math.floor(Math.random() * 10000) + ".webp";
      await v3.toFile(v4);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v4),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v2);
      fs.unlinkSync(v4);
    } catch (e) {
      console.error("Erreur lors de la création du sticker :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la création du sticker : " + e.message,
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
    nom_cmd: "circle",
    classe: "Conversion",
    react: "🔵",
    desc: "Crée un sticker circulaire à partir d'une image ou vidéo",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, ms } = ctx;
    const v1 = msg_Repondu || ms.message;
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Répondez à une image ou vidéo.",
        },
        {
          quoted: ms,
        },
      );
    }
    let v2;
    try {
      const v12 = v1.imageMessage || v1.videoMessage;
      if (!v12) {
        return ovl.sendMessage(
          dest,
          {
            text: "Veuillez répondre à une image ou vidéo valide.",
          },
          {
            quoted: ms,
          },
        );
      }
      v2 = await ovl.dl_save_media_ms(v12);
      const v22 = fs.readFileSync(v2);
      const v3 = new Sticker(v22, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.CIRCLE,
        quality: v1.imageMessage ? 100 : 30,
      });
      const v4 = Math.floor(Math.random() * 10000) + ".webp";
      await v3.toFile(v4);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v4),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v2);
      fs.unlinkSync(v4);
    } catch (e) {
      console.error("Erreur lors de la création du sticker :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la création du sticker : " + e.message,
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
    nom_cmd: "round",
    classe: "Conversion",
    react: "🔲",
    desc: "Crée un sticker avec des coins arrondis à partir d'une image ou vidéo",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, ms } = ctx;
    const v1 = msg_Repondu || ms.message;
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Répondez à une image ou vidéo.",
        },
        {
          quoted: ms,
        },
      );
    }
    let v2;
    try {
      const v12 = v1.imageMessage || v1.videoMessage;
      if (!v12) {
        return ovl.sendMessage(
          dest,
          {
            text: "Veuillez répondre à une image ou vidéo valide.",
          },
          {
            quoted: ms,
          },
        );
      }
      v2 = await ovl.dl_save_media_ms(v12);
      const v22 = fs.readFileSync(v2);
      const v3 = new Sticker(v22, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.ROUNDED,
        quality: v1.imageMessage ? 100 : 30,
      });
      const v4 = Math.floor(Math.random() * 10000) + ".webp";
      await v3.toFile(v4);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v4),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v2);
      fs.unlinkSync(v4);
    } catch (e) {
      console.error("Erreur lors de la création du sticker :", e);
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la création du sticker : " + e.message,
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
    nom_cmd: "take",
    classe: "Conversion",
    react: "✍️",
    desc: "Modifie le nom d'un sticker",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, arg, nom_Auteur_Message, ms } = ctx;
    if (!msg_Repondu || !msg_Repondu.stickerMessage) {
      return ovl.sendMessage(
        dest,
        {
          text: "Répondez à un sticker.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v1 = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
      const v2 = msg_Repondu.stickerMessage.quality || 40;
      const v3 = new Sticker(v1, {
        pack: arg.join(" ") ? arg.join(" ") : nom_Auteur_Message,
        author: "",
        type: StickerTypes.FULL,
        quality: v2,
      });
      const v4 = alea(".webp");
      await v3.toFile(v4);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v4),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v4);
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors du renommage du sticker : " + e.message,
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
    nom_cmd: "toimage",
    classe: "Conversion",
    react: "✍️",
    desc: "Convertit un sticker en image",
    alias: ["toimg", "photo"],
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, ms } = ctx;
    if (!msg_Repondu || !msg_Repondu.stickerMessage) {
      return ovl.sendMessage(
        dest,
        {
          text: "Répondez à un sticker.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v1 = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
      const v2 = await sharp(v1).png().toBuffer();
      await ovl.sendMessage(
        dest,
        {
          image: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "Erreur lors de la conversion en image : " + e.message,
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
    nom_cmd: "write",
    classe: "Conversion",
    react: "✍️",
    desc: "Ajoute du texte à une image, vidéo ou sticker",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, arg, ms } = ctx;
    if (!msg_Repondu || !arg[0]) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez répondre à un fichier et fournir du texte.",
        },
        {
          quoted: ms,
        },
      );
    }
    const v1 = msg_Repondu.imageMessage || msg_Repondu.videoMessage || msg_Repondu.stickerMessage;
    if (!v1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou sticker.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await ovl.dl_save_media_ms(v1);
      const v2 = sharp(v12);
      const { width, height } = await v2.metadata();
      const v3 = arg.join(" ").toUpperCase();
      let v4 = Math.floor(width / 10);
      if (v4 < 20) {
        v4 = 20;
      }
      const v5 = v4 * 1.2;
      const v6 = width * 0.8;
      function v7(v13, v22) {
        const v32 = v13.split(" ");
        let v42 = [];
        let v52 = "";
        v32.forEach(v14 => {
          let v23 = v52 + v14 + " ";
          let v33 = v23.length * (v4 * 0.6);
          if (v33 > v22 && v52 !== "") {
            v42.push(v52.trim());
            v52 = v14 + " ";
          } else {
            v52 = v23;
          }
        });
        v42.push(v52.trim());
        return v42;
      }
      const v8 = v7(v3, v6);
      const v9 = v8
        .map(
          (v13, v22) =>
            '<text x="50%" y="' +
            (height - (v8.length - v22) * v5) +
            '" font-size="' +
            v4 +
            '" font-family="Arial" fill="white" text-anchor="middle" stroke="black" stroke-width="' +
            v4 / 15 +
            '">' +
            v13 +
            "</text>",
        )
        .join("");
      const v10 = '<svg width="' + width + '" height="' + height + '">' + v9 + "</svg>";
      const v11 = await v2
        .composite([
          {
            input: Buffer.from(v10),
            top: 0,
            left: 0,
          },
        ])
        .toBuffer();
      const v122 = Math.floor(Math.random() * 10000) + ".webp";
      await sharp(v11).webp().toFile(v122);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v122),
        },
        {
          quoted: ms,
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v122);
      fs.unlinkSync(v12);
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de l'ajout du texte : " + e.message,
        },
        {
          quoted: ms,
        },
      );
    }
  },
);
const remini = async (v1, v2) => {
  const v3 = ["enhance", "recolor", "dehaze"];
  const v4 = v3.includes(v2) ? v2 : v3[0];
  const v5 = "https://inferenceengine.vyro.ai/" + v4;
  const v6 = new FormData();
  v6.append("model_version", 1);
  const v7 = Buffer.isBuffer(v1) ? v1 : readFileSync(v1);
  v6.append("image", v7, {
    filename: "enhance_image_body.jpg",
    contentType: "image/jpeg",
  });
  const v8 = await axios.post(v5, v6, {
    headers: {
      ...v6.getHeaders(),
      "User-Agent": "okhttp/4.9.3",
      Connection: "Keep-Alive",
      "Accept-Encoding": "gzip",
    },
    responseType: "arraybuffer",
  });
  return Buffer.from(v8.data);
};
ovlcmd(
  {
    nom_cmd: "remini",
    classe: "Conversion",
    react: "🖼️",
    desc: "Amélioration de la qualité des images",
  },
  async (dest, ovl, ctx) => {
    const { msg_Repondu, ms } = ctx;
    const v1 = msg_Repondu || ms.message;
    if (!v1?.imageMessage) {
      return ovl.sendMessage(
        dest,
        {
          text: "Veuillez répondre à une image pour améliorer sa qualité.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v12 = await ovl.dl_save_media_ms(v1.imageMessage);
      if (!v12) {
        return ovl.sendMessage(
          dest,
          {
            text: "Impossible de télécharger l'image. Réessayez.",
          },
          {
            quoted: ms,
          },
        );
      }
      try {
        const v13 = await uploadToCatbox(v12);
        const v2 = await axios.get("https://www.itzky.xyz/api/remini?url=" + v13);
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v2.data.result,
            },
            caption: "```Powered By OVL-MD-V2```",
          },
          {
            quoted: ms,
          },
        );
        return;
      } catch {}
      try {
        const v13 = await remini(v12, "enhance");
        await ovl.sendMessage(
          dest,
          {
            image: v13,
            caption: "```Powered By OVL-MD-V2```",
          },
          {
            quoted: ms,
          },
        );
      } catch {
        await ovl.sendMessage(
          dest,
          {
            text: "Une erreur est survenue pendant le traitement de l'image avec les deux services.",
          },
          {
            quoted: ms,
          },
        );
      }
    } catch {
      return ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue pendant le traitement de l'image.",
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
    nom_cmd: "emix",
    classe: "Conversion",
    react: "🌟",
    desc: "Mixes deux emojis pour créer un sticker",
  },
  async (dest, ovl, ctx) => {
    const { arg, prefixe, ms } = ctx;
    if (!arg || arg.length < 1) {
      return ovl.sendMessage(
        dest,
        {
          text: "Example: " + prefixe + "emix 😅;🤔",
        },
        {
          quoted: ms,
        },
      );
    }
    let [v1, v2] = arg[0].split(";");
    try {
      let v12 = await axios.get(
        "https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=" +
          encodeURIComponent(v1) +
          "_" +
          encodeURIComponent(v2),
      );
      let v22 = v12.data;
      if (!v22.results || v22.results.length === 0) {
        return ovl.sendMessage(
          dest,
          {
            text: "Aucun résultat trouvé pour ces emojis.",
          },
          {
            quoted: ms,
          },
        );
      }
      for (let v13 of v22.results) {
        const v14 = await axios
          .get(v13.url, {
            responseType: "arraybuffer",
          })
          .then(v15 => v15.data);
        const v23 = new Sticker(v14, {
          pack: config.STICKER_PACK_NAME,
          author: config.STICKER_AUTHOR_NAME,
          type: StickerTypes.FULL,
          quality: 100,
        });
        const v3 = Math.floor(Math.random() * 10000) + ".webp";
        await v23.toFile(v3);
        await ovl.sendMessage(
          dest,
          {
            sticker: fs.readFileSync(v3),
          },
          {
            quoted: ms,
          },
        );
        fs.unlinkSync(v3);
      }
    } catch (e) {
      console.error("Erreur:", e);
      return ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de la recherche de l'image.",
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
    nom_cmd: "tts",
    classe: "Conversion",
    react: "🔊",
    desc: "Convertit un texte en parole et renvoie l'audio.",
  },
  async (dest, ovl, ctx) => {
    const { arg, prefixe, ms } = ctx;
    if (!arg[0]) {
      return ovl.sendMessage(
        dest,
        {
          text: "Entrez un texte à lire.",
        },
        {
          quoted: ms,
        },
      );
    }
    let v1 = "fr";
    let v2 = arg.join(" ");
    if (arg[0].length === 2) {
      v1 = arg[0];
      v2 = arg.slice(1).join(" ");
    }
    try {
      const v12 = new gTTS(v2, v1);
      const v22 = path.join(__dirname, "output.mp3");
      v12.save(v22, function (v13, v23) {
        if (v13) {
          return ovl.sendMessage(
            dest,
            {
              text: "Une erreur est survenue lors de la conversion en audio. Veuillez réessayer plus tard.",
            },
            {
              quoted: ms,
            },
          );
        }
        const v3 = fs.readFileSync(v22);
        const v4 = {
          audio: v3,
          mimetype: "audio/mpeg",
          caption: "```Powered By OVL-MD-V2```",
        };
        ovl
          .sendMessage(dest, v4, {
            quoted: ms,
          })
          .then(() => {
            fs.unlinkSync(v22);
          });
      });
    } catch (e) {
      return ovl.sendMessage(
        dest,
        {
          text: "Une erreur est survenue lors de la conversion en audio. Veuillez réessayer plus tard.",
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
    nom_cmd: "attp",
    classe: "Conversion",
    react: "📥",
    desc: "Transforme du texte en sticker animé",
  },
  async (dest, ovl, ctx) => {
    const { arg, repondre, nom_Auteur_Message, ms } = ctx;
    if (!arg[0]) {
      return repondre("Veuillez fournir du texte");
    }
    const v1 = arg.join(" ");
    try {
      const v12 = await axios.get("https://api-ovl.koyeb.app/attp?texte=" + encodeURIComponent(v1), {
        responseType: "arraybuffer",
      });
      const v2 = await new Sticker(v12.data, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: 90,
        background: "transparent",
      }).toBuffer();
      await ovl.sendMessage(
        dest,
        {
          sticker: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      repondre("❌ Une erreur est survenue lors de la génération du sticker animé.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "ttp",
    classe: "Conversion",
    react: "📥",
    desc: "Transforme du texte en sticker",
  },
  async (dest, ovl, ctx) => {
    const { arg, repondre, nom_Auteur_Message, ms } = ctx;
    if (!arg[0]) {
      return repondre("Veuillez fournir du texte");
    }
    const v1 = arg.join(" ");
    try {
      const v12 = await axios.get("https://api-ovl.koyeb.app/ttp?texte=" + encodeURIComponent(v1), {
        responseType: "arraybuffer",
      });
      const v2 = await new Sticker(v12.data, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: 70,
        background: "transparent",
      }).toBuffer();
      await ovl.sendMessage(
        dest,
        {
          sticker: v2,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      repondre("❌ Une erreur est survenue lors de la génération du sticker.");
    }
  },
);
async function convertWebpToMp4({ file, filename, url }) {
  try {
    if (!file && !url) {
      throw new Error("Un fichier ou une URL est requis.");
    }
    if (file && !filename) {
      throw new Error("Le nom du fichier est requis pour les fichiers envoyés.");
    }
    const v1 = new FormData();
    if (file) {
      v1.append("new-image", file, {
        filename,
      });
    }
    if (url) {
      v1.append("new-image-url", url);
    }
    const v2 = await axios.post("https://ezgif.com/webp-to-mp4", v1, {
      headers: v1.getHeaders(),
    });
    const v3 = v2?.request?.res?.responseUrl;
    if (!v3) {
      throw new Error("Redirection introuvable.");
    }
    const v4 = v3.replace(/\.html$/, "");
    const v5 = v4.split("/").pop();
    const v6 = await axios.post(
      v4 + "?ajax=true",
      new URLSearchParams({
        file: v5,
        background: "#ffffff",
        backgroundc: "#ffffff",
        repeat: "1",
        ajax: "true",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    const v7 = v6.data.toString();
    const v8 = '" controls><source src="';
    const v9 = '" type="video/mp4">Your browser';
    const v10 = v7.split(v8)?.[1]?.split(v9)?.[0];
    if (!v10) {
      throw new Error("Conversion échouée.");
    }
    return "https:" + v10.replace("https:", "");
  } catch (e) {
    throw new Error("Erreur conversion WebP → MP4 : " + e);
  }
}
ovlcmd(
  {
    nom_cmd: "stickertovideo",
    classe: "Conversion",
    react: "🎞️",
    desc: "Convertit un sticker en vidéo MP4",
    alias: ["stovid"],
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, msg_Repondu } = ctx;
    try {
      if (!msg_Repondu || !msg_Repondu.stickerMessage) {
        return ovl.sendMessage(
          dest,
          {
            text: "Répondez à un sticker.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v1 = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
      const v2 = fs.createReadStream(v1);
      const v3 = await convertWebpToMp4({
        file: v2,
        filename: "fichier.webp",
      });
      await ovl.sendMessage(
        dest,
        {
          video: {
            url: v3,
          },
          caption: "```Powered By OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v1);
    } catch (e) {
      console.error(e);
      repondre("❌ Une erreur est survenue pendant la conversion.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "quotely",
    classe: "Conversion",
    react: "🖼️",
    desc: "Transforme un message cité en sticker stylisé.",
    alias: ["q"],
  },
  async (dest, ovl, { ms, msg_Repondu, repondre, auteur_Msg_Repondu }) => {
    const v1 = msg_Repondu?.conversation || msg_Repondu?.extendedTextMessage?.text;
    if (!v1) {
      return repondre("Veuillez répondre à un message texte.");
    }
    let v2;
    try {
      v2 = await ovl.profilePictureUrl(auteur_Msg_Repondu, "image");
    } catch (e) {
      v2 = "https://files.catbox.moe/8kvevz.jpg";
    }
    let v3;
    const v4 = await Ranks.findOne({
      where: {
        id: auteur_Msg_Repondu,
      },
    });
    if (v4.name) {
      v3 = v4.name;
    } else {
      v3 = "OVL-MD-USER";
    }
    const v5 = ["#FFFFFF", "#000000", "#1f1f1f", "#e3e3e3"];
    const v6 = v5[Math.floor(Math.random() * v5.length)];
    const v7 = {
      type: "quote",
      format: "png",
      backgroundColor: v6,
      width: 512,
      height: 512,
      scale: 3,
      messages: [
        {
          avatar: true,
          from: {
            first_name: v3,
            language_code: "fr",
            name: v3,
            photo: {
              url: v2,
            },
          },
          text: v1,
          replyMessage: {},
        },
      ],
    };
    try {
      const v12 = await axios.post("https://bot.lyo.su/quote/generate", v7);
      const v22 = Buffer.from(v12.data.result.image, "base64");
      const v32 = new Sticker(v22, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: 100,
      });
      const v42 = "/tmp/quotely_" + Date.now() + ".webp";
      await v32.toFile(v42);
      await ovl.sendMessage(
        dest,
        {
          sticker: fs.readFileSync(v42),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v42);
    } catch (e) {
      console.error("Erreur Quotely :", e.message || e);
      return repondre("Une erreur est survenue lors de la génération du sticker.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "tovv",
    classe: "Outils",
    react: "👀",
    desc: "envoie un message en vue unique dans la discussion",
  },
  async (dest, ovl, ctx) => {
    const { ms, msg_Repondu, repondre } = ctx;
    if (!msg_Repondu) {
      return repondre("Veuillez mentionner un message qui n'est pas en vue unique.");
    }
    let v1 = Object.keys(msg_Repondu).find(v12 => v12.startsWith("viewOnceMessage"));
    let v2 = msg_Repondu;
    if (v1) {
      v2 = msg_Repondu[v1].message;
    }
    if (v2) {
      if (
        (v2.imageMessage && v2.imageMessage.viewOnce == true) ||
        (v2.videoMessage && v2.videoMessage.viewOnce == true) ||
        (v2.audioMessage && v2.audioMessage.viewOnce == true)
      ) {
        return repondre("Ce message est un message en vue unique.");
      }
    }
    try {
      let v12;
      let v22 = {
        quoted: ms,
      };
      if (v2.imageMessage) {
        v12 = await ovl.dl_save_media_ms(v2.imageMessage);
        await ovl.sendMessage(
          dest,
          {
            image: {
              url: v12,
            },
            viewOnce: true,
            caption: v2.imageMessage.caption || "",
          },
          v22,
        );
      } else if (v2.videoMessage) {
        v12 = await ovl.dl_save_media_ms(v2.videoMessage);
        await ovl.sendMessage(
          dest,
          {
            video: {
              url: v12,
            },
            viewOnce: true,
            caption: v2.videoMessage.caption || "",
          },
          v22,
        );
      } else if (v2.audioMessage) {
        v12 = await ovl.dl_save_media_ms(v2.audioMessage);
        await ovl.sendMessage(
          dest,
          {
            audio: {
              url: v12,
            },
            viewOnce: true,
            mimetype: "audio/mp4",
            ptt: false,
          },
          v22,
        );
      } else {
        return repondre("Ce type de message en vue unique n'est pas pris en charge.");
      }
    } catch (e) {
      console.error("Erreur lors de l'envoi du message en vue unique :", e.message || e);
      return repondre("Une erreur est survenue lors du traitement du message.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "toaudio",
    classe: "Conversion",
    react: "🎧",
    desc: "Convertit une vidéo en audio",
  },
  async (dest, ovl, { msg_Repondu, ms }) => {
    if (!msg_Repondu || !msg_Repondu.videoMessage) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Répondez à une *vidéo*.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v1 = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
      const v2 = path.join(os.tmpdir(), "aud_" + Date.now() + ".mp3");
      await new Promise((v12, v22) => {
        const v3 = spawn("ffmpeg", ["-i", v1, "-vn", "-acodec", "libmp3lame", "-q:a", "4", v2]);
        v3.stderr.on("data", () => {});
        v3.on("close", v13 => {
          if (v13 === 0) {
            v12();
          } else {
            v22(new Error("ffmpeg exited with code " + v13));
          }
        });
      });
      await ovl.sendMessage(
        dest,
        {
          audio: fs.readFileSync(v2),
          mimetype: "audio/mpeg",
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v1);
      fs.unlinkSync(v2);
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "❌ Erreur de conversion : " + e.message,
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
    nom_cmd: "tovideo",
    classe: "Conversion",
    react: "🎬",
    desc: "Convertit un audio en vidéo animée",
  },
  async (dest, ovl, { msg_Repondu, ms }) => {
    if (!msg_Repondu || !msg_Repondu.audioMessage) {
      return ovl.sendMessage(
        dest,
        {
          text: "❌ Répondez à un *audio*.",
        },
        {
          quoted: ms,
        },
      );
    }
    try {
      const v1 = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
      const v2 = parseFloat(
        execSync('ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "' + v1 + '"')
          .toString()
          .trim(),
      );
      const v3 = path.basename(v1, path.extname(v1));
      const v4 = path.dirname(v1);
      const v5 = path.join(v4, v3 + ".mp4");
      await new Promise((v12, v22) => {
        const v32 = spawn("ffmpeg", [
          "-y",
          "-i",
          v1,
          "-f",
          "lavfi",
          "-i",
          "color=c=black:s=640x360:d=" + v2,
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-shortest",
          v5,
        ]);
        v32.stderr.on("data", () => {});
        v32.on("close", v13 => {
          if (v13 === 0) {
            v12();
          } else {
            v22(new Error("ffmpeg exited with code " + v13));
          }
        });
      });
      await ovl.sendMessage(
        dest,
        {
          video: fs.readFileSync(v5),
        },
        {
          quoted: ms,
        },
      );
      fs.unlinkSync(v1);
      fs.unlinkSync(v5);
    } catch (e) {
      await ovl.sendMessage(
        dest,
        {
          text: "❌ Erreur de conversion en vidéo : " + e.message,
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
    nom_cmd: "fusion",
    classe: "Conversion",
    react: "🎬",
    desc: "Fusionne un audio et une vidéo",
  },
  async (dest, ovl, { msg_Repondu, ms, auteur_Message, arg }) => {
    const v1 = auteur_Message;
    fusionCache[v1] = fusionCache[v1] || {};
    if (arg[0]?.toLowerCase() === "result") {
      if (!fusionCache[v1].audioPath || !fusionCache[v1].videoPath) {
        return ovl.sendMessage(
          dest,
          {
            text: "❌ Audio ou vidéo manquant.",
          },
          {
            quoted: ms,
          },
        );
      }
      const { audioPath, videoPath } = fusionCache[v1];
      const v12 = path.join(path.dirname(videoPath), "fusion_" + Date.now() + ".mp4");
      try {
        await new Promise((v13, v2) => {
          const v3 = spawn("ffmpeg", [
            "-y",
            "-i",
            videoPath,
            "-i",
            audioPath,
            "-map",
            "0:v",
            "-map",
            "1:a",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            v12,
          ]);
          v3.on("close", v14 => {
            if (v14 === 0) {
              v13();
            } else {
              v2(new Error("ffmpeg " + v14));
            }
          });
        });
        await ovl.sendMessage(
          dest,
          {
            video: fs.readFileSync(v12),
          },
          {
            quoted: ms,
          },
        );
        fs.unlinkSync(audioPath);
        fs.unlinkSync(videoPath);
        fs.unlinkSync(v12);
        delete fusionCache[v1];
        return;
      } catch (e) {
        return ovl.sendMessage(
          dest,
          {
            text: "❌ Erreur lors de la fusion.",
          },
          {
            quoted: ms,
          },
        );
      }
    }
    if (msg_Repondu?.audioMessage) {
      if (fusionCache[v1].audioPath) {
        return ovl.sendMessage(
          dest,
          {
            text: "⚠️ Audio déjà enregistré. Envoyez une vidéo ou tapez *fusion result*.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v12 = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
      fusionCache[v1].audioPath = v12;
      if (fusionCache[v1].videoPath) {
        return ovl.sendMessage(
          dest,
          {
            text: "✅ Audio ajouté. Tapez *fusion result* pour obtenir la vidéo.",
          },
          {
            quoted: ms,
          },
        );
      }
      return ovl.sendMessage(
        dest,
        {
          text: "✅ Audio enregistré. Répondez maintenant à une vidéo.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (msg_Repondu?.videoMessage) {
      if (fusionCache[v1].videoPath) {
        return ovl.sendMessage(
          dest,
          {
            text: "⚠️ Vidéo déjà enregistrée. Envoyez un audio ou tapez *fusion result*.",
          },
          {
            quoted: ms,
          },
        );
      }
      const v12 = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
      fusionCache[v1].videoPath = v12;
      if (fusionCache[v1].audioPath) {
        return ovl.sendMessage(
          dest,
          {
            text: "✅ Vidéo ajoutée. Tapez *fusion result* pour obtenir le résultat.",
          },
          {
            quoted: ms,
          },
        );
      }
      return ovl.sendMessage(
        dest,
        {
          text: "✅ Vidéo enregistrée. Répondez maintenant à un audio.",
        },
        {
          quoted: ms,
        },
      );
    }
    return ovl.sendMessage(
      dest,
      {
        text: "❌ Répondez à un *audio* ou une *vidéo*.",
      },
      {
        quoted: ms,
      },
    );
  },
);
