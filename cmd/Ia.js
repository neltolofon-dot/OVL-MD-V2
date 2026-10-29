const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");
ovlcmd(
  {
    nom_cmd: "gpt",
    classe: "IA",
    react: "🤖",
    desc: "Utilise l'API gpt pour générer des réponses.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer un prompt pour générer une réponse.");
    }
    const v1 = arg.join(" ");
    const v2 = "https://ab-chatgpt4o.abrahamdw882.workers.dev/?q=" + encodeURIComponent(v1);
    try {
      const v12 = await axios.get(v2);
      const v22 = v12.data?.data || "Erreur de réponse de l'API.";
      return repondre(v22);
    } catch (e) {
      console.error("Erreur GPT :", e);
      return repondre("Une erreur est survenue lors de l'appel à l'API.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "dalle",
    classe: "IA",
    react: "🎨",
    desc: "Génère des images avec DALLE-E.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer une description pour générer une image.");
    }
    try {
      const v1 = arg.join(" ");
      const v2 = "https://api-toxxic.zone.id/api/ai/ai4chat?prompt=" + encodeURIComponent(v1);
      const v3 = await axios.get(v2);
      return ovl.sendMessage(
        dest,
        {
          image: {
            url: v3.data.data,
          },
          caption: "```Powered By OVL-MD-V2```",
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur DALLE :", e);
      return repondre("Erreur lors de la génération de l'image. Réessayez plus tard.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "blackbox",
    classe: "IA",
    react: "🖤",
    desc: "Utilise l'API blackbox pour générer des réponses.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer un prompt pour générer une réponse.");
    }
    const v1 = arg.join(" ");
    const v2 = "https://api-toxxic.zone.id/api/ai/blackbox?prompt=" + encodeURIComponent(v1);
    try {
      const v12 = await axios.get(v2);
      const v22 = v12.data?.data || "Erreur de réponse de l'API.";
      return repondre(v22);
    } catch (e) {
      console.error("Erreur GPT :", e);
      return repondre("Une erreur est survenue lors de l'appel à l'API.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "copilot",
    classe: "IA",
    react: "🤖",
    desc: "Utilise l'API Copilot pour générer des réponses.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer un prompt pour générer une réponse.");
    }
    const v1 = arg.join(" ");
    const v2 = "https://eliteprotech-apis.zone.id/copilot?message=" + encodeURIComponent(v1);
    try {
      const v12 = await axios.get(v2);
      const v22 = v12.data?.text || "Erreur de réponse de l'API.";
      return repondre(v22);
    } catch (e) {
      console.error("Erreur Copilot :", e);
      return repondre("Une erreur est survenue lors de l'appel à l'API.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "gemini",
    classe: "IA",
    react: "🤖",
    desc: "Utilise l'API Gemini-Pro pour générer des réponses.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre, auteur_Message } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer un prompt pour générer une réponse.");
    }
    const v1 = arg.join(" ");
    const v2 = "https://eliteprotech-apis.zone.id/gemini?prompt=" + encodeURIComponent(v1);
    try {
      const v12 = await axios.get(v2);
      const v22 = v12.data?.text || "Erreur de réponse de l'API Gemini-Pro.";
      return repondre(v22);
    } catch (e) {
      console.error("Erreur Gemini-Pro :", e);
      return repondre("Une erreur est survenue lors de l'appel à l'API.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "llama",
    classe: "IA",
    react: "🤖",
    desc: "Utilise l'API Llama pour générer des réponses.",
  },
  async (dest, ovl, ctx) => {
    const { arg, repondre } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer un prompt pour générer une réponse.");
    }
    const v1 = arg.join(" ");
    const v2 = "https://api.gurusensei.workers.dev/llama?prompt=" + encodeURIComponent(v1);
    try {
      const v12 = await axios.get(v2);
      const v22 = v12.data?.response?.response || "Erreur de réponse de l'API Llama.";
      return repondre(v22);
    } catch (e) {
      console.error("Erreur Llama :", e);
      return repondre("Une erreur est survenue lors de l'appel à l'API.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "claude",
    classe: "IA",
    react: "🖤",
    desc: "Utilise l'API Claude pour générer des réponses.",
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, repondre } = ctx;
    if (!arg.length) {
      return repondre("Veuillez entrer un prompt pour générer une réponse.");
    }
    const v1 = arg.join(" ");
    const v2 = "https://api-toxxic.zone.id/api/ai/claude?prompt=" + encodeURIComponent(v1);
    try {
      const v12 = await axios.get(v2);
      const v22 = v12.data?.data || "Erreur de réponse de l'API.";
      return repondre(v22);
    } catch (e) {
      console.error("Erreur Claude :", e);
      return repondre("Une erreur est survenue lors de l'appel à l'API.");
    }
  },
);
