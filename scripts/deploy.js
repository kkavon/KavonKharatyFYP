// Import the ethers library from Hardhat, which provides a set of APIs for interacting with the Ethereum network.
const { ethers } = require("hardhat");

async function main(){
    // Load our smart contract 
    const CampaignFcatory = await ethers.getContractFactory("CampaignFactory");

    // Deploy an instance of the CampaignFactory contract
    const campaignFactory = await CampaignFcatory.deploy();

    // Log the address of the deployed contract to the console
    console.log("Contract deployed to address : " + campaignFactory.address);
}

// Call the main function and exit the process on success
main()
    .then(() => process.exit(0))
    // Log any errors and exit the process with an error code
    .catch(error => {
        console.log(error);
        process.exit(1);

    });
