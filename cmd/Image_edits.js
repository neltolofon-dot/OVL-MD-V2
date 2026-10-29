const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");
const FormData = require("form-data");
const effetsCanvacord = [
  "shit",
  "wasted",
  "wanted",
  "trigger",
  "trash",
  "rip",
  "sepia",
  "rainbow",
  "hitler",
  "invert1",
  "jail",
  "affect",
  "beautiful",
  "blur",
  "circle1",
  "facepalm",
  "greyscale",
  "jokeoverhead",
  "delete_image",
  "darkness",
  "colorfy",
  "threshold",
  "pixelate",
];
function genererCommandeCanvacord(v1) {
  ovlcmd(
    {
      nom_cmd: v1,
      classe: "Image_Edits",
      react: "🎨",
      desc: "Applique l'effet " + v1 + " via l'API",
    },
    async (dest, ovl, ctx) => {
      const { arg, ms, getJid, auteur_Msg_Repondu, msg_Repondu, auteur_Message } = ctx;
      try {
        const v12 = msg_Repondu || ms.message;
        let v2;
        let v3 = false;
        if (v12?.imageMessage) {
          const v13 = await ovl.dl_save_media_ms(v12.imageMessage);
          v2 = v13;
          v3 = true;
        } else if (arg[0]?.startsWith("http")) {
          v2 = arg[0];
        } else {
          const v13 =
            auteur_Msg_Repondu ||
            (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid") ||
            auteur_Message;
          const v22 = await getJid(v13, dest, ovl);
          try {
            v2 = await ovl.profilePictureUrl(v22, "image");
          } catch {
            v2 = "https://files.catbox.moe/ulwqtr.jpg";
          }
        }
        let v4;
        if (v3) {
          const v13 = new FormData();
          v13.append("file", require("fs").createReadStream(v2));
          v4 = await axios.post("https://api-ovl.koyeb.app/img-effect/" + v1, v13, {
            headers: v13.getHeaders(),
            responseType: "arraybuffer",
          });
        } else {
          v4 = await axios.get(
            "https://api-ovl.koyeb.app/img-effect/" + v1 + "?url=" + encodeURIComponent(v2),
            {
              responseType: "arraybuffer",
            },
          );
        }
        await ovl.sendMessage(
          dest,
          {
            image: Buffer.from(v4.data),
          },
          {
            quoted: ms,
          },
        );
      } catch (e) {
        console.error('Erreur avec la commande "' + v1 + '":', e);
      }
    },
  );
}
effetsCanvacord.forEach(v1 => genererCommandeCanvacord(v1));
