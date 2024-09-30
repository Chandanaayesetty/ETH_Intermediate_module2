import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [action, setAction] = useState(null);
  const [amount, setAmount] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [rentAmount, setRentAmount] = useState(null);
  const [exchangeAmount, setExchangeAmount] = useState(null);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
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
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const performTransaction = async (action, amount) => {
    if (atm) {
      let tx;
      if (action === "deposit") {
        tx = await atm.deposit(amount);
      } else if (action === "withdraw") {
        tx = await atm.withdraw(amount);
      }
      await tx.wait();
      setTransactions([...transactions, { action, amount, timestamp: new Date().toLocaleString() }]);
      getBalance();
      setAction(null);
      setAmount(null);
      setMessage(`Transaction of ${amount} ETH ${action}ed successfully.`);
    }
  };

  const payToAddress = async () => {
    if (atm && recipient && amount) {
      const tx = await atm.pay(recipient, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
      setTransactions([...transactions, { action: "paid", amount, recipient, timestamp: new Date().toLocaleString() }]);
      getBalance();
      setMessage(`Paid ${amount} ETH to ${recipient} successfully.`);
      setRecipient("");
      setAmount(null);
    }
  };

  const exchangeCurrency = async () => {
    if (atm && exchangeAmount) {
      const tx = await atm.exchangeCurrency(exchangeAmount);
      await tx.wait();
      setTransactions([...transactions, { action: "exchanged", amount: exchangeAmount, timestamp: new Date().toLocaleString() }]);
      getBalance();
      setMessage(`Exchanged ${exchangeAmount} USD to tokens successfully.`);
      setExchangeAmount(null);
    }
  };

  const payRent = async () => {
    if (atm && rentAmount) {
      const tx = await atm.payRent(account, ethers.utils.parseEther(rentAmount.toString()));
      await tx.wait();
      setTransactions([...transactions, { action: "rent paid", amount: rentAmount, timestamp: new Date().toLocaleString() }]);
      getBalance();
      setMessage(`Paid ${rentAmount} ETH as rent successfully.`);
      setRentAmount(null);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (showTransactions) {
      return (
        <div>
          <p>Connected Account Address: <strong>{account}</strong></p>
          <p className="balance">Connected Account Balance: {balance} ETH</p>
          <button className="back-btn" onClick={() => setShowTransactions(false)}>Back</button>
          <h3>Transaction History</h3>
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>{`${tx.timestamp} - ${tx.action} ${tx.amount} ETH ${tx.recipient ? `to ${tx.recipient}` : ''}`}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (!action) {
      return (
        <div>
          <p>Connected Account Address: <strong>{account}</strong></p>
          <p className="balance">Connected Account Balance: {balance} ETH</p>
          <div className="button-group">
            <button className="action-btn deposit-btn" onClick={() => setAction("deposit")}>Deposit</button><br />
            <button className="action-btn withdraw-btn" onClick={() => setAction("withdraw")}>Withdraw</button><br />
            <button className="action-btn transactions-btn" onClick={() => setShowTransactions(true)}>Transaction History</button>
            <button className="action-btn pay-btn" onClick={() => setAction("pay")}>Pay to Address</button><br />
            <button className="action-btn exchange-btn" onClick={() => setAction("exchange")}>Exchange Currency</button><br />
            <button className="action-btn rent-btn" onClick={() => setAction("rent")}>Pay Rent</button><br />
          </div>
        </div>
      );
    }

    if (action === "pay") {
      return (
        <div>
          <p>Connected Account Address: <strong>{account}</strong></p>
          <p className="balance">Connected Account Balance: {balance} ETH</p>
          <p>{`How much would you like to pay?`}</p>
          <input
            type="text"
            placeholder="Amount in ETH"
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <button onClick={payToAddress}>Pay</button>
          <button onClick={() => setAction(null)}>Cancel</button>
        </div>
      );
    }

    if (action === "exchange") {
      return (
        <div>
          <p>Connected Account Address: <strong>{account}</strong></p>
          <p className="balance">Connected Account Balance: {balance} ETH</p>
          <p>{`How much USD would you like to exchange?`}</p>
          <input
            type="text"
            placeholder="Amount in USD"
            onChange={(e) => setExchangeAmount(e.target.value)}
          />
          <button onClick={exchangeCurrency}>Exchange</button>
          <button onClick={() => setAction(null)}>Cancel</button>
        </div>
      );
    }

    if (action === "rent") {
      return (
        <div>
          <p>Connected Account Address: <strong>{account}</strong></p>
          <p className="balance">Connected Account Balance: {balance} ETH</p>
          <p>{`How much rent would you like to pay?`}</p>
          <input
            type="text"
            placeholder="Rent Amount in ETH"
            onChange={(e) => setRentAmount(e.target.value)}
          />
          <button onClick={payRent}>Pay Rent</button>
          <button onClick={() => setAction(null)}>Cancel</button>
        </div>
      );
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to EBI (Ether Bank Of India)</h1></header>
      {initUser()}
      {message && <p>{message}</p>}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #ffe4e1; /* Light Pink */
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Georgia', serif;
          font-size: 20px;
        }

        .button-group
