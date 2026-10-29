const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");
const fs = require("fs");
const child_process = require("child_process");
const reactions = {
  embeter: "https://api.waifu.pics/sfw/bully",
  caliner: "https://api.waifu.pics/sfw/cuddle",
  pleurer: "https://api.waifu.pics/sfw/cry",
  enlacer: "https://api.waifu.pics/sfw/hug",
  awoo: "https://api.waifu.pics/sfw/awoo",
  embrasser: "https://api.waifu.pics/sfw/kiss",
  lecher: "https://api.waifu.pics/sfw/lick",
  tapoter: "https://api.waifu.pics/sfw/pat",
  sourire_fier: "https://api.waifu.pics/sfw/smug",
  assommer: "https://api.waifu.pics/sfw/bonk",
  lancer: "https://api.waifu.pics/sfw/yeet",
  rougir: "https://api.waifu.pics/sfw/blush",
  sourire: "https://api.waifu.pics/sfw/smile",
  saluer: "https://api.waifu.pics/sfw/wave",
  highfive: "https://api.waifu.pics/sfw/highfive",
  tenir_main: "https://api.waifu.pics/sfw/handhold",
  croquer: "https://api.waifu.pics/sfw/nom",
  mordre: "https://api.waifu.pics/sfw/bite",
  sauter: "https://api.waifu.pics/sfw/glomp",
  gifler: "https://api.waifu.pics/sfw/slap",
  tuer: "https://api.waifu.pics/sfw/kill",
  coup_de_pied: "https://api.waifu.pics/sfw/kick",
  heureux: "https://api.waifu.pics/sfw/happy",
  clin_doeil: "https://api.waifu.pics/sfw/wink",
  pousser: "https://api.waifu.pics/sfw/poke",
  danser: "https://api.waifu.pics/sfw/dance",
  gene: "https://api.waifu.pics/sfw/cringe",
};
function generateCaption(v1, v2, v3) {
  const v4 = {
    embeter: {
      withTarget: "@" + v2 + " embête @" + v3 + " !",
      withoutTarget: "@" + v2 + " embête tout le monde !",
    },
    caliner: {
      withTarget: "@" + v2 + " câline @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut câliner tout le monde !",
    },
    pleurer: {
      withTarget: "@" + v2 + " pleure sur l'épaule de @" + v3 + " !",
      withoutTarget: "@" + v2 + " pleure tout seul...",
    },
    enlacer: {
      withTarget: "@" + v2 + " enlace chaleureusement @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut enlacer tout le monde !",
    },
    awoo: {
      withTarget: "@" + v2 + ' fait "Awoo" à @' + v3 + " !",
      withoutTarget: "@" + v2 + ' hurle "Awoo" pour tout le monde !',
    },
    embrasser: {
      withTarget: "@" + v2 + " embrasse tendrement @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut embrasser tout le monde !",
    },
    lecher: {
      withTarget: "@" + v2 + " lèche @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut lécher tout le monde !",
    },
    tapoter: {
      withTarget: "@" + v2 + " tapote la tête de @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut tapoter la tête de tout le monde !",
    },
    sourire_fier: {
      withTarget: "@" + v2 + " adresse un sourire fier à @" + v3 + " !",
      withoutTarget: "@" + v2 + " affiche un sourire fier devant tout le monde !",
    },
    assommer: {
      withTarget: "@" + v2 + " assomme @" + v3 + " avec une massue !",
      withoutTarget: "@" + v2 + " est prêt à assommer tout le monde !",
    },
    lancer: {
      withTarget: "@" + v2 + " lance @" + v3 + " loin dans les airs !",
      withoutTarget: "@" + v2 + " veut lancer quelqu'un dans les airs !",
    },
    rougir: {
      withTarget: "@" + v2 + " rougit en regardant @" + v3 + " !",
      withoutTarget: "@" + v2 + " rougit devant tout le monde !",
    },
    sourire: {
      withTarget: "@" + v2 + " sourit joyeusement à @" + v3 + " !",
      withoutTarget: "@" + v2 + " sourit joyeusement à tout le monde !",
    },
    saluer: {
      withTarget: "@" + v2 + " salue chaleureusement @" + v3 + " !",
      withoutTarget: "@" + v2 + " salue tout le monde !",
    },
    highfive: {
      withTarget: "@" + v2 + " donne un high-five à @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut donner un high-five à tout le monde !",
    },
    tenir_main: {
      withTarget: "@" + v2 + " tient la main de @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut tenir la main de tout le monde !",
    },
    croquer: {
      withTarget: "@" + v2 + " croque un morceau de @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut croquer tout le monde !",
    },
    mordre: {
      withTarget: "@" + v2 + " mord @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut mordre tout le monde !",
    },
    sauter: {
      withTarget: "@" + v2 + " saute sur @" + v3 + " avec enthousiasme !",
      withoutTarget: "@" + v2 + " veut sauter sur tout le monde !",
    },
    gifler: {
      withTarget: "@" + v2 + " gifle @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut gifler tout le monde !",
    },
    tuer: {
      withTarget: "@" + v2 + " tue @" + v3 + " !",
      withoutTarget: "@" + v2 + " est prêt à tuer tout le monde !",
    },
    coup_de_pied: {
      withTarget: "@" + v2 + " donne un coup de pied à @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut donner un coup de pied à tout le monde !",
    },
    heureux: {
      withTarget: "@" + v2 + " est heureux en voyant @" + v3 + " !",
      withoutTarget: "@" + v2 + " est heureux avec tout le monde !",
    },
    clin_doeil: {
      withTarget: "@" + v2 + " fait un clin d'œil à @" + v3 + " !",
      withoutTarget: "@" + v2 + " fait un clin d'œil à tout le monde !",
    },
    pousser: {
      withTarget: "@" + v2 + " pousse doucement @" + v3 + " !",
      withoutTarget: "@" + v2 + " veut pousser tout le monde !",
    },
    danser: {
      withTarget: "@" + v2 + " danse joyeusement avec @" + v3 + " !",
      withoutTarget: "@" + v2 + " danse pour tout le monde !",
    },
    gene: {
      withTarget: "@" + v2 + " est gêné en regardant @" + v3 + " !",
      withoutTarget: "@" + v2 + " est gêné devant tout le monde !",
    },
  };
  if (v4[v1]) {
    if (v3) {
      return v4[v1].withTarget;
    } else {
      return v4[v1].withoutTarget;
    }
  } else {
    return "@" + v2 + " a exécuté " + v1 + " !";
  }
}
async function giftovidbuff(v1) {
  const v2 = "temp_" + Date.now() + ".gif";
  const v3 = "temp_" + Date.now() + ".mp4";
  fs.writeFileSync(v2, v1);
  await new Promise((v12, v22) => {
    child_process.exec(
      "ffmpeg -i " +
        v2 +
        ' -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ' +
        v3,
      v13 => {
        if (v13) {
          v22(v13);
        } else {
          v12();
        }
      },
    );
  });
  const v4 = fs.readFileSync(v3);
  fs.unlinkSync(v2);
  fs.unlinkSync(v3);
  return v4;
}
function addReactionCommand(v1, v2) {
  ovlcmd(
    {
      nom_cmd: v1,
      classe: "Réaction",
      react: "💬",
      desc: "Réaction de type " + v1,
    },
    async (dest, ovl, ctx) => {
      const { arg, auteur_Message, getJid, auteur_Msg_Repondu, repondre, ms } = ctx;
      const v12 = auteur_Msg_Repondu || (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid");
      const v22 = await getJid(v12, dest, ovl);
      try {
        const v13 = await axios.get(v2);
        const v23 = v13.data.url;
        const v3 = (
          await axios.get(v23, {
            responseType: "arraybuffer",
          })
        ).data;
        const v4 = await giftovidbuff(v3);
        const v5 = generateCaption(v1, auteur_Message?.split("@")[0], v22?.split("@")[0]);
        await ovl.sendMessage(
          dest,
          {
            video: v4,
            gifPlayback: true,
            caption: v5,
            mentions: v22 ? [auteur_Message, v22] : [auteur_Message],
          },
          {
            quoted: ms,
          },
        );
      } catch (e) {
        console.error("Erreur avec la commande " + v1 + ":", e);
        await repondre({
          text: "Désolé, une erreur est survenue lors du traitement de la commande.",
        });
      }
    },
  );
}
for (const [nom_cmd, url] of Object.entries(reactions)) {
  addReactionCommand(nom_cmd, url);
}
