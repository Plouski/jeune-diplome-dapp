const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Déploiement de la DApp Jeune Diplômé...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Compte utilisé:", deployer.address);
    
    try {
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Balance du compte:", hre.ethers.formatEther(balance), "ETH");
    } catch (error) {
        console.log("Erreur lors de la récupération de la balance:", error.message);
    }
    
    const JeuneDiplomeToken = await hre.ethers.getContractFactory("JeuneDiplomeToken");
    const token = await JeuneDiplomeToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("JeuneDiplomeToken déployé à:", tokenAddress);
    
    const DiplomaNFT = await hre.ethers.getContractFactory("DiplomaNFT");
    const nft = await DiplomaNFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("DiplomaNFT déployé à:", nftAddress);
    
    const DiplomaRegistry = await hre.ethers.getContractFactory("DiplomaRegistry");
    const registry = await DiplomaRegistry.deploy(tokenAddress, nftAddress);
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("DiplomaRegistry déployé à:", registryAddress);
    
    await token.setDiplomaRegistry(registryAddress);
    console.log("Token lié au registry");
    
    await nft.setDiplomaRegistry(registryAddress);
    console.log("NFT lié au registry");
    
    const currentNFTOwner = await nft.owner();
    console.log("Owner actuel du NFT:", currentNFTOwner);
    
    console.log("Déploiement terminé.");
    console.log("Adresses déployées:");
    console.log("JeuneDiplomeToken:", tokenAddress);
    console.log("DiplomaNFT:", nftAddress);
    console.log("DiplomaRegistry:", registryAddress);
    
    const addresses = {
        JeuneDiplomeToken: tokenAddress,
        DiplomaNFT: nftAddress,
        DiplomaRegistry: registryAddress,
        deployer: deployer.address,
        network: hre.network.name,
        deployedAt: new Date().toISOString()
    };
    
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("Adresses sauvegardées dans deployed-addresses.json");
    
    console.log("Prochaines étapes :");
    console.log("Configurer le frontend");
    console.log("Lancer 'cd frontend && npm start'");
    console.log("Tester l'application");
}

main()
    .then(() => {
        console.log("Script terminé avec succès.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Erreur lors du déploiement :", error);
        process.exit(1);
    });
