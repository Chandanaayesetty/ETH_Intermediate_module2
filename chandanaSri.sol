// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Payment(address indexed from, address indexed to, uint256 amount);
    event CurrencyExchange(uint256 amountInUSD, uint256 amountInTokens);
    event RentPaid(address indexed tenant, uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    // New function to pay another address
    function pay(address payable _to, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _amount, "Insufficient balance for payment");

        balance -= _amount;
        _to.transfer(_amount);

        emit Payment(msg.sender, _to, _amount);
    }

    // New function to exchange currency (mocked for simplicity)
    function exchangeCurrency(uint256 _amountInUSD) public {
        // Here we will define a fixed exchange rate for simplicity, e.g., 1 USD = 1 token
        uint256 amountInTokens = _amountInUSD; // Replace with actual logic for exchange rate
        balance += amountInTokens; // Assume you are adding tokens to the balance for this example

        emit CurrencyExchange(_amountInUSD, amountInTokens);
    }

    // New function to pay rent
    function payRent(address payable _tenant, uint256 _rentAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _rentAmount, "Insufficient balance to pay rent");

        balance -= _rentAmount;
        _tenant.transfer(_rentAmount);

        emit RentPaid(_tenant, _rentAmount);
    }
}
