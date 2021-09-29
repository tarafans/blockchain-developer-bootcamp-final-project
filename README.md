# Trust (less) Trust

This is a simple dapp which lets you wrap your cryptoassets into an NFT

The dapp
* uses the factory to create an NFT 
* calls `approve(factory.address, amount)` on each relevant asset so the NFT can transfer those assets around
* calls `wrap(asssets[], amounts[])` on the NFT, which transfers assets to the NFT

The NFT can then be transfered as any other NFT

When it comes time to "withdraw" funds, the owner of the NFT can call `unwrap`, which transfers wrapped assets to the current owner

A good analogy for this in legacy finance is a revocable living trust.
