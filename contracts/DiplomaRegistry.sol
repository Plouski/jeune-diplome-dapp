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
    
    // Structure pour stocker les infos d'un établissement
    struct Institution {
        string name;                    // Nom_Etablissement
        string institutionType;         // Type
        string country;                 // Pays
        string adresse;                 // Adresse
        string website;                 // Site_Web
        string idAgent;                 // ID_Agent
        address agentAddress;           // Adresse blockchain de l'agent
        bool isVerified;                // Si l'institution est vérifiée
        uint256 registrationDate;       // Date d'enregistrement sur la blockchain
    }
    
    // Structure pour stocker les infos d'un étudiant
    struct Student {
        string name;                    // Nom
        string surname;                 // Prénom
        uint256 birthDate;              // Date de naissance
        string sexe;                    // Sexe
        string nationality;             // Nationalité
        string statutCivil;             // Statut civil
        string adresse;                 // Adresse
        string courriel;                // Courriel
        string telephone;               // Téléphone
        string section;                 // Section
        string sujetPFE;                // Sujet_PFE
        address idEES;                  // ID_EES - Clé étrangère vers l'établissement
        address idEntrepriseStage;      // ID_Entreprise_Stage_PFE - Clé étrangère vers l'entreprise
        string nomPrenomMaitre;         // NometPrenom_MaitreDuStage
        uint256 internshipStartDate;    // Date_debut_stage
        uint256 internshipEndDate;      // Date_fin_stage
        uint256 evaluation;             // Evaluation
        address studentAddress;         // Adresse blockchain de l'étudiant
        uint256 registrationDate;       // Date d'inscription sur la blockchain
        bool hasEvaluation;             // Si l'étudiant a été évalué
    }
    
    // Structure pour stocker les infos d'une entreprise
    struct Company {
        string name;                    // Nom
        string sector;                  // Secteur
        uint256 dateCreation;           // Date_Création
        string classificationTaille;    // Classification_Taille 
        string country;                 // Pays
        string adresse;                 // Adresse
        string courriel;                // Courriel
        string telephone;               // Téléphone
        string website;                 // Site_Web
        address agentAddress;           // Adresse blockchain de l'agent
        bool isVerified;                // Si l'entreprise est vérifiée
        uint256 registrationDate;       // Date d'enregistrement sur la blockchain
    }
    
    // Mappings basiques pour stocker les données
    mapping(address => Institution) public institutions;
    mapping(address => Student) public students;
    mapping(address => Company) public companies;
    mapping(uint256 => address) public diplomaToStudent;
    mapping(address => uint256[]) public studentDiplomas;
    mapping(address => bool) public registeredInstitutions;
    mapping(address => bool) public registeredCompanies;
    mapping(address => bool) public registeredStudents;
    
    // Events pour tracer les actions importantes
    event InstitutionRegistered(address indexed institution, string name);
    event CompanyRegistered(address indexed company, string name);
    event StudentRegistered(address indexed student, string name);
    event StudentEvaluated(address indexed student, address indexed company, uint256 evaluation);
    event DiplomaVerified(uint256 indexed diplomaId, address indexed verifier);
    
    // Modifiers pour la sécurité (appris en cours)
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
    
    // Fonction pour enregistrer une institution
    function registerInstitution(
        string memory name,
        string memory institutionType,
        string memory country,
        string memory adresse,
        string memory website,
        string memory idAgent,
        address agentAddress
    ) external whenNotPaused {
        require(!registeredInstitutions[agentAddress], "Institution already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(idAgent).length > 0, "ID Agent required");
        
        institutions[agentAddress] = Institution({
            name: name,
            institutionType: institutionType,
            country: country,
            adresse: adresse,
            website: website,
            idAgent: idAgent,
            agentAddress: agentAddress,
            isVerified: false,
            registrationDate: block.timestamp
        });
        
        registeredInstitutions[agentAddress] = true;
        
        emit InstitutionRegistered(agentAddress, name);
    }
    
    // Seul le propriétaire peut vérifier une institution
    function verifyInstitution(address institutionAddress) external onlyOwner {
        require(registeredInstitutions[institutionAddress], "Institution not registered");
        institutions[institutionAddress].isVerified = true;
    }
    
    // Fonction pour enregistrer une entreprise
    function registerCompany(
        string memory name,
        string memory sector,
        uint256 dateCreation,
        string memory classificationTaille,
        string memory country,
        string memory adresse,
        string memory courriel,
        string memory telephone,
        string memory website,
        address agentAddress
    ) external whenNotPaused {
        require(!registeredCompanies[agentAddress], "Company already registered");
        require(bytes(name).length > 0, "Name required");
        require(dateCreation > 0, "Date creation required");
        
        companies[agentAddress] = Company({
            name: name,
            sector: sector,
            dateCreation: dateCreation,
            classificationTaille: classificationTaille,
            country: country,
            adresse: adresse,
            courriel: courriel,
            telephone: telephone,
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
    
    // Une institution peut enregistrer un étudiant
    function registerStudent(
        address studentAddress,
        string memory name,
        string memory surname,
        uint256 birthDate,
        string memory sexe,
        string memory nationality,
        string memory statutCivil,
        string memory adresse,
        string memory courriel,
        string memory telephone,
        string memory section,
        string memory sujetPFE,
        address idEntrepriseStage,      // ✅ Maintenant c'est une address (clé étrangère)
        string memory nomPrenomMaitre,
        uint256 internshipStartDate,
        uint256 internshipEndDate
    ) external onlyRegisteredInstitution whenNotPaused {
        require(!registeredStudents[studentAddress], "Student already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(surname).length > 0, "Surname required");
        require(registeredCompanies[idEntrepriseStage], "Enterprise not registered");
        
        students[studentAddress] = Student({
            name: name,
            surname: surname,
            birthDate: birthDate,
            sexe: sexe,
            nationality: nationality,
            statutCivil: statutCivil,
            adresse: adresse,
            courriel: courriel,
            telephone: telephone,
            section: section,
            sujetPFE: sujetPFE,
            idEES: msg.sender,  // ✅ Clé étrangère vers l'établissement qui enregistre
            idEntrepriseStage: idEntrepriseStage,  // ✅ Clé étrangère vers l'entreprise de stage
            nomPrenomMaitre: nomPrenomMaitre,
            internshipStartDate: internshipStartDate,
            internshipEndDate: internshipEndDate,
            evaluation: 0,
            studentAddress: studentAddress,
            registrationDate: block.timestamp,
            hasEvaluation: false
        });
        
        registeredStudents[studentAddress] = true;
        
        emit StudentRegistered(studentAddress, name);
    }
    
    // Une entreprise peut évaluer un étudiant et reçoit des tokens
    function evaluateStudent(
        address studentAddress,
        uint256 evaluation
    ) external onlyRegisteredCompany nonReentrant {
        require(registeredStudents[studentAddress], "Student not registered");
        require(evaluation >= 0 && evaluation <= 20, "Evaluation must be between 0 and 20");
        require(!students[studentAddress].hasEvaluation, "Student already evaluated");
        
        students[studentAddress].evaluation = evaluation;
        students[studentAddress].hasEvaluation = true;
        
        // On récompense l'entreprise avec des tokens
        token.rewardEvaluation(msg.sender);
        
        emit StudentEvaluated(studentAddress, msg.sender, evaluation);
    }
    
    // Une institution peut créer un diplôme NFT
    function createDiploma(
        address studentAddress,
        string memory diplomaName,
        string memory speciality,
        string memory mention,
        uint256 dateObtention,
        string memory ipfsHash,
        string memory tokenURI
    ) external onlyRegisteredInstitution returns (uint256) {
        require(registeredStudents[studentAddress], "Student not registered");
        require(institutions[msg.sender].isVerified, "Institution not verified");
        
        // On crée le NFT diplôme avec toutes les infos du diagramme + clés étrangères
        uint256 diplomaId = diplomaNFT.mintDiploma(
            studentAddress,
            string(abi.encodePacked(students[studentAddress].name, " ", students[studentAddress].surname)),
            diplomaName,
            institutions[msg.sender].name,
            msg.sender,  // idEES - Clé étrangère vers l'établissement émetteur
            institutions[msg.sender].country,  // Pays de l'institution
            speciality,
            mention,
            dateObtention,  // Date d'obtention du diplôme
            ipfsHash,
            tokenURI
        );
        
        diplomaToStudent[diplomaId] = studentAddress;
        studentDiplomas[studentAddress].push(diplomaId);
        
        return diplomaId;
    }
    
    // Fonction pour vérifier un diplôme (coûte des tokens)
    function verifyDiploma(uint256 diplomaId) external nonReentrant returns (bool) {
        require(diplomaNFT.verifyDiploma(diplomaId), "Invalid diploma");
        
        // On fait payer les frais de vérification
        token.payVerificationFee(msg.sender);
        
        emit DiplomaVerified(diplomaId, msg.sender);
        
        return true;
    }
    
    // Fonctions de lecture simples
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
    
    // Fonctions d'admin basiques
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