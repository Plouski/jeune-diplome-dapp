#!/bin/bash
# scripts/docker-commands.sh
# Scripts utilitaires pour Docker dans le projet M2

echo "🐳 COMMANDES DOCKER - DApp Jeune Diplômé"
echo "========================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}Commandes disponibles:${NC}"
    echo ""
    echo "  build         - Construire l'image Docker"
    echo "  start         - Démarrer le nœud Hardhat"
    echo "  test          - Exécuter les tests"
    echo "  audit         - Exécuter l'audit Mythril"
    echo "  compile       - Compiler les contrats"
    echo "  deploy        - Déployer les contrats"
    echo "  shell         - Ouvrir un shell dans le container"
    echo "  logs          - Voir les logs"
    echo "  stop          - Arrêter tous les services"
    echo "  clean         - Nettoyer (images, containers, volumes)"
    echo "  dev           - Mode développement complet"
    echo ""
    echo -e "${YELLOW}Exemples:${NC}"
    echo "  ./scripts/docker-commands.sh build"
    echo "  ./scripts/docker-commands.sh audit"
    echo "  ./scripts/docker-commands.sh dev"
}

build_image() {
    echo -e "${BLUE}🔨 Construction de l'image Docker...${NC}"
    docker build -t jeune-diplome-dapp .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Image construite avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la construction${NC}"
        exit 1
    fi
}

start_node() {
    echo -e "${BLUE}🚀 Démarrage du nœud Hardhat...${NC}"
    docker-compose up -d dapp
    echo -e "${GREEN}✅ Nœud démarré sur http://localhost:8545${NC}"
    echo "Pour voir les logs: docker-compose logs -f dapp"
}

run_tests() {
    echo -e "${BLUE}🧪 Exécution des tests...${NC}"
    docker-compose run --rm test
}

run_audit() {
    echo -e "${BLUE}🔍 Exécution de l'audit Mythril...${NC}"
    docker-compose --profile audit run --rm audit
    
    if [ -d "./audit-reports" ]; then
        echo -e "${GREEN}📊 Rapports d'audit générés:${NC}"
        ls -la audit-reports/
    fi
}

compile_contracts() {
    echo -e "${BLUE}🔨 Compilation des contrats...${NC}"
    docker-compose run --rm dapp npm run compile
}

deploy_contracts() {
    echo -e "${BLUE}🚀 Déploiement des contrats...${NC}"
    docker-compose run --rm dapp npm run deploy
}

open_shell() {
    echo -e "${BLUE}💻 Ouverture du shell...${NC}"
    docker-compose run --rm dapp bash
}

show_logs() {
    echo -e "${BLUE}📋 Logs des services...${NC}"
    docker-compose logs -f
}

stop_services() {
    echo -e "${BLUE}🛑 Arrêt des services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Services arrêtés${NC}"
}

clean_all() {
    echo -e "${YELLOW}🧹 Nettoyage complet...${NC}"
    echo "Cela va supprimer:"
    echo "  - Tous les containers du projet"
    echo "  - L'image Docker du projet"
    echo "  - Les volumes Docker associés"
    echo ""
    read -p "Êtes-vous sûr? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker rmi jeune-diplome-dapp 2>/dev/null || true
        docker system prune -f
        echo -e "${GREEN}✅ Nettoyage terminé${NC}"
    else
        echo "Nettoyage annulé"
    fi
}

dev_mode() {
    echo -e "${BLUE}🛠️  Mode développement complet...${NC}"
    echo ""
    
    # Construction
    build_image
    
    # Compilation
    compile_contracts
    
    # Tests
    run_tests
    
    # Audit
    run_audit
    
    # Démarrage du nœud
    start_node
    
    echo ""
    echo -e "${GREEN}🎉 Environnement de développement prêt!${NC}"
    echo ""
    echo -e "${YELLOW}Services disponibles:${NC}"
    echo "  - Nœud Hardhat: http://localhost:8545"
    echo "  - Rapports d'audit: ./audit-reports/"
    echo ""
    echo -e "${YELLOW}Commandes utiles:${NC}"
    echo "  - Voir les logs: docker-compose logs -f"
    echo "  - Shell: ./scripts/docker-commands.sh shell"
    echo "  - Arrêter: ./scripts/docker-commands.sh stop"
}

# Gestion des arguments
case "${1:-help}" in
    "build")
        build_image
        ;;
    "start")
        start_node
        ;;
    "test")
        run_tests
        ;;
    "audit")
        run_audit
        ;;
    "compile")
        compile_contracts
        ;;
    "deploy")
        deploy_contracts
        ;;
    "shell")
        open_shell
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        clean_all
        ;;
    "dev")
        dev_mode
        ;;
    "help"|*)
        show_help
        ;;
esac