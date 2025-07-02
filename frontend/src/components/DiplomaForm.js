"use client";

import React, { useState } from "react";
import { getContracts } from "../utils/contracts";

const DiplomaForm = () => {
  const [student, setStudent] = useState("");
  const [studentName, setStudentName] = useState("");
  const [diplomaName, setDiplomaName] = useState("");
  const [institution, setInstitution] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [institutionCountry, setInstitutionCountry] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [mention, setMention] = useState("");
  const [dateObtention, setDateObtention] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [tokenURI, setTokenURI] = useState("");
  const [loading, setLoading] = useState(false);

  const mintDiploma = async () => {
    try {
      setLoading(true);
      const { diplomaContract } = await getContracts();

      const timestamp = Math.floor(new Date(dateObtention).getTime() / 1000);

      const tx = await diplomaContract.mintDiploma(
        student,
        studentName,
        diplomaName,
        institution,
        institutionAddress,
        institutionCountry,
        speciality,
        mention,
        timestamp,
        ipfsHash,
        tokenURI
      );

      await tx.wait();
      alert("Diplôme NFT émis avec succès !");
      console.log(tx)
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du diplôme.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6 space-y-2">
      <h2 className="text-lg font-semibold mb-3">Créer un Diplôme NFT</h2>

      <input placeholder="Adresse de l’étudiant" value={student} onChange={(e) => setStudent(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Nom de l’étudiant" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Nom du diplôme" value={diplomaName} onChange={(e) => setDiplomaName(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Nom de l'institution" value={institution} onChange={(e) => setInstitution(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Adresse de l'institution (Ethereum)" value={institutionAddress} onChange={(e) => setInstitutionAddress(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Pays de l'institution" value={institutionCountry} onChange={(e) => setInstitutionCountry(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Spécialité" value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Mention" value={mention} onChange={(e) => setMention(e.target.value)} className="border px-2 py-1 w-full" />
      <input type="date" placeholder="Date d'obtention" value={dateObtention} onChange={(e) => setDateObtention(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Hash IPFS" value={ipfsHash} onChange={(e) => setIpfsHash(e.target.value)} className="border px-2 py-1 w-full" />
      <input placeholder="Lien IPFS complet (tokenURI)" value={tokenURI} onChange={(e) => setTokenURI(e.target.value)} className="border px-2 py-1 w-full" />

      <button onClick={mintDiploma} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded w-full">
        {loading ? "Création..." : "Émettre le diplôme"}
      </button>
    </div>
  );
};

export default DiplomaForm;
