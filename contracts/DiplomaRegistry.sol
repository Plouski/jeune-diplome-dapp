// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./JeuneDiplomeToken.sol";
import "./DiplomaNFT.sol";

contract DiplomaRegistry is Ownable, ReentrancyGuard, Pausable {
    JeuneDiplomeToken public token;
    DiplomaNFT public diplomaNFT;
    
    struct Institution {
        string name;
        string institutionType;
        string country;
        string website;
        address agentAddress;
        bool isVerified;
        uint256 registrationDate;
    }
    
    struct Student {
        string name;
        string surname;
        uint256 birthDate;
        string nationality;
        string email;
        address studentAddress;
        uint256 registrationDate;
        string internshipCompany;
        uint256 internshipStartDate;
        uint256 internshipEndDate;
        uint256 evaluation;
        bool hasEvaluation;
    }
    
    struct Company {
        string name;
        string sector;
        string country;
        string website;
        address agentAddress;
        bool isVerified;
        uint256 registrationDate;
    }
    
    mapping(address => Institution) public institutions;
    mapping(address => Student) public students;
    mapping(address => Company) public companies;
    mapping(uint256 => address) public diplomaToStudent;
    mapping(address => uint256[]) public studentDiplomas;
    mapping(address => bool) public registeredInstitutions;
    mapping(address => bool) public registeredCompanies;
    mapping(address => bool) public registeredStudents;
    
    event InstitutionRegistered(address indexed institution, string name);
    event CompanyRegistered(address indexed company, string name);
    event StudentRegistered(address indexed student, string name);
    event StudentEvaluated(address indexed student, address indexed company, uint256 evaluation);
    event DiplomaVerified(uint256 indexed diplomaId, address indexed verifier);
    
    modifier onlyRegisteredInstitution() {
        require(registeredInstitutions[msg.sender], "Not a registered institution");
        require(institutions[msg.sender].isVerified, "Institution not verified");
        _;
    }
    
    modifier onlyRegisteredCompany() {
        require(registeredCompanies[msg.sender], "Not a registered company");
        require(companies[msg.sender].isVerified, "Company not verified");
        _;
    }
    
    constructor(address _tokenAddress, address _nftAddress) {
        token = JeuneDiplomeToken(_tokenAddress);
        diplomaNFT = DiplomaNFT(_nftAddress);
    }
    
    // ===== GESTION DES INSTITUTIONS =====
    function registerInstitution(
        string memory name,
        string memory institutionType,
        string memory country,
        string memory website,
        address agentAddress
    ) external whenNotPaused {
        require(!registeredInstitutions[agentAddress], "Institution already registered");
        require(bytes(name).length > 0, "Name required");
        
        institutions[agentAddress] = Institution({
            name: name,
            institutionType: institutionType,
            country: country,
            website: website,
            agentAddress: agentAddress,
            isVerified: false,
            registrationDate: block.timestamp
        });
        
        registeredInstitutions[agentAddress] = true;
        
        emit InstitutionRegistered(agentAddress, name);
    }
    
    function verifyInstitution(address institutionAddress) external onlyOwner {
        require(registeredInstitutions[institutionAddress], "Institution not registered");
        institutions[institutionAddress].isVerified = true;
        // Note: On appelle directement verifyInstitution sur le NFT depuis le owner du registry
    }
    
    // ===== GESTION DES ENTREPRISES =====
    function registerCompany(
        string memory name,
        string memory sector,
        string memory country,
        string memory website,
        address agentAddress
    ) external whenNotPaused {
        require(!registeredCompanies[agentAddress], "Company already registered");
        require(bytes(name).length > 0, "Name required");
        
        companies[agentAddress] = Company({
            name: name,
            sector: sector,
            country: country,
            website: website,
            agentAddress: agentAddress,
            isVerified: false,
            registrationDate: block.timestamp
        });
        
        registeredCompanies[agentAddress] = true;
        
        emit CompanyRegistered(agentAddress, name);
    }
    
    function verifyCompany(address companyAddress) external onlyOwner {
        require(registeredCompanies[companyAddress], "Company not registered");
        companies[companyAddress].isVerified = true;
    }
    
    // ===== GESTION DES ÉTUDIANTS =====
    function registerStudent(
        address studentAddress,
        string memory name,
        string memory surname,
        uint256 birthDate,
        string memory nationality,
        string memory email,
        string memory internshipCompany,
        uint256 internshipStartDate,
        uint256 internshipEndDate
    ) external onlyRegisteredInstitution whenNotPaused {
        require(!registeredStudents[studentAddress], "Student already registered");
        require(bytes(name).length > 0, "Name required");
        
        students[studentAddress] = Student({
            name: name,
            surname: surname,
            birthDate: birthDate,
            nationality: nationality,
            email: email,
            studentAddress: studentAddress,
            registrationDate: block.timestamp,
            internshipCompany: internshipCompany,
            internshipStartDate: internshipStartDate,
            internshipEndDate: internshipEndDate,
            evaluation: 0,
            hasEvaluation: false
        });
        
        registeredStudents[studentAddress] = true;
        
        emit StudentRegistered(studentAddress, name);
    }
    
    // ===== ÉVALUATION DES ÉTUDIANTS =====
    function evaluateStudent(
        address studentAddress,
        uint256 evaluation
    ) external onlyRegisteredCompany nonReentrant {
        require(registeredStudents[studentAddress], "Student not registered");
        require(evaluation >= 0 && evaluation <= 20, "Evaluation must be between 0 and 20");
        require(!students[studentAddress].hasEvaluation, "Student already evaluated");
        
        students[studentAddress].evaluation = evaluation;
        students[studentAddress].hasEvaluation = true;
        
        // Récompenser l'entreprise avec des tokens
        token.rewardEvaluation(msg.sender);
        
        emit StudentEvaluated(studentAddress, msg.sender, evaluation);
    }
    
    // ===== CRÉATION DE DIPLÔMES =====
    function createDiploma(
        address studentAddress,
        string memory diplomaName,
        string memory speciality,
        string memory mention,
        string memory ipfsHash,
        string memory tokenURI
    ) external onlyRegisteredInstitution returns (uint256) {
        require(registeredStudents[studentAddress], "Student not registered");
        require(institutions[msg.sender].isVerified, "Institution not verified");
        
        // Appeler directement le NFT en tant que registre autorisé
        uint256 diplomaId = diplomaNFT.mintDiploma(
            studentAddress,
            string(abi.encodePacked(students[studentAddress].name, " ", students[studentAddress].surname)),
            diplomaName,
            institutions[msg.sender].name,
            speciality,
            mention,
            ipfsHash,
            tokenURI
        );
        
        diplomaToStudent[diplomaId] = studentAddress;
        studentDiplomas[studentAddress].push(diplomaId);
        
        return diplomaId;
    }
    
    // ===== VÉRIFICATION DES DIPLÔMES =====
    function verifyDiploma(uint256 diplomaId) external nonReentrant returns (bool) {
        require(diplomaNFT.verifyDiploma(diplomaId), "Invalid diploma");
        
        // Payer les frais de vérification
        token.payVerificationFee(msg.sender);
        
        emit DiplomaVerified(diplomaId, msg.sender);
        
        return true;
    }
    
    // ===== FONCTIONS DE LECTURE =====
    function getStudentDiplomas(address studentAddress) external view returns (uint256[] memory) {
        return studentDiplomas[studentAddress];
    }
    
    function getInstitutionInfo(address institutionAddress) external view returns (Institution memory) {
        return institutions[institutionAddress];
    }
    
    function getCompanyInfo(address companyAddress) external view returns (Company memory) {
        return companies[companyAddress];
    }
    
    function getStudentInfo(address studentAddress) external view returns (Student memory) {
        return students[studentAddress];
    }
    
    // ===== FONCTIONS D'ADMINISTRATION =====
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function updateTokenAddress(address newTokenAddress) external onlyOwner {
        token = JeuneDiplomeToken(newTokenAddress);
    }
    
    function updateNFTAddress(address newNFTAddress) external onlyOwner {
        diplomaNFT = DiplomaNFT(newNFTAddress);
    }
}