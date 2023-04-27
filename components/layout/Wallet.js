import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

const Wallet = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Please install MetaMask');
        setShowPopup(true);
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);

      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        setCurrentAccount(account);

        if (account) {
          const balance = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(balance));
        }

        ethereum.on('accountsChanged', async ([account]) => {
          setCurrentAccount(account);
          const balance = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(balance));
        });
      } catch (error) {
        console.log(error);
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Please install MetaMask');
      setShowPopup(true);
      return;
    }

    try {
      const [account] = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(account);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {showPopup && (
        <MetaMaskPopup>
          <p>
            You need to have MetaMask installed to use this app. Please{' '}
            <a href="https://metamask.io/download.html" target="_blank" rel="noreferrer">
              download and install MetaMask
            </a>{' '}
            first.
          </p>
          <CloseButton onClick={() => setShowPopup(false)}>Close</CloseButton>
        </MetaMaskPopup>
      )}
      <WalletContainer>
        <WalletLogo src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png" alt="MetaMask Logo" />
        <WalletInfo>
          {currentAccount ? (
            <>
              <WalletAddress>{`${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`}</WalletAddress>
              <BalanceText>{balance && `Balance: ${balance.slice(0, 6)}${balance.slice(1000)} ETH`}</BalanceText>
            </>
          ) : (
            <ConnectButton onClick={connectWallet}>Connect Wallet</ConnectButton>
          )}
        </WalletInfo>
      </WalletContainer>
    </>
  );
};

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 5px;
  border-radius: 20px;
  background-color: #FFF;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
`;

const WalletLogo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const ConnectButton = styled.button`
  border: none;
  background-color: #2d9cdb;
  color: #fff;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #2b8acc;
  }
`;

const WalletAddress = styled.h3`
  font-size: 16px;
  font-weight: 400;
  color: #333;
  margin-right: 10px;
`;

const BalanceText = styled.h4`
  font-size: 14px;
  font-weight: 400;
  color: #333;
`;


const MetaMaskPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const CloseButton = styled.button`
  display: inline-block;
  background-color: #ccc;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #bbb;
  }
`;
export default Wallet;
