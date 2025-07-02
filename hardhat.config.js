require("@nomicfoundation/hardhat-toolbox");

// On charge les variables d'environnement si le fichier .env existe
require('dotenv').config();

// Configuration basique pour un projet de M2
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,  // ✅ Ajouter cette ligne pour résoudre "Stack too deep"
    },
  },
  
  networks: {
    // Réseau local pour les tests
    hardhat: {
      chainId: 31337,
    },
    
    // Pour se connecter à un nœud local si on en lance un
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  
  // Configuration des chemins
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // Timeout pour les tests
  mocha: {
    timeout: 40000,
  },
};