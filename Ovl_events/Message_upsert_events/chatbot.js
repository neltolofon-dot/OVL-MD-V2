const axios = require("axios");
const { ChatbotConf } = require("../../DataBase/chatbot");
const config = require("../../set");
async function chatbot(v1, v2, v3, v4, v5, v6, v7, v8) {
  try {
    if (v2) {
      if (!v5.includes(v6) && v7 !== v6) {
        return;
      }
    } else if (!v3) {
      return;
    }
    if (!v3) {
      return;
    }
    const v12 = await ChatbotConf.findByPk("1");
    if (!v12) {
      return;
    }
    let v22 = [];
    try {
      v22 = JSON.parse(v12.enabled_ids || "[]");
    } catch {
      v22 = [];
    }
    const v32 = v22.includes(v1);
    const v42 = v2 ? v12.chatbot_gc === "oui" : v12.chatbot_pm === "oui";
    if (!v32 && !v42) {
      return;
    }
    const v52 =
      'Tu es un assistant intelligent appelé OVL.\nTon créateur se nomme Ainz.\nRépond clairement, précisément et chaleureusement.\nRépond toujours dans la langue du message.\nMessage :\n"' +
      v3 +
      '"';
    const v62 = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        config.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [
              {
                text: v52,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const v72 = v62.data;
    if (v72?.candidates?.length > 0) {
      const v13 = v72.candidates[0]?.content?.parts?.[0]?.text || "";
      if (v13) {
        return v4(v13);
      }
    }
  } catch (e) {
    console.error("Erreur chatbot Gemini :", e.message);
  }
}
module.exports = chatbot;
