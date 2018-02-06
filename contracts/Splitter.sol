pragma solidity ^0.4.4;

/*

Last update: 2018-02-06
 Version: 2.1

Splitter
You will create a smart contract named Splitter whereby:
- there are 3 people: Alice, Bob and Carol
- we can see the balance of the Splitter contract on the web page
- whenever Alice sends ether to the contract, half of it goes to Bob and the other half to Carol
- we can see the balances of Alice, Bob and Carol on the web page
- we can send ether to it from the web page
- It would be even better if you could team up with different people impersonating Alice, Bob and Carol, all cooperating on a test net.

Stretch goals:
- add a kill switch to the whole contract
- make the contract a utility that can be used by David, Emma and anybody with an address to split Ether between any 2 other addresses of their own choice
- cover potentially bad input data

Do not:
- split between more than 2 people

CORE functions:
- Constructor
- depositFundsToSplitter
- sendSplitFunds

*/

import "./_FundsManager.sol";

contract Splitter is FundsManager {
    // To see the balance of the Splitter contract from a web page: contractAddress.balance
    // To see the balance of Alice, Bob or Carol: address.balance
    // To send ether to the contract: depositFundsToSplitter.sendTransaction(...)
    // Kill switch implemented in the Stoppable super contract

    address public alice;
    address public bob;
    address public carol;

        event LogSplitterNew (address _sender, address _alice, address _bob, address _carol);
    // Constructor
    function Splitter(address _alice, address _bob, address _carol)
        public 
    {
        require(_alice != 0);
        require(_bob != 0);
        require(_carol != 0);

        alice = _alice;
        bob = _bob;
        carol = _carol;

        LogSplitterNew (msg.sender, _alice, _bob, _carol);
    }

// CORE functions

        event LogSplitterDepositFundsToSplitter (address _sender, uint _value);
        //If Alice is using this function the funds will be split half to Bob and the other half to Carol
    function depositFundsToSplitter ()
        onlyIfRunning 
        public 
        payable 
        returns (bool) 
    {
        require(msg.value > 0); //avoid 0 value transfers

        if (msg.sender == alice) { //if sender is Alice then the funds are split between Bob and Carol, else funds go to the contract
            require (msg.value % 2 == 0); //Divisible
            bob.transfer(msg.value/2);
            carol.transfer(msg.value/2);
        }

        LogSplitterDepositFundsToSplitter (msg.sender, msg.value);
        return true;
    }

        event LogSplitterSendSplitFunds (address _sender, uint _value, address _address1, address _address2);
        //Anybody can use this function to split funds between two given addresses
    function sendSplitFunds (address _address1, address _address2) 
        onlyIfRunning
        public 
        payable 
        returns (bool) 
    {
        require(msg.value > 0); //avoid 0 value transfers

        require(msg.value % 2 == 0); //Divisible
        require(_address1 != address(0));
        require(_address2 != address(0));

        _address1.transfer (msg.value / 2);
        _address2.transfer (msg.value / 2);
        
        LogSplitterSendSplitFunds (msg.sender, msg.value, _address1, _address2);
        return true;
    }
}
