"use client";

import React, { useState } from 'react'
import { getContracts } from '../utils/contracts'
import { ethers } from 'ethers'

const EvaluateStudent = () => {
  const [student, setStudent] = useState('')
  const [loading, setLoading] = useState(false)

  const evaluate = async () => {
    try {
      setLoading(true)
      const { tokenContract } = await getContracts()

      // Envoie 15 tokens (ex: avec 18 décimales)
      const amount = ethers.parseUnits('15', 18)
      const tx = await tokenContract.transfer(student, amount)
      await tx.wait()
      alert('Stagiaire évalué et rémunéré.')
    } catch (err) {
      console.error(err)
      alert('Échec de l’évaluation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-3">Évaluer un étudiant</h2>
      <input
        type="text"
        placeholder="Adresse de l’étudiant"
        className="border px-2 py-1 w-full mb-2"
        value={student}
        onChange={(e) => setStudent(e.target.value)}
      />
      <button
        onClick={evaluate}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'En cours...' : 'Rémunérer 15 tokens'}
      </button>
    </div>
  )
}

export default EvaluateStudent
