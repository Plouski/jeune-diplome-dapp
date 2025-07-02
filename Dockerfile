# Dockerfile alternatif pour DApp Jeune Diplômé
# Version plus simple avec Ubuntu pour éviter les problèmes Alpine

FROM node:18

# Métadonnées
LABEL maintainer="Étudiant M2 Blockchain"
LABEL description="DApp Jeune Diplômé avec audit Mythril"
LABEL version="1.0.0"

# Mise à jour et installation des dépendances
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    bash \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Création de l'utilisateur non-root
RUN groupadd -r nodejs && useradd -r -g nodejs dapp

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY hardhat.config.js ./

# Installation des dépendances Node.js
RUN npm ci --only=production && \
    npm cache clean --force

# Installation de Mythril dans un environnement virtuel
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install mythril

# Ajout du venv au PATH pour que 'myth' soit disponible
ENV PATH="/opt/venv/bin:$PATH"

# Vérification de l'installation Mythril
RUN myth version

# Copie du code source
COPY --chown=dapp:nodejs . .

# Création des dossiers nécessaires
RUN mkdir -p audit-reports && \
    mkdir -p artifacts && \
    mkdir -p cache && \
    chown -R dapp:nodejs /app

# Permissions pour les scripts
RUN chmod +x scripts/audit-mythril.sh

# Changement vers l'utilisateur non-root
USER dapp

# Port pour Hardhat node
EXPOSE 8545

# Commande par défaut
CMD ["npm", "run", "dev:setup"]