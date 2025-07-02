// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DiplomaNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct DiplomaMetadata {
        string studentName;
        string institution;
        address idEES;
        string institutionCountry;
        string diplomaName;
        string speciality;
        string mention;
        uint256 dateObtention;
        uint256 dateIssued;
        string ipfsHash;
        bool isValid;
    }
    
    mapping(uint256 => DiplomaMetadata) public diplomaData;
    mapping(address => bool) public verifiedInstitutions;
    mapping(string => bool) public usedDiplomaHashes;
    
    address public diplomaRegistry;
    
    event DiplomaMinted(
        uint256 indexed tokenId,
        address indexed student,
        string studentName,
        string diplomaName,
        address indexed institution
    );
    
    event InstitutionVerified(address indexed institution, bool status);
    
    modifier onlyVerifiedInstitution() {
        require(diplomaRegistry != address(0), "Registry not set");
        _;
    }
    
    modifier onlyDiplomaRegistry() {
        require(msg.sender == diplomaRegistry, "Only diploma registry can call this");
        _;
    }
    
    constructor() ERC721("DiplomaNFT", "DNFT") {
    }
    
    function setDiplomaRegistry(address _diplomaRegistry) external onlyOwner {
        diplomaRegistry = _diplomaRegistry;
    }
    
    function verifyInstitution(address institution, bool status) external onlyOwner {
        verifiedInstitutions[institution] = status;
        emit InstitutionVerified(institution, status);
    }
    
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
    
    function invalidateDiploma(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Diploma does not exist");
        diplomaData[tokenId].isValid = false;
    }
    
    function getDiplomaData(uint256 tokenId) external view returns (DiplomaMetadata memory) {
        require(_exists(tokenId), "Diploma does not exist");
        return diplomaData[tokenId];
    }
    
    function verifyDiploma(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return diplomaData[tokenId].isValid;
    }
    
    function transferDiploma(address from, address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized to transfer");
        _transfer(from, to, tokenId);
    }
    
    function getTotalDiplomas() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
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
