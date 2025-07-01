const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Déploiement de la DApp Jeune Diplômé...");

  // Récupérer les comptes
  const [deployer] = await ethers.getSigners();
  console.log("Déploiement avec le compte:", deployer.address);
  console.log(
    "Balance du compte:",
    ethers.utils.formatEther(await deployer.getBalance())
  );

  // 1. Déployer le token ERC20
  console.log("\n📄 Déploiement du JeuneDiplomeToken...");
  const JeuneDiplomeToken = await ethers.getContractFactory(
    "JeuneDiplomeToken"
  );
  const token = await JeuneDiplomeToken.deploy();
  await token.deployed();
  console.log("✅ JeuneDiplomeToken déployé à:", token.address);

  // 2. Déployer le NFT
  console.log("\n🎨 Déploiement du DiplomaNFT...");
  const DiplomaNFT = await ethers.getContractFactory("DiplomaNFT");
  const nft = await DiplomaNFT.deploy();
  await nft.deployed();
  console.log("✅ DiplomaNFT déployé à:", nft.address);

  // 3. Déployer le registre principal
  console.log("\n📋 Déploiement du DiplomaRegistry...");
  const DiplomaRegistry = await ethers.getContractFactory("DiplomaRegistry");
  const registry = await DiplomaRegistry.deploy(token.address, nft.address);
  await registry.deployed();
  console.log("✅ DiplomaRegistry déployé à:", registry.address);

  // 4. Configuration des autorisations
  console.log("\n⚙️ Configuration des autorisations...");

  // Configurer le token pour qu'il reconnaisse le registry
  await token.setDiplomaRegistry(registry.address);
  console.log("✅ Token configuré avec le registry");

  // Configurer le NFT pour qu'il reconnaisse le registry
  await nft.setDiplomaRegistry(registry.address);
  console.log("✅ NFT configuré avec le registry");

  console.log("\n🎉 Déploiement terminé avec succès!");
  console.log("\n📊 Résumé des adresses:");
  console.log("- JeuneDiplomeToken:", token.address);
  console.log("- DiplomaNFT:", nft.address);
  console.log("- DiplomaRegistry:", registry.address);

  // Sauvegarder les adresses dans un fichier
  const fs = require("fs");
  const addresses = {
    JeuneDiplomeToken: token.address,
    DiplomaNFT: nft.address,
    DiplomaRegistry: registry.address,
    deployer: deployer.address,
  };

  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n💾 Adresses sauvegardées dans deployed-addresses.json");

  // Instructions pour la suite
  console.log("\n📝 Prochaines étapes:");
  console.log("1. Vérifier les contrats sur Etherscan (si mainnet/testnet)");
  console.log("2. Ajouter des institutions vérifiées");
  console.log("3. Déployer le frontend");
  console.log("4. Effectuer l'audit de sécurité avec Mythril");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });
