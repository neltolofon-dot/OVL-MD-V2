<h1 align="center">OVL-MD-V2</h1>

<p align="center">
    <img alt="OVL" src="https://files.catbox.moe/gxcb9p.jpg">
</p>

<p align="center">
    Un bot WhatsApp multi-appareil basé sur <a href="https://github.com/WhiskeySockets/Baileys">Baileys</a>.
</p>

<p align="center">
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
    </a>
    <a href="https://github.com/WhiskeySockets/Baileys">
        <img src="https://img.shields.io/badge/Baileys-Web%20API-orange?style=flat-square" alt="Using Baileys Web API" />
    </a>
    <img src="https://img.shields.io/badge/Node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node >= 20" />
</p>

---

## Installation

### Prérequis

- **Node.js 20 ou plus** (`node -v`)
- **ffmpeg** — indispensable aux stickers, conversions et effets audio
  - Debian/Ubuntu : `sudo apt install ffmpeg`
  - Termux : `pkg install ffmpeg`
  - macOS : `brew install ffmpeg`
- **git**

### 1. Récupérer le projet

```bash
git clone https://github.com/neltolofon-dot/OVL-MD-V2.git
```

```bash
cd OVL-MD-V2 && npm install
```

### 2. Connecter votre WhatsApp

Deux méthodes. **La première est recommandée** : vos identifiants restent sur
votre machine.

#### Méthode A — appairage local (recommandée)

```bash
npm run pair
```

Un QR code s'affiche dans le terminal. Sur votre téléphone :
**WhatsApp → Paramètres → Appareils connectés → Connecter un appareil**, puis
scannez.

Si vous ne pouvez pas scanner (serveur distant, SSH, Termux), utilisez un code
à 8 chiffres en passant votre numéro :

```bash
npm run pair -- 226XXXXXXXX
```

Puis sur le téléphone : **Connecter un appareil → Connecter avec un numéro de
téléphone**, et saisissez le code affiché.

Dans les deux cas, les identifiants sont écrits dans `auth/principale/`.
**Laissez `SESSION_ID` vide** dans `.env` : le bot détecte ce dossier et
n'appelle aucun service externe.

#### Méthode B — SESSION_ID via service tiers

Rendez-vous sur **https://ovl-web.koyeb.app/**, appairez votre numéro, et
collez la valeur obtenue dans `SESSION_ID`.

> ⚠️ Vos identifiants WhatsApp transitent alors par ce service, qui ne vous
> appartient pas, et ils donnent un accès complet à votre compte. Utile si vous
> déployez sur un hébergeur où vous ne pouvez pas lancer `npm run pair`.
> `SESSION_API` permet de pointer vers votre propre instance.

> **Ne partagez jamais le dossier `auth/` ni votre `SESSION_ID`**, et ne les
> committez pas (déjà couverts par `.gitignore`).

### 3. Configurer

```bash
cp .env.example .env
```

Puis éditez `.env` :

| Variable       | Rôle                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `NUMERO_OWNER` | **Obligatoire.** Votre numéro, format international, sans `+` ni espace      |
| `SESSION_ID`   | À remplir **uniquement** avec la méthode B. Laissez vide après `npm run pair` |

`.env.example` documente toutes les autres options (préfixe, mode, base de
données, clés d'API…).

### 4. Démarrer

```bash
npm run dev
```

`npm run dev` lance le bot au premier plan : les erreurs s'affichent
directement, c'est ce qu'il faut pour un premier démarrage. Une fois que tout
fonctionne, utilisez `npm start` (pm2, redémarrage automatique) et
`npm run logs` pour consulter les journaux.

Le bot écoute aussi sur `http://localhost:3000` : `/health` renvoie l'état des
sessions, le nombre de commandes chargées et l'uptime.

---

## Base de données

| Situation                                                     | Configuration                         |
| ------------------------------------------------------------- | ------------------------------------- |
| VPS, panel, Termux, machine locale (disque persistant)        | Laissez `DATABASE` vide → SQLite      |
| Heroku, Render, Docker sans volume (disque éphémère)          | `DATABASE=postgresql://...` requis    |

Sans PostgreSQL sur un hébergeur éphémère, vous perdez à chaque redémarrage les
sudo, bans, niveaux, économie et réglages anti-spam. Offres gratuites
adaptées : [Supabase](https://supabase.com), [Neon](https://neon.tech).

---
## Hébergement

Un bot WhatsApp a trois besoins que la plupart des offres gratuites ne
satisfont plus : **un processus qui tourne en permanence**, **un disque
persistant** pour `auth/`, et **pas de mise en veille**. État vérifié en
octobre 2026 :

| Solution | Coût | Verdict |
| --- | --- | --- |
| **Vieux téléphone Android + Termux** | gratuit | ✅ Le meilleur choix gratuit. Disque persistant, pas de carte bancaire, pas de quota. |
| **Petit VPS** (Hetzner, Contabo, hébergeur local) | ~4–7 €/mois | ✅ Le choix « on installe et on oublie ». SQLite suffit, pas besoin de PostgreSQL. |
| **Oracle Cloud Always Free** | gratuit | ⚠️ Possible, mais Oracle **arrête** les instances inactives (CPU < 20 % sur 7 jours) : un bot WhatsApp est précisément inactif. Allocation ARM réduite à 2 OCPU / 12 Go en 2026. |
| **Render** (offre gratuite) | gratuit | ⚠️ Fragile : veille après 15 min sans trafic, **aucun disque persistant**, 750 h/mois partagées. Exige `SESSION_ID` + PostgreSQL. Render déconseille l'offre gratuite en production. |
| **Koyeb** | — | ❌ L'offre gratuite est **fermée aux nouveaux comptes** depuis février 2026. |
| **Heroku** | ~5–7 €/mois | ⚠️ Plus aucune offre gratuite depuis 2022. Disque éphémère : exige `SESSION_ID` + PostgreSQL. |
| **GitHub Actions** | gratuit | ❌ **À éviter.** 5 h maximum par exécution, et l'usage d'Actions comme hébergement permanent est contraire à la politique d'usage acceptable de GitHub : risque de suspension du compte. |

### Option recommandée 1 — vieux téléphone Android (Termux)

Installez [Termux depuis F-Droid](https://f-droid.org/packages/com.termux/)
(la version du Play Store n'est plus maintenue), puis :

```bash
pkg update && pkg install nodejs-lts git ffmpeg
```

```bash
git clone https://github.com/neltolofon-dot/OVL-MD-V2.git && cd OVL-MD-V2 && npm install
```

Ensuite `npm run pair -- 226XXXXXXXX` (le mode code à 8 chiffres est plus
pratique que le QR sur téléphone), configurez `.env`, puis `npm start`.

Deux réglages indispensables pour que le bot survive :

```bash
termux-wake-lock
```

Et dans les paramètres Android : **Batterie → Termux → Sans restriction**.
Laissez le téléphone branché.

### Option recommandée 2 — VPS avec systemd

Sur un VPS Debian/Ubuntu, en tant qu'utilisateur non-root :

```bash
sudo apt update && sudo apt install -y nodejs npm git ffmpeg
```

```bash
git clone https://github.com/neltolofon-dot/OVL-MD-V2.git && cd OVL-MD-V2 && npm install
```

Appairez (`npm run pair`), remplissez `.env`, vérifiez que ça démarre
(`npm run dev`), puis installez le service pour un démarrage automatique au
boot et un redémarrage en cas de plantage :

```bash
sudo cp deploy/ovl-md.service /etc/systemd/system/
```

Ajustez `User`, `WorkingDirectory` et le chemin de `node` dans le fichier, puis :

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now ovl-md
```

```bash
journalctl -u ovl-md -f
```

### Option 3 — Docker Compose

Pour un VPS avec Docker. Les volumes `ovl-auth` et `ovl-data` conservent la
session et la base entre les redémarrages.

```bash
cp .env.example .env    # remplissez-le
```

```bash
docker compose up -d --build
```

```bash
docker compose logs -f
```

L'appairage se fait dans le conteneur, en interactif :

```bash
docker compose run --rm ovl-md node pair.js
```

### Option 4 — Heroku / Render (disque éphémère)

Ces plateformes effacent le disque à chaque redémarrage. Il faut donc :

1. Appairer **en local** (`npm run pair`), puis coller le contenu de
   `auth/principale/creds.json` dans la variable `SESSION_ID` — le code
   accepte le JSON brut ou en base64.
2. Renseigner `DATABASE` avec une URL PostgreSQL, sinon vous perdez sudo,
   bans, niveaux, économie et réglages à chaque redémarrage.

Le dépôt fournit `Dockerfile`, `heroku.yml` et `app.json`.

> Les URL de déploiement en un clic pointent vers ce dépôt. Si vous
> travaillez sur votre propre fork, remplacez-les.

## Commandes

Tapez `.menu` pour la liste complète. 17 catégories :

| Catégorie            | Exemples                                                    |
| -------------------- | ----------------------------------------------------------- |
| Téléchargement       | `ytmp3`, `ytmp4`, `tiktok`, `instagram`, `facebook`         |
| IA                   | `gpt`, `gemini`, `claude`, `blackbox`, `dalle`              |
| Groupe               | `kick`, `promote`, `hidetag`, `antilink`, `welcome`, `warn` |
| Conversion           | `sticker`, `toimage`, `attp`, `ttp`, `tts`, `stovid`        |
| Effets audio         | `nightcore`, `bass`, `reverb`, `slow`, `deep`               |
| Logo / Images        | `neon`, `naruto`, `hacker`, `blur`, `jail`, `wasted`        |
| Recherche            | `google`, `wiki`, `shazam`, `weather`, `lyrics`, `yts`      |
| Économie / Jeux      | `banque`, `pari`, `crypto`, `tictactoe`                     |
| Propriétaire         | `setsudo`, `ban`, `restart`, `setvar`, `pginstall`, `mode`  |
| Outils / Système     | `ping`, `menu`, `uptime`, `update`, `tempmail`              |

### Qui peut faire quoi

- **Propriétaire** (`NUMERO_OWNER`) et **sudo** (`.setsudo`) : toutes les commandes
- **Admins de groupe** : commandes d'administration dans leur groupe
- **Tout le monde** : commandes publiques, si `MODE=public`

---

## Dépannage

| Symptôme                                      | Cause et solution                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Le bot démarre mais ne répond à rien          | `NUMERO_OWNER` absent, ou `MODE=private`. Vérifiez votre `.env`.                                          |
| `⛔ Aucune session`                            | `SESSION_ID` vide et pas de `auth/principale/creds.json`. Lancez `npm run pair`.                          |
| `npm run pair` reste bloqué puis code 408      | Réseau sortant bloqué vers `web.whatsapp.com`. Vérifiez pare-feu, VPN ou proxy.                           |
| Code d'appairage refusé                        | Numéro au mauvais format. Indicatif pays sans `+` ni `00`, ex. `226XXXXXXXX`.                             |
| `❌ Session "principale" introuvable`          | SESSION_ID expiré ou service injoignable. Régénérez-la.                                                   |
| `⛔ Déconnecté : appareil délié`               | Session fermée depuis WhatsApp. Supprimez `auth/` et régénérez une SESSION_ID.                            |
| Réglages perdus à chaque redémarrage          | Hébergeur à disque éphémère sans PostgreSQL. Renseignez `DATABASE`.                                       |
| Stickers / conversions / audio en échec       | `ffmpeg` absent. Installez-le.                                                                            |
| `Synchronisation de la base impossible`       | `DATABASE` incorrect ou base injoignable. Testez l'URL, ou videz la variable pour repasser en SQLite.     |
| Erreurs PostgreSQL aléatoires                 | Limite de connexions atteinte. Le bot n'ouvre qu'un pool de 5 ; fermez les autres clients connectés.      |
| Le bot s'arrête quand je ferme le terminal    | Utilisez `npm start` (pm2), le service systemd ou Docker Compose — pas `npm run dev`.                     |
| Sur Termux, le bot meurt au bout de quelques minutes | `termux-wake-lock`, et passez Termux en « Sans restriction » dans les réglages de batterie Android. |

Pour diagnostiquer, lancez toujours `npm run dev` : pm2 et systemd masquent une
partie des messages de démarrage.

---

## Sécurité

Cette version diffère du dépôt d'origine sur plusieurs points importants :

- **Aucune porte dérobée.** Le fichier `eval_exec.js`, qui exécutait toute
  commande shell préfixée par `$` et tout code JS préfixé par `>` pour trois
  numéros codés en dur dans le source, a été supprimé.
- **Aucun numéro privilégié codé en dur.** Les droits dérivent uniquement de
  `NUMERO_OWNER` et de la liste des sudo.
- **Aucune télémétrie.** L'envoi périodique de votre numéro WhatsApp, préfixe et
  hébergeur vers un serveur tiers a été retiré.
- **Code lisible.** Les 70 fichiers étaient obfusqués ; ils sont désormais
  auditables.

Points de vigilance qui subsistent, par conception :

- `SESSION_ID` fait passer vos identifiants WhatsApp par un service tiers.
  Utilisez `auth/principale/creds.json` pour l'éviter.
- `.pginstall` télécharge et exécute du code distant, et installe ses
  dépendances npm. Réservé au propriétaire : n'installez que des plugins dont
  vous avez lu le code.
- Ne committez jamais `.env` ni `auth/` (déjà couverts par `.gitignore`).

---

## Licence et crédits

Distribué sous licence **MIT** — voir [LICENSE](./LICENSE).

Projet d'origine : **Ainz** ([Ainz-devs/OVL-MD-V2](https://github.com/Ainz-devs/OVL-MD-V2)).
Remerciements : Haibo_lugh, Nathan Harmone, Dr Djibi.
