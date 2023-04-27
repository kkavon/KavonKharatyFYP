import styled from 'styled-components';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PaidIcon from '@mui/icons-material/Paid';
import EventIcon from '@mui/icons-material/Event';
import Image from 'next/image';
import { ethers } from 'ethers';
import CampaignFactory from '../artifacts/contracts/Campaign.sol/CampaignFactory.json'
import { useState } from 'react';
import Link from 'next/link'
import React, {useEffect } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import Campaign from '../artifacts/contracts/Campaign.sol/Campaign.json';

// Define the main component of this file, which displays a list of campaigns
export default function Index({AllData, ActiveData}) {
    // Define state variables and their setter functions using the useState hook
  const [filter, setFilter] = useState(AllData);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [filteredCampaigns, setFilteredCampaigns] = useState([...AllData]);
  const [loading, setLoading] = useState(true);

  // useEffect to apply filters and search term to the campaigns list
  useEffect(() => {
    let filtered = filter
      .filter((e) => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((e) => category === 'All' || e.category === category)
    setFilteredCampaigns(filtered);
  }, [filter, searchTerm, category]);
  
    // Event handlers for updating search term and category
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };
  
 // Render the component
  return (
    <HomeContainer>
   <FilterWrapper>
            {/* Filter buttons for switching between All and Active Campaigns */}
      <Category onClick={() => setFilter(AllData)} active={filter === AllData}>
        All Campaigns
      </Category>
      <Category onClick={() => setFilter(ActiveData)} active={filter === ActiveData}>
        Active Campaigns
      </Category>
       {/* Category dropdown */}
      <label>Category: </label>
      <select onChange={handleCategoryChange}>
        <option value="All">All</option>
        <option value='"Art"'>Art</option>
        <option value='"Comic"'>Comic</option>
        <option value='"Crafts"'>Crafts</option>
        <option value='"Dance"'>Dance</option>
        <option value='"Fashion"'>Fashion</option>
        <option value='"Film & Video"'>Film & Video</option>
        <option value='"Food"'>Food</option>
        <option value='"Games"'>Games</option>
        <option value='"Health"'>Health</option>
        <option value='"Journalism"'>Journalism</option>
        <option value='"Music"'>Music</option>
        <option value='"Photography"'>Photography</option>
        <option value='"Publishing"'>Publishing</option>
        <option value='"Technology"'>Technology</option>
        <option value='"Theater"'>Theater</option>
      </select>
    </FilterWrapper>
  
    <SearchWrapper>
              {/* Search input for filtering by title */}
        <SearchInput
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </SearchWrapper>

      <CardsContainer>
        

      {filteredCampaigns.length > 0 ? (
    filteredCampaigns
    .sort((a, b) => (a.isAfterDeadline - b.isAfterDeadline) || (a.isClosed - b.isClosed))

      .map((e) => {

  return (
    
<Card
  key={e.title}
  isClosed={e.isClosed}
  isAfterDeadline={e.isAfterDeadline}
>
          <CardImg>
            <Image 
            
              alt={e.title}
            
             width={150}
             height={130}
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
        </Card>
        )
        
      }

      )) : (
        <div>
          <p>No campaigns match the selected filters or search criteria.</p>
        </div>
      )}

      </CardsContainer>
    </HomeContainer>
  )
    }

// Fetch campaign data from the contract and sort the campaigns
    export async function getStaticProps() {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      // Connect to the Ethereum provider and instantiate the contract
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ADDRESS,
        CampaignFactory.abi,
        provider
      );
      // Fetch all campaigns
      const getAllCampaigns = contract.filters.campaignCreated();
      const AllCampaigns = await contract.queryFilter(getAllCampaigns);
    
  // Function to add isAfterDeadline property and format the campaign data
      const IsExpiredProperty = async(e) => {
    const deadlineDate = new Date(parseInt(e.args.deadline) * 1000);
    const currentDate = new Date();
    const currentDateUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
    const deadlineDateUTC = new Date(Date.UTC(deadlineDate.getUTCFullYear(), deadlineDate.getUTCMonth(), deadlineDate.getUTCDate()));
    const isAfterDeadline = deadlineDateUTC <= currentDateUTC;
    const campaign = new ethers.Contract(e.args.campaignAddress, Campaign.abi, provider);
    const isClosed = await campaign.closed();

    return {
        title: e.args.title,
        image: e.args.imageURI,
        owner: e.args.owner,
        timeStamp: parseInt(e.args.timestamp),
        amount: ethers.utils.formatEther(e.args.targetAmount),
        address: e.args.campaignAddress,
        deadline: deadlineDate.toLocaleDateString(),
        isClosed, // Use isClosed attribute instead of isAfterDeadline
        category: JSON.stringify(e.args.category),
        isAfterDeadline // Add isAfterDeadline property

    }
};

      //This will sort the campaigns by their isAfterDeadline property, placing the active campaigns
      //(where isAfterDeadline is false) at the top and the inactive ones (where isAfterDeadline is true) at the bottom.
      const AllData = await Promise.all(AllCampaigns.map(IsExpiredProperty))
      .then((campaigns) => campaigns.sort((a, b) => a.isAfterDeadline - b.isAfterDeadline));
      // Filter out active campaigns
      const ActiveData = AllData.filter((campaign) => !campaign.isClosed && !campaign.isAfterDeadline);
   
        // Return the sorted and filtered campaign data as props

        console.log('AllData:', AllData);
        console.log('ActiveData:', ActiveData);
      return {
        props: {
          AllData,
          ActiveData,
        },
        //reload page after every 10 seconds
        revalidate: 10
      }
    }



    
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  margin-bottom: 1rem;

  label {
    margin-right: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }

  select {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    background-color: #f2f2f2;
    font-size: 1rem;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    outline: none;
  }
`;
const Category = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: ${(props) => (props.active ? '#0074D9' : props.theme.bgDiv)};
  color: ${(props) => (props.active ? 'white' : props.theme.color)};
  margin: 0px 15px;
  border-radius: 8px;
  font-family: 'Poppins';
  font-weight: normal;
  cursor: pointer;
  svg {
    margin-right: 5px;
  }
  :hover {
  background-color: #0074D9;
  color: white;
  transition: background-color 0.3s, color 0.3s;
}

:hover {
  background-color: #0074D9;
  color: white;
  transition: background-color 0.3s, color 0.3s;
}
`;


const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 40px;
  width: 100%;
`;

const Card = styled.div`

background-color: ${(props) =>
    props.isClosed || props.isAfterDeadline ?'rgba(255, 0, 0, 0.1)'  : "white"};
  border-radius: 10px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.05);
  width: 300px;
  height: 450px;
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
  width: 200px;
  height: 200px;
  margin: 15px 0;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
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
margin: 0 10px;
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

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 40%;
  margin-top: 1rem;
  position: relative;

  & input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: none;
    background-color: ${(props) => props.theme.bgDiv};
    color: ${(props) => props.theme.text};
    font-family: 'Poppins';
    font-size: 16px;
    margin-left: 1rem;
  }

  & input:focus {
  }

  & svg {
    position: absolute;
    left: 0;
    color: ${(props) => props.theme.text};
  }
`;


const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 16px;
  margin-left: 8px;
`;
