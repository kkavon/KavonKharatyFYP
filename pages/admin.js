import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import { useRouter } from "next/router";
import styled from "styled-components";

export default function AdminPage({ AllData }) {
    const [campaigns, setCampaigns] = useState(AllData);
    const router = useRouter();
  
    async function markInactive(campaignAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ADDRESS,
        CampaignFactory.abi,
        signer
      );
  
      try {
        const tx = await contract.markCampaignInactive(campaignAddress);
        await tx.wait();
        router.reload();
      } catch (err) {
        console.error("Error marking campaign inactive:", err);
      }
    }
  
    return (
      <PageContainer>
       
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader>Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.address}>
                <TableCell>{campaign.title}</TableCell>
                <TableCell>{campaign.owner}</TableCell>
                <TableCell>{campaign.address}</TableCell>
                <TableCell>
                  {!campaign.isAfterDeadline && (
                    <Button onClick={() => markInactive(campaign.address)}>
                      Mark Inactive
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageContainer>
    );
  }

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
    const IsExpiredProperty = (e) => {
      const deadlineDate = new Date(parseInt(e.args.deadline) * 1000);
      const currentDate = new Date();
      const currentDateUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
      const deadlineDateUTC = new Date(Date.UTC(deadlineDate.getUTCFullYear(), deadlineDate.getUTCMonth(), deadlineDate.getUTCDate()));
      const isAfterDeadline = deadlineDateUTC <= currentDateUTC;
      return {
        title: e.args.title,
        image: e.args.imageURI,
        owner: e.args.owner,
        timeStamp: parseInt(e.args.timestamp),
        amount: ethers.utils.formatEther(e.args.targetAmount),
        address: e.args.campaignAddress,
        deadline: deadlineDate.toLocaleDateString(),
        isAfterDeadline,
        category: JSON.stringify(e.args.category)// Add the category field here
        
      }
    
    };

    //This will sort the campaigns by their isAfterDeadline property, placing the active campaigns
    //(where isAfterDeadline is false) at the top and the inactive ones (where isAfterDeadline is true) at the bottom.
    const AllData = AllCampaigns.map(IsExpiredProperty).sort((b,a) => a.isAfterDeadline - b.isAfterDeadline); 

    // Filter out active campaigns
    const ActiveData = AllData.filter((campaign) => !campaign.isAfterDeadline);
 
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


  const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 40px;
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const TableHead = styled.thead`
  background-color: #f7f7f7;
`;

const TableRow = styled.tr``;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  font-weight: bold;
  color: #333;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  color: #333;
`;

const Button = styled.button`
  background-color: #f7b500;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e09800;
  }
`;
