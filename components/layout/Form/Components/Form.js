import styled from 'styled-components';
import { createContext, useState } from 'react';
import { ethers } from 'ethers';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import CampaignFactory from '/Users/kavonkharaty/crowdfundingdapp copy/artifacts/contracts/Campaign.sol/CampaignFactory.json';
import FormInputContainer from './FormInputContainer';
import Confetti from 'react-confetti'; 
import Link from 'next/link';


// Create context form to manage and share its state and associated functions
const FormContext = createContext();

const Form = () => {

    // State variables for form fields, description URL, image URL, loading state, address, and image
  const [form, setForm] = useState({
    campaignTitle: '',
    description: '',
    targetAmount: '',
    category: '',
    deadline: '',
  });

  const [descriptionUrl, setDescriptionUrl] = useState();
  const [imageUrl, setImageUrl] = useState();
  // const [address, setAddress] = useState('0x827d7aEda51e832A05cb0e6987e80EeB1bb3d476');
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  // FormHandler: Updates the form state when an input field changes

  const FormHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  
  // ImageHandler: Sets the image state with the selected file
  const ImageHandler = (e) => {
    setImage(e.target.files[0]);
  };
    // Validate form fields

  const startCampaign = async (e) => {
    e.preventDefault();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    if (form.campaignTitle === '') {
      alert('Title field is empty');
      return;
    }
    if (form.description === '') {
      alert('Description field is empty');
      return;
    }
    if (form.targetAmount === '') {
      alert('Target amount field is empty');
      return;
    }
    if (form.deadline === '') {
      alert('campaign deadline field is empty');
      return;
    }

    setLoading(true);

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ADDRESS,
      CampaignFactory.abi,
      signer
    );

    const CampaignAmount = ethers.utils.parseEther(form.targetAmount);
    const deadlineDate = new Date(form.deadline);
    const CampaignDeadline = Math.floor(deadlineDate.getTime() / 1000);
  
    try {
      const campaignData = await contract.createCampaign(
        form.campaignTitle,
        CampaignAmount,
        imageUrl,
        form.category,
        descriptionUrl,
        CampaignDeadline
      );
  
      await campaignData.wait();
      setAddress(campaignData.to);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("The MetaMask wallet declined the campaign creation request.");
    }
  };
  // Render the form, loading spinner, or campaign address, based on the current state
  return (
    <FormContext.Provider
      value={{
        form,
        setForm,
        image,
        setImage,
        setImageUrl,
        ImageHandler,
        FormHandler,
        setDescriptionUrl,
        startCampaign,
      }}
    >
      <FormContainer>
        <FormContent>
          {loading ? (
            address ? (
              <CampaignAddress>
                <Confetti width={window.innerWidth} height={window.innerHeight} /> 
                <h1>Project Launched</h1>
                <h1>{address}</h1>
                <SubmitButton href={'/' + address}>Click To View</SubmitButton>

              </CampaignAddress>
            ) : (
              <LoaderWrapper>
                <TailSpin height={60} />
              </LoaderWrapper>
            )
          ) : (
            <InputGroupWrapper>
              <FormInputContainer />
            </InputGroupWrapper>
          )}
        </FormContent>
      </FormContainer>
    </FormContext.Provider>
  );
  
};

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FormContent = styled.div`
  width: 80%;
`;


const InputGroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CampaignAddress = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  h1 {
    margin-top: 50px;
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    color: ${(props) => props.theme.color};
  }
`;

const LoaderWrapper = styled.div`display: flex; 
justify-content: center; 
align-items: center;
 height: 80vh;;`

const SubmitButton = styled(Link)` 
display: flex; 
justify-content: center; 
align-items: center; 
text-align: center;
background-color: ${(props) => props.theme.colorLight};
  color: ${(props) => props.theme.white}; 
  font-size: 24px; font-weight: bold; 
  width: 250px; 
  height: 60px;ƒ
   border-radius: 8px; 
   margin-top: 20px; 
   text-decoration: none;
    transition: 
    background-color 0.3s ease;
     &:hover { 
      background-color: ${(props) => props.theme.colorLight}; };`

export default Form
export { FormContext };