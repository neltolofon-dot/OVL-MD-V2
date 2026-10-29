const { WA_CONF2 } = require("../../DataBase/wa_conf");
const emojis = [
  "🎐",
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "🎉",
  "🔥",
  "🙏",
  "💯",
  "✨",
  "🎈",
  "🤖",
  "👀",
  "🌟",
  "😎",
  "🤩",
  "💥",
  "🎶",
  "😄",
  "😆",
  "😉",
  "😊",
  "😋",
  "😜",
  "😝",
  "😛",
  "🤑",
  "🤗",
  "🤔",
  "😳",
  "😱",
  "😨",
  "😰",
  "😥",
  "😭",
  "😓",
  "😪",
  "😴",
  "🙄",
  "🤐",
  "😷",
  "🤒",
  "🤕",
  "😵",
  "🤠",
  "😇",
  "🤡",
  "👹",
  "👺",
  "💀",
  "👻",
  "👽",
  "🤖",
  "💩",
  "😺",
  "😸",
  "😹",
  "😻",
  "😼",
  "😽",
  "🙀",
  "😿",
  "😾",
  "🙌",
  "👏",
  "🤝",
  "👍",
  "👎",
  "👊",
  "✊",
  "🤛",
  "🤜",
  "🤞",
  "✌️",
  "🤟",
  "🤘",
  "👌",
  "👈",
  "👉",
  "👆",
  "👇",
  "☝️",
  "✋",
  "🤚",
  "🖐",
  "🖖",
  "👋",
  "🤙",
  "💪",
  "🦵",
  "🦶",
  "👂",
  "👃",
  "👣",
  "👁",
  "👀",
  "🧠",
  "🦷",
  "🦴",
  "👅",
  "👄",
  "💋",
  "👓",
  "🕶",
  "🥽",
  "🥼",
  "🦺",
  "👔",
];
const BLOCKED_REACT_JIDS = ["120363314687943170@g.us", "120363404635307998@g.us", "120363398500341783@g.us"];
function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}
async function autoread_msg(v1, v2) {
  const v3 = await WA_CONF2.findOne({
    where: {
      id: "1",
    },
  });
  if (!v3 || v3.autoread_msg !== "oui") {
    return;
  }
  await v1.readMessages([v2]);
}
async function autoreact_msg(v1, v2, v3) {
  if (v3 && BLOCKED_REACT_JIDS.includes(v3)) {
    return;
  }
  const v4 = await WA_CONF2.findOne({
    where: {
      id: "1",
    },
  });
  if (!v4 || v4.autoreact_msg !== "oui") {
    return;
  }
  const v5 = getRandomEmoji();
  await v1.sendMessage(v2.key.remoteJid, {
    react: {
      text: v5,
      key: v2.key,
    },
  });
}
module.exports = {
  autoread_msg,
  autoreact_msg,
};
