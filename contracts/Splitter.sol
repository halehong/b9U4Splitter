pragma solidity ^0.4.4;

/*
Splitter
You will create a smart contract named Splitter whereby:

there are 3 people: Alice, Bob and Carol
we can see the balance of the Splitter contract on the web page
whenever Alice sends ether to the contract, half of it goes to Bob and the other half to Carol
we can see the balances of Alice, Bob and Carol on the web page
we can send ether to it from the web page
It would be even better if you could team up with different people impersonating Alice, Bob and Carol, all cooperating on a test net.

Stretch goals:

add a kill switch to the whole contract
make the contract a utility that can be used by David, Emma and anybody with an address to split Ether between any 2 other addresses of their own choice
cover potentially bad input data

Do not:

split between more than 2 people
*/

contract Splitter {
    address public owner;
    address public alice;
    address public bob;
    address public carol;

    uint private contractBalance;

    function Splitter(address _alice, address _bob, address _carol) public {
        owner = msg.sender;
        alice = _alice;
        bob = _bob;
        carol = _carol;
    }

    function () public payable {
        //This function is needed to allow the contract to store value
        contractBalance += msg.value;
    }

    function kill() public payable returns(bool) {
        selfdestruct(owner);
        return true;
    }

    function getContractBalance() returns (uint) {
        return this.balance;
    }

    function getAliceBalance() returns (uint) {
        return alice.balance;
    }

    function getBobBalance() returns (uint) {
        return bob.balance;
    }

    function getCarolBalance() returns (uint) {
        return carol.balance;
    }

    function sendFunds () public payable returns (bool) {
        require(msg.value > 0); //avoid 0 value transfers
        require(msg.sender.balance >= msg.value); //avoid overspending

         if (msg.sender == alice) { //if sender is Alice then the funds are split between Bob and Carol
            bob.transfer(msg.value/2);
            carol.transfer(msg.value/2);
         } else {
            //else, funds go to the contract
            //update the private variable that keeps track of the available balance
            contractBalance += msg.value;
         }

        return true;
    }
}
