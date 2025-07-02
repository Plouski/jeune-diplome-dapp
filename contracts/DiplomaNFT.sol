// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DiplomaNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // Compteur pour les IDs des NFT
    Counters.Counter private _tokenIdCounter;
    
    // Structure pour stocker les infos d'un diplôme
    struct DiplomaMetadata {
        string studentName;         // ID_Titulaire
        string institution;         // Nom_Etablissement d'enseignement supérieur
        address idEES;              // ID_EES - Clé étrangère vers l'établissement
        string institutionCountry;  // Pays
        string diplomaName;         // Type_Diplôme
        string speciality;          // Spécialité
        string mention;             // Mention
        uint256 dateObtention;      // Date_d'obtention
        uint256 dateIssued;         // Date de création sur blockchain
        string ipfsHash;            // Hash IPFS pour le document PDF
        bool isValid;               // Si le diplôme est encore valide
    }
    
    // Stockage des données de chaque diplôme
    mapping(uint256 => DiplomaMetadata) public diplomaData;
    
    // Pour vérifier qu'une institution est autorisée
    mapping(address => bool) public verifiedInstitutions;
    
    // Pour éviter les diplômes en double (même hash IPFS)
    mapping(string => bool) public usedDiplomaHashes;
    
    // Adresse du contrat principal qui gère tout
    address public diplomaRegistry;
    
    // Events pour tracer les actions importantes
    event DiplomaMinted(
        uint256 indexed tokenId,
        address indexed student,
        string studentName,
        string diplomaName,
        address indexed institution
    );
    
    event InstitutionVerified(address indexed institution, bool status);
    
    // Seules les institutions vérifiées peuvent créer des diplômes
    modifier onlyVerifiedInstitution() {
        require(diplomaRegistry != address(0), "Registry not set");
        _;
    }
    
    // Seul le registre principal peut appeler certaines fonctions
    modifier onlyDiplomaRegistry() {
        require(msg.sender == diplomaRegistry, "Only diploma registry can call this");
        _;
    }
    
    constructor() ERC721("DiplomaNFT", "DNFT") {
        // On initialise le contrat NFT avec un nom et un symbole
    }
    
    // Configuration de l'adresse du registre principal
    function setDiplomaRegistry(address _diplomaRegistry) external onlyOwner {
        diplomaRegistry = _diplomaRegistry;
    }
    
    // Le propriétaire peut vérifier/déverifier une institution
    function verifyInstitution(address institution, bool status) external onlyOwner {
        verifiedInstitutions[institution] = status;
        emit InstitutionVerified(institution, status);
    }
    
    // Fonction principale pour créer un diplôme NFT
    function mintDiploma(
        address student,
        string memory studentName,
        string memory diplomaName,
        string memory institution,
        address idEES,
        string memory institutionCountry,
        string memory speciality,
        string memory mention,
        uint256 dateObtention,
        string memory ipfsHash,
        string memory tokenUri
    ) external onlyVerifiedInstitution returns (uint256) {
        require(bytes(studentName).length > 0, "Student name required");
        require(bytes(diplomaName).length > 0, "Diploma name required");
        require(bytes(institution).length > 0, "Institution name required");
        require(idEES != address(0), "Institution address required");
        require(dateObtention > 0, "Date obtention required");
        require(!usedDiplomaHashes[ipfsHash], "Diploma already exists");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenUri);
        
        diplomaData[tokenId] = DiplomaMetadata({
            studentName: studentName,
            diplomaName: diplomaName,
            institution: institution,
            idEES: idEES,
            institutionCountry: institutionCountry,
            speciality: speciality,
            mention: mention,
            dateObtention: dateObtention,
            dateIssued: block.timestamp,
            ipfsHash: ipfsHash,
            isValid: true
        });
        
        usedDiplomaHashes[ipfsHash] = true;
        
        emit DiplomaMinted(tokenId, student, studentName, diplomaName, msg.sender);
        
        return tokenId;
    }
    
    // Le propriétaire peut invalider un diplôme
    function invalidateDiploma(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Diploma does not exist");
        diplomaData[tokenId].isValid = false;
    }
    
    // Récupérer toutes les infos d'un diplôme
    function getDiplomaData(uint256 tokenId) external view returns (DiplomaMetadata memory) {
        require(_exists(tokenId), "Diploma does not exist");
        return diplomaData[tokenId];
    }
    
    // Vérifier si un diplôme est valide (fonction utilisée par le registry)
    function verifyDiploma(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return diplomaData[tokenId].isValid;
    }
    
    // Permettre le transfert de diplômes (si l'étudiant veut changer de wallet)
    function transferDiploma(address from, address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized to transfer");
        _transfer(from, to, tokenId);
    }
    
    // Fonction pour avoir le nombre total de diplômes créés
    function getTotalDiplomas() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Fonctions obligatoires à override (à cause des héritages multiples)
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}