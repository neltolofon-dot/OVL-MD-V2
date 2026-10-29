const { ovlcmd } = require("../lib/ovlcmd");
const { WA_CONF } = require("../DataBase/wa_conf");
ovlcmd(
  {
    nom_cmd: "presence",
    classe: "confidentialité",
    react: "👤",
    desc: "Active ou configure la présence sur WhatsApp",
  },
  async (dest, ovl, ctx) => {
    const { ms, repondre, arg, prenium_id } = ctx;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }
      const v1 = arg[0]?.toLowerCase();
      const v2 = ["off", "enligne", "enregistre", "ecrit"];
      const v3 = {
        1: "enligne",
        2: "enregistre",
        3: "ecrit",
      };
      const [v4] = await WA_CONF.findOrCreate({
        where: {
          id: "1",
        },
        defaults: {
          id: "1",
          presence: "non",
        },
      });
      if (v1 === "off") {
        v4.presence = "non";
        await v4.save();
        return repondre("La présence est maintenant désactivée.");
      }
      if (v3[v1]) {
        if (v4.presence === v3[v1]) {
          return repondre("La présence est déjà configurée sur " + v3[v1]);
        }
        v4.presence = v3[v1];
        await v4.save();
        return repondre("La présence est maintenant définie sur " + v3[v1]);
      }
      return repondre(
        "Utilisation :\npresence 1: Configurer la présence sur 'enligne'\npresence 2: Configurer la présence sur 'enregistre'\npresence 3: Configurer la présence sur 'ecrit'\npresence off: Désactiver la présence",
      );
    } catch (e) {
      console.error("Erreur lors de la configuration de presence :", e);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "getprivacy",
    classe: "confidentialité",
    react: "📋",
    desc: "Obtenir vos paramètres de confidentialité",
  },
  async (dest, ovl, { repondre, prenium_id, ms }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    try {
      const { readreceipts, profile, status, online, last, groupadd, calladd } =
        await ovl.fetchPrivacySettings(true);
      const v1 =
        "*♺ Mes paramètres de confidentialité*\n\n*ᝄ Nom :* " +
        ms.pushName +
        "\n*ᝄ En ligne :* " +
        online +
        "\n*ᝄ Profil :* " +
        profile +
        "\n*ᝄ Dernière vue :* " +
        last +
        "\n*ᝄ Confirmation lecture :* " +
        readreceipts +
        "\n*ᝄ Statut :* " +
        status +
        "\n*ᝄ Ajout groupe :* " +
        groupadd +
        "\n*ᝄ Ajout appel :* " +
        calladd;
      let v2;
      try {
        v2 = await ovl.profilePictureUrl(dest, "image");
      } catch {
        v2 = "https://files.catbox.moe/ulwqtr.jpg";
      }
      await ovl.sendMessage(
        dest,
        {
          image: {
            url: v2,
          },
          caption: v1,
        },
        {
          quoted: ms,
        },
      );
    } catch (e) {
      console.error(e);
      await repondre("Erreur lors de la récupération des paramètres de confidentialité.");
    }
  },
);
ovlcmd(
  {
    nom_cmd: "setbio",
    classe: "confidentialité",
    react: "✍️",
    desc: "Modifier votre statut de profil",
  },
  async (dest, ovl, { repondre, prenium_id, arg }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    }
    let v1 = arg.join(" ");
    if (!v1) {
      return repondre("entrez la bio\nExemple : setbio Salut!  j'utilise WhatsApp.");
    }
    try {
      await ovl.updateProfileStatus(v1);
      await repondre("Statut de profil mis à jour.");
    } catch (e) {
      console.error(e);
      await repondre("Erreur lors de la mise à jour du statut.");
    }
  },
);
const privacyValues = {
  lastseen: [
    {
      key: "all",
      desc: "Tout le monde",
    },
    {
      key: "contacts",
      desc: "Seulement vos contacts",
    },
    {
      key: "contact_blacklist",
      desc: "Tous sauf certains",
    },
    {
      key: "none",
      desc: "Personne",
    },
  ],
  online: [
    {
      key: "all",
      desc: "Visible pour tout le monde",
    },
    {
      key: "match_last_seen",
      desc: "Même que votre visibilité de dernière vue",
    },
  ],
  profile: [
    {
      key: "all",
      desc: "Tout le monde",
    },
    {
      key: "contacts",
      desc: "Seulement vos contacts",
    },
    {
      key: "contact_blacklist",
      desc: "Tous sauf certains",
    },
    {
      key: "none",
      desc: "Personne",
    },
  ],
  status: [
    {
      key: "all",
      desc: "Tout le monde",
    },
    {
      key: "contacts",
      desc: "Seulement vos contacts",
    },
    {
      key: "contact_blacklist",
      desc: "Tous sauf certains",
    },
    {
      key: "none",
      desc: "Personne",
    },
  ],
  read: [
    {
      key: "all",
      desc: "Activé (vous voyez qui a lu, et eux aussi)",
    },
    {
      key: "none",
      desc: "Désactivé (vous ne verrez rien, eux non plus)",
    },
  ],
  groupadd: [
    {
      key: "all",
      desc: "Tout le monde peut vous ajouter",
    },
    {
      key: "contacts",
      desc: "Seuls vos contacts peuvent vous ajouter",
    },
    {
      key: "contact_blacklist",
      desc: "Tous sauf certains",
    },
    {
      key: "none",
      desc: "Personne ne peut vous ajouter",
    },
  ],
};
async function handlePrivacyCommand({ type, ovl, repondre, arg, prenium_id, updateFunction, label }) {
  if (!prenium_id) {
    return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
  }
  const v1 = privacyValues[type];
  let v2 = arg[0];
  if (!v2 || (!isNaN(v2) && !v1[Number(v2) - 1])) {
    const v12 = ["🔐 *Options pour " + label + "* :"];
    v1.forEach((v13, v22) => {
      v12.push("*" + (v22 + 1) + ".* " + v13.key + " - _" + v13.desc + "_");
    });
    v12.push("\n*Exemple :* " + type + " 1");
    return repondre(v12.join("\n"));
  }
  let v3;
  if (!isNaN(v2)) {
    const v12 = Number(v2) - 1;
    v3 = v1[v12]?.key;
  } else {
    v3 = v1.find(v12 => v12.key === v2)?.key;
  }
  if (!v3) {
    return repondre("Option invalide. Veuillez choisir un numéro ou une valeur valide.");
  }
  try {
    await updateFunction(v3);
    return repondre("✅ Confidentialité *" + label + "* mise à jour en *" + v3 + "*");
  } catch (e) {
    console.error(e);
    return repondre("Erreur lors de la mise à jour de *" + label + "*");
  }
}
ovlcmd(
  {
    nom_cmd: "lastseen",
    classe: "confidentialité",
    react: "⏳",
    desc: "Modifier la confidentialité de la dernière vue",
  },
  async (dest, ovl, ctx) => {
    await handlePrivacyCommand({
      type: "lastseen",
      ovl,
      repondre: ctx.repondre,
      arg: ctx.arg,
      prenium_id: ctx.prenium_id,
      updateFunction: ovl.updateLastSeenPrivacy,
      label: "dernière vue",
    });
  },
);
ovlcmd(
  {
    nom_cmd: "online",
    classe: "confidentialité",
    react: "🟢",
    desc: "Modifier la confidentialité en ligne",
  },
  async (dest, ovl, ctx) => {
    await handlePrivacyCommand({
      type: "online",
      ovl,
      repondre: ctx.repondre,
      arg: ctx.arg,
      prenium_id: ctx.prenium_id,
      updateFunction: ovl.updateOnlinePrivacy,
      label: "en ligne",
    });
  },
);
ovlcmd(
  {
    nom_cmd: "mypp",
    classe: "confidentialité",
    react: "🖼️",
    desc: "Modifier la confidentialité de la photo de profil",
  },
  async (dest, ovl, ctx) => {
    await handlePrivacyCommand({
      type: "profile",
      ovl,
      repondre: ctx.repondre,
      arg: ctx.arg,
      prenium_id: ctx.prenium_id,
      updateFunction: ovl.updateProfilePicturePrivacy,
      label: "photo de profil",
    });
  },
);
ovlcmd(
  {
    nom_cmd: "mystatus",
    classe: "confidentialité",
    react: "📃",
    desc: "Modifier la confidentialité du statut",
  },
  async (dest, ovl, ctx) => {
    await handlePrivacyCommand({
      type: "status",
      ovl,
      repondre: ctx.repondre,
      arg: ctx.arg,
      prenium_id: ctx.prenium_id,
      updateFunction: ovl.updateStatusPrivacy,
      label: "statut",
    });
  },
);
ovlcmd(
  {
    nom_cmd: "read",
    classe: "confidentialité",
    react: "📖",
    desc: "Modifier la confidentialité des confirmations de lecture",
  },
  async (dest, ovl, ctx) => {
    await handlePrivacyCommand({
      type: "read",
      ovl,
      repondre: ctx.repondre,
      arg: ctx.arg,
      prenium_id: ctx.prenium_id,
      updateFunction: ovl.updateReadReceiptsPrivacy,
      label: "confirmation de lecture",
    });
  },
);
ovlcmd(
  {
    nom_cmd: "groupadd",
    classe: "confidentialité",
    react: "➕",
    desc: "Modifier la confidentialité d'ajout en groupe",
  },
  async (dest, ovl, ctx) => {
    await handlePrivacyCommand({
      type: "groupadd",
      ovl,
      repondre: ctx.repondre,
      arg: ctx.arg,
      prenium_id: ctx.prenium_id,
      updateFunction: ovl.updateGroupsAddPrivacy,
      label: "ajout en groupe",
    });
  },
);
