FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /ovl_bot

# Les dépendances d'abord : cette couche est mise en cache tant que
# package.json ne change pas.
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Puis le code du dépôt courant. L'image précédente faisait un `git clone` du
# dépôt d'origine, ce qui ignorait silencieusement toute modification locale.
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "Ovl.js"]
