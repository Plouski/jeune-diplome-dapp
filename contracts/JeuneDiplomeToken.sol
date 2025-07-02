// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract JeuneDiplomeToken is ERC20, Ownable, ReentrancyGuard {
    // Constantes pour l'économie du token (définies selon les spécifications du projet)
    uint256 public constant TOKEN_PRICE = 0.01 ether;  // 0.01 ETH = 100 tokens
    uint256 public constant TOKENS_PER_ETH = 100;      // Nombre de tokens par ETH
    uint256 public constant EVALUATION_REWARD = 15;     // 15 tokens par évaluation d'entreprise
    uint256 public constant VERIFICATION_FEE = 10;      // 10 tokens par vérification de diplôme
    
    // Adresse du contrat principal qui nous autorise à faire des opérations
    address public diplomaRegistry;
    
    // Events pour tracer les transactions importantes (appris en cours)
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event EvaluationRewarded(address indexed evaluator, uint256 amount);
    event VerificationFeePaid(address indexed verifier, uint256 amount);
    
    // Seul le registry peut appeler certaines fonctions (sécurité)
    modifier onlyDiplomaRegistry() {
        require(msg.sender == diplomaRegistry, "Only diploma registry can call this");
        _;
    }
    
    constructor() ERC20("JeuneDiplomeToken", "JDT") {
        // On crée une réserve initiale de 1 million de tokens pour le propriétaire
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    // Configuration de l'adresse du registre principal (appelé après déploiement)
    function setDiplomaRegistry(address _diplomaRegistry) external onlyOwner {
        diplomaRegistry = _diplomaRegistry;
    }
    
    // Fonction pour acheter des tokens avec de l'ETH
    function buyTokens() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(msg.value % TOKEN_PRICE == 0, "Invalid ETH amount");
        
        // Calcul du nombre de tokens à donner
        uint256 tokenAmount = (msg.value / TOKEN_PRICE) * TOKENS_PER_ETH * 10**decimals();
        require(balanceOf(owner()) >= tokenAmount, "Insufficient token supply");
        
        // Transfert des tokens de la réserve vers l'acheteur
        _transfer(owner(), msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }
    
    // Récompenser une entreprise qui fait une évaluation
    function rewardEvaluation(address evaluator) external onlyDiplomaRegistry {
        require(balanceOf(owner()) >= EVALUATION_REWARD * 10**decimals(), "Insufficient token supply");
        
        // On donne des tokens à l'entreprise depuis la réserve du propriétaire
        _transfer(owner(), evaluator, EVALUATION_REWARD * 10**decimals());
        
        emit EvaluationRewarded(evaluator, EVALUATION_REWARD * 10**decimals());
    }
    
    // Faire payer les frais de vérification d'un diplôme
    function payVerificationFee(address from) external onlyDiplomaRegistry {
        require(balanceOf(from) >= VERIFICATION_FEE * 10**decimals(), "Insufficient balance");
        
        // On transfère les tokens vers le registry (qui les garde comme frais)
        _transfer(from, diplomaRegistry, VERIFICATION_FEE * 10**decimals());
        
        emit VerificationFeePaid(from, VERIFICATION_FEE * 10**decimals());
    }
    
    // Le propriétaire peut retirer l'ETH reçu des ventes de tokens
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        // Transfert sécurisé de l'ETH vers le propriétaire
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    // Fonctions de lecture pour obtenir les paramètres du système
    function getTokenPrice() external pure returns (uint256) {
        return TOKEN_PRICE;
    }
    
    function getVerificationFee() external view returns (uint256) {
        return VERIFICATION_FEE * 10**decimals();
    }
    
    function getEvaluationReward() external view returns (uint256) {
        return EVALUATION_REWARD * 10**decimals();
    }
    
    // Fonction pour connaître le solde de la réserve (utile pour debug)
    function getReserveBalance() external view returns (uint256) {
        return balanceOf(owner());
    }
}