import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";

const AboutUs = () => {
 
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonations: 0,
  });


  
  useEffect(() => {
    const fetchCampaignStatistics = async () => {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ADDRESS,
        CampaignFactory.abi,
        provider
      );
  
      try {
        const [totalCampaigns, activeCampaigns, totalDonations] = await contract.getCampaignStatistics();
        setStats({
          totalCampaigns: totalCampaigns.toNumber(),
          activeCampaigns: activeCampaigns.toNumber(),
          totalDonations: ethers.utils.formatEther(totalDonations),
        });
      } catch (error) {
        console.error("Error fetching campaign statistics:", error);
      }
    };
  
    fetchCampaignStatistics();
  }, []);



  

  return (
    <>
      <ImageContainer>
        <Image src="https://source.unsplash.com/1200x600/?blockchain" alt="Blockchain" />
        <OverlayText>
          <h3>Our Vision</h3>
          <p>Empowering creativity and innovation through blockchain technology.</p>
        </OverlayText>
      </ImageContainer>
      <CampaignStatsContainer>
        <StatCard>
          <h2>Total Campaigns</h2>
          <p>{stats.totalCampaigns}</p>
        </StatCard>
        <StatCard>
          <h2>Active Campaigns</h2>
          <p>{stats.activeCampaigns}</p>
        </StatCard>
        <StatCard>
          <h2>Total Donations</h2>
          <p>{stats.totalDonations} ETH</p>
        </StatCard>
      </CampaignStatsContainer>
      <AboutUsContainer>
        <Heading>About Us</Heading>
        <Paragraph>
          My platform is built on Ethereum and enables anyone, anywhere to support their favorite projects and initiatives through cryptocurrency donations. Our goal is to make crowdfunding more accessible and to help bring exciting ideas to life.
        </Paragraph>
        <Paragraph>
          The platform is user-friendly, secure, and transparent. I believe in the power of the Ethereum blockchain to provide a more equitable and accessible way of funding projects. By using Ethereum, we can eliminate the need for intermediaries and reduce the fees associated with traditional crowdfunding platforms.
        </Paragraph>
        <Paragraph>
          I am passionate about supporting creative and innovative projects and helping bring them to life. If you have an idea that you would like to see come to fruition, or if you're simply looking for a platform that is more in line with your values, please consider using my Ethereum-based crowdfunding platform.
        </Paragraph>
      </AboutUsContainer>
    </>
  );
};


export default AboutUs;


const AboutUsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2em;
`;

const Heading = styled.h2`
  font-size: 3em;
  font-weight: bold;
  margin-top: 2em;
  text-align: center;
`;

const Paragraph = styled.p`
  font-size: 1.2em;
  line-height: 1.5em;
  text-align: center;
  width: 80%;
  margin-top: 1em;
`;


const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OverlayText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 1em;
  text-align: center;
`;

const CampaignStatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
  padding: 2rem;
  background-color: #f7f7f7;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;