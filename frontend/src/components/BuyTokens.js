"use client";

import React, { useState } from 'react'
import { getContracts } from '../utils/contracts'
import { ethers } from 'ethers'

const BuyTokens = () => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      const { tokenContract, signer } = await getContracts()
      const value = ethers.parseEther(amount)
      const tx = await signer.sendTransaction({
        to: await tokenContract.getAddress(),
        value,
      })
      await tx.wait()
      alert('Tokens achetés avec succès !')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l’achat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Acheter des tokens</h2>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Montant en ETH"
        className="border px-2 py-1 w-full mb-2"
      />
      <button
        onClick={handleBuy}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Chargement...' : 'Acheter'}
      </button>
    </div>
  )
}

export default BuyTokens
