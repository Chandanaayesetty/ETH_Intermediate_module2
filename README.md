# Ether Bank of India (EBI)

Welcome to Ether Bank of India (EBI), a decentralized banking application built on the Ethereum blockchain. This application allows users to connect their MetaMask wallet, view their account balance, and perform transactions (deposit and withdraw Ether).

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contract](#contract)
- [License](#license)

## Features

- Connect to MetaMask wallet
- View account balance
- Deposit Ether
- Withdraw Ether
- View transaction history

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- MetaMask browser extension installed
- Local Ethereum blockchain (e.g., Hardhat) running
- Contract deployed on the local Ethereum blockchain

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Chandanaayesetty/ETH_Intermediate_module2/tree/main
   cd ether-bank-of-india
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Ensure your local Ethereum blockchain is running.** If using Hardhat, run:

   ```bash
   npx hardhat node
   ```

4. **Deploy the contract to your local blockchain:**

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Update the contract address in `HomePage.js` if necessary:**

   ```javascript
   const contractAddress = "0xYourDeployedContractAddress";
   ```

## Usage

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**

   ```bash
   http://localhost:3000
   ```

3. **Connect your MetaMask wallet** and start using Ether Bank of India.

## Contract

The smart contract is located in the `contracts` directory. It defines the functions for depositing and withdrawing Ether, as well as retrieving the account balance. 

Example contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Assessment {
    mapping(address => uint256) private balances;

    function deposit(uint256 amount) public payable {
        require(msg.value == amount, "Amount mismatch");
        balances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
