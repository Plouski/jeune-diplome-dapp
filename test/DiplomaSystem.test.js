const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🎓 Système de Diplômes Blockchain", function () {
    let token, nft, registry;
    let owner, institution, company, student, verifier;
    
    beforeEach(async function () {
        // Récupérer les signataires
        [owner, institution, company, student, verifier] = await ethers.getSigners();
        
        // Déployer le token ERC20
        const JeuneDiplomeToken = await ethers.getContractFactory("JeuneDiplomeToken");
        token = await JeuneDiplomeToken.deploy();
        await token.waitForDeployment();
        
        // Déployer le NFT
        const DiplomaNFT = await ethers.getContractFactory("DiplomaNFT");
        nft = await DiplomaNFT.deploy();
        await nft.waitForDeployment();
        
        // Déployer le registre principal
        const DiplomaRegistry = await ethers.getContractFactory("DiplomaRegistry");
        registry = await DiplomaRegistry.deploy(await token.getAddress(), await nft.getAddress());
        await registry.waitForDeployment();
        
        // Configuration des liens entre contrats
        await token.setDiplomaRegistry(await registry.getAddress());
        await nft.setDiplomaRegistry(await registry.getAddress());
    });
    
    describe("💰 Token ERC20", function () {
        it("✅ Devrait permettre d'acheter des tokens", async function () {
            const ethAmount = ethers.parseEther("0.01");
            const expectedTokens = ethers.parseEther("100");
            
            await token.connect(verifier).buyTokens({ value: ethAmount });
            
            expect(await token.balanceOf(verifier.address)).to.equal(expectedTokens);
        });
        
        it("❌ Devrait rejeter un montant ETH invalide", async function () {
            const invalidAmount = ethers.parseEther("0.005");
            
            await expect(
                token.connect(verifier).buyTokens({ value: invalidAmount })
            ).to.be.revertedWith("Invalid ETH amount");
        });
        
        it("📊 Devrait avoir les bonnes constantes", async function () {
            expect(await token.getTokenPrice()).to.equal(ethers.parseEther("0.01"));
            expect(await token.getVerificationFee()).to.equal(ethers.parseEther("10"));
        });
    });
    
    describe("🏛️ Gestion des Institutions", function () {
        it("✅ Devrait enregistrer une institution", async function () {
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École Supérieure",
                "France",
                "https://ynov.com",
                institution.address
            );
            
            const info = await registry.getInstitutionInfo(institution.address);
            expect(info.name).to.equal("YNOV Campus");
            expect(info.isVerified).to.be.false;
        });
        
        it("🔐 Devrait permettre la vérification par le owner", async function () {
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École Supérieure",
                "France",
                "https://ynov.com",
                institution.address
            );
            
            await registry.connect(owner).verifyInstitution(institution.address);
            
            const info = await registry.getInstitutionInfo(institution.address);
            expect(info.isVerified).to.be.true;
        });
        
        it("❌ Devrait rejeter les doublons", async function () {
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École",
                "France",
                "https://ynov.com",
                institution.address
            );
            
            await expect(
                registry.connect(institution).registerInstitution(
                    "YNOV Campus 2",
                    "École",
                    "France",
                    "https://ynov2.com",
                    institution.address
                )
            ).to.be.revertedWith("Institution already registered");
        });
    });
    
    describe("🏢 Gestion des Entreprises", function () {
        it("✅ Devrait enregistrer une entreprise", async function () {
            await registry.connect(company).registerCompany(
                "TechCorp",
                "Développement Web",
                "France",
                "https://techcorp.com",
                company.address
            );
            
            const info = await registry.getCompanyInfo(company.address);
            expect(info.name).to.equal("TechCorp");
            expect(info.isVerified).to.be.false;
        });
        
        it("🔐 Devrait permettre la vérification", async function () {
            await registry.connect(company).registerCompany(
                "TechCorp",
                "Tech",
                "France",
                "https://techcorp.com",
                company.address
            );
            
            await registry.connect(owner).verifyCompany(company.address);
            
            const info = await registry.getCompanyInfo(company.address);
            expect(info.isVerified).to.be.true;
        });
    });
    
    describe("🎓 Gestion des Étudiants", function () {
        beforeEach(async function () {
            // Setup institution vérifiée
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École",
                "France",
                "https://ynov.com",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
        });
        
        it("✅ Devrait enregistrer un étudiant", async function () {
            await registry.connect(institution).registerStudent(
                student.address,
                "Alice",
                "Martin",
                978307200, // 01/01/2001
                "Française",
                "alice.martin@ynov.com",
                "TechCorp",
                1672531200, // Début stage
                1680307200  // Fin stage
            );
            
            const info = await registry.getStudentInfo(student.address);
            expect(info.name).to.equal("Alice");
            expect(info.surname).to.equal("Martin");
        });
        
        it("❌ Devrait rejeter si institution non vérifiée", async function () {
            // Institution non vérifiée
            await registry.connect(verifier).registerInstitution(
                "Fake University",
                "Université",
                "Nowhere",
                "https://fake.edu",
                verifier.address
            );
            
            await expect(
                registry.connect(verifier).registerStudent(
                    student.address,
                    "John",
                    "Doe",
                    946684800,
                    "Unknown",
                    "john@fake.edu",
                    "No Company",
                    1672531200,
                    1680307200
                )
            ).to.be.revertedWith("Institution not verified");
        });
    });
    
    describe("⭐ Évaluation des Étudiants", function () {
        beforeEach(async function () {
            // Setup complet
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École",
                "France",
                "https://ynov.com",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            await registry.connect(company).registerCompany(
                "TechCorp",
                "Tech",
                "France",
                "https://techcorp.com",
                company.address
            );
            await registry.connect(owner).verifyCompany(company.address);
            
            await registry.connect(institution).registerStudent(
                student.address,
                "Alice",
                "Martin",
                978307200,
                "Française",
                "alice@ynov.com",
                "TechCorp",
                1672531200,
                1680307200
            );
        });
        
        it("✅ Devrait permettre l'évaluation", async function () {
            await registry.connect(company).evaluateStudent(student.address, 18);
            
            const info = await registry.getStudentInfo(student.address);
            expect(info.evaluation).to.equal(18);
            expect(info.hasEvaluation).to.be.true;
            
            // Vérifier la récompense en tokens
            expect(await token.balanceOf(company.address)).to.equal(ethers.parseEther("15"));
        });
        
        it("❌ Devrait rejeter une note invalide", async function () {
            await expect(
                registry.connect(company).evaluateStudent(student.address, 25)
            ).to.be.revertedWith("Evaluation must be between 0 and 20");
        });
        
        it("❌ Devrait rejeter une double évaluation", async function () {
            await registry.connect(company).evaluateStudent(student.address, 15);
            
            await expect(
                registry.connect(company).evaluateStudent(student.address, 18)
            ).to.be.revertedWith("Student already evaluated");
        });
    });
    
    describe("🎨 Création de Diplômes NFT", function () {
        beforeEach(async function () {
            // Setup institution + étudiant
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École",
                "France",
                "https://ynov.com",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            await registry.connect(institution).registerStudent(
                student.address,
                "Alice",
                "Martin",
                978307200,
                "Française",
                "alice@ynov.com",
                "TechCorp",
                1672531200,
                1680307200
            );
        });
        
        it("✅ Devrait créer un diplôme NFT", async function () {
            await registry.connect(institution).createDiploma(
                student.address,
                "Master DevOps",
                "Cloud & Infrastructure",
                "Très Bien",
                "QmMasterDevOpsIPFS",
                "https://ipfs.io/ipfs/QmMasterDevOps"
            );
            
            const diplomaId = 0; // Premier NFT
            expect(await nft.ownerOf(diplomaId)).to.equal(student.address);
            
            const data = await nft.getDiplomaData(diplomaId);
            expect(data.diplomaName).to.equal("Master DevOps");
            expect(data.isValid).to.be.true;
        });
        
        it("❌ Devrait rejeter les doublons IPFS", async function () {
            await registry.connect(institution).createDiploma(
                student.address,
                "Master DevOps",
                "Cloud",
                "Bien",
                "QmSameHash",
                "https://ipfs.io/ipfs/QmSame1"
            );
            
            await expect(
                registry.connect(institution).createDiploma(
                    student.address,
                    "Master DevOps 2",
                    "Cloud",
                    "Très Bien",
                    "QmSameHash", // Même hash
                    "https://ipfs.io/ipfs/QmSame2"
                )
            ).to.be.revertedWith("Diploma already exists");
        });
    });
    
    describe("🔍 Vérification de Diplômes", function () {
        beforeEach(async function () {
            // Setup + création diplôme
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École",
                "France",
                "https://ynov.com",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            await registry.connect(institution).registerStudent(
                student.address,
                "Alice",
                "Martin",
                978307200,
                "Française",
                "alice@ynov.com",
                "TechCorp",
                1672531200,
                1680307200
            );
            
            await registry.connect(institution).createDiploma(
                student.address,
                "Master DevOps",
                "Cloud",
                "Très Bien",
                "QmMasterHash",
                "https://ipfs.io/ipfs/QmMaster"
            );
        });
        
        it("✅ Devrait vérifier un diplôme", async function () {
            // Acheter des tokens
            await token.connect(verifier).buyTokens({ value: ethers.parseEther("0.01") });
            
            // Vérifier le diplôme
            await registry.connect(verifier).verifyDiploma(0);
            
            // Vérifier les frais payés
            expect(await token.balanceOf(verifier.address)).to.equal(ethers.parseEther("90"));
        });
        
        it("❌ Devrait rejeter si solde insuffisant", async function () {
            await expect(
                registry.connect(verifier).verifyDiploma(0)
            ).to.be.revertedWith("Insufficient balance");
        });
    });
    
    describe("🚀 Workflow Complet", function () {
        it("✅ Devrait gérer un scénario complet", async function () {
            // 1. Institution s'enregistre
            await registry.connect(institution).registerInstitution(
                "YNOV Campus",
                "École Supérieure",
                "France",
                "https://ynov.com",
                institution.address
            );
            await registry.connect(owner).verifyInstitution(institution.address);
            
            // 2. Entreprise s'enregistre
            await registry.connect(company).registerCompany(
                "TechCorp",
                "Développement",
                "France",
                "https://techcorp.com",
                company.address
            );
            await registry.connect(owner).verifyCompany(company.address);
            
            // 3. Étudiant s'inscrit
            await registry.connect(institution).registerStudent(
                student.address,
                "Alice",
                "Martin",
                978307200,
                "Française",
                "alice.martin@ynov.com",
                "TechCorp",
                1672531200,
                1680307200
            );
            
            // 4. Entreprise évalue l'étudiant
            await registry.connect(company).evaluateStudent(student.address, 18);
            
            // 5. Institution crée le diplôme
            await registry.connect(institution).createDiploma(
                student.address,
                "Master DevOps",
                "Cloud & Infrastructure",
                "Très Bien",
                "QmAliceMaster",
                "https://ipfs.io/ipfs/QmAlice"
            );
            
            // 6. Recruteur achète des tokens
            await token.connect(verifier).buyTokens({ value: ethers.parseEther("0.05") });
            
            // 7. Recruteur vérifie le diplôme
            await registry.connect(verifier).verifyDiploma(0);
            
            // ✅ Vérifications finales
            const studentInfo = await registry.getStudentInfo(student.address);
            expect(studentInfo.hasEvaluation).to.be.true;
            expect(studentInfo.evaluation).to.equal(18);
            
            expect(await token.balanceOf(company.address)).to.equal(ethers.parseEther("15"));
            expect(await token.balanceOf(verifier.address)).to.equal(ethers.parseEther("490"));
            expect(await nft.ownerOf(0)).to.equal(student.address);
            
            console.log("🎉 Workflow complet réussi !");
        });
    });
    
    describe("🛡️ Sécurité", function () {
        it("❌ Devrait rejeter les appels non autorisés", async function () {
            await expect(
                registry.connect(student).verifyInstitution(institution.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("⏸️ Devrait gérer la pause", async function () {
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