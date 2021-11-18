import React, { Component, useState, useEffect } from "react";
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import getWeb3 from "./getWeb3";
// import Sidebar from "react-sidebar";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faTimesCircle, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Table, WALLET_VIEW, NFT_VIEW } from "./components/Table.js"
import Identicon from "./components/Identicon.js"

// Generic ERC20 interface
import ERC20ABI from "./contracts/ERC20.json";

// Trustless Trust
import TrustlessTrust from "./contracts/TrustlessTrust.json";

// In production we'd load this information from github, but alas
import TokenA from "./contracts/TokenA.json";
import TokenB from "./contracts/TokenB.json";
import TokenC from "./contracts/TokenC.json";

import "./App.scss";

library.add(fab, faCheckSquare, faChevronRight, faTimesCircle)

const INFINITE = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export async function fetchAllTokens(web3, networkId) {
  // Here we'd reach into the Uniswap github or something to get the definitive list of all tokens,
  // addresses, icons, etc
  return [
    {
      address: TokenA.networks[networkId].address,
      name: TokenA.contractName,
      icon: "https://github.com/spothq/cryptocurrency-icons/blob/master/128/color/bcc.png?raw=true"
    },
    {
      address: TokenB.networks[networkId].address,
      name: TokenB.contractName,
      icon: "https://github.com/spothq/cryptocurrency-icons/blob/master/128/color/usdc.png?raw=true"
    },
    {
      address: TokenC.networks[networkId].address,
      name: TokenC.contractName,
      icon: "https://github.com/spothq/cryptocurrency-icons/blob/master/128/color/aave.png?raw=true"
    }
  ]
};

export const getExistingNftInstance = async (account, trustlessTrust) => {
  const balance = await trustlessTrust.methods.balanceOf(account).call();
  if (balance < 1) return new Promise((resolve, reject) => { resolve(-1) });

  let tokenId = await trustlessTrust.methods.tokenOfOwnerByIndex(account, 0).call();
  return new Promise((resolve, reject) => { resolve(tokenId) });
}

export const mintNewInstance = async (account, trustlessTrust) => {
  const instance = await trustlessTrust.methods.mint(account).send({from: account});
  window.location.reload();
}

class App extends Component {
  state = { 
    storageValue: 0, 
    web3: null, 
    accounts: null, 
    contract: null, 
    sidebarOpen: false,
    assetAddress: null
  };

  onSetSidebarOpen = this.onSetSidebarOpen.bind(this);

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
    document.querySelectorAll('[role="navigation"]').forEach(x => x.classList.add(open ? "sidebarOpen" : "sidebarClosed"));
  };

  approveToken = async (address) => {
    let token = await new this.state.web3.eth.Contract(
      this.state.ERC20ABI.abi,
      address,
    );
  
    await token.methods.approve(this.state.trustlessTrust._address, INFINITE).send({ from: this.state.accounts[0] });
    window.location.reload();
  }

  depositToken = async (address) => {
    let token = await new this.state.web3.eth.Contract(
      this.state.ERC20ABI.abi,
      address,
    );

    const balance = await token.methods.balanceOf(this.state.accounts[0]).call();
    await this.state.trustlessTrust.methods.deposit(this.state.trustlessTrustId, [address], [balance]).send({from : this.state.accounts[0]});
    window.location.reload();
  }

  withdrawToken = async (address) => {
    const balance = await this.state.trustlessTrust.methods.balanceOf(this.state.trustlessTrustId, address).call();
    await this.state.trustlessTrust.methods.withdraw(this.state.trustlessTrustId, [address], [balance]).send({from : this.state.accounts[0]});
    window.location.reload();
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the supported contracts
      const networkId = await web3.eth.net.getId();
      if (networkId === "loading") return;

      const supportedTokens = await fetchAllTokens(web3, networkId);

      const trustlessTrust = await new web3.eth.Contract(
        TrustlessTrust.abi,
        TrustlessTrust.networks[networkId].address
      );

      const trustlessTrustId = await getExistingNftInstance(accounts[0], trustlessTrust);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, supportedTokens, trustlessTrust, ERC20ABI, trustlessTrustId }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { web3, accounts, supportedTokens, trustlessTrust, trustlessTrustId } = this.state;

    for (let t of supportedTokens) {
      let token = await new web3.eth.Contract(
        ERC20ABI.abi,
        t.address,
      );
      t.walletBalance = await token.methods.balanceOf(accounts[0]).call();
      t.nftBalance = await trustlessTrust.methods.balanceOf(trustlessTrustId, t.address).call();
      t.approved = (await token.methods.allowance(accounts[0], trustlessTrust._address).call()) !== '0';
    }

    // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();
    // const response = await erc20Base.methods.balanceOf(accounts[0]).call();

    // Update state with the result.
    // this.setState({ storageValue: response });

    this.setState({ connectedWallet: accounts[0] })
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="walletConnect">
          <Button>
            { this.state.accounts[0] ?
              <span>
                The connected address is: {this.state.accounts[0].substring(0, 8)}[...] <Identicon />
              </span>
            :
            <span>
              Please connect your wallet
            </span>
            }
          </Button>
        </div>

        <div className="main">
          <h1>TrustlessTrust</h1>
          <p>
            This dApp wraps the assets in your wallet into an NFT, which is then transferable to any another account. To use this,
          </p>
          <ul>
            <li>
              Mint a new TrustlessTrust instance if you don't already have one
            </li>
            <li>
              Approve whichever assets you want to wrap in it
            </li>
            <li>
              Transfer those assets
            </li>
            <li>
              Watch the balance on your TrustlessTrust increase accordingly
            </li>
          </ul>

          <h2>Your Trustless Trust</h2>

          <Button onClick={()=>mintNewInstance(this.state.accounts[0], this.state.trustlessTrust)} disabled={this.state.trustlessTrustId >= 0}>
            Mint
          </Button>
          <h5>
          { this.state.trustlessTrustId >= 0 ?
            <div>
              <span>
                Your TrustlessTrust contract address is {this.state.trustlessTrust._address}[{this.state.trustlessTrustId}]
              </span>
              <Table 
                body={this.state.supportedTokens.filter((t) => t.nftBalance > 0)} 
                withdraw={this.withdrawToken} 
                view={NFT_VIEW}
                />
            </div>
            :
            <span></span>
          }
          </h5>

          <h2>Approve and transfer tokens</h2>
          
          <Table 
            body={this.state.supportedTokens.filter((t) => t.walletBalance > 0)} 
            approve={this.approveToken} 
            deposit={this.depositToken} 
            view={WALLET_VIEW}
          />
        </div>

        {/* <Sidebar
          sidebar={
            <div className="sidebarContent">
              <h1>Getting Started</h1>
              
            </div>
          }
          open={this.state.sidebarOpen}
          onSetOpen={this.onSetSidebarOpen}
          styles={{ sidebar: { 
            background: "white",
            width: "300px"
          } }}
        >
        </Sidebar>
        <Button onClick={()=>this.onSetSidebarOpen(!this.state.sidebarOpen)} className="sidebarNav">
            { this.state.sidebarOpen
              ? 
              <span>
                   <FontAwesomeIcon icon="times-circle" />
              </span> 
              : 
              <span>
                <FontAwesomeIcon icon="chevron-right" />
              </span>
            }
          </Button> */}

      </div>
    );
  }
}

export default App;
