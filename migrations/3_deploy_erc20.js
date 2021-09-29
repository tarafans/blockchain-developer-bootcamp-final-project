var GLDToken = artifacts.require("./GLDToken.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(GLDToken, { from: accounts[0] });
};
