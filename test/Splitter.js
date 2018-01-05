var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
  var instance;

  var alice_account = accounts[1];
  var bob_account = accounts[2];
  var carol_account = accounts[3];

  var alice_balance_start;
  var bob_balance_start;
  var carol_balance_start;

  var alice_balance_ending;
  var bob_balance_ending;
  var carol_balance_ending;

  var transferAmount = web3.toWei(2, "ether");

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
    })
      
    var tx = instance.sendFunds({from: alice_account, value:transferAmount});
    
    return instance.getAliceBalance.call().then (function(balance){
      alice_balance_ending = balance.toNumber();
      return instance.getBobBalance.call();
    }).then (function(balance){
      bob_balance_ending = balance.toNumber();
      return instance.getCarolBalance.call();
    }).then (function(balance){
      carol_balance_ending = balance.toNumber();
    })    

    assert.equal(bob_balance_start, bob_balance_ending - (transferAmount/2), "Bob's account wasn't credited correctly");
    assert.equal(carol_balance_start, carol_balance_ending - (transferAmount/2), "Carol's account wasn't credited correctly");

  })

  it("Bob transfer is too expensive", function(){
    return instance.getBobBalance.call().then(function(balance){
      bob_balance_start = balance.toNumber();
    })

    var tx = instance.sendFunds({from:bob_account, value:transferAmount*bob_balance_start}); 

    return instance.getBobBalance.call().then(function(balance){
      assert.equal(balance.toNumber(), bob_balance_start, "Bob's balance has changed. The transaction succeed when it was expected to fail");
    })
  })

  it("Carol transfers to Contract successfully", function(){
    return instance.getCarolBalance.call().then(function(balance){
      carol_balance_start = balance;
    })

    var tx = instance.sendFunds({from:carol_account, value:carol_balance_start/3});

    return instance.getCarolBalance.call().then(function(balance){
      assert.isBelow(balance.toNumber(), carol_balance_start, "Carol's new balance after transfer is not lower than before");
    })
  })

});
