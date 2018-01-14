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

    bool private isKilled;

    function Splitter(address _alice, address _bob, address _carol) public {
        require(_alice != address(0));
        require(_bob != address(0));
        require(_carol != address(0));

        owner = msg.sender;
        alice = _alice;
        bob = _bob;
        carol = _carol;

        isKilled = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyParticipants() {
        require (msg.sender == alice || msg.sender == bob || msg.sender == carol || msg.sender == owner);
        _;
    }

    function kill() onlyOwner public {
        selfdestruct(owner);
    }

    function softKill() onlyOwner public returns(bool) {
        isKilled = true;
        return true;
    }

    function softResurrect() onlyOwner public returns(bool) {
        isKilled = false;
        return true;
    }

    function getIsKilled () public returns(bool) {
        return isKilled;
    }

    function isKilledRefund (address _address, uint _amount) private {
        require (isKilled);
        _address.transfer(_amount);
    }

    function refund (address _address, uint _amount) onlyOwner public returns (bool) {
        //Is possible that someone sends funds to the contract by mistake. This function allows the Owner to refund a given account
        require (_address != address(0));
        _address.transfer(_amount);
        return true;
    }

    function getContractBalance() onlyOwner public returns (uint) {
        return this.balance;
    }

    function getBalance(address _address) onlyParticipants public returns (uint) {
        return _address.balance;
    }

    function sendFunds () onlyParticipants public payable returns (bool) {
        //Only participants can use this function to send funds to the contract
        //If Alice is using this function the funds will be split half to Bob and the other half to Carol

        require(msg.value > 0); //avoid 0 value transfers

        if (isKilled) {
            isKilledRefund (msg.sender, msg.value);
            return false;
        } else {
            if (msg.sender == alice) { //if sender is Alice then the funds are split between Bob and Carol, else funds go to the contract
                require (msg.value % 2 == 0); //Divisible
                bob.transfer(msg.value/2);
                carol.transfer(msg.value/2);
            }
            return true;
        }
    }

    function splitFunds (address _address1, address _address2) public payable returns (bool) {
        //Anybody can use this function to split funds between two given addresses

        require(msg.value > 0); //avoid 0 value transfers

        if (isKilled) {
            isKilledRefund (msg.sender, msg.value);
            return false;
        } else {
            require(msg.value % 2 == 0); //Divisible
            require(_address1 != address(0));
            require(_address2 != address(0));

            _address1.transfer (msg.value / 2);
            _address2.transfer (msg.value / 2);
            return true;
        }
    }
}
