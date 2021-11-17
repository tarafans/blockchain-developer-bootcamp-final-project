const truffleAssert = require('truffle-assertions');
const TrustlessTrust = artifacts.require("./TrustlessTrust.sol");
const TokenA = artifacts.require("./TokenA.sol");

contract("TrustlessTrust", accounts => {
  // This largely just smoke tests the contract under proper usage conditions
  it("...should allow minting, depositing, and withdrawing", async () => {
    const tokenAInstance = await TokenA.deployed();
    const trustlessTrustInstance = await TrustlessTrust.deployed();

    const myTrustlessTrust = await trustlessTrustInstance.mint(accounts[0], { from: accounts[0] });
    const myTrustlessTrustId = await trustlessTrustInstance.tokenOfOwnerByIndex(accounts[0], 0, { from: accounts[0] });
    assert.equal(myTrustlessTrustId, 0, "The first tokenId was not 0");

    // Approve TLT to spend TokenA
    const myTokenABalancePreDeposit = await tokenAInstance.balanceOf(accounts[0], { from: accounts[0] });
    await tokenAInstance.approve(trustlessTrustInstance.address, 10000, { from: accounts[0] });

    // Deposit TokenA into the contract
    await trustlessTrustInstance.deposit(myTrustlessTrustId, [tokenAInstance.address], [10000]);

    // Get balance of A
    const balance = await trustlessTrustInstance.balanceOf.call(myTrustlessTrustId, tokenAInstance.address, { from: accounts[0] });

    assert.equal(balance, 10000, "The deposited and actual balances don't match");

    // Withdraw A
    await trustlessTrustInstance.withdraw(myTrustlessTrustId, [tokenAInstance.address], [10000]);
    const myTokenABalancePostWithdraw = await tokenAInstance.balanceOf(accounts[0], { from: accounts[0] });

    // Ensure no tokens were lost in transit
    assert.equal(web3.utils.fromWei(myTokenABalancePreDeposit),  web3.utils.fromWei(myTokenABalancePostWithdraw), "The balances don't match before and after depositing/withdrawing");
  });

  // This ensures you can only deposit if you have some of the underlying asset
  it("...should not allow depositing if you don't have a large enough balance", async () => {
    const tokenAInstance = await TokenA.deployed();
    const trustlessTrustInstance = await TrustlessTrust.deployed();

    const myTrustlessTrust = await trustlessTrustInstance.mint(accounts[1], { from: accounts[0] });
    const myTrustlessTrustId = await trustlessTrustInstance.tokenOfOwnerByIndex(accounts[1], 0, { from: accounts[0] });

    // Approve TLT to spend TokenA
    await tokenAInstance.approve(trustlessTrustInstance.address, 10000, { from: accounts[1] });

    // Deposit TokenA into the contract
    await truffleAssert.reverts(
        trustlessTrustInstance.deposit(myTrustlessTrustId, [tokenAInstance.address], [10000], { from: accounts[1] }),
        "ERC20: transfer amount exceeds balance"
    );
  });

  // This ensures deposits have to be well formed
  it("...should not allow depositing if the parameters are malformed", async () => {
    const tokenAInstance = await TokenA.deployed();
    const trustlessTrustInstance = await TrustlessTrust.deployed();

    const myTrustlessTrust = await trustlessTrustInstance.mint(accounts[1], { from: accounts[0] });
    const myTrustlessTrustId = await trustlessTrustInstance.tokenOfOwnerByIndex(accounts[0], 0, { from: accounts[0] });

    // Approve TLT to spend TokenA
    await tokenAInstance.approve(trustlessTrustInstance.address, 10000, { from: accounts[0] });

    // Deposit TokenA into the contract
    await truffleAssert.reverts(
        trustlessTrustInstance.deposit(myTrustlessTrustId, [tokenAInstance.address], [10000, 0], { from: accounts[0] }),
        "Number of assets and number of amounts must be equal"
    );
  });

  // This ensures the actor withdrawing is actually the token owner
  it("...should not allow withdrawing someone else's assets", async () => {
    const tokenAInstance = await TokenA.deployed();
    const trustlessTrustInstance = await TrustlessTrust.deployed();

    const myTrustlessTrust = await trustlessTrustInstance.mint(accounts[1], { from: accounts[0] });
    const myTrustlessTrustId = await trustlessTrustInstance.tokenOfOwnerByIndex(accounts[0], 0, { from: accounts[0] });

    await tokenAInstance.approve(trustlessTrustInstance.address, 10000, { from: accounts[0] });
    await trustlessTrustInstance.deposit(myTrustlessTrustId, [tokenAInstance.address], [10000]);

    // Deposit TokenA into the contract
    await truffleAssert.reverts(
        trustlessTrustInstance.withdraw(myTrustlessTrustId, [tokenAInstance.address], [10000], { from: accounts[1] }),
        "Only the owner can modify their assets"
    );
  });

  // This ensures withdrawals are well formed
  it("...should not allow withdrawing if the parameters are malformed", async () => {
    const tokenAInstance = await TokenA.deployed();
    const trustlessTrustInstance = await TrustlessTrust.deployed();

    const myTrustlessTrust = await trustlessTrustInstance.mint(accounts[1], { from: accounts[0] });
    const myTrustlessTrustId = await trustlessTrustInstance.tokenOfOwnerByIndex(accounts[0], 0, { from: accounts[0] });

    await tokenAInstance.approve(trustlessTrustInstance.address, 10000, { from: accounts[0] });
    await trustlessTrustInstance.deposit(myTrustlessTrustId, [tokenAInstance.address], [10000]);

    // Deposit TokenA into the contract
    await truffleAssert.reverts(
        trustlessTrustInstance.withdraw(myTrustlessTrustId, [tokenAInstance.address], [10000, 0], { from: accounts[0] }),
        "Number of assets and number of amounts must be equal"
    );
  });
});
