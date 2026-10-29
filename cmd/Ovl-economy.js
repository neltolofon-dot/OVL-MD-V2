const { ovlcmd } = require("../lib/ovlcmd");
const {
  modifierSolde,
  getInfosUtilisateur,
  resetEconomie,
  mettreAJourCapaciteBanque,
  ECONOMIE,
  TopBanque,
} = require("../DataBase/economie");
const crypto = require("crypto");
function generateUserId(v1) {
  const v2 = crypto.createHash("md5").update(v1).digest("hex");
  return "User-" + v2.slice(0, 6);
}
function generateTransactionId() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}
ovlcmd(
  {
    nom_cmd: "myecon",
    desc: "Afficher votre portefeuille et banque",
    react: "💰",
    classe: "OVL-ECON--y",
  },
  async (dest, ovl, { ms, getJid, arg, auteur_Message, auteur_Msg_Repondu, repondre: repondre2 }) => {
    try {
      const v1 =
        (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid") || auteur_Msg_Repondu || auteur_Message;
      const v2 = await getJid(v1, dest, ovl);
      if (!v2) {
        return await repondre2("❌ Impossible de trouver l'utilisateur.");
      }
      let v3 = "https://wallpapercave.com/uwp/uwp4820694.jpeg";
      try {
        v3 = await ovl.profilePictureUrl(v2, "image");
      } catch {}
      const v4 = await getInfosUtilisateur(v2);
      if (!v4) {
        return await repondre2("⚠️ Aucune information trouvée pour cet utilisateur.");
      }
      const v5 = v4.pseudo || "Inconnu";
      const v6 = v4.portefeuille ?? 0;
      const v7 = v4.banque ?? 0;
      const v8 = v4.capacite_banque ?? 10000;
      const v9 = generateUserId(v2);
      const v10 =
        "╭────🎒 *OVL-ECON--Y* 🎒────╮\n┃ 👤 *Pseudo :* " +
        v5 +
        "\n┃ 🆔 *Identifiant :* " +
        v9 +
        "\n┃ 💼 *Portefeuille :* " +
        v6 +
        " 💸\n┃ 🏦 *Banque :* " +
        v7 +
        " 🪙\n┃ 📈 *Capacité Banque :* " +
        v8 +
        " 🧱\n╰─────────────────────╯";
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v3,
          },
          caption: v10,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error("Erreur dans myovl_econ:", e);
      await repondre2("❌ Une erreur est survenue lors de la récupération des informations économiques.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "transfer",
    desc: "Transférer de l'argent de votre banque vers la banque d'un autre utilisateur",
    react: "💸",
    classe: "OVL-ECON--y",
  },
  async (dest, ovl, ctx) => {
    const { ms, arg, auteur_Message, repondre: repondre2, getJid } = ctx;
    if (arg.length < 2) {
      return repondre2("Usage : transfer @utilisateur montant");
    }
    const v1 = arg[0].includes("@") ? arg[0].replace("@", "") + "@lid" : null;
    const v2 = await getJid(v1, dest, ovl);
    if (!v2) {
      return repondre2("Merci de mentionner un utilisateur valide (@numéro).");
    }
    if (v2 === auteur_Message) {
      return repondre2("Vous ne pouvez pas vous transférer de l'argent à vous-même.");
    }
    const v3 = parseInt(arg[1]);
    if (isNaN(v3) || v3 <= 0) {
      return repondre2("Le montant doit être un nombre entier positif.");
    }
    try {
      const v12 = await getInfosUtilisateur(auteur_Message);
      const v22 = await getInfosUtilisateur(v2);
      if (!v12) {
        return repondre2("Profil de l'expéditeur introuvable.");
      }
      if (!v22) {
        return repondre2("Profil du destinataire introuvable.");
      }
      if (v12.banque < v3) {
        return repondre2("Fonds insuffisants dans votre banque.");
      }
      const v32 = Math.floor(v3 * 0.99);
      if (v22.banque + v32 > v22.capacite_banque) {
        return repondre2(
          "Ce transfert dépasserait la capacité du destinataire (" + v22.capacite_banque + " 🪙).",
        );
      }
      await modifierSolde(auteur_Message, "banque", -v3);
      await modifierSolde(v2, "banque", v32);
      const v4 = generateTransactionId();
      const v5 =
        "╭── 💸 *REÇU DE TRANSFERT* 💸 ──╮\n┃ 🔁 *Transfert de banque à banque*\n┃ 🆔 *Transaction ID :* " +
        v4 +
        "\n┃ 👤 *Expéditeur :* " +
        (v12.pseudo || "Inconnu") +
        "\n┃ 👥 *Destinataire :* " +
        (v22.pseudo || "Inconnu") +
        "\n┃ 💰 *Montant envoyé :* " +
        v3 +
        " 🪙\n┃ 📉 *Frais (1%) :* " +
        (v3 - v32) +
        " 🪙\n┃ 📥 *Montant reçu :* " +
        v32 +
        " 🪙\n┃ 📅 *Date :* " +
        new Date().toLocaleString() +
        "\n╰─────────────────────────╯";
      return repondre2(v5);
    } catch (e) {
      console.error("Erreur lors du transfert :", e);
      return repondre2("Une erreur est survenue. Réessayez plus tard.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "resetaccount",
    classe: "OVL-ECON--y",
    react: "♻️",
    desc: "Réinitialise le compte économie d'un utilisateur",
  },
  async (dest, ovl, { arg, prenium_id, getJid, auteur_Msg_Repondu }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas l'autorisation d'exécuter cette commande.");
    }
    const v1 = (arg[0]?.includes("@") && arg[0].replace("@", "") + "@lid") || auteur_Msg_Repondu;
    const v2 = await getJid(v1, dest, ovl);
    if (!v2) {
      repondre("Veuillez mentionner un utilisateur ou répondre à son message.\nEx: resetaccount @user");
    }
    const v3 = await resetEconomie(v2, {
      wallet: true,
      banque: true,
      capacite: true,
    });
    if (!v3) {
      return repondre("Utilisateur introuvable dans la base de données.");
    }
    const v4 = generateUserId(v2);
    const v5 =
      "✅ Le compte économie de l'utilisateur a bien été réinitialisé :\n╭── 💼 *RESET ECONOMIE* ──╮\n┃ 👤 Utilisateur : " +
      (v3.pseudo || "Inconnu") +
      "\n┃ 🆔 ID : " +
      v4 +
      "\n┃ 💰 Portefeuille : " +
      v3.portefeuille +
      " 🪙\n┃ 🏦 Banque : " +
      v3.banque +
      " 🪙\n┃ 📦 Capacité : " +
      v3.capacite_banque +
      "\n╰──────────────────────╯";
    await repondre(v5);
  },
);
const prixCapacite = {
  1: {
    montant: 10000,
    capacite: 100000,
  },
  2: {
    montant: 100000,
    capacite: 1000000,
  },
  3: {
    montant: 1000000,
    capacite: 10000000,
  },
  4: {
    montant: 10000000,
    capacite: 100000000,
  },
  5: {
    montant: 100000000,
    capacite: 1000000000,
  },
};
ovlcmd(
  {
    nom_cmd: "capacite",
    classe: "OVL-ECON--y",
    react: "📦",
    desc: "Augmenter la capacite de la banque",
  },
  async (dest, ovl, { arg, auteur_Message, repondre: repondre2 }) => {
    const v1 = parseInt(arg[0]);
    if (!v1 || !prixCapacite[v1]) {
      let v12 = "❌ *Niveau invalide.*\n\n📦 *Niveaux disponibles (Ex: capacite 1):*\n";
      for (const [v13, { montant, capacite }] of Object.entries(prixCapacite)) {
        v12 += "\n🔹 Niveau " + v13 + " → 💰 " + montant + " 🪙 → 📈 Capacité : " + capacite + " 🪙";
      }
      return repondre2(v12);
    }
    const v2 = await getInfosUtilisateur(auteur_Message);
    const { portefeuille } = v2;
    const { montant, capacite } = prixCapacite[v1];
    if (portefeuille < montant) {
      return repondre2("💸 Fonds insuffisants. Il faut *" + montant + " 🪙* dans le portefeuille.");
    }
    await modifierSolde(auteur_Message, "portefeuille", -montant);
    await mettreAJourCapaciteBanque(auteur_Message, capacite);
    repondre2(
      "✅ *Capacité améliorée au niveau " +
        v1 +
        "*\n📦 *Nouvelle capacité :* " +
        capacite +
        " 🪙\n💰 *Coût :* " +
        montant +
        " 🪙",
    );
  },
);
ovlcmd(
  {
    nom_cmd: "depot",
    classe: "OVL-ECON--y",
    react: "🏦",
    desc: "Transférer des fonds du portefeuille vers la banque",
  },
  async (dest, ovl, { arg, auteur_Message, repondre: repondre2 }) => {
    const v1 = parseInt(arg[0]);
    if (!v1 || v1 <= 0) {
      return repondre2("Veuillez entrer un montant valide à déposer.\nEx: depot 1000");
    }
    const v2 = await getInfosUtilisateur(auteur_Message);
    const { portefeuille, banque, capacite_banque } = v2;
    if (portefeuille < v1) {
      return repondre2("Fonds insuffisants dans le portefeuille.");
    }
    if (banque + v1 > capacite_banque) {
      return repondre2("Ce dépôt dépasserait la capacité de votre banque (" + capacite_banque + " 🪙).");
    }
    await modifierSolde(auteur_Message, "portefeuille", -v1);
    await modifierSolde(auteur_Message, "banque", v1);
    repondre2(
      "🏦 *Dépôt effectué avec succès !*\n💰 *Montant déposé :* " +
        v1 +
        " 🪙\n📦 *Banque actuelle :* " +
        (banque + v1) +
        " / " +
        capacite_banque +
        " 🪙",
    );
  },
);
ovlcmd(
  {
    nom_cmd: "retrait",
    classe: "OVL-ECON--y",
    react: "💼",
    desc: "Transférer des fonds de la banque vers le portefeuille",
  },
  async (dest, ovl, { arg, auteur_Message, repondre: repondre2 }) => {
    const v1 = parseInt(arg[0]);
    if (!v1 || v1 <= 0) {
      return repondre2("Veuillez entrer un montant valide à retirer.\nEx: retrait 1000");
    }
    const v2 = await getInfosUtilisateur(auteur_Message);
    const { portefeuille, banque } = v2;
    if (banque < v1) {
      return repondre2("Fonds insuffisants dans la banque.");
    }
    const v3 = Math.floor(v1 * 0.99);
    const v4 = v1 - v3;
    await modifierSolde(auteur_Message, "banque", -v1);
    await modifierSolde(auteur_Message, "portefeuille", v3);
    repondre2(
      "💼 *Retrait effectué avec succès !*\n💰 *Montant demandé :* " +
        v1 +
        " 🪙\n📉 *Frais (1%) :* " +
        v4 +
        " 🪙\n💵 *Montant reçu :* " +
        v3 +
        " 🪙\n👛 *Portefeuille actuel :* " +
        (portefeuille + v3) +
        " 🪙",
    );
  },
);
ovlcmd(
  {
    nom_cmd: "vol",
    desc: "Tenter de voler un autre utilisateur",
    react: "🕶️",
    classe: "OVL-ECON--y",
  },
  async (dest, ovl, { repondre: repondre2, auteur_Msg_Repondu, getJid, auteur_Message, arg, ms }) => {
    let v1 = null;
    if (auteur_Msg_Repondu) {
      v1 = auteur_Msg_Repondu;
    } else if (arg[0]?.includes("@")) {
      victimeIdl = arg[0].replace("@", "") + "@lid";
      v1 = await getJid(victimeIdl, dest, ovl);
    }
    if (!v1) {
      return repondre2(
        "Mentionne un utilisateur valide ou réponds à son message.\nEx : *vol @user* ou *vol* en réponse à un message.",
      );
    }
    if (v1 === auteur_Message) {
      return repondre2("Tu ne peux pas te voler toi-même, voleur paresseux 😒.");
    }
    const v2 = await getInfosUtilisateur(auteur_Message);
    const v3 = await getInfosUtilisateur(v1);
    if (!v2 || !v3) {
      return repondre2("Impossible de trouver les profils des utilisateurs.");
    }
    if (v2.portefeuille < 1000) {
      return repondre2(
        "💸 Tu dois avoir au moins 1000 🪙 pour tenter un vol (au cas où tu te fais attraper).",
      );
    }
    if (v3.portefeuille < 1000) {
      return repondre2("🤷🏽‍♂️ Ta victime est trop pauvre... Trouve-toi une meilleure cible.");
    }
    const v4 = ["echoue", "reussi", "attrape"];
    const v5 = v4[Math.floor(Math.random() * v4.length)];
    switch (v5) {
      case "echoue":
        return repondre2("😬 Ta victime s'est échappée ! Sois plus intimidant la prochaine fois.");
      case "reussi": {
        const v12 = Math.floor(Math.random() * 1000) + 100;
        await modifierSolde(v1, "portefeuille", -v12);
        await modifierSolde(auteur_Message, "portefeuille", v12);
        return repondre2("🤑 Vol réussi ! Tu as volé *" + v12 + " 🪙* à ta victime.");
      }
      case "attrape": {
        const v12 = Math.floor(Math.random() * 1000) + 100;
        await modifierSolde(auteur_Message, "portefeuille", -v12);
        return repondre2("🚓 Oups ! Tu t'es fait attraper par la police. Amende : *" + v12 + " 🪙*.");
      }
      default:
        return repondre2("Une erreur est survenue. Essaie encore.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "pari",
    desc: "Parier de l'argent en devinant une direction",
    react: "🎲",
    classe: "OVL-ECON--y",
  },
  async (dest, ovl, { repondre: repondre2, auteur_Message, arg, ms }) => {
    const v1 = parseInt(arg[0]);
    const v2 = arg[1]?.toLowerCase();
    const v3 = ["haut", "bas", "gauche", "droite"];
    if (!v1 || v1 < 50) {
      return repondre2("Tu dois miser au moins 50 🪙.");
    }
    if (!v2 || !v3.includes(v2)) {
      return repondre2(
        "🧭 Choisis une direction valide : *haut, bas, gauche ou droite*.\nExemple : `pari 200 gauche`",
      );
    }
    const v4 = await getInfosUtilisateur(auteur_Message);
    if (v4.portefeuille < v1) {
      return repondre2("💸 Fonds insuffisants dans ton portefeuille.");
    }
    const v5 = v3[Math.floor(Math.random() * v3.length)];
    const v6 = v5;
    const v7 = {
      haut: "https://files.catbox.moe/j0wmsd.jpg",
      bas: "https://files.catbox.moe/qizuxk.jpg",
      gauche: "https://files.catbox.moe/lj7xmc.jpg",
      droite: "https://files.catbox.moe/dsfbhl.jpg",
    };
    await ovl.sendMessage(
      dest,
      {
        image: {
          url: v7[v6],
        },
        caption: "",
      },
      {
        quoted: ms,
      },
    );
    if (v2 === v5) {
      const v12 = v1 * 2;
      await modifierSolde(auteur_Message, "portefeuille", v12);
      return repondre2("🎉 *Bravo !* La direction était *" + v5 + "*.\n✅ Tu gagnes *" + v12 + " 🪙* !");
    } else {
      await modifierSolde(auteur_Message, "portefeuille", -v1);
      return repondre2("😓 *Raté !* La direction correcte était *" + v5 + "*.\n❌ Tu perds *" + v1 + " 🪙*.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "slot",
    desc: "Jouer à la machine à sous",
    react: "🎰",
    classe: "OVL-ECON--y",
  },
  async (dest, ovl, { auteur_Message, repondre: repondre2 }) => {
    const { portefeuille } = await getInfosUtilisateur(auteur_Message);
    if (portefeuille < 100) {
      return repondre2("💰 Tu as besoin d'au moins 100 🪙 pour jouer.");
    }
    const v1 = ["🔴", "🔵", "🟣", "🟢", "🟡", "⚪️", "⚫️"];
    const v2 = Array.from(
      {
        length: 3,
      },
      () =>
        Array.from(
          {
            length: 3,
          },
          () => Math.floor(Math.random() * v1.length),
        ),
    );
    const v3 = v2.map(v12 => v12.map(v13 => v1[v13]));
    const v4 = v3.map(v12 => v12.join("   ")).join("\n");
    const v5 = (v12, v22, v32) => v12 === v22 && v22 === v32;
    const v6 =
      v5(v3[0][0], v3[0][1], v3[0][2]) ||
      v5(v3[1][0], v3[1][1], v3[1][2]) ||
      v5(v3[2][0], v3[2][1], v3[2][2]) ||
      v5(v3[0][0], v3[1][0], v3[2][0]) ||
      v5(v3[0][1], v3[1][1], v3[2][1]) ||
      v5(v3[0][2], v3[1][2], v3[2][2]) ||
      v5(v3[0][0], v3[1][1], v3[2][2]) ||
      v5(v3[0][2], v3[1][1], v3[2][0]);
    if (v6) {
      const v12 = Math.floor(Math.random() * 5000);
      await modifierSolde(auteur_Message, "portefeuille", v12 * 2);
      return repondre2("🎰 *Résultat*\n" + v4 + "\n\n🎉 *Jackpot ! Tu gagnes " + v12 * 2 + " 🪙*");
    } else {
      const v12 = Math.floor(Math.random() * 300);
      await modifierSolde(auteur_Message, "portefeuille", -v12);
      return repondre2("🎰 *Résultat*\n" + v4 + "\n\n📉 *Tu perds " + v12 + " 🪙...*");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "bonus",
    classe: "OVL-ECON--y",
    react: "🎁",
    desc: "Réclame un bonus toutes les 2 heures",
  },
  async (dest, ovl, { auteur_Message, repondre: repondre2 }) => {
    const v1 = await ECONOMIE.findOne({
      where: {
        id: auteur_Message,
      },
    });
    const v2 = await getInfosUtilisateur(auteur_Message);
    const v3 = Date.now();
    const v4 = 7200000;
    if (!v2.last_bonus) {
      v2.last_bonus = 0;
    }
    const v5 = v3 - v2.last_bonus;
    if (v5 < v4) {
      const v12 = v4 - v5;
      const v22 = Math.floor(v12 / 3600000);
      const v32 = Math.floor((v12 % 3600000) / 60000);
      const v42 = Math.floor((v12 % 60000) / 1000);
      let v52 = "⏳ Tu dois attendre encore ";
      if (v22 > 0) {
        v52 += v22 + " h ";
      }
      if (v32 > 0) {
        v52 += v32 + " min ";
      }
      if (v42 > 0 || (v22 === 0 && v32 === 0)) {
        v52 += v42 + " sec";
      }
      return repondre2(v52.trim() + " avant de réclamer ton prochain bonus.");
    }
    await modifierSolde(auteur_Message, "portefeuille", 1000);
    v1.last_bonus = v3;
    await v1.save();
    repondre2("🎉 Tu as reçu *1000 pièces* ! Reviens dans 2h pour un autre bonus.");
  },
);
ovlcmd(
  {
    nom_cmd: "don",
    classe: "OVL-ECON--y",
    react: "🤝",
    desc: "Permet à un Premium de donner des pièces à un autre utilisateur",
  },
  async (
    dest,
    ovl,
    { arg, auteur_Message, getJid, auteur_Msg_Repondu, ms, repondre: repondre2, prenium_id, dev_id },
  ) => {
    const v1 = await getInfosUtilisateur(auteur_Message);
    if (!prenium_id) {
      return repondre2("Cette commande est réservée aux utilisateurs Premium.");
    }
    let v2 = null;
    if (auteur_Msg_Repondu) {
      v2 = auteur_Msg_Repondu;
    } else if (arg[0]?.includes("@")) {
      destinatairl = arg[0].replace("@", "") + "@lid";
      v2 = await getJid(destinatairl, dest, ovl);
    }
    if (!v2) {
      return repondre2("Mentionne un utilisateur *ou* réponds à son message pour lui faire un don.");
    }
    const v3 = parseInt(auteur_Msg_Repondu ? arg[0] : arg[1]);
    if (!v3 || v3 <= 0) {
      return repondre2("Montant invalide.");
    }
    const v4 = 50000;
    if (v3 > v4 && !dev_id) {
      return repondre2("Tu ne peux pas donner plus de *" + v4 + " pièces*.");
    }
    const v5 = await ECONOMIE.findOne({
      where: {
        id: v2,
      },
    });
    if (!v5) {
      return repondre2("L'utilisateur mentionné n'est pas enregistré dans le système.");
    }
    await modifierSolde(v2, "portefeuille", v3);
    await ovl.sendMessage(
      dest,
      {
        text: "✅ Tu as donné *" + v3 + " pièces* à @" + v2.split("@")[0] + " 💸",
        mentions: [v2],
      },
      {
        quoted: ms,
      },
    );
  },
);
