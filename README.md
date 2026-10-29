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

### 2. Générer une SESSION_ID

Rendez-vous sur **https://ovl-web.koyeb.app/** et appairez votre numéro.

> ⚠️ Vos identifiants WhatsApp transitent par ce service tiers et donnent un
> accès complet à votre compte. Pour éviter cela, générez vos identifiants
> vous-même avec Baileys et déposez le fichier obtenu dans
> `auth/principale/creds.json` : le bot l'utilisera directement et ne contactera
> aucun service externe. Vous pouvez aussi faire pointer `SESSION_API` vers
> votre propre instance.

### 3. Configurer

```bash
cp .env.example .env
```

Puis éditez `.env`. Deux valeurs sont indispensables :

| Variable       | Rôle                                                       |
| -------------- | ---------------------------------------------------------- |
| `SESSION_ID`   | La session générée à l'étape 2                             |
| `NUMERO_OWNER` | Votre numéro, format international, sans `+` ni espace     |

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
| Heroku, Koyeb, Render, GitHub Actions (disque éphémère)       | `DATABASE=postgresql://...` requis    |

Sans PostgreSQL sur un hébergeur éphémère, vous perdez à chaque redémarrage les
sudo, bans, niveaux, économie et réglages anti-spam. Offres gratuites
adaptées : [Supabase](https://supabase.com), [Neon](https://neon.tech).

---

## Déploiement

<details>
  <summary>Heroku / Render / Koyeb</summary>

Le dépôt fournit un `Dockerfile`, un `heroku.yml` et un `app.json`.

- **Heroku** : [déployer](https://dashboard.heroku.com/new?template=https://github.com/neltolofon-dot/OVL-MD-V2)
- **Render** : [nouveau service web](https://dashboard.render.com/web/new), environnement Docker
- **Koyeb** : [nouveau service](https://app.koyeb.com/deploy), builder Dockerfile

Renseignez les variables d'environnement de `.env.example` dans l'interface de
l'hébergeur, et n'oubliez pas `DATABASE`.

> Le `Dockerfile` clone le dépôt d'origine `Ainz-devs/OVL-MD-V2`. Si vous
> déployez votre propre fork, modifiez l'URL du `git clone` dans le
> `Dockerfile`, sinon vos modifications seront ignorées.

</details>

<details>
  <summary>Panel (Pterodactyl, etc.)</summary>

Fichier de démarrage : `Ovl.js`. Déposez votre `.env` à la racine, lancez
`npm install`, puis démarrez. Le bot installe lui-même les dépendances
manquantes au premier lancement (désactivable avec `AUTO_INSTALL=off`).

</details>

<details>
  <summary>GitHub Actions</summary>

`.github/workflows/deploy.yml` :

```yaml
name: OVL-MD Bot CI

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 */5 * * *"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - run: sudo apt-get update && sudo apt-get install -y ffmpeg
      - run: npm ci
      - run: timeout 18300s node Ovl.js
        env:
          SESSION_ID: ${{ secrets.SESSION_ID }}
          NUMERO_OWNER: ${{ secrets.NUMERO_OWNER }}
          DATABASE: ${{ secrets.DATABASE }}
```

Passez les valeurs par les *secrets* du dépôt, jamais en clair dans le
workflow. `DATABASE` est obligatoire ici : le disque est détruit à chaque run.

</details>

---

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
| `⛔ Aucune session`                            | `SESSION_ID` vide et pas de `auth/principale/creds.json`. Reprenez l'étape 2.                             |
| `❌ Session "principale" introuvable`          | SESSION_ID expiré ou service injoignable. Régénérez-la.                                                   |
| `⛔ Déconnecté : appareil délié`               | Session fermée depuis WhatsApp. Supprimez `auth/` et régénérez une SESSION_ID.                            |
| Réglages perdus à chaque redémarrage          | Hébergeur à disque éphémère sans PostgreSQL. Renseignez `DATABASE`.                                       |
| Stickers / conversions / audio en échec       | `ffmpeg` absent. Installez-le.                                                                            |
| `Synchronisation de la base impossible`       | `DATABASE` incorrect ou base injoignable. Testez l'URL, ou videz la variable pour repasser en SQLite.     |
| Erreurs PostgreSQL aléatoires                 | Limite de connexions atteinte. Le bot n'ouvre qu'un pool de 5 ; fermez les autres clients connectés.      |

Pour diagnostiquer, lancez toujours `npm run dev` : pm2 masque une partie des
messages de démarrage.

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
