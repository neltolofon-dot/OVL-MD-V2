/**
 * Appairage local du bot à un compte WhatsApp.
 *
 * Génère auth/principale/creds.json sur votre machine, sans passer par un
 * service tiers : vos identifiants WhatsApp ne quittent jamais votre disque.
 *
 *   npm run pair              → QR code à scanner
 *   npm run pair -- 226XXXXXXXX  → code à 8 chiffres pour ce numéro
 *
 * Une fois terminé, laissez SESSION_ID vide dans .env et lancez `npm run dev`.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason,
  delay,
} = require("@whiskeysockets/baileys");

const NOM_SESSION = process.env.PAIR_SESSION || "principale";
const DOSSIER_AUTH = path.join(__dirname, "auth", NOM_SESSION);

function demander(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve =>
    rl.question(question, reponse => {
      rl.close();
      resolve(reponse.trim());
    }),
  );
}

function normaliserNumero(brut) {
  return (brut || "").replace(/[^0-9]/g, "");
}

async function confirmerEcrasement() {
  const creds = path.join(DOSSIER_AUTH, "creds.json");
  if (!fs.existsSync(creds)) return true;

  console.log(`\n⚠️  Une session existe déjà dans auth/${NOM_SESSION}/.`);
  console.log("   Continuer l'écrasera et déliera l'appareil actuel.");
  const reponse = await demander("   Écraser ? (oui/non) : ");
  if (!/^(o|oui|y|yes)$/i.test(reponse)) {
    console.log("Annulé. Aucune modification.");
    return false;
  }
  fs.rmSync(DOSSIER_AUTH, { recursive: true, force: true });
  return true;
}

async function appairer(numero) {
  fs.mkdirSync(DOSSIER_AUTH, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(DOSSIER_AUTH);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: Browsers.ubuntu("Chrome"),
    markOnlineOnConnect: false,
    // Ce mode n'affiche plus rien depuis Baileys 6.7 : le QR est traité
    // nous-mêmes dans connection.update ci-dessous.
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  let codeDemande = false;

  async function demanderCode() {
    if (codeDemande || !numero) return;
    codeDemande = true;
    try {
      const code = await sock.requestPairingCode(numero);
      const joli = code.match(/.{1,4}/g)?.join("-") || code;
      console.log("\n╭──────────────────────────────────────────╮");
      console.log(`│  Code d'appairage :  ${joli.padEnd(18)}│`);
      console.log("╰──────────────────────────────────────────╯");
      console.log("\nSur votre téléphone :");
      console.log("  WhatsApp → Paramètres → Appareils connectés");
      console.log("  → Connecter un appareil → Connecter avec un numéro de téléphone");
      console.log("  → saisissez le code ci-dessus.\n");
    } catch (e) {
      console.error("❌ Impossible d'obtenir un code d'appairage :", e.message);
      console.error("   Vérifiez le numéro (format international, sans +) ou utilisez le QR.");
      process.exit(1);
    }
  }

  // Filet de sécurité : selon les versions de Baileys, l'événement `qr` peut
  // ne pas être émis quand on compte utiliser un code. On demande alors le
  // code dès que le socket a eu le temps de s'établir.
  if (numero && !state.creds.registered) {
    const minuterie = setTimeout(demanderCode, 8000);
    if (minuterie.unref) minuterie.unref();
  }

  return new Promise(resolve => {
    sock.ev.on("connection.update", async update => {
      const { connection, lastDisconnect, qr } = update;

      // Le socket est prêt côté réseau mais pas encore enregistré : c'est le
      // bon moment pour demander le code.
      if (qr && numero) {
        await delay(1500);
        await demanderCode();
        return;
      }

      if (qr && !numero) {
        console.log("\nScannez ce QR code depuis votre téléphone :");
        console.log("  WhatsApp → Paramètres → Appareils connectés → Connecter un appareil\n");
        qrcode.generate(qr, { small: true });
        console.log("\n(le QR expire après ~60 s, un nouveau s'affichera)\n");
        return;
      }

      if (connection === "open") {
        await delay(1500);
        console.log(`\n✅ Connecté en tant que ${sock.user?.id?.split(":")[0] || "?"}`);
        console.log(`✅ Identifiants enregistrés dans auth/${NOM_SESSION}/`);
        console.log("\nÀ faire maintenant :");
        console.log("  1. Dans .env : laissez SESSION_ID vide, renseignez NUMERO_OWNER");
        console.log("  2. Lancez le bot : npm run dev");
        console.log("\n⚠️  Ne partagez jamais le dossier auth/ : il donne un accès");
        console.log("   complet à ce compte WhatsApp.\n");
        try {
          sock.end(undefined);
        } catch {
          /* le socket peut déjà être fermé */
        }
        resolve(true);
        return;
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;

        if (code === DisconnectReason.restartRequired) {
          // Normal juste après l'appairage : WhatsApp demande une reconnexion.
          console.log("🔄 Finalisation de l'appairage...");
          resolve(await appairer(null));
          return;
        }

        if (code === DisconnectReason.loggedOut) {
          console.error("\n❌ Appairage refusé ou session fermée depuis le téléphone.");
          fs.rmSync(DOSSIER_AUTH, { recursive: true, force: true });
          resolve(false);
          return;
        }

        console.error(`\n❌ Connexion fermée (code ${code ?? "inconnu"}). Relancez npm run pair.`);
        resolve(false);
      }
    });
  });
}

(async () => {
  console.log("── Appairage OVL-MD-V2 ──");

  if (!(await confirmerEcrasement())) process.exit(0);

  // Numéro passé en argument : npm run pair -- 226XXXXXXXX
  let numero = normaliserNumero(process.argv[2]);

  if (!numero) {
    const reponse = await demander(
      "\nNuméro WhatsApp au format international sans + (laissez vide pour un QR code) : ",
    );
    numero = normaliserNumero(reponse);
  }

  if (numero && numero.length < 8) {
    console.error("❌ Numéro trop court. Format attendu : indicatif + numéro, ex. 226XXXXXXXX.");
    process.exit(1);
  }

  console.log(numero ? `\nMode : code à 8 chiffres pour +${numero}` : "\nMode : QR code");

  const ok = await appairer(numero || null);
  process.exit(ok ? 0 : 1);
})().catch(e => {
  console.error("❌ Erreur pendant l'appairage :", e.message);
  process.exit(1);
});
