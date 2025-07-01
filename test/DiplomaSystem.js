const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Système de Diplômes", function () {
    let token, nft, registry;
    let owner, institution, company, student, verifier;
    
    beforeEach(async function () {
        [owner, institution, company, student, verifier] = await ethers.getSigners();
        
        // Déployer les contrats avec Ethers v6
        const JeuneDiplomeToken = await ethers.getContractFactory("JeuneDiplomeToken");
        token = await JeuneDiplomeToken.deploy();
        await token.waitForDeployment();
        
        const DiplomaNFT = await ethers.getContractFactory("DiplomaNFT");
        nft = await DiplomaNFT.deploy();
        await nft.waitForDeployment();
        
        const DiplomaRegistry = await ethers.getContractFactory("DiplomaRegistry");
        registry = await DiplomaRegistry.deploy(await token.getAddress(), await nft.getAddress());
        await registry.waitForDeployment();
        
        // Configuration
        await token.setDiplomaRegistry(await registry.getAddress());
        await nft.setDiplomaRegistry(await registry.getAddress());
    });
    
    describe("Token ERC20", function () {
        it("Devrait permettre d'acheter des tokens", async function () {
            const ethAmount = ethers.parseEther("0.01");
            const expectedTokens = ethers.parseEther("100");
            
            await token.connect(verifier).buyTokens({ value: ethAmount });
            
            expect(await token.balanceOf(verifier.address)).to.equal(expectedTokens);
        });
        
        it("Devrait rejeter un montant ETH invalide", async function () {
            const ethAmount = ethers.parseEther("0.005"); // Montant invalide
            
            await expect(
                token.connect(verifier).buyTokens({ value: ethAmount })
            ).to.be.revertedWith("Invalid ETH amount");
        });
        
        it("Devrait avoir les bonnes constantes", async function () {
            expect(await token.getTokenPrice()).to.equal(ethers.parseEther("0.01"));
            expect(await token.getVerificationFee()).to.equal(ethers.parseEther("10"));
        });
    });
    
    describe("Enregistrement des entités", function () {
        it("Devrait permettre l'enregistrement d'une institution", async function () {
            await registry.connect(institution).registerInstitution(
                "Université Test",
                "Université",
                "France",
                "https://test.edu",
                institution.address
            );
            
            const institutionInfo = await registry.getInstitutionInfo(institution.address);
            expect(institutionInfo.name).to.equal("Université Test");
            expect(institutionInfo.isVerified).to.be.false;
        });
        
        it("Devrait permettre la vérification d'une institution par le owner", async function () {
            await registry.connect(institution).registerInstitution(
                "Université Test",
                "Université",
                "France",
                "https://test.edu",
                institution.address
            );
            
            await registry.connect(owner).verifyInstitution(institution.address);
            
            const institutionInfo = await registry.getInstitutionInfo(institution.address);
            expect(institutionInfo.isVerified).to.be.true;
        });
        
        it("Devrait permettre l'enregistrement d'une entreprise", async function () {
            await registry.connect(company).registerCompany(
                "Entreprise Test",
                "Tech",
                "France",
                "https://company.com",
                company.address
            );
            
            const companyInfo = await registry.getCompanyInfo(company.address);
            expect(companyInfo.name).to.equal("Entreprise Test");
        });
        
        it("Devrait rejeter l'enregistrement d'institution en double", async function () {
            await registry.connect(institution).registerInstitution(
                "Université Test",
                "Université",
                "France",
                "https://test.edu",
                institution.address
            );
            
            await expect(
                registry.connect(institution).registerInstitution(
                    "Université Test 2",
                    "Université",
                    "France",
                    "https://test2.edu",
                    institution.address
                )
            ).to.be.revertedWith("Institution already registered");
        });
    });
    
    describe("Gestion des étudiants", function () {
        beforeEach(async function () {
            // Enregistrer et vérifier une institution
            await registry.connect(institution).registerInstitution(
                "Université Test",
                "Université",
                "France",
                "https://test.edu",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
        });
        
        it("Devrait permettre l'enregistrement d'un étudiant par une institution vérifiée", async function () {
            await registry.connect(institution).registerStudent(
                student.address,
                "Jean",
                "Dupont",
                946684800, // 01/01/2000
                "Française",
                "jean.dupont@email.com",
                "Entreprise Test",
                1672531200, // 01/01/2023
                1680307200  // 01/04/2023
            );
            
            const studentInfo = await registry.getStudentInfo(student.address);
            expect(studentInfo.name).to.equal("Jean");
            expect(studentInfo.surname).to.equal("Dupont");
        });
        
        it("Devrait rejeter l'enregistrement par institution non vérifiée", async function () {
            // Enregistrer une institution mais ne pas la vérifier
            await registry.connect(verifier).registerInstitution(
                "Université Non Vérifiée",
                "Université",
                "France",
                "https://fake.edu",
                verifier.address
            );
            
            await expect(
                registry.connect(verifier).registerStudent(
                    student.address,
                    "Jean",
                    "Dupont",
                    946684800,
                    "Française",
                    "jean.dupont@email.com",
                    "Entreprise Test",
                    1672531200,
                    1680307200
                )
            ).to.be.revertedWith("Institution not verified");
        });
    });
    
    describe("Évaluation des étudiants", function () {
        beforeEach(async function () {
            // Setup complet
            await registry.connect(institution).registerInstitution(
                "Université Test",
                "Université",
                "France",
                "https://test.edu",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            await registry.connect(company).registerCompany(
                "Entreprise Test",
                "Tech",
                "France",
                "https://company.com",
                company.address
            );
            await registry.connect(owner).verifyCompany(company.address);
            
            await registry.connect(institution).registerStudent(
                student.address,
                "Jean",
                "Dupont",
                946684800,
                "Française",
                "jean.dupont@email.com",
                "Entreprise Test",
                1672531200,
                1680307200
            );
        });
        
        it("Devrait permettre l'évaluation d'un étudiant", async function () {
            const evaluation = 15;
            
            await registry.connect(company).evaluateStudent(student.address, evaluation);
            
            const studentInfo = await registry.getStudentInfo(student.address);
            expect(studentInfo.evaluation).to.equal(evaluation);
            expect(studentInfo.hasEvaluation).to.be.true;
            
            // Vérifier que l'entreprise a reçu des tokens
            expect(await token.balanceOf(company.address)).to.equal(ethers.parseEther("15"));
        });
        
        it("Devrait rejeter une évaluation invalide", async function () {
            await expect(
                registry.connect(company).evaluateStudent(student.address, 25) // > 20
            ).to.be.revertedWith("Evaluation must be between 0 and 20");
        });
        
        it("Devrait rejeter une double évaluation", async function () {
            await registry.connect(company).evaluateStudent(student.address, 15);
            
            await expect(
                registry.connect(company).evaluateStudent(student.address, 18)
            ).to.be.revertedWith("Student already evaluated");
        });
    });
    
    describe("Création et vérification de diplômes", function () {
        beforeEach(async function () {
            // Setup complet
            await registry.connect(institution).registerInstitution(
                "Université Test",
                "Université", 
                "France",
                "https://test.edu",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            await registry.connect(institution).registerStudent(
                student.address,
                "Jean",
                "Dupont",
                946684800,
                "Française",
                "jean.dupont@email.com", 
                "Entreprise Test",
                1672531200,
                1680307200
            );
        });
        
        it("Devrait permettre la création d'un diplôme NFT", async function () {
            const tx = await registry.connect(institution).createDiploma(
                student.address,
                "Master Informatique",
                "Intelligence Artificielle",
                "Très Bien",
                "QmTestIPFSHash123",
                "https://ipfs.io/ipfs/QmTestTokenURI"
            );
            
            // Récupérer l'ID du diplôme depuis les events
            const receipt = await tx.wait();
            const diplomaId = 0; // Premier NFT créé
            
            expect(await nft.ownerOf(diplomaId)).to.equal(student.address);
            
            const diplomaData = await nft.getDiplomaData(diplomaId);
            expect(diplomaData.diplomaName).to.equal("Master Informatique");
            expect(diplomaData.isValid).to.be.true;
        });
        
        it("Devrait permettre la vérification d'un diplôme", async function () {
            // Donner des tokens au vérifieur
            await token.connect(verifier).buyTokens({ value: ethers.parseEther("0.01") });
            
            // Créer un diplôme
            await registry.connect(institution).createDiploma(
                student.address,
                "Master Informatique",
                "IA",
                "Bien",
                "QmTestIPFSHash456",
                "https://ipfs.io/ipfs/QmTestTokenURI2"
            );
            
            const diplomaId = 0; // Premier diplôme
            
            // Vérifier le diplôme
            await registry.connect(verifier).verifyDiploma(diplomaId);
            
            // Vérifier que les frais ont été payés
            expect(await token.balanceOf(verifier.address)).to.equal(ethers.parseEther("90")); // 100 - 10
        });
        
        it("Devrait rejeter la vérification avec solde insuffisant", async function () {
            // Créer un diplôme
            await registry.connect(institution).createDiploma(
                student.address,
                "Master Informatique",
                "IA",
                "Bien",
                "QmTestIPFSHash789",
                "https://ipfs.io/ipfs/QmTestTokenURI3"
            );
            
            const diplomaId = 0;
            
            // Essayer de vérifier sans tokens
            await expect(
                registry.connect(verifier).verifyDiploma(diplomaId)
            ).to.be.revertedWith("Insufficient balance");
        });
        
        it("Devrait rejeter la création de diplôme en double", async function () {
            await registry.connect(institution).createDiploma(
                student.address,
                "Master Informatique",
                "IA",
                "Bien",
                "QmTestIPFSHash999",
                "https://ipfs.io/ipfs/QmTestTokenURI4"
            );
            
            await expect(
                registry.connect(institution).createDiploma(
                    student.address,
                    "Master Informatique 2",
                    "IA",
                    "Très Bien",
                    "QmTestIPFSHash999", // Même hash IPFS
                    "https://ipfs.io/ipfs/QmTestTokenURI5"
                )
            ).to.be.revertedWith("Diploma already exists");
        });
    });
    
    describe("Tests d'intégration", function () {
        it("Devrait gérer un workflow complet", async function () {
            // 1. Enregistrer une institution
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École",
                "France",
                "https://ynov.com",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            // 2. Enregistrer une entreprise
            await registry.connect(company).registerCompany(
                "TechCorp",
                "Développement",
                "France",
                "https://techcorp.com",
                company.address
            );
            await registry.connect(owner).verifyCompany(company.address);
            
            // 3. Enregistrer un étudiant
            await registry.connect(institution).registerStudent(
                student.address,
                "Alice",
                "Martin",
                978307200, // 01/01/2001
                "Française",
                "alice.martin@email.com",
                "TechCorp",
                1672531200,
                1680307200
            );
            
            // 4. L'entreprise évalue l'étudiant
            await registry.connect(company).evaluateStudent(student.address, 18);
            
            // 5. L'institution crée le diplôme
            await registry.connect(institution).createDiploma(
                student.address,
                "Master DevOps",
                "Cloud & Infrastructure",
                "Très Bien",
                "QmMasterDevOpsHash",
                "https://ipfs.io/ipfs/QmMasterDevOpsURI"
            );
            
            // 6. Un recruteur achète des tokens
            await token.connect(verifier).buyTokens({ value: ethers.parseEther("0.05") }); // 500 tokens
            
            // 7. Le recruteur vérifie le diplôme
            const diplomaId = 0;
            await registry.connect(verifier).verifyDiploma(diplomaId);
            
            // Vérifications finales
            const studentInfo = await registry.getStudentInfo(student.address);
            expect(studentInfo.hasEvaluation).to.be.true;
            expect(studentInfo.evaluation).to.equal(18);
            
            expect(await token.balanceOf(company.address)).to.equal(ethers.parseEther("15")); // Récompense
            expect(await token.balanceOf(verifier.address)).to.equal(ethers.parseEther("490")); // 500 - 10
            
            expect(await nft.ownerOf(diplomaId)).to.equal(student.address);
            expect(await nft.verifyDiploma(diplomaId)).to.be.true;
        });
    });
    
    describe("Tests de sécurité", function () {
        it("Devrait rejeter les appels non autorisés", async function () {
            await expect(
                registry.connect(student).verifyInstitution(institution.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("Devrait empêcher la pause non autorisée", async function () {
            await expect(
                registry.connect(student).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("Devrait gérer correctement la pause", async function () {
            await registry.connect(owner).pause();
            
            await expect(
                registry.connect(institution).registerInstitution(
                    "Test",
                    "Test",
                    "Test",
                    "Test",
                    institution.address
                )
            ).to.be.revertedWith("Pausable: paused");
        });
    });
});