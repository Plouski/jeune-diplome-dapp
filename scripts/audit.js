const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function runMythrilAudit() {
  console.log("🔍 Démarrage de l'audit de sécurité avec Mythril...");

  const contractsDir = "./contracts";
  const auditDir = "./audit-reports";

  // Créer le dossier d'audit s'il n'existe pas
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir);
  }

  const contracts = [
    "JeuneDiplomeToken.sol",
    "DiplomaNFT.sol",
    "DiplomaRegistry.sol",
  ];

  for (const contract of contracts) {
    const contractPath = path.join(contractsDir, contract);
    const reportPath = path.join(
      auditDir,
      `${contract.replace(".sol", "")}-audit.json`
    );

    console.log(`\n🔍 Audit de ${contract}...`);

    const command = `myth analyze ${contractPath} --execution-timeout 300 -o json`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur lors de l'audit de ${contract}:`, error);
        return;
      }

      if (stderr) {
        console.warn(`⚠️ Avertissements pour ${contract}:`, stderr);
      }

      // Sauvegarder le rapport
      fs.writeFileSync(reportPath, stdout);
      console.log(`✅ Rapport d'audit sauvegardé: ${reportPath}`);

      // Analyser et afficher les résultats
      try {
        const report = JSON.parse(stdout);
        analyzeReport(contract, report);
      } catch (e) {
        console.log(`📄 Rapport brut pour ${contract}:\n${stdout}`);
      }
    });
  }
}

function analyzeReport(contractName, report) {
  console.log(`\n📊 Analyse du rapport pour ${contractName}:`);

  if (report.issues && report.issues.length > 0) {
    console.log(`⚠️ ${report.issues.length} problème(s) détecté(s):`);

    report.issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.title}`);
      console.log(`   Sévérité: ${issue.severity}`);
      console.log(`   Type: ${issue.swc_id}`);
      console.log(`   Description: ${issue.description.head}`);
      console.log(`   Ligne: ${issue.lineno}`);
    });
  } else {
    console.log("✅ Aucun problème de sécurité détecté!");
  }
}

// Générer un rapport de recommandations
function generateSecurityRecommendations() {
  const recommendations = `
# 🛡️ Recommandations de Sécurité

## Mesures Implémentées

### 1. Protection contre la Reentrancy
- ✅ Utilisation de ReentrancyGuard d'OpenZeppelin
- ✅ Modificateur nonReentrant sur les fonctions sensibles
- ✅ Checks-Effects-Interactions pattern

### 2. Contrôle d'Accès
- ✅ Utilisation d'Ownable d'OpenZeppelin
- ✅ Modificateurs personnalisés pour les rôles
- ✅ Vérification des permissions avant actions critiques

### 3. Gestion des Entiers
- ✅ Solidity 0.8+ (protection intégrée contre overflow/underflow)
- ✅ Utilisation d'OpenZeppelin SafeMath si nécessaire

### 4. Validation des Entrées
- ✅ Require statements pour valider les paramètres
- ✅ Vérification des adresses non nulles
- ✅ Validation des montants et plages

### 5. Pause d'Urgence
- ✅ Utilisation du contrat Pausable d'OpenZeppelin
- ✅ Fonctions pause/unpause pour le owner

## Mesures Supplémentaires Recommandées

### 1. Oracle de Prix
- ⚠️ Considérer un oracle pour le prix ETH/Token plus robuste

### 2. Limite de Gaz
- ⚠️ Ajouter des limites sur les boucles pour éviter les attaques DoS

### 3. Event Logging
- ✅ Events appropriés pour toutes les actions importantes

### 4. Upgrade Pattern
- 💡 Considérer un proxy upgradeable pour les futures améliorations

### 5. Multi-Signature
- 💡 Utiliser un multi-sig wallet pour le owner en production

## Tests de Sécurité Additionnels

1. **Test de Front-Running**: Vérifier les fonctions sensibles aux attaques MEV
2. **Test de DoS**: Vérifier la résistance aux attaques de déni de service
3. **Test d'Oracle**: Tester la manipulation des prix si oracle externe
4. **Test de Gouvernance**: Vérifier les mécanismes de vote si applicable

## Déploiement Sécurisé

1. **Testnet First**: Toujours tester sur testnet avant mainnet
2. **Verify Contracts**: Vérifier les contrats sur Etherscan
3. **Gradual Rollout**: Commencer avec des limites basses
4. **Monitor**: Surveiller les transactions suspectes
5. **Bug Bounty**: Considérer un programme de bug bounty
`;

  fs.writeFileSync(
    "./audit-reports/security-recommendations.md",
    recommendations
  );
  console.log(
    "📋 Recommandations de sécurité générées: ./audit-reports/security-recommendations.md"
  );
}

if (require.main === module) {
  runMythrilAudit();
  generateSecurityRecommendations();
}

module.exports = { runMythrilAudit, generateSecurityRecommendations };