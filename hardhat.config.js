require("@nomicfoundation/hardhat-toolbox");

// Variables d'environnement
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    // Réseau de développement local
    hardhat: {
      chainId: 31337,
    },
    
    // Localhost pour tests
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Testnets
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 5,
      gasPrice: 20000000000, // 20 gwei
    },
    
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 20000000000,
    },
    
    // Mainnet (à utiliser avec précaution)
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: 20000000000,
    },
    
    // Polygon
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 137,
    },
    
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 80001,
    },
  },
  
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    gasPrice: 20,
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 40000,
  },
};