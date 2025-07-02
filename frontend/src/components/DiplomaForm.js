"use client";

import React, { useState } from 'react'
import { getContracts } from '../utils/contracts'

const DiplomaForm = () => {
  const [student, setStudent] = useState('')
  const [tokenURI, setTokenURI] = useState('')
  const [loading, setLoading] = useState(false)

  const mintDiploma = async () => {
    try {
      setLoading(true)
      const { diplomaContract } = await getContracts()
      const tx = await diplomaContract.mintDiploma(student, tokenURI)
      await tx.wait()
      alert('Diplôme NFT émis avec succès !')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la création du diplôme.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-3">Créer un Diplôme NFT</h2>
      <input
        type="text"
        placeholder="Adresse de l’étudiant"
        className="border px-2 py-1 w-full mb-2"
        value={student}
        onChange={(e) => setStudent(e.target.value)}
      />
      <input
        type="text"
        placeholder="Lien IPFS (tokenURI)"
        className="border px-2 py-1 w-full mb-2"
        value={tokenURI}
        onChange={(e) => setTokenURI(e.target.value)}
      />
      <button
        onClick={mintDiploma}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Création...' : 'Émettre le diplôme'}
      </button>
    </div>
  )
}

export default DiplomaForm
