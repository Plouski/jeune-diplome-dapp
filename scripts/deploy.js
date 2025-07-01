const hre = require("hardhat");

async function main() {
    console.log("🚀 Déploiement de la DApp Jeune Diplômé...");
    
    // Récupérer les comptes
    const [deployer] = await hre.ethers.getSigners();
    console.log("Déploiement avec le compte:", deployer.address);
    console.log("Balance du compte:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));
    
    // 1. Déployer le token ERC20
    console.log("\n📄 Déploiement du JeuneDiplomeToken...");
    const JeuneDiplomeToken = await hre.ethers.getContractFactory("JeuneDiplomeToken");
    const token = await JeuneDiplomeToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ JeuneDiplomeToken déployé à:", tokenAddress);
    
    // 2. Déployer le NFT
    console.log("\n🎨 Déploiement du DiplomaNFT...");
    const DiplomaNFT = await hre.ethers.getContractFactory("DiplomaNFT");
    const nft = await DiplomaNFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("✅ DiplomaNFT déployé à:", nftAddress);
    
    // 3. Déployer le registre principal
    console.log("\n📋 Déploiement du DiplomaRegistry...");
    const DiplomaRegistry = await hre.ethers.getContractFactory("DiplomaRegistry");
    const registry = await DiplomaRegistry.deploy(tokenAddress, nftAddress);
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ DiplomaRegistry déployé à:", registryAddress);
    
    // 4. Configuration des autorisations
    console.log("\n⚙️ Configuration des autorisations...");
    
    // Configurer le token pour qu'il reconnaisse le registry
    await token.setDiplomaRegistry(registryAddress);
    console.log("✅ Token configuré avec le registry");
    
    // Configurer le NFT pour qu'il reconnaisse le registry
    await nft.setDiplomaRegistry(registryAddress);
    console.log("✅ NFT configuré avec le registry");
    
    // Le owner du registry doit aussi être owner du NFT pour vérifier les institutions
    const currentNFTOwner = await nft.owner();
    console.log("✅ Owner du NFT:", currentNFTOwner);
    
    console.log("\n🎉 Déploiement terminé avec succès!");
    console.log("\n📊 Résumé des adresses:");
    console.log("- JeuneDiplomeToken:", tokenAddress);
    console.log("- DiplomaNFT:", nftAddress);
    console.log("- DiplomaRegistry:", registryAddress);
    
    // Sauvegarder les adresses dans un fichier
    const fs = require('fs');
    const addresses = {
        JeuneDiplomeToken: tokenAddress,
        DiplomaNFT: nftAddress,
        DiplomaRegistry: registryAddress,
        deployer: deployer.address
    };
    
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Adresses sauvegardées dans deployed-addresses.json");
    
    // Instructions pour la suite
    console.log("\n📝 Prochaines étapes:");
    console.log("1. Vérifier les contrats sur Etherscan (si mainnet/testnet)");
    console.log("2. Ajouter des institutions vérifiées");
    console.log("3. Déployer le frontend");
    console.log("4. Effectuer l'audit de sécurité avec Mythril");
}