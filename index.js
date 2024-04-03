import { useState, useEffect } from "react";
import { ethers } from "ethers";
import tokenABI from "../artifacts/contracts/MyToken.sol/MyToken.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [tokenContract, setTokenContract] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const tokenAbi = tokenABI.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts[0]);
    
    // once wallet is set we can get a reference to our deployed contract
    getTokenContract();
  };

  const getTokenContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(contractAddress, tokenAbi, signer).connect(signer); // Connect the signer to the contract
    tokenContract.gasLimit = ethers.constants.MaxUint; // Set gas limit to MaxUint
    setTokenContract(tokenContract);
  };

  const getBalance = async () => {
    if (tokenContract) {
      const balance = await tokenContract.balanceOf(account);
      setBalance(balance.toString());
    }
  };

  const mint = async () => {
    if (tokenContract) {
      await tokenContract.mint(1); // Mint 1 token to the connected account
      getBalance();
    }
  };

  const burn = async () => {
    if (tokenContract) {
      await tokenContract.burn(1); // Burn 1 token to the connected account
      getBalance();
    }
  };

  const transfer = async () => {
    if (tokenContract) {
      // Perform a token transfer from the connected account to another address
      // Replace `recipientAddress` with the recipient's Ethereum address
      const recipientAddress = "0xfcd1381f391500eccb0f2192b4bbff17ac5c659f"; // Add recipient address here
      await tokenContract.transfer(recipientAddress, 1); // Transfer 1 token to the recipient address
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Phantom wallet in order to proceed.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Phantom wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={mint}>Mint</button>
        <button onClick={burn}>Burn</button>
        <button onClick={transfer}>Transfer</button>
      </div>
    );
  };

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>My Token</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  );
}
