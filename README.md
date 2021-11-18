# Trust (less) Trust

This is a simple dapp which lets you wrap your cryptoassets into an NFT

The dapp
* uses the factory to create an NFT 
* calls `approve(factory.address, amount)` on each relevant asset so the NFT can transfer those assets around
* calls `wrap(asssets[], amounts[])` on the NFT, which transfers assets to the NFT

The NFT can then be transfered as any other NFT

When it comes time to "withdraw" funds, the owner of the NFT can call `unwrap`, which transfers wrapped assets to the current owner

A good analogy for this in legacy finance is a revocable living trust.

## Setup

To compile the contracts, run `truffle migrate --reset`

To run the webapp, run `yarn start` from `/client`

If you're running locally, please make sure you're using just `localhost:3000` and your metamask is connected to Ganache (ie, `localhost:7545`) and you've imported the first account from Ganache - the migration script mints mock ERC20s, but doesn't transfer them to any other accounts, and the app only works with a balance of those mock ERC20s

## Testing

`truffle test`

## Further work

This project was pretty hacky, just to prove out the concept. However, for the next generation of this project built with hardhard, etherjs, and scaffoldeth, which will be deployed in a production setting as part of the Coinbase.org DAO, please view [GiveCrypto](https://github.com/givecrypto/trustless-trust)

## Public ETH account

`0xB18cE756aC866264b1017344E4a921A2733ab43e`

## Public website address

[https://hdahme.github.io/blockchain-developer-bootcamp-final-project/](https://hdahme.github.io/blockchain-developer-bootcamp-final-project/)

## Screencast

[https://drive.google.com/file/d/11ApmC0328rUZOyLGeu-YrE9ck2AEc0bG/view?usp=sharing](https://drive.google.com/file/d/11ApmC0328rUZOyLGeu-YrE9ck2AEc0bG/view?usp=sharing)