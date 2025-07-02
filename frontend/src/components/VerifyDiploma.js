"use client";

import React, { useState } from 'react'
import { getContracts } from '../utils/contracts'

const VerifyDiploma = () => {
  const [tokenId, setTokenId] = useState('')
  const [uri, setUri] = useState(null)
  const [loading, setLoading] = useState(false)

  const verify = async () => {
    try {
      setLoading(true)
      const { diplomaContract } = await getContracts()
      const result = await diplomaContract.tokenURI(tokenId)
      setUri(result)
    } catch (err) {
      console.error(err)
      alert('Diplôme non trouvé.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-3">Vérifier un Diplôme</h2>
      <input
        type="text"
        placeholder="ID du NFT"
        className="border px-2 py-1 w-full mb-2"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <button
        onClick={verify}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Recherche...' : 'Vérifier'}
      </button>

      {uri && (
        <div className="mt-3 text-sm">
          <p className="font-semibold">URI :</p>
          <a href={uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {uri}
          </a>
        </div>
      )}
    </div>
  )
}

export default VerifyDiploma
