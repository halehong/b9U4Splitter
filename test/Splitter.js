var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
  var instance;

  var owner_account = accounts[0];
  var alice_account = accounts[1];
  var bob_account = accounts[2];
  var carol_account = accounts[3];

  var alice_balance_start;
  var bob_balance_start;
  var carol_balance_start;
  var contract_balance_start;

  var alice_balance_ending;
  var bob_balance_ending;
  var carol_balance_ending;
  var contract_balance_ending;

  var transferAmount = 1; //in ether

  beforeEach (function() {
    return Splitter.new(alice_account, bob_account, carol_account, {from:accounts[0]}).then(function(i) {
      instance = i;
    });
  });

  it("Alice tranfer should send half to Bob and Carol", function() {
    console.log("it: Alice tranfer should send half to Bob and Carol...");
    alice_balance_start = web3.fromWei(web3.eth.getBalance(alice_account), "ether");
    console.log("    Alice start = " + alice_balance_start.toString());
    bob_balance_start = web3.fromWei(web3.eth.getBalance(bob_account), "ether");
    console.log("    Bob start = " + bob_balance_start.toString());
    carol_balance_start = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
    console.log("    Carol start = " + carol_balance_start.toString());
    contract_balance_start = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
    console.log("    Contract start = " + contract_balance_start.toString());
    console.log("    Alice sends transaction that will split the funds between Bob and Carol...")
    return instance.depositFundsToSplitter({from: alice_account, value:web3.toWei(transferAmount, "ether")}).then(function(){
      alice_balance_ending = web3.fromWei(web3.eth.getBalance(alice_account), "ether");
      console.log("    Alice ending = " + alice_balance_ending.toString());
      bob_balance_ending = web3.fromWei(web3.eth.getBalance(bob_account), "ether");
      console.log("    Bob ending = " + bob_balance_ending.toString());
      carol_balance_ending = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
      console.log("    Carol ending = " + carol_balance_ending.toString());
      contract_balance_ending = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
      console.log("    Contract ending = " + contract_balance_ending.toString());
        
      assert.isBelow(+alice_balance_ending.toNumber().toFixed(5), +alice_balance_start.toNumber().toFixed(5), "Alice's account wasn't debited correctly");
      assert.isBelow(+bob_balance_start.toNumber().toFixed(5), +bob_balance_ending.toNumber().toFixed(5), "Bob's account wasn't credited correctly");
      assert.isBelow(+carol_balance_start.toNumber().toFixed(5), +carol_balance_ending.toNumber().toFixed(5), "Carol's account wasn't credited correctly");
      assert.equal(+contract_balance_start.toNumber().toFixed(5), +contract_balance_ending.toNumber().toFixed(5), "Carol's account wasn't credited correctly");
    });
  });
  

  it("Carol transfers to Contract successfully", function(){
    console.log("it: Carol transfers to Contract successfully...");

    carol_balance_start = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
    console.log("    Carol start = " + carol_balance_start.toString());
    contract_balance_start = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
    console.log("    Contract start = " + contract_balance_start.toString());
    console.log("    Carol deposit funds into the contract... ")
    return instance.depositFundsToSplitter({from:carol_account, value:web3.toWei(transferAmount, "ether")}).then(function(){
      carol_balance_ending = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
      console.log("    Carol ending = " + carol_balance_ending.toString());
      contract_balance_ending = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
      console.log("    Contract ending = " + contract_balance_ending.toString());

      assert.isBelow(+carol_balance_ending.toNumber().toFixed(5), +carol_balance_start.toNumber().toFixed(5), "Carol's new balance after transfer is not lower than before");
      assert.isAbove(+contract_balance_ending.toNumber().toFixed(5), +contract_balance_start.toNumber().toFixed(5), "Contract's balance didn't increase with Carol's transfer");
    });
  });

  
  it("Stop the contract. Try to send funds. Funds shall bounce back. Resume. Send funds successfully", function() {
    console.log("it: Stop the contract. Try to send funds. Funds shall bounce back. Resume. Send funds successfully");
    contract_balance_start = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
    console.log("    Contract start = " + contract_balance_start.toString());
    console.log("    Owner stops the contract...");
    return instance.stopContract({from:owner_account}).then(function(){
      carol_balance_start = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
      console.log("    Carol start = " + carol_balance_start.toString());
      console.log("    Carol tries to deposit funds into the contract...");
      return instance.depositFundsToSplitter({from:carol_account, value:web3.toWei(transferAmount, "ether")});
    }).catch(function(){
      carol_balance_ending = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
      console.log("    Carol ending = " + carol_balance_ending.toString());
      contract_balance_ending = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
      console.log("    Contract ending = " + contract_balance_ending.toString());

      assert.equal(+contract_balance_start, +contract_balance_ending, "Contract balance shouldn't have changed");
      
      return instance.resumeContract({from:owner_account});
    }).then(function(){
      console.log("    Carol tries to deposit funds into the contract...");
      return instance.depositFundsToSplitter({from:carol_account, value:web3.toWei(transferAmount, "ether")});
    }).then(function(){
      carol_balance_ending = web3.fromWei(web3.eth.getBalance(carol_account), "ether");
      console.log("    Carol ending = " + carol_balance_ending.toString());
      contract_balance_ending = web3.fromWei(web3.eth.getBalance(instance.address), "ether");
      console.log("    Contract ending = " + contract_balance_ending.toString());

      assert.isBelow(+contract_balance_start, +contract_balance_ending, "Contract balance shouldn't have changed");      
    })
  });
});
