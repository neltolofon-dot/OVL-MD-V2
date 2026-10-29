const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");
const { delay } = require("@whiskeysockets/baileys");
const config = require("../set");
const fs = require("fs");
let activeGames = {};
ovlcmd(
  {
    nom_cmd: "tictactoe",
    classe: "OVL-GAMES",
    react: "🎮",
    desc: "Jeu du Tic-Tac-Toe",
    alias: ["ttt"],
  },
  async (dest, ovl, ctx) => {
    const { arg, ms, msg_Repondu, auteur_Msg_Repondu, auteur_Message, getJid } = ctx;
    let v1 = auteur_Message.split("@")[0];
    let v2;
    let v3;
    if (msg_Repondu) {
      v2 = auteur_Msg_Repondu.split("@")[0];
      v3 = auteur_Msg_Repondu;
    } else if (arg.length > 0 && arg[0].includes("@")) {
      v3 = await getJid(arg[0].replace("@", "") + "@lid", dest, ovl);
      v2 = v3.split("@")[0];
    } else {
      return ovl.sendMessage(
        dest,
        {
          text: "🙋‍♂️ Veuillez *mentionner* ou *répondre* au message du joueur pour lancer une partie.",
        },
        {
          quoted: ms,
        },
      );
    }
    if (auteur_Message === v3) {
      return ovl.sendMessage(
        dest,
        {
          text: "🚫 Vous ne pouvez pas jouer contre vous-même !",
        },
        {
          quoted: ms,
        },
      );
    }
    if (activeGames[auteur_Message] || activeGames[v3]) {
      delete activeGames[auteur_Message];
      delete activeGames[v3];
    }
    const v4 = Date.now() + "-" + auteur_Message + "-" + v3;
    activeGames[auteur_Message] = {
      opponent: v3,
      gameID: v4,
    };
    activeGames[v3] = {
      opponent: auteur_Message,
      gameID: v4,
    };
    await ovl.sendMessage(
      dest,
      {
        text:
          "🎮 *Tic-Tac-Toe Défi !*\n\n🔸 @" +
          v1 +
          " défie @" +
          v2 +
          " !\n\n✍️ Pour accepter, réponds *oui* dans les 60 secondes.",
        mentions: [auteur_Message, v3],
      },
      {
        quoted: ms,
      },
    );
    try {
      const v12 = await ovl.recup_msg({
        auteur: v3,
        ms_org: dest,
        temps: 60000,
      });
      const v22 = v12?.message?.conversation || v12?.message?.extendedTextMessage?.text || "";
      if (v22.toLowerCase() === "oui") {
        let v13 = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
        let v23 = 0;
        let v32 = ["❌", "⭕"];
        let v42 = [auteur_Message, v3];
        activeGames[auteur_Message] = {
          opponent: v3,
          grid: v13,
          currentPlayer: v23,
          gameID: v4,
        };
        activeGames[v3] = {
          opponent: auteur_Message,
          grid: v13,
          currentPlayer: v23,
          gameID: v4,
        };
        const v5 = (v14 = false) => {
          let v24 =
            "\n╔═══╦═══╦═══╗\n║ " +
            v13[0] +
            "    " +
            v13[1] +
            "    " +
            v13[2] +
            "\n╠═══╬═══╬═══╣\n║ " +
            v13[3] +
            "    " +
            v13[4] +
            "    " +
            v13[5] +
            "\n╠═══╬═══╬═══╣\n║ " +
            v13[6] +
            "    " +
            v13[7] +
            "    " +
            v13[8] +
            "\n╚═══╩═══╩═══╝\n\n❌ : @" +
            v1 +
            "\n⭕ : @" +
            v2;
          if (!v14) {
            v24 += "\n\n🎯 C'est au tour de @" + v42[v23].split("@")[0] + " de jouer !";
          }
          return v24;
        };
        const v6 = v14 => {
          const v24 = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
          ];
          return v24.some(v15 => v15.every(v16 => v13[v16] === v14));
        };
        for (let v14 = 0; v14 < 9; v14++) {
          let v15 = v32[v23];
          await ovl.sendMessage(
            dest,
            {
              text: v5(),
              mentions: [auteur_Message, v3],
            },
            {
              quoted: ms,
            },
          );
          let v24;
          let v33 = false;
          while (!v33) {
            const v16 = await ovl.recup_msg({
              auteur: v42[v23],
              ms_org: dest,
              temps: 60000,
            });
            let v25 = v16?.message?.conversation || v16?.message?.extendedTextMessage?.text || "";
            if (!isNaN(v25)) {
              v24 = parseInt(v25);
              if (v13[v24 - 1] !== "❌" && v13[v24 - 1] !== "⭕" && v24 >= 1 && v24 <= 9) {
                v13[v24 - 1] = v15;
                v33 = true;
              } else {
                await ovl.sendMessage(
                  dest,
                  {
                    text: "❗ *Position invalide !* Choisis une case encore libre (1 à 9).",
                    mentions: v42,
                  },
                  {
                    quoted: ms,
                  },
                );
              }
            } else if (v25.toLowerCase().startsWith(config.PREFIXE + "ttt")) {
            } else {
              await ovl.sendMessage(
                dest,
                {
                  text: "❌ *Entrée invalide !* Réponds avec un chiffre entre 1 et 9.",
                  mentions: v42,
                },
                {
                  quoted: ms,
                },
              );
            }
          }
          if (v6(v15)) {
            await ovl.sendMessage(
              dest,
              {
                text:
                  "🏆 *Victoire !*\n\n🎉 @" + v42[v23].split("@")[0] + " a gagné la partie !\n" + v5(true),
                mentions: v42,
              },
              {
                quoted: ms,
              },
            );
            delete activeGames[auteur_Message];
            delete activeGames[v3];
            return;
          }
          v23 = 1 - v23;
          activeGames[auteur_Message].currentPlayer = v23;
          activeGames[v3].currentPlayer = v23;
        }
        await ovl.sendMessage(
          dest,
          {
            text: "🤝 *Match Nul !*\n\nAucun gagnant cette fois-ci !\n" + v5(true),
            mentions: v42,
          },
          {
            quoted: ms,
          },
        );
        delete activeGames[auteur_Message];
        delete activeGames[v3];
      } else {
        return ovl.sendMessage(
          dest,
          {
            text: "❌ Invitation refusée par le joueur.",
          },
          {
            quoted: ms,
          },
        );
      }
    } catch (e) {
      if (e.message === "Timeout") {
        await ovl.sendMessage(
          dest,
          {
            text: "⏱️ @" + v2 + " a mis trop de temps. Partie annulée.",
            mentions: [auteur_Message, v3],
          },
          {
            quoted: ms,
          },
        );
      } else {
        console.error(e);
      }
      delete activeGames[auteur_Message];
      delete activeGames[v3];
    }
  },
);
ovlcmd(
  {
    nom_cmd: "anime-quizz",
    classe: "OVL-GAMES",
    react: "📺",
    desc: "Lance un quiz anime.",
    alias: ["a-quizz"],
  },
  async (dest, ovl, { repondre, auteur_Message, verif_Groupe, prenium_id, getJid }) => {
    if (!verif_Groupe) {
      return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
    }
    const v1 = auteur_Message || prenium_id;
    const v2 =
      "🎯 *Anime Quiz*\n\nChoisis le nombre de questions :\n1️⃣ 10 questions\n2️⃣ 20 questions\n3️⃣ 30 questions\n\n✋ Envoie *stop* à tout moment pour annuler (créateur uniquement).";
    await ovl.sendMessage(dest, {
      text: v2,
    });
    let v3 = 10;
    try {
      const v12 = await ovl.recup_msg({
        ms_org: dest,
        auteur: v1,
        temps: 30000,
      });
      const v22 = (v12?.message?.conversation || v12?.message?.extendedTextMessage?.text || "")
        .trim()
        .toLowerCase();
      if (v22 === "stop") {
        return repondre("🛑 Quiz annulé.");
      }
      if (v22 === "1") {
        v3 = 10;
      } else if (v22 === "2") {
        v3 = 20;
      } else if (v22 === "3") {
        v3 = 30;
      } else {
        return repondre("❗ Choix invalide. Réponds par 1, 2 ou 3.");
      }
    } catch {
      return repondre("⏱️ Temps écoulé. Relance la commande pour recommencer.");
    }
    let v4;
    try {
      const v12 = fs.readFileSync("./lib/aquizz.json", "utf8");
      v4 = JSON.parse(v12)
        .sort(() => 0.5 - Math.random())
        .slice(0, v3);
    } catch {
      return repondre("❌ Impossible de récupérer les questions.");
    }
    const v5 = {
      1: "a",
      2: "b",
      3: "c",
      4: "d",
    };
    const v6 = {};
    for (let v12 = 0; v12 < v3; v12++) {
      const { question, options, answer } = v4[v12];
      const v13 = answer.toLowerCase();
      const v22 = options[v13];
      const v32 = Object.values(options)
        .map((v14, v23) => v23 + 1 + ". " + v14)
        .join("\n");
      const v42 =
        "📺 *Question " +
        (v12 + 1) +
        "/" +
        v3 +
        "*\n\n" +
        (question + "\n\n") +
        (v32 + "\n\n") +
        "⏳ *15 secondes* — Réponds avec 1, 2, 3 ou 4\n🛑 Le créateur peut envoyer *stop* pour annuler.";
      await ovl.sendMessage(dest, {
        text: v42,
      });
      const v52 = Date.now();
      let v62 = false;
      while (Date.now() - v52 < 15000 && !v62) {
        try {
          const v14 = await ovl.recup_msg({
            ms_org: dest,
            temps: 15000 - (Date.now() - v52),
          });
          const v23 = (v14?.message?.conversation || v14?.message?.extendedTextMessage?.text || "")
            .trim()
            .toLowerCase();
          const v33 = v14.key.participant || v14.key.remoteJid;
          const v43 = await getJid(v33, dest, ovl);
          if (v23 === "stop" && v43 === v1) {
            return ovl.sendMessage(dest, {
              text: "🛑 Quiz annulé par le créateur @" + v43.split("@")[0],
              mentions: [v43],
            });
          }
          if (!["1", "2", "3", "4"].includes(v23)) {
            continue;
          }
          const v53 = v5[v23];
          if (v53 === v13) {
            v6[v43] = (v6[v43] || 0) + 1;
            await ovl.sendMessage(dest, {
              text: "✅ Bonne réponse @" + v43.split("@")[0] + " ! C'était *" + v22 + "*",
              quoted: v14,
              mentions: [v43],
            });
            v62 = true;
          }
        } catch {
          break;
        }
      }
      if (!v62) {
        await ovl.sendMessage(dest, {
          text: "⌛ Temps écoulé ! La bonne réponse était *" + v22 + "*",
        });
      }
      await delay(1000);
    }
    if (!Object.keys(v6).length) {
      return ovl.sendMessage(dest, {
        text: "😢 Personne n'a marqué de point. Fin du quiz.",
      });
    }
    const v7 = Object.entries(v6)
      .sort(([, v12], [, v22]) => v22 - v12)
      .map(
        ([v12, v22], v32) =>
          v32 + 1 + ". @" + v12.split("@")[0] + " — *" + v22 + "* point" + (v22 > 1 ? "s" : ""),
      )
      .join("\n");
    const v8 = "🏁 *Fin du Quiz Anime !*\n\n📊 *Classement final :*\n\n" + v7;
    await ovl.sendMessage(dest, {
      text: v8,
      mentions: Object.keys(v6),
    });
  },
);
ovlcmd(
  {
    nom_cmd: "dmots",
    classe: "OVL-GAMES",
    react: "🪹",
    desc: "Jouez à plusieurs au jeu du Mot Mélangé",
  },
  async (dest, ovl, { repondre, auteur_Message, prenium_id, getJid }) => {
    const v1 = new Map();
    const v2 = Date.now();
    let v3 = [];
    const v4 = new Set();
    try {
      const v19 = fs.readFileSync("./lib/mots.json", "utf8");
      v3 = JSON.parse(v19);
      v3 = v3.sort(() => Math.random() - 0.5);
    } catch (e) {
      return repondre("❌ Impossible de récupérer les mots.");
    }
    function v5(v19) {
      return v19
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
    }
    const v6 = v19 => {
      let v22;
      let v32 = 0;
      const v42 = v19.toLowerCase();
      do {
        const v110 = v19.split("");
        for (let v111 = v110.length - 1; v111 > 0; v111--) {
          const v112 = Math.floor(Math.random() * (v111 + 1));
          [v110[v111], v110[v112]] = [v110[v112], v110[v111]];
        }
        v22 = v110.join("");
        v32++;
      } while (
        v32 < 20 &&
        (v22.toLowerCase() === v42 ||
          v22 === v19.split("").reverse().join("") ||
          v22.toLowerCase() === v19.split("").reverse().join("").toLowerCase())
      );
      return v22;
    };
    const v7 = v19 => {
      const v22 = v19.filter(v110 => !v4.has(v5(v110)));
      if (v22.length === 0) {
        v4.clear();
        return v19[Math.floor(Math.random() * v19.length)];
      }
      const v32 = v22[Math.floor(Math.random() * v22.length)];
      v4.add(v5(v32));
      return v32;
    };
    v1.set(auteur_Message, {
      id: auteur_Message,
      score: 0,
    });
    const v8 = auteur_Message || prenium_id;
    await ovl.sendMessage(dest, {
      text: "🎮 *Jeu du Mot Mélangé - MULTIJOUEURS* 🎮\n\nTapez 'join' pour participer !\n🆕 Tapez 'start' pour commencer immédiatement (créateur)\n❌ Tapez 'stop' pour annuler (créateur)\n⏳ Temps max d'inscription : 60s\n🎯 Dernier survivant gagne !",
    });
    const v9 = [45000, 30000, 15000];
    const v10 = new Set();
    let v11 = false;
    let v12 = false;
    const v13 = setInterval(async () => {
      const v19 = 60000 - (Date.now() - v2);
      if (v19 <= 0 || v11 || v12) {
        return clearInterval(v13);
      }
      const v22 = Math.floor(v19 / 1000);
      for (let v110 of v9) {
        if (v22 === v110 / 1000 && !v10.has(v110)) {
          v10.add(v110);
          await ovl.sendMessage(dest, {
            text:
              "⏳ Temps restant : " +
              v110 / 1000 +
              "s ! Tapez *join* pour participer ou *start* pour commencer.",
          });
        }
      }
    }, 1000);
    while (Date.now() - v2 < 60000 && !v11 && !v12) {
      try {
        const v19 = await ovl.recup_msg({
          ms_org: dest,
          temps: 60000 - (Date.now() - v2),
        });
        const v22 = (v19?.message?.conversation || v19?.message?.extendedTextMessage?.text || "")
          .trim()
          .toLowerCase();
        const v32 = v19?.key?.participant || v19?.key?.remoteJid || v19?.message?.senderKey;
        const v42 = await getJid(v32, dest, ovl);
        if (v22 === "join" && v42 && !v1.has(v42)) {
          v1.set(v42, {
            id: v42,
            score: 0,
          });
          await ovl.sendMessage(dest, {
            text:
              "✅ @" +
              v42.split("@")[0] +
              " a rejoint la partie ! (" +
              v1.size +
              " joueur" +
              (v1.size > 1 ? "s" : "") +
              ")",
            mentions: [v42],
          });
        } else if (v22 === "start" && v42 === v8) {
          if (v1.size < 2) {
            await ovl.sendMessage(dest, {
              text: "❌ Il faut au moins 2 joueurs pour démarrer. (Actuellement : " + v1.size + ")",
              mentions: [v42],
            });
          } else {
            v11 = true;
            clearInterval(v13);
            break;
          }
        } else if (v22 === "stop" && v42 === v8) {
          v12 = true;
          clearInterval(v13);
          await ovl.sendMessage(dest, {
            text: "🛑 Partie annulée par @" + v42.split("@")[0],
            mentions: [v42],
          });
          return;
        }
      } catch {}
    }
    if (v12) {
      return;
    }
    if (!v11) {
      if (v1.size < 2) {
        await repondre("❌ Pas assez de joueurs (minimum 2). Partie annulée.");
        return;
      }
      v11 = true;
      clearInterval(v13);
    }
    await ovl.sendMessage(dest, {
      text:
        "🚀 *Début de la Partie*\n" +
        ("👥 Joueurs (" +
          v1.size +
          ") : " +
          [...v1.values()].map(v19 => "@" + v19.id.split("@")[0]).join(", ") +
          "\n") +
        "⏱️ 20 secondes par mot\nBonne chance à tous 🍀",
      mentions: [...v1.keys()],
    });
    let v14 = 1;
    let v15 = [...v1.values()];
    const v16 = v19 => {
      if (v19 === 1) {
        return v3.filter(v110 => v110.length >= 4 && v110.length <= 5);
      }
      if (v19 === 2) {
        return v3.filter(v110 => v110.length >= 6 && v110.length <= 7);
      }
      if (v19 === 3) {
        return v3.filter(v110 => v110.length >= 8 && v110.length <= 9);
      }
      return v3.filter(v110 => v110.length >= 10);
    };
    while (v15.length > 1 && !v12) {
      const v19 = [...v15];
      let v22 = 0;
      await ovl.sendMessage(dest, {
        text:
          "📢 *Tour " + v14 + "* - " + v15.length + " joueur" + (v15.length > 1 ? "s" : "") + " en lice !",
      });
      for (const v110 of v19) {
        const v111 = v16(v14);
        if (!v111.length) {
          await ovl.sendMessage(dest, {
            text: "❌ Plus de mots disponibles pour ce tour. Fin de partie !",
          });
          break;
        }
        const v23 = v7(v111);
        const v32 = v6(v23);
        await ovl.sendMessage(dest, {
          text:
            "🎯 Tour de @" +
            v110.id.split("@")[0] +
            "\n" +
            ("🔀 Mot mélangé : *" + v32 + "*\n") +
            ("💡 Indice : " + v23.length + " lettres, commence par *" + v23[0].toUpperCase() + "*\n") +
            "⏱️ 20 secondes pour répondre !",
          mentions: [v110.id],
        });
        let v42 = false;
        const v52 = Date.now();
        try {
          const v112 = await ovl.recup_msg({
            ms_org: dest,
            auteur: v110.id,
            temps: 20000,
          });
          const v24 = (v112?.message?.conversation || v112?.message?.extendedTextMessage?.text || "").trim();
          const v33 = await getJid(
            v112?.key?.participant || v112?.key?.remoteJid || v112?.message?.senderKey,
            dest,
            ovl,
          );
          if (v33 !== v110.id) {
            throw new Error("Mauvais joueur");
          }
          if (v24.toLowerCase() === "stop" && v33 === v8) {
            v12 = true;
            await ovl.sendMessage(dest, {
              text: "🛑 Partie arrêtée par @" + v8.split("@")[0],
              mentions: [v8],
            });
            return;
          }
          if (v5(v24) === v5(v23)) {
            v110.score++;
            v42 = true;
            v22++;
            await ovl.sendMessage(dest, {
              text: "✅ Excellent @" + v110.id.split("@")[0] + " ! Le mot était *" + v23 + "*",
              mentions: [v110.id],
            });
          } else {
            await ovl.sendMessage(dest, {
              text:
                "❌ Dommage @" +
                v110.id.split("@")[0] +
                ' ! Vous avez dit "' +
                v24 +
                "\" mais c'était *" +
                v23 +
                "*",
              mentions: [v110.id],
            });
          }
        } catch (e) {
          await ovl.sendMessage(dest, {
            text:
              "⏰ Temps écoulé ! @" + v110.id.split("@")[0] + " est éliminé... Le mot était *" + v23 + "*",
            mentions: [v110.id],
          });
        }
        if (!v42) {
          v110.elimine = true;
        }
        await new Promise(v112 => setTimeout(v112, 1500));
      }
      v15 = v15.filter(v110 => !v110.elimine);
      if (v12) {
        return;
      }
      if (v22 === 0) {
        await ovl.sendMessage(dest, {
          text: "💥 Aucun joueur n'a trouvé au tour " + v14 + ". Fin de la partie !",
        });
        break;
      }
      if (v15.length > 1) {
        v14++;
        await ovl.sendMessage(dest, {
          text:
            "📊 *Fin du tour " +
            (v14 - 1) +
            "*\n" +
            ("✅ Survivants : " + v15.map(v110 => "@" + v110.id.split("@")[0]).join(", ") + "\n") +
            ("⬆️ Tour " + v14 + " - Difficulté accrue !"),
          mentions: v15.map(v110 => v110.id),
        });
        await new Promise(v110 => setTimeout(v110, 3000));
      }
    }
    let v17 = "";
    if (v15.length === 1) {
      v17 =
        "🏆 *VICTOIRE !*\n\n" +
        ("👑 Vainqueur : @" + v15[0].id.split("@")[0] + "\n") +
        ("🎯 Score final : " + v15[0].score + " point(s)\n") +
        ("📈 Tours complétés : " + v14 + "\n\n");
    } else if (v15.length === 0) {
      v17 = "💥 *Fin de Partie - Aucun survivant !*\n\n";
    } else {
      v17 = "🏁 *Fin de Partie*\n\n";
    }
    v17 += "📊 *Classement Final :*\n";
    const v18 = [...v1.values()].sort((v19, v22) => v22.score - v19.score);
    v18.forEach((v19, v22) => {
      const v32 = v22 === 0 ? "🥇" : v22 === 1 ? "🥈" : v22 === 2 ? "🥉" : "  ";
      v17 += v32 + " @" + v19.id.split("@")[0] + " : " + v19.score + " point(s)\n";
    });
    v17 += "\n🎮 Merci d'avoir joué ! Tapez *dmots* pour rejouer.";
    await ovl.sendMessage(dest, {
      text: v17,
      mentions: [...v1.keys()],
    });
  },
);
ovlcmd(
  {
    nom_cmd: "wcg",
    classe: "OVL-GAMES",
    react: "🎯",
    desc: "Word Chain Game - Survivez en trouvant des mots !",
  },
  async (dest, ovl, { repondre, auteur_Message, prenium_id, getJid }) => {
    const v1 = new Map();
    const v2 = Date.now();
    const v3 = new Set();
    async function v4(v18) {
      try {
        const v19 = v18;
        const v22 = "https://fr.wiktionary.org/wiki/" + encodeURIComponent(v19);
        const v32 = await fetch(v22);
        if (!v32.ok) {
          return false;
        }
        const v42 = await v32.text();
        if (v42.includes("Pas de résultat pour")) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    }
    v1.set(auteur_Message, {
      id: auteur_Message,
      score: 0,
    });
    const v5 = auteur_Message || prenium_id;
    await ovl.sendMessage(dest, {
      text: "╔════════════════╗\n  🎮 WORD CHAIN GAME\n╚════════════════╝\n\n📝 Trouvez des mots valides\n🎯 Dernier survivant gagne\n💬 'join' pour rejoindre\n🚀 'start' pour lancer\n🛑 'stop' pour annuler\n\n⏳ Inscription : 60s",
    });
    const v6 = [45000, 30000, 15000];
    const v7 = new Set();
    let v8 = false;
    let v9 = false;
    const v10 = setInterval(async () => {
      const v18 = 60000 - (Date.now() - v2);
      if (v18 <= 0 || v8 || v9) {
        return clearInterval(v10);
      }
      const v22 = Math.floor(v18 / 1000);
      for (let v19 of v6) {
        if (v22 === v19 / 1000 && !v7.has(v19)) {
          v7.add(v19);
          await ovl.sendMessage(dest, {
            text: "⏰ Plus que " + v19 / 1000 + "s pour rejoindre !",
          });
        }
      }
    }, 1000);
    while (Date.now() - v2 < 60000 && !v8 && !v9) {
      try {
        const v18 = await ovl.recup_msg({
          ms_org: dest,
          temps: 60000 - (Date.now() - v2),
        });
        const v22 = (v18?.message?.conversation || v18?.message?.extendedTextMessage?.text || "")
          .trim()
          .toLowerCase();
        const v32 = v18?.key?.participant || v18?.key?.remoteJid || v18?.message?.senderKey;
        const v42 = await getJid(v32, dest, ovl);
        if (v22 === "join" && v42 && !v1.has(v42)) {
          v1.set(v42, {
            id: v42,
            score: 0,
          });
          await ovl.sendMessage(dest, {
            text:
              "✅ @" +
              v42.split("@")[0] +
              " a rejoint la partie !\n👥 Total : " +
              v1.size +
              " joueur" +
              (v1.size > 1 ? "s" : ""),
            mentions: [v42],
          });
        } else if (v22 === "start" && v42 === v5) {
          if (v1.size < 2) {
            await ovl.sendMessage(dest, {
              text: "❌ Minimum 2 joueurs requis\n📊 Actuellement : " + v1.size,
            });
          } else {
            v8 = true;
            clearInterval(v10);
            break;
          }
        } else if (v22 === "stop" && v42 === v5) {
          v9 = true;
          clearInterval(v10);
          await ovl.sendMessage(dest, {
            text: "🛑 Partie annulée par @" + v42.split("@")[0],
            mentions: [v42],
          });
          return;
        }
      } catch {}
    }
    if (v9) {
      return;
    }
    if (!v8) {
      if (v1.size < 2) {
        await repondre("❌ Pas assez de joueurs");
        return;
      }
      v8 = true;
      clearInterval(v10);
    }
    await ovl.sendMessage(dest, {
      text:
        "╔═════════════╗\n    🚀 DÉBUT DU JEU\n╚═════════════╝\n\n" +
        ("👥 Joueurs (" + v1.size + ") :\n") +
        ([...v1.values()].map(v18 => "  • @" + v18.id.split("@")[0]).join("\n") + "\n\n") +
        "🎯 Bonne chance à tous !",
      mentions: [...v1.keys()],
    });
    await new Promise(v18 => setTimeout(v18, 2000));
    let v11 = 1;
    let v12 = [...v1.values()];
    let v13 = false;
    const v14 = v18 => {
      if (v18 === 1) {
        return [3, 4];
      }
      if (v18 === 2) {
        return [4, 5, 6];
      }
      if (v18 === 3) {
        return [5, 6, 7];
      }
      if (v18 === 4) {
        return [6, 7, 8];
      }
      if (v18 === 5) {
        return [7, 8, 9];
      }
      if (v18 === 6) {
        return [8, 9, 10];
      }
      if (v18 === 7) {
        return [9, 10, 11];
      }
      if (v18 === 8) {
        return [10, 11, 12];
      }
      if (v18 === 9) {
        return [11, 12, 13];
      }
      if (v18 === 10) {
        return [12, 13, 14];
      }
      if (v18 === 11) {
        return [13, 14, 15];
      }
      if (v18 === 12) {
        return [14, 15, 16];
      }
      if (v18 === 13) {
        return [15, 16, 17];
      }
      if (v18 === 14) {
        return [16, 17, 18];
      }
      if (v18 === 15) {
        return [18, 19, 20];
      }
      if (v18 === 16) {
        return [20, 21, 22];
      }
      if (v18 === 17) {
        return [22, 23, 24];
      }
      return [25];
    };
    const v15 = v18 => {
      if (v18 <= 4) {
        return 10000;
      }
      if (v18 <= 6) {
        return 15000;
      }
      if (v18 <= 8) {
        return 18000;
      }
      if (v18 <= 10) {
        return 20000;
      }
      if (v18 <= 14) {
        return 25000;
      }
      return 30000;
    };
    while (v12.length > 1 && !v9 && !v13) {
      const v18 = [...v12];
      let v22 = 0;
      const v32 = v15(v11);
      const v42 = Math.floor(v32 / 1000);
      await ovl.sendMessage(dest, {
        text:
          "\n━━━━━━━━━━━━━━━\n" +
          ("   🎯 TOUR " + v11 + "\n") +
          "━━━━━━━━━━━━━━━━\n" +
          ("👥 " + v12.length + " survivant" + (v12.length > 1 ? "s" : "") + "\n") +
          ("⏱️ " + v42 + "s par mot"),
      });
      await new Promise(v19 => setTimeout(v19, 1500));
      for (const v19 of v18) {
        const v110 = v14(v11);
        const v23 = v110[Math.floor(Math.random() * v110.length)];
        await ovl.sendMessage(dest, {
          text:
            "┌────── TOUR ─────┐\n" +
            ("│ @" + v19.id.split("@")[0] + "\n") +
            ("│ Longueur : " + v23 + " lettres\n") +
            "└───────────────┘\n" +
            ("⏰ " + v42 + " secondes !"),
          mentions: [v19.id],
        });
        let v33 = false;
        try {
          const v111 = await ovl.recup_msg({
            ms_org: dest,
            auteur: v19.id,
            temps: v32,
          });
          const v24 = (v111?.message?.conversation || v111?.message?.extendedTextMessage?.text || "").trim();
          const v34 = await getJid(
            v111?.key?.participant || v111?.key?.remoteJid || v111?.message?.senderKey,
            dest,
            ovl,
          );
          if (v34 !== v19.id) {
            throw new Error("Mauvais joueur");
          }
          if (v24.toLowerCase() === "stop" && v34 === v5) {
            v9 = true;
            await ovl.sendMessage(dest, {
              text: "🛑 Partie interrompue",
            });
            return;
          }
          const v43 = normaliserTexte(v24);
          if (v43.length < v23) {
            await ovl.sendMessage(dest, {
              text:
                "❌ Éliminé : @" +
                v19.id.split("@")[0] +
                "\n" +
                ("Raison : Longueur incorrecte (" + v43.length + " < " + v23 + ")"),
              mentions: [v19.id],
            });
          } else if (v3.has(v43)) {
            await ovl.sendMessage(dest, {
              text: "❌ Éliminé : @" + v19.id.split("@")[0] + "\nRaison : Mot déjà utilisé",
              mentions: [v19.id],
            });
          } else {
            const v112 = await v4(v43);
            if (v112) {
              v3.add(v43);
              v19.score++;
              v33 = true;
              v22++;
              if (v23 === 25) {
                v13 = true;
                await ovl.sendMessage(dest, {
                  text:
                    "\n🏆🏆🏆 EXPLOIT ! 🏆🏆🏆\n\n" +
                    ("@" + v19.id.split("@")[0] + " a trouvé un mot de 25 lettres !\n") +
                    ("Mot : *" + v24.toUpperCase() + "*\n\n") +
                    "🎉 VICTOIRE ABSOLUE !",
                  mentions: [v19.id],
                });
                break;
              } else {
                await ovl.sendMessage(dest, {
                  text: "✅ *" + v24.toUpperCase() + "* validé !",
                });
              }
            } else {
              await ovl.sendMessage(dest, {
                text: "❌ Éliminé : @" + v19.id.split("@")[0] + "\nRaison : Mot inexistant",
                mentions: [v19.id],
              });
            }
          }
        } catch (e) {
          await ovl.sendMessage(dest, {
            text: "⏰ Temps écoulé : @" + v19.id.split("@")[0] + "\nÉliminé !",
            mentions: [v19.id],
          });
        }
        if (!v33) {
          v19.elimine = true;
        }
        await new Promise(v111 => setTimeout(v111, 1000));
      }
      if (v13) {
        break;
      }
      v12 = v12.filter(v19 => !v19.elimine);
      if (v9) {
        return;
      }
      if (v22 === 0) {
        await ovl.sendMessage(dest, {
          text: "\n💥 Aucun survivant au tour " + v11 + "\nFin de partie !",
        });
        break;
      }
      if (v12.length > 1) {
        v11++;
        await ovl.sendMessage(dest, {
          text:
            "\n✅ Survivants :\n" +
            (v12.map(v19 => "  • @" + v19.id.split("@")[0]).join("\n") + "\n\n") +
            ("⏭️ Passage au tour " + v11 + "..."),
          mentions: v12.map(v19 => v19.id),
        });
        await new Promise(v19 => setTimeout(v19, 2500));
      }
    }
    let v16 = "";
    if (v13) {
      const v18 = v12.filter(v19 => !v19.elimine);
      if (v18.length === 1) {
        v16 =
          "\n╔══════════════════╗\n   🏆 VICTOIRE TOTALE 🏆\n╚══════════════════╝\n\n" +
          ("👑 Champion ultime : @" + v18[0].id.split("@")[0] + "\n") +
          ("🎯 Score : " + v18[0].score + " mot" + (v18[0].score > 1 ? "s" : "") + "\n") +
          ("📈 Tours : " + v11 + "\n") +
          "🏅 Exploit : Mot de 25 lettres !\n\n";
      } else {
        v16 =
          "\n╔══════════════════╗\n   🏆 VICTOIRE TOTALE 🏆\n╚══════════════════╝\n\n" +
          ("👑 Champions : " + v18.map(v19 => "@" + v19.id.split("@")[0]).join(", ") + "\n") +
          ("📈 Tours : " + v11 + "\n") +
          "🏅 Exploit : Mots de 25 lettres !\n\n";
      }
    } else if (v12.length === 1) {
      v16 =
        "\n╔══════════════════╗\n     👑 VICTOIRE ! 👑\n╚══════════════════╝\n\n" +
        ("🏆 Vainqueur : @" + v12[0].id.split("@")[0] + "\n") +
        ("🎯 Score : " + v12[0].score + " mot" + (v12[0].score > 1 ? "s" : "") + "\n") +
        ("📈 Tours complétés : " + v11 + "\n\n");
    } else {
      v16 = "\n💥 Fin de partie - Aucun survivant\n\n";
    }
    const v17 = [...v1.values()].sort((v18, v22) => v22.score - v18.score);
    v16 += "━━━━━━━━━━━━━━━━━━━\n📊 CLASSEMENT FINAL\n━━━━━━━━━━━━━━━━━━━\n\n";
    v17.forEach((v18, v22) => {
      const v32 = v22 === 0 ? "🥇" : v22 === 1 ? "🥈" : v22 === 2 ? "🥉" : v22 + 1 + ".";
      v16 +=
        v32 + " @" + v18.id.split("@")[0] + " : " + v18.score + " mot" + (v18.score > 1 ? "s" : "") + "\n";
    });
    v16 += "\n🎮 Tapez 'wcg' pour rejouer !";
    await ovl.sendMessage(dest, {
      text: v16,
      mentions: [...v1.keys()],
    });
  },
);
