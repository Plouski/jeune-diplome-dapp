import { ethers } from 'ethers'
import diplomaABI from './DiplomaABI.json'
import tokenABI from './TokenABI.json'

const DIPLOMA_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' // adresse du smart contract ERC-721
const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // adresse du smart contract ERC-20

export const getContracts = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const diplomaContract = new ethers.Contract(DIPLOMA_ADDRESS, diplomaABI.abi, signer)
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI.abi, signer)

  return { diplomaContract, tokenContract, signer }
}