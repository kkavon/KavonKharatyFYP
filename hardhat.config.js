
//waffle is used for writing and testing smart contracts
//create secret keys that your application needs to function and keep them from going public
require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

task("accounts", "prints the list of accounts", async (taskArgs, hre) =>{
const accounts = await hre.ethers.getSigners();



for (const account of accounts) {
  console.log(account.address);
}
})

const {API_URL, PRIVATE_KEY} = process.env

module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "goerli",
  networks:{
    hardhat: {},
    goerli: {
      url : API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
      }

  }
};
