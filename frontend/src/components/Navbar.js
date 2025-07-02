"use client";

import React, { useEffect, useState } from 'react'

const Navbar = () => {
  const [account, setAccount] = useState(null)

  const connectWallet = async () => {
    if (window.ethereum) {
      const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(address)
    } else {
      alert('MetaMask non détecté.')
    }
  }

  useEffect(() => {
    connectWallet()
  }, [])

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <span className="font-bold">🎓 Jeune Diplômé DApp</span>
      <button onClick={connectWallet} className="bg-white text-black px-3 py-1 rounded">
        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
      </button>
    </nav>
  )
}

export default Navbar
