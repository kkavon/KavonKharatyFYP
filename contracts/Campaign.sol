// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.19;

contract CampaignFactory {
    address[] public startedCampaigns;
    mapping(address => bool) public admins;

    constructor() {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can call this function.");
        _;
    }

    event campaignCreated(string title, uint targetAmount, address indexed owner, address campaignAddress, string imageURI, uint indexed timestamp, string category, uint deadline);

    function createCampaign(
        string memory campaignTitle,
        uint targetAmount,
        string memory imageURI,
        string memory category,
        string  memory descriptionURI,
        uint deadline
    ) public {
        Campaign newCampaign = new Campaign(campaignTitle, targetAmount, imageURI, descriptionURI, msg.sender, deadline, category);

        startedCampaigns.push(address(newCampaign));

        emit campaignCreated(campaignTitle, targetAmount, msg.sender, address(newCampaign), imageURI, block.timestamp, category, deadline);
    }

    function markCampaignInactive(address campaignAddress) public onlyAdmin {
        Campaign campaign = Campaign(campaignAddress);
        campaign.closeCampaign();
    }

    function getActiveCampaigns() public view returns (address[] memory) {
        uint count = 0;
        for (uint i = 0; i < startedCampaigns.length; i++) {
            if (!Campaign(startedCampaigns[i]).closed()) {
                count++;
            }
        }
    
        address[] memory activeCampaignList = new address[](count);
        uint index = 0;
        for (uint i = 0; i < startedCampaigns.length; i++) {
            if (!Campaign(startedCampaigns[i]).closed()) {
                activeCampaignList[index] = startedCampaigns[i];
                index++;
            }
        }
    
        return activeCampaignList;
    }
    function getCampaignStatistics() public view  returns (uint totalCampaigns, uint activeCampaigns, uint totalDonations) {
        totalCampaigns = startedCampaigns.length;
        activeCampaigns = 0;
        totalDonations = 0;
        for (uint i = 0; i < totalCampaigns; i++) {
            Campaign campaign = Campaign(startedCampaigns[i]);
            if (!campaign.closed() && block.timestamp <= campaign.deadline()) {
                activeCampaigns++;
            }
            totalDonations += campaign.currentDonation();
        }
        return (totalCampaigns, activeCampaigns, totalDonations);
    }
}
// Campaign contract that holds the details and functionality of each campaign
contract Campaign {
    // Campaign properties
    string public title;
    uint public targetAmount;
    string public image;
    string public description;
    address payable public owner;
    uint public currentDonation;
    uint public deadline;
    bool public closed;
    string public category;

    struct Donation {
        address donor;
        uint amount;
        uint timestamp;
    }


    // Event to log donation details
    event donated(address indexed donar, uint indexed amount, uint indexed timestamp);
  
    // Event to log withdrawal details
    event Withdrawn(address indexed recipient, uint amount, uint indexed timestamp);

    // Event to log when the campaign is closed
    event Closed(uint256 indexed timestamp);

    // Constructor to initialize the campaign properties
    constructor(
        string memory campaignTitle,
        uint targetCampaignAmount, 
        string memory imageURI,
        string memory descripstionURI,
        address campaignOwner,
        uint campaignDeadline,
        string memory campaignCategory

        
    ) {
        title = campaignTitle;
        targetAmount = targetCampaignAmount;
        image = imageURI;
        description = descripstionURI;
        owner = payable(campaignOwner);
        deadline = campaignDeadline;
        category = campaignCategory;

    }

    // Modifier to restrict function access to the campaign owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    function closeCampaign() public {
        require(CampaignFactory(msg.sender).admins(owner), "Only admin can call this function.");
        require(!closed, "Campaign is already closed.");
        closed = true;
        emit Closed(block.timestamp);
    }


    
    // Function to donate to the campaign
    function donate() public payable {
        require(block.timestamp < deadline, "Campaign has ended!");
        // uint remainingAmount = targetAmount - currentDonation;
        uint donationAmount = msg.value;
    
        currentDonation += donationAmount;
        emit donated(msg.sender, donationAmount, block.timestamp);
    
        if (block.timestamp >= deadline) {
            closed = true;
            emit Closed(block.timestamp);
        }
    }

 

    // Function to withdraw funds from the campaign by the owner
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No funds available to withdraw.");
        // require(block.timestamp >= deadline || currentDonation >= targetAmount, "Campaign is still active.");

        uint amountToWithdraw = address(this).balance;
        currentDonation = 0;
        payable(msg.sender).transfer(amountToWithdraw);
        
        emit Withdrawn(msg.sender, amountToWithdraw, block.timestamp);
    }
    
    
    
}