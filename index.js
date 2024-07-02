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

    // once wallet is set we can get a reference to our deployed contract
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

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance == undefined) {
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
              <li key={index}>{`${tx.timestamp} - ${tx.action}ed ${tx.amount} ETH`}</li>
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
            <button className="action-btn deposit-btn" onClick={() => setAction("deposit")}>Deposit</button><br></br>
            <button className="action-btn withdraw-btn" onClick={() => setAction("withdraw")}>Withdraw</button><br></br>
            <button className="action-btn transactions-btn" onClick={() => setShowTransactions(true)}>Transaction History</button>
          </div>
        </div>
      );
    }

    if (!amount) {
      return (
        <div>
          <p>Connected Account Address: <strong>{account}</strong></p>
          <p className="balance">Connected Account Balance: {balance} ETH</p>
          <p>{`How much would you like to ${action}?`}</p>
          <div className="button-group">
            <button className="amount-btn" onClick={() => { setAmount(1); performTransaction(action, 1); }}>1 ETH</button><br></br>
            <button className="amount-btn" onClick={() => { setAmount(10); performTransaction(action, 10); }}>10 ETH</button>
          </div>
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
      <style jsx>{`
        .container
         {
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
        {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        button
       {
          background-color: green; /* Light Green */
          border: none;
          border-radius: 25px;
          padding: 20px 40px;
          font-size: 24px;
          color: green;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        button:hover {
          background-color: green; /* Slightly darker green */
          transform: translateY(-2px);
        }

        .back-btn {
          background-color: #b0e0e6; /* Light Blue */
        }
          

        .back-btn:hover {
          background-color: #7ec0ee; /* Slightly darker light blue */
        }

        .action-btn {
          width: 250px;
        }

        .amount-btn {
          width: 200px;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        ul li {
          background-color: green; /* Light pinkish background */
          margin: 5px;
          padding: 10px;
          border-radius: 10px;
          font-family: 'Times New Roman', Times, serif;
          font-size: 22px;
        }

        header h1 {
          color: #a0522d; /* Light Brown */
        }

        p {
          color: #a0522d; /* Light Brown */
          font-size: 20px;
          font-family: 'Times New Roman', Times, serif;
        }

        .balance {
          font-family: 'Times New Roman', Times, serif;
          font-size: 24px;
          color: #228B22; /* Forest Green */
        }
      `}</style>
    </main>
  );
}
