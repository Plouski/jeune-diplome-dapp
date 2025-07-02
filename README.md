# DApp Jeune Diplômé

### Smart Contracts
- **JeuneDiplomeToken.sol** : Token ERC-20 pour les transactions internes
- **DiplomaNFT.sol** : Contrat NFT ERC-721 représentant les diplômes
- **DiplomaRegistry.sol** : Registre central gérant institutions, étudiants et entreprises

### Frontend
- **Next.js** avec React 19
- **Tailwind CSS** pour le styling
- **Ethers.js** pour l'interaction avec la blockchain

## Installation et Configuration

### Installation Backend
```bash
npm install
npm run compile
```

### Installation Frontend
```bash
cd frontend
npm install
```

## Déploiement Local

### 1. Démarrer le nœud Hardhat
```bash
npm run node
```

### 2. Déployer les contrats
```bash
npm run deploy:local
```

### 3. Lancer le frontend
```bash
cd frontend
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Adresses des Contrats (Réseau Local)

Les adresses sont automatiquement sauvegardées dans `deployed-addresses.json` après déploiement.

## Utilisation

### 1. Connexion MetaMask
- Connecter MetaMask au réseau local (localhost:8545)
- Importer un compte de test avec une clé privée du nœud Hardhat

### 2. Flux d'utilisation
1. **Institution** : S'enregistre via le registre
2. **Entreprise** : S'enregistre pour accueillir des stagiaires
3. **Étudiant** : Enregistré par son institution
4. **Création NFT** : L'institution émet un diplôme NFT à l'étudiant
5. **Évaluation** : L'entreprise évalue l'étudiant et reçoit des tokens
6. **Vérification** : Employeurs vérifient l'authenticité des diplômes

### 3. Fonctionnalités principales
- Achat de tokens (1 ETH = 100 tokens)
- Création de diplômes NFT avec métadonnées IPFS
- Système de récompenses pour les entreprises
- Vérification d'authenticité des diplômes

## Tests

### Exécuter les tests
```bash
npm test
```

### Tests couverts
- Achat de tokens
- Enregistrement des entités (institutions, entreprises, étudiants)
- Création et vérification de diplômes NFT
- Système de récompenses

## Audit de Sécurité

### Audit manuel
```bash
npm run audit
```

Les rapports sont générés dans le dossier `audit-reports/`

### Points de sécurité vérifiés
- Protection contre la réentrance
- Contrôle d'accès approprié
- Validation des entrées
- Gestion des rôles
- Protection contre les débordements

## Déploiement Docker (Optionnel)

### Construction
```bash
docker build -t jeune-diplome-dapp .
```

### Démarrage
```bash
docker-compose up -d
```