import React from 'react'
import Navbar from '../components/Navbar'
import BuyTokens from '../components/BuyTokens'
import DiplomaForm from '../components/DiplomaForm'
import VerifyDiploma from '../components/VerifyDiploma'
import EvaluateStudent from '../components/EvaluateStudent'

function App() {
  return (
    <>
      <Navbar />
      <main className="p-6 space-y-6">
        <BuyTokens />
        <DiplomaForm />
        <VerifyDiploma />
        <EvaluateStudent />
      </main>
    </>
  )
}


export default App
