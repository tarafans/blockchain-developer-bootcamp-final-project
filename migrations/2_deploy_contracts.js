var TrustlessTrust = artifacts.require("./TrustlessTrust.sol");

module.exports = function(deployer) {
  deployer.deploy(TrustlessTrust);
};
