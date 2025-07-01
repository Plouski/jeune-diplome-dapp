// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract JeuneDiplomeToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant TOKEN_PRICE = 0.01 ether; // 0.01 ETH = 100 tokens
    uint256 public constant TOKENS_PER_ETH = 100;
    uint256 public constant EVALUATION_REWARD = 15; // 15 tokens par évaluation
    uint256 public constant VERIFICATION_FEE = 10; // 10 tokens par vérification
    
    address public diplomaRegistry;
    
    mapping(address => bool) public authorizedEvaluators;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event EvaluationRewarded(address indexed evaluator, uint256 amount);
    event VerificationFeePaid(address indexed verifier, uint256 amount);
    
    modifier onlyDiplomaRegistry() {
        require(msg.sender == diplomaRegistry, "Only diploma registry can call this");
        _;
    }
    
    constructor() ERC20("JeuneDiplomeToken", "JDT") {
        // Mint initial supply to owner
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function setDiplomaRegistry(address _diplomaRegistry) external onlyOwner {
        diplomaRegistry = _diplomaRegistry;
    }
    
    function buyTokens() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(msg.value % TOKEN_PRICE == 0, "Invalid ETH amount");
        
        uint256 tokenAmount = (msg.value / TOKEN_PRICE) * TOKENS_PER_ETH;
        require(balanceOf(owner()) >= tokenAmount, "Insufficient token supply");
        
        _transfer(owner(), msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }
    
    function rewardEvaluation(address evaluator) external onlyDiplomaRegistry {
        require(balanceOf(owner()) >= EVALUATION_REWARD, "Insufficient token supply");
        _transfer(owner(), evaluator, EVALUATION_REWARD);
        
        emit EvaluationRewarded(evaluator, EVALUATION_REWARD);
    }
    
    function payVerificationFee(address from) external onlyDiplomaRegistry {
        require(balanceOf(from) >= VERIFICATION_FEE, "Insufficient balance");
        _transfer(from, diplomaRegistry, VERIFICATION_FEE);
        
        emit VerificationFeePaid(from, VERIFICATION_FEE);
    }
    
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    function getTokenPrice() external pure returns (uint256) {
        return TOKEN_PRICE;
    }
    
    function getVerificationFee() external pure returns (uint256) {
        return VERIFICATION_FEE;
    }
}