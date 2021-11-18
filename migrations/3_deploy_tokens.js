var TokenA = artifacts.require("./TokenA.sol");
var TokenB = artifacts.require("./TokenB.sol");
var TokenC = artifacts.require("./TokenC.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenA);
  deployer.deploy(TokenB);
  deployer.deploy(TokenC);
};
