var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
  var instance;

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

  var transferAmount = web3.toWei(1, "ether");

  before (function(){
    return Splitter.new(alice_account, bob_account, carol_account, {from:accounts[0]}).then(function(i) {
      instance = i;
    });
  });

  it("Alice tranfer should send half to Bob and Carol", function() {
    return instance.getAliceBalance.call().then (function(balance) {
      alice_balance_start = balance.toNumber();
      return instance.getBobBalance.call();
    }).then (function(balance) {
      bob_balance_start = balance.toNumber();
      return instance.getCarolBalance.call();
    }).then (function(balance){
      carol_balance_start = balance.toNumber();
      return instance.sendFunds({from: alice_account, value:transferAmount});
    }).then(function(){});
  });

  it("  Check Alice transfer was ok", function() {
    return instance.getAliceBalance.call().then (function(balance){
      alice_balance_ending = balance.toNumber();
      return instance.getBobBalance.call();
    }).then (function(balance){
      bob_balance_ending = balance.toNumber();
      return instance.getCarolBalance.call();
    }).then (function(balance){
      carol_balance_ending = balance.toNumber();
      assert.equal(bob_balance_start.toFixed(5), bob_balance_ending.toFixed(5) - (transferAmount/2).toFixed(5), "Bob's account wasn't credited correctly");
      assert.equal(carol_balance_start.toFixed(5), carol_balance_ending.toFixed(5) - (transferAmount/2).toFixed(5), "Carol's account wasn't credited correctly");
    })
  });

  it("Carol transfers to Contract successfully", function(){
    return instance.getCarolBalance.call().then(function(balance){
      carol_balance_start = balance.toNumber();
      return instance.getContractBalance.call();
    }).then(function(balance) {
      contract_balance_start = balance.toNumber();
      return instance.sendFunds({from:carol_account, value:carol_balance_start/3});
    }).then(function(){
      return instance.getCarolBalance.call();
    }).then(function(balance){
      carol_balance_ending = balance.toNumber();
      return instance.getContractBalance.call();
    }).then(function(balance) {
      contract_balance_ending = balance.toNumber();
      assert.isBelow(carol_balance_ending.toFixed(5), carol_balance_start.toFixed(5), "Carol's new balance after transfer is not lower than before");
      assert.isAbove(contract_balance_ending.toFixed(5), contract_balance_start.toFixed(5), "Contract's balance didn't increase with Carol's transfer");
      })
  });

});
