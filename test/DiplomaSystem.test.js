const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DApp Jeune Diplômé - Tests MVP", function () {
    let token, nft, registry;
    let owner, institution, company, student, verifier;
    
    beforeEach(async function () {
        [owner, institution, company, student, verifier] = await ethers.getSigners();
        
        // Déploiement des contrats
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
    
    describe("Tests de base", function () {
        it("Peut acheter des tokens", async function () {
            await token.connect(verifier).buyTokens({ value: ethers.parseEther("0.01") });
            const balance = await token.balanceOf(verifier.address);
            expect(balance).to.equal(ethers.parseEther("100"));
        });
        
        it("Peut enregistrer une institution", async function () {
            await registry.connect(institution).registerInstitution(
                "YNOV Campus", "Université", "France", "123 rue", 
                "https://ynov.com", "AGENT01", institution.address
            );
            
            const info = await registry.getInstitutionInfo(institution.address);
            expect(info.name).to.equal("YNOV Campus");
        });
        
        it("Peut enregistrer une entreprise", async function () {
            await registry.connect(company).registerCompany(
                "TechCorp", "IT", 1577836800, "PME", "France",
                "456 avenue", "contact@tech.com", "0123456789",
                "https://techcorp.com", company.address
            );
            
            const info = await registry.getCompanyInfo(company.address);
            expect(info.name).to.equal("TechCorp");
        });
    });
    
    describe("Test du scénario principal", function () {
        it("Scénario Emilie Dupont", async function () {
            // Setup institution
            await registry.connect(institution).registerInstitution(
                "YNOV Campus", "Université", "France", "123 rue",
                "https://ynov.com", "AGENT01", institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            // Setup entreprise
            await registry.connect(company).registerCompany(
                "TechCorp", "IT", 1577836800, "PME", "France",
                "456 avenue", "contact@tech.com", "0123456789", 
                "https://techcorp.com", company.address
            );
            await registry.connect(owner).verifyCompany(company.address);
            
            // 1. Créer le profil de l'étudiante Emilie
            await registry.connect(institution).registerStudent(
                student.address,
                "Emilie",
                "Dupont",
                946684800, // 01/01/2000
                "Féminin",
                "Française", 
                "Célibataire",
                "789 boulevard",
                "emilie.dupont@email.com",
                "0987654321",
                "Informatique",
                "Développement web blockchain",
                company.address, // Entreprise de stage
                "Marie Martin",
                1672531200, // Date début stage
                1680307200  // Date fin stage
            );
            
            // 2. Créer son diplôme d'ingénieur informatique
            const dateObtention = 1688169600; // 01/07/2023
            await registry.connect(institution).createDiploma(
                student.address,
                "Diplôme d'ingénieur en informatique",
                "Informatique",
                "Bien",
                dateObtention,
                "QmEmilieDiploma",
                "https://ipfs.io/ipfs/QmEmilie"
            );
            
            // 3. Evaluer l'étudiante
            await registry.connect(company).evaluateStudent(student.address, 16);
            
            // 4. Vérifier le diplôme
            await token.connect(verifier).buyTokens({ value: ethers.parseEther("0.01") });
            await registry.connect(verifier).verifyDiploma(0);
            
            // Vérifications simples
            const studentInfo = await registry.getStudentInfo(student.address);
            expect(studentInfo.name).to.equal("Emilie");
            expect(studentInfo.surname).to.equal("Dupont");
            expect(studentInfo.evaluation).to.equal(16);
            
            const companyBalance = await token.balanceOf(company.address);
            expect(companyBalance).to.equal(ethers.parseEther("15"));
            
            const verifierBalance = await token.balanceOf(verifier.address);
            expect(verifierBalance).to.equal(ethers.parseEther("90"));
            
            expect(await nft.ownerOf(0)).to.equal(student.address);
        });
    });
    
    describe("Tests d'erreur basiques", function () {
        it("Rejette montant ETH invalide", async function () {
            await expect(
                token.connect(verifier).buyTokens({ value: ethers.parseEther("0.005") })
            ).to.be.revertedWith("Invalid ETH amount");
        });
        
        it("Seul owner peut vérifier institution", async function () {
            await registry.connect(institution).registerInstitution(
                "Test", "Test", "Test", "Test", "https://test.com", "TEST", institution.address
            );
            
            await expect(
                registry.connect(student).verifyInstitution(institution.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});