var GLDToken = artifacts.require("./GLDToken.sol");
var TrustlessTrust = artifacts.require("./TrustlessTrust.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TrustlessTrust, { from: accounts[0] });

  token = await GLDToken.deployed()
  trust = await TrustlessTrust.deployed()

  await token.approve(trust.address, 1000, { from: accounts[0] })
  await trust.create([token.address], [1], { from: accounts[0] })
};
