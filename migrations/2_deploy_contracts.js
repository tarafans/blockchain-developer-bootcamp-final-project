var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var TokenA = artifacts.require("./TokenA.sol");
var TokenB = artifacts.require("./TokenB.sol");
var TokenC = artifacts.require("./TokenC.sol");

var TrustlessTrust = artifacts.require("./TrustlessTrust.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(TokenA);
  deployer.deploy(TokenB);
  deployer.deploy(TokenC);
  deployer.deploy(TrustlessTrust);
};
