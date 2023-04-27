import styled from "styled-components";
import Image from "next/image";
import {ethers} from 'ethers';
import CampaignFactory from '../artifacts/contracts/Campaign.sol/CampaignFactory.json'
import Campaign from '../artifacts/contracts/Campaign.sol/Campaign.json'
import { useEffect, useState } from "react";

// Define the main component of this file, which displays a campaign detail page
export default function Detail({Data, DonationsData}) {
    // Define state variables and their setter functions using the useState hook
  const [mydonations, setMydonations] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState();
  const [change, setChange] = useState(false);

  //ProgressBar component to show the percentage of funds raised
const ProgressBar = ({ percentage }) => {
  return (
    <ProgressBarContainer>
      <ProgressBarFill percentage={percentage} />
      <ProgressText>{percentage.toFixed(2)}%</ProgressText>
    </ProgressBarContainer>
  );
};



// useEffect to fetch campaign data and user's donation data
  useEffect(() => {
    const Request = async () => {
      let descriptionData;
            // Request user's Ethereum account and instantiate a new ethers Web3 provider and signer
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const Web3provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Web3provider.getSigner();
      const Address = await signer.getAddress();
      // Instantiate the contract using the provider and fetch campaign data
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
    
      const contract = new ethers.Contract(
        Data.address,
        Campaign.abi,
        provider
      );
      // Fetch the campaign description from IPFS
      fetch('https://test22.infura-ipfs.io/ipfs/' + Data.descriptionURL)
            .then(res => res.text()).then(data => descriptionData = data);

      // Fetch the user's donations to this campaign
      const MyDonations = contract.filters.donated(Address);
      const MyAllDonations = await contract.queryFilter(MyDonations);

      // Update state variables with fetched data
      setMydonations(MyAllDonations.map((e) => {
        return {
          donar: e.args.donar,
          amount: ethers.utils.formatEther(e.args.amount),
          timestamp : parseInt(e.args.timestamp)
        }
      }));

      setDescription(descriptionData);
    }

    Request();
  }, [change])


  
  const DonateFunds = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(Data.address, Campaign.abi, signer);
  
      const isClosed = await contract.closed();
      if (isClosed) {
        alert('Campaign is closed. Donation not allowed.');
        return;
      }
      // Send the donation transaction
      const transaction = await contract.donate({ value: ethers.utils.parseEther(amount) });
      await transaction.wait();
      alert('Donation successful');
      setChange(true);
      setAmount('');
    } catch (error) {
      console.error("Error:", error);
      if ((error.message.includes("user rejected transaction"))) { // MetaMask error code for user rejection
        alert("MetaMask wallet donation approval was rejected. Please try again.");
      } else if (error.message.includes("insufficient funds")) {
        alert("Insufficient funds in your wallet. Please check your balance and try again.");
      } else if (error.message.includes("Campaign is closed")) {
        alert("The campaign is closed and cannot receive donations.");
      } else if (error.message.includes("Campaign has ended")) {
        alert("Campaign is closed. Donation not allowed.");
        
      } else {
        alert("An error occurred during the donation process: " + error.message);
      }
    }
  };
  



  return (
    <DetailContainer>
      <LeftSection>
        <ImageContainer>
          <Image
                 alt={Data.title}
            width={240}
            height={240}
            src={
              "https://test22.infura-ipfs.io/ipfs/" + Data.image
            }
            
          />
          
        </ImageContainer>
        <DescriptionText>
          {description}
        </DescriptionText>
      
      </LeftSection>
      <RightSection>
        <CampaignTitle>{Data.title}</CampaignTitle>
        <DonateSection>
          <DonationInput value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" step="any" placeholder="Donation Amount" />
          <DonateButton onClick={DonateFunds}>Donate</DonateButton>
        </DonateSection>

        <FundingDetails>
          <FundingData>
            <FundText>Target Amouunt</FundText>
            <FundText>{Data.targetAmount} </FundText>
          </FundingData>
          <FundingData>
            <FundText>Received Amount</FundText>
            <FundText>{Data.currentDonation} </FundText>
          </FundingData>
        </FundingDetails>

         {/* Render the ProgressBar component */}
        <ProgressBar
          // Calculate the percentage by dividing the current donation amount by the target amount, and multiply by 100
         percentage={
         (parseFloat(Data.currentDonation) / parseFloat(Data.targetAmount)) * 100
          }
          />
          
        <DonationsContainer>
          <RecentDonations>
            <DonationTitle>Recent Donations</DonationTitle>
            {DonationsData.map((e) => {
              return (
                <Donation key={e.timestamp}>
                {/* <DonationData>{e.donar.slice(0,6)}...{e.donar.slice(39)}</DonationData>  */}
                <DonationData>{e.amount} Ethereum</DonationData>
                <DonationData>{new Date(e.timestamp * 1000).toLocaleString()}</DonationData>
              </Donation>
              )
            })
            }
          </RecentDonations>
          <UserDonations>
            <DonationTitle>My Donations</DonationTitle>
            {mydonations.map((e) => {
              return (
                <Donation key={e.timestamp}>
                {/* <DonationData>{e.donar.slice(0,6)}...{e.donar.slice(39)}</DonationData> */}
                <DonationData>{e.amount} Ethereum</DonationData>
                <DonationData>{new Date(e.timestamp * 1000).toLocaleString()}</DonationData>
              </Donation>
              )
            })
            }
          </UserDonations>
        </DonationsContainer>
      </RightSection>
    </DetailContainer>
  );
}

// Define getStaticPaths function to generate paths for all campaign detail pages
export async function getStaticPaths() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ADDRESS,
    CampaignFactory.abi,
    provider
  );

  const getAllCampaigns = contract.filters.campaignCreated();
  const AllCampaigns = await contract.queryFilter(getAllCampaigns);
  // Generate the paths for all campaign detail pages
  return {
    paths: AllCampaigns.map((e) => ({
        params: {
          address: e.args.campaignAddress.toString(),
        }
    })),
    fallback: "blocking"
  }
}
// getStaticProps function to fetch campaign and donation data for a specific campaign
export async function getStaticProps(context) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );

  // Fetch campaign data
  const contract = new ethers.Contract(
    context.params.address,
    Campaign.abi,
    provider
  );
  // Fetch all donations to this campaign
  const title = await contract.title();
  const targetAmount = await contract.targetAmount();
  const image = await contract.image();
  const descriptionURL = await contract.description();
  const owner = await contract.owner();
  const currentDonation = await contract.currentDonation();
  const Donations = contract.filters.donated();
  const AllDonations = await contract.queryFilter(Donations);

  // Format campaign and donation data for passing to the component
  const Data = {
      address: context.params.address,
      title, 
      targetAmount: ethers.utils.formatEther(targetAmount), 
      image, 
      currentDonation: ethers.utils.formatEther(currentDonation), 
      descriptionURL, 
      owner,
  }

  const DonationsData =  AllDonations.map((e) => {
    return {
      // donar: e.args.donar,
      amount: ethers.utils.formatEther(e.args.amount),
      timestamp : parseInt(e.args.timestamp)
  }});

  return {
    props: {
      Data,
      DonationsData
    },
    revalidate: 10
  }


}

const DetailContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  padding: 4rem 2rem;
  max-width: 1200px;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImageContainer = styled.div`
  border-radius: 10%;
  overflow: hidden;
  width: 500px;
  height: 310px;
  margin-bottom: 2rem;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

const DescriptionText = styled.p`
  font-size: 1.6rem;
  line-height: 2.4rem;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 4rem;
`;

const CampaignTitle = styled.h1`
  font-size: 3.6rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const DonateSection = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

const DonationInput = styled.input`
  flex: 1;
  padding: 1rem;
  font-size: 1.6rem;
  border: 1px solid #ccc;
  border-right: none;
  border-radius: 5px 0 0 5px;
`;

const DonateButton = styled.button`
  padding: 1rem 2rem;
  background-color: #0080ff;
  color: #fff;
  font-size: 1.6rem;
  font-weight: bold;
  border: none;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
`;

const FundingDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const FundingData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FundText = styled.p`
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
`;

const DonationsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RecentDonations = styled.div`
  width: 50%;
  margin-right: 2rem;
`;

const DonationTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const UserDonations = styled.div`
  width: 50%;
`;

const Donation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const DonationData = styled.p`
  font-size: 1.6rem;
`;


const ProgressBarContainer = styled.div`
background-color: #f3f3f3;
border-radius: 20px;
position: relative;
height: 30px;
width: 100%;
`;

const ProgressBarFill = styled.div`
background-color: #4caf50;
border-radius: 20px;
position: absolute;
height: 100%;
width: ${(props) => props.percentage}%;
`;

const ProgressText = styled.div`
position: absolute;
width: 100%;
text-align: center;
font-weight: bold;
color: black;
`;