// Import necessary modules and components
import styled from 'styled-components';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PaidIcon from '@mui/icons-material/Paid';
import EventIcon from '@mui/icons-material/Event';
import Image from 'next/image';
import { ethers } from 'ethers';
import CampaignFactory from '../artifacts/contracts/Campaign.sol/CampaignFactory.json'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Chart } from 'chart.js/auto'
import Campaign from '../artifacts/contracts/Campaign.sol/Campaign.json'

// Main Dashboard component
export default function UserPr() {
  const [campaignsData, setCampaignsData] = useState([]);

 // Function to handle withdrawal of funds from a campaign
const handleWithdrawFunds = async (campaignAddress) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    campaignAddress,
    Campaign.abi,
    signer
  );
  try {
    // Call the 'withdraw' function from the contract and await its completion
    const tx = await contract.withdraw();
    // Wait for the transaction to be mined
    await tx.wait();
    alert("Funds successfully withdrawn from the campaign!");
  } catch (error) {
    if (error.message.includes("No funds available to withdraw")) {
      alert("No funds available to withdraw. Try promoting your campaign");
    } else {
      alert("Failed to withdraw funds from the campaign: " + error.message);
    }
  }
};
  // Ethereum price chart component
  const EthereumPriceChart = () => {
    const [priceData, setPriceData] = useState(null);
    const [chart, setChart] = useState(null);

    // Fetch Ethereum price data from CoinGecko API
    useEffect(() => {
      const fetchPriceData = async () => {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=eur&days=30');
        const data = await response.json();
        setPriceData(data.prices);
      }
      fetchPriceData();
    }, []);

    // Initialise and update the chart when priceData is updated
    useEffect(() => {
      if (priceData) {
        const chartData = {
          labels: priceData.map(data => new Date(data[0]).toLocaleDateString()),
          datasets: [{
            label: 'Ethereum Price (EUR)',
            data: priceData.map(data => data[1]),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };

        const ctx = document.getElementById('ethereum-price-chart');
        if (chart) {
          chart.destroy();
        }
        setChart(new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  unit: 'hour'
                }
              }]
            }
          }
        }));
      }
    }, [priceData]);

    // Render the chart container
    return (
      <ChartContainer>
        <canvas id="ethereum-price-chart"></canvas>
      </ChartContainer>
    );
  };

  // Fetch all campaigns for the connected user
  useEffect(() => {
    const Request = async () => {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const Web3provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Web3provider.getSigner();
      const Address = await signer.getAddress();

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
  
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ADDRESS,
        CampaignFactory.abi,
        provider
      );
  
      const getAllCampaigns = contract.filters.campaignCreated(null, null, Address);
      const AllCampaigns = await contract.queryFilter(getAllCampaigns);
      const AllData = AllCampaigns.map((e) => {
        const deadlineDate = new Date(parseInt(e.args.deadline) * 1000);
      return {
        title: e.args.title,
        image: e.args.imageURI,
        owner: e.args.owner,
        timeStamp: parseInt(e.args.timestamp),
        deadline: deadlineDate.toLocaleDateString(),
        amount: ethers.utils.formatEther(e.args.targetAmount),
        address: e.args.campaignAddress
      }
      })  
      setCampaignsData(AllData)
    }
    Request();
  }, [])

  return (
    
    <HomeContainer>
      
      <EthereumPriceChart/>
      <CardsContainer>

      {campaignsData.map((e) => {
        return (
          
          <Card key={e.title}>
            
          <CardImg>
            <Image 
              alt={e.title}
              
              width={120}
              height={120}
              src={"https://test22.infura-ipfs.io/ipfs/" + e.image} 
            />
          </CardImg>
          <Title>
            {e.title}
          </Title>
          <CampaignCardInfo>
          <Text>Owner</Text><AccountBoxIcon/>  
            <Text>{e.owner.slice(0,6)}...{e.owner.slice(39)}</Text>
          </CampaignCardInfo>
          <CampaignCardInfo>
          <Text>Target</Text><PaidIcon/>
            <Text>{e.amount} Ethereum</Text>
          </CampaignCardInfo>
          <CampaignCardInfo>
          <Text>Deadline</Text><EventIcon/>
          <Text>{e.deadline}</Text>
          </CampaignCardInfo>
          <Link style={{ textDecoration: 'none'}} passHref href={'/' + e.address}><Button style={{}}>
            Go to Campaign
          </Button></Link>
          <WithdrawButton onClick={() => handleWithdrawFunds(e.address)}>Withdraw</WithdrawButton>


          
        </Card>
        )
      })}

      </CardsContainer>
    </HomeContainer>
  )
}

const WithdrawButton = styled.button`
  background-color: #F7B500;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;

  &:hover {
    background-color: #E09800;
  }
`;
const ChartContainer = styled.div`
  width: 400px;
  height: 200px; 
  transition: all 0.2s ease-in-out; 
  border: 2px solid #333; 
  border-radius: 10px; 
  box-shadow: 2px 2px 10px lightgray;

  &:hover {
    width: 1000px; 
    height: 500px;
  }
`;


const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;


const CardsContainer = styled.div`
   display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 40px;
  width: 100%;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.05);
  width: 300px;
  height: 500px;
  margin: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
  box-shadow: 2px 2px 10px lightgray;

  &:hover{
    transform: translateY(-10px);
    transition: transform 0.5s;
  }

  
  &:not(:hover){
    transition: transform 0.5s;
  }
`;


const CardImg = styled.div`
  width: 120px;
  height: 120px;
  margin: 20px 0;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 20px 0;
`;
const CampaignCardInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
`;

const Text = styled.p`
font-size: 16px;
color: #333;
margin: 0 20px;
`;
const Button = styled.a`
  background: #0074D9;
  color: white;
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  margin: 20px 0;
`;


