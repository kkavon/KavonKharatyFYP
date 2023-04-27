import Web3 from "web3"

const provider = () => {
  // If the user has MetaMask:
  if (typeof Web3 !== 'undefined') {
    return Web3.currentProvider
  } else {
    console.error("Please install MetaMask for this web app to work!")
  }
}

export const eth = new Web3(provider()).eth