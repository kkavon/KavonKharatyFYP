import styled from "styled-components";
import { FormContext } from "./Form";
import { useContext } from 'react';
import { useState } from "react";
import { create as IPFSHTTPClient } from 'ipfs-http-client'
import { toast } from 'react-toastify';

const projectId = process.env.NEXT_PUBLIC_IPFS_ID
const projectSecret = process.env.NEXT_PUBLIC_IPFS_KEY
const auth = 'Basic ' + Buffer.from(projectId + ":" + projectSecret).toString('base64')

const client = IPFSHTTPClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth
  }
})

const today = new Date();
const todayFormatted = today.toISOString().split("T")[0];

function FormInputContainer() {




  const Handler = useContext(FormContext);

  const [loading, setLoading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const isFormValid =
  Handler.form.campaignTitle !== "" &&
  Handler.form.description !== "" &&
  Handler.form.targetAmount !== "" &&
  Handler.form.category !== "" &&
  Handler.form.deadline !=="" &&
  Handler.image !== null;


const uploadFiles = async (e) => {
  // Prevent the default behavior of the event (e.g., form submission)
  e.preventDefault();
  setLoading(true);

  if (Handler.form.description !== "") {
    try {
      // Add the description using the client and await its completion
      const added = await client.add(Handler.form.description);
      // Set the description URL using the returned path
      Handler.setDescriptionUrl(added.path);
    } catch (error) {
      alertg('Error uploading description')
    }
  }
  if (Handler.image !== null) {
    try {
      // Add the image using the client and await its completion
      const added = await client.add(Handler.image);
      // Set the image URL using the returned path
      Handler.setImageUrl(added.path);

    } catch (error) {
      alert("Error image");
    }
  }
  setUploadDone(true);
  setLoading(false);
  toast.success("Files Uploaded Sucessfully")
}



  const handleImagePreview = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };


  return (
    <FormContainer>
      <FormContent>
        <FormGroup>
          <FormLabel htmlFor="projectTitle">Project Title</FormLabel>
          <FormInput
            id="projectTitle"
            type="text"
            placeholder="Title"
            name="campaignTitle"
            value={Handler.form.campaignTitle}
            onChange={Handler.FormHandler}
            maxLength={26} 
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="projectDescription">Description</FormLabel>
          <FormTextArea
            id="projectDescription"
            type="text"
            placeholder="Description"
            name="description"
            value={Handler.form.description}
            onChange={Handler.FormHandler}
          />
        </FormGroup>
        <FormGroup>
          <FormRow>
            <FormColumn>
              <FormLabel htmlFor="targetAmount">Target Amount</FormLabel>
              <FormInput
                id="targetAmount"
                type="number"
                placeholder="Target Amount"
                name="targetAmount"
                value={Handler.form.targetAmount}
                onChange={Handler.FormHandler}
              />
            </FormColumn>
            <FormColumn>
              <FormLabel htmlFor="category">Category</FormLabel>
              <FormSelect
                id="category"
                name="category"
                value={Handler.form.category}
                onChange={Handler.FormHandler}
              >
                <option>Art</option>
                <option>Comic</option>
                <option>Crafts</option>
                <option>Dance</option>
                <option>Fashion</option>
                <option>Film & Video</option>
                <option>Food</option>
                <option>Games</option>
                <option>Health</option>
                <option>Journalism</option>
                <option>Music</option>
                <option>Photography</option>
                <option>Publishing</option>
                <option>Technology</option>
                <option>Theater</option>
              </FormSelect>
            </FormColumn>
            
          </FormRow>
          <FormGroup>
          <FormInput
    id="deadline"
    type="date"
    placeholder="Campaign Deadline" 
    name="deadline"
    value={Handler.form.deadline} 
    onChange={Handler.FormHandler}
    // min={todayFormatted}
  />  
        </FormGroup>
          <FormGroup>
            <FormImage
              type="file"
              accept="image/*"
              onChange={(event) => {
                Handler.ImageHandler(event);
                handleImagePreview(event);
              }}
            />
            {imagePreview && <img src={imagePreview} style={{ width: "150px"}} />}
          </FormGroup>
          {loading ? (
            <LoadingIndicator color="#fff" height={20} />
          ) : uploadDone ? (
            <FormButton onClick={Handler.startCampaign} >Confirm Launch </FormButton>
            
            
          ) : (
            <FormButton onClick={uploadFiles} disabled={!isFormValid}>Launch Project</FormButton>
           
          )}
        </FormGroup>
      </FormContent>
    </FormContainer>
  );
          }  

const FormContainer = styled.div`
margin-top:20px;
  display: flex;
  justify-content: center;
  align-items: center;
      `;

const FormContent = styled.form`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 1100px;
        padding: 50px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      `;

const FormGroup = styled.div`
        display: flex;
        flex-direction: column;
        margin-bottom: 30px;
        width: 100%;
      `;

const FormRow = styled.div`
        display: flex;
        width: 100%;
        justify-content: space-between;
        margin-bottom: 30px;
        
      `;

const FormColumn = styled.div`
        display: flex;
        flex-direction: column;
        width: 48%;
      `;

const FormLabel = styled.label`
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 10px;
      `;

const FormInput = styled.input`
        width: 100%;
        height: 40px;
        border-radius: 5px;
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        padding: 10px;
        font-size: 14px;
        margin-bottom: 10px;
      `;

const FormTextArea = styled.textarea`
        width: 100%;
        height: 100px;
        border-radius: 5px;
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        padding: 10px;
        font-size: 14px;
        margin-bottom: 10px;
      `;

const FormSelect = styled.select`
        width: 103%;
        height: 100%;
        border-radius: 5px;
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        padding: 10px;
        font-size: 14px;
        margin-bottom: 10px;
      `;

const FormImage = styled.input`
        margin-top: 30px;
        margin-bottom: 10px;
      `;

const FormButton = styled.button`
        width: 100%;
        height: 40px;
        border: none;
        border-radius: 5px;
        background-color: #0086d6;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      
        &:hover {
          background-color: #0069a9;
        }
      
        &:active {
          transform: scale(0.98);
        }
      `;

const LoadingIndicator = styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 40px;
        background-color: #0086d6;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 30px;
        border-radius: 5px
`


export default FormInputContainer


