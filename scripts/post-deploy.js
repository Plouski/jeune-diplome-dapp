const fs = require("fs");
const path = require("path");

async function updateFrontendConfig() {
  console.log("🔧 Mise à jour de la configuration frontend...");

  // Lire les adresses déployées
  const addressesPath = "./deployed-addresses.json";
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ Fichier deployed-addresses.json introuvable");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  // Chemin du service wallet
  const walletServicePath = "./frontend/src/services/walletService.js";

  if (!fs.existsSync(walletServicePath)) {
    console.error("❌ Fichier walletService.js introuvable");
    process.exit(1);
  }

  // Lire le contenu du fichier
  let content = fs.readFileSync(walletServicePath, "utf8");

  // Remplacer les adresses
  content = content.replace(
    /JeuneDiplomeToken: "0x\.\.\."/,
    `JeuneDiplomeToken: "${addresses.JeuneDiplomeToken}"`
  );

  content = content.replace(
    /DiplomaNFT: "0x\.\.\."/,
    `DiplomaNFT: "${addresses.DiplomaNFT}"`
  );

  content = content.replace(
    /DiplomaRegistry: "0x\.\.\."/,
    `DiplomaRegistry: "${addresses.DiplomaRegistry}"`
  );

  // Écrire le fichier mis à jour
  fs.writeFileSync(walletServicePath, content);

  console.log("✅ Configuration frontend mise à jour avec succès!");
  console.log("📄 Adresses configurées:");
  console.log(`- JeuneDiplomeToken: ${addresses.JeuneDiplomeToken}`);
  console.log(`- DiplomaNFT: ${addresses.DiplomaNFT}`);
  console.log(`- DiplomaRegistry: ${addresses.DiplomaRegistry}`);
}

async function createDeploymentSummary() {
  console.log("\n📊 Création du résumé de déploiement...");

  const addresses = JSON.parse(
    fs.readFileSync("./deployed-addresses.json", "utf8")
  );
  const network = await ethers.provider.getNetwork();

  const summary = `
# 🚀 Résumé du Déploiement

**Date**: ${new Date().toISOString()}
**Réseau**: ${network.name} (Chain ID: ${network.chainId})
**Déployeur**: ${addresses.deployer}

## 📝 Adresses des Contrats

| Contrat | Adresse |
|---------|---------|
| JeuneDiplomeToken | \`${addresses.JeuneDiplomeToken}\` |
| DiplomaNFT | \`${addresses.DiplomaNFT}\` |
| DiplomaRegistry | \`${addresses.DiplomaRegistry}\` |

## 🔗 Liens Utiles

${
  network.name !== "hardhat"
    ? `
### Etherscan
- [JeuneDiplomeToken](https://etherscan.io/address/${addresses.JeuneDiplomeToken})
- [DiplomaNFT](https://etherscan.io/address/${addresses.DiplomaNFT})
- [DiplomaRegistry](https://etherscan.io/address/${addresses.DiplomaRegistry})
`
    : ""
}

## 🛠️ Commandes Utiles

\`\`\`bash
# Vérifier les contrats (si testnet/mainnet)
npx hardhat verify --network ${network.name} ${addresses.JeuneDiplomeToken}
npx hardhat verify --network ${network.name} ${addresses.DiplomaNFT}
npx hardhat verify --network ${network.name} ${addresses.DiplomaRegistry} ${
    addresses.JeuneDiplomeToken
  } ${addresses.DiplomaNFT}

# Interagir avec les contrats
npx hardhat console --network ${network.name}
\`\`\`

## 📋 Prochaines Étapes

1. ✅ Contrats déployés
2. ✅ Configuration frontend mise à jour
3. ⏳ Vérifier les contrats sur Etherscan
4. ⏳ Ajouter des institutions de test
5. ⏳ Tester le flow complet
6. ⏳ Effectuer l'audit de sécurité
7. ⏳ Lancer le frontend

## 🔐 Sécurité

- [ ] Audit Mythril effectué
- [ ] Tests de sécurité manuels
- [ ] Vérification des permissions
- [ ] Test des fonctions pause/unpause
- [ ] Validation des rôles et accès

## 💡 Notes

- Le frontend est configuré automatiquement avec les bonnes adresses
- Les tokens peuvent être achetés au taux: 0.01 ETH = 100 JDT
- Les vérifications coûtent 10 JDT
- Les évaluations rapportent 15 JDT
`;

  fs.writeFileSync("./DEPLOYMENT.md", summary);
  console.log("✅ Résumé créé: DEPLOYMENT.md");
}

async function runPostDeployment() {
  try {
    await updateFrontendConfig();
    await createDeploymentSummary();

    console.log("\n🎉 Post-déploiement terminé avec succès!");
    console.log("\n📋 Actions recommandées:");
    console.log("1. Vérifier les contrats sur Etherscan");
    console.log("2. Tester le frontend: cd frontend && npm start");
    console.log("3. Ajouter des institutions de test");
    console.log("4. Effectuer l'audit de sécurité");
  } catch (error) {
    console.error("❌ Erreur lors du post-déploiement:", error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runPostDeployment();
}

module.exports = {
  updateFrontendConfig,
  createDeploymentSummary,
  runPostDeployment,
};