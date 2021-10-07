// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract TrustlessTrust is ERC721PresetMinterPauserAutoId {

    event LogDeposit(address indexed actor, uint indexed tokenId);
    event LogWithdrawal(address indexed actor, uint indexed tokenId);
    event LogInsufficientBalance(address indexed tokenAddress, address indexed actor, uint indexed tokenId);
    event LogWithdrawalError(address indexed tokenAddress, address indexed actor, uint indexed tokenId);

    // Token id => token owners => ERC20 address => ERC20 balance
    mapping(uint => mapping(address => mapping(address => uint))) tokenBalances;

    constructor() ERC721PresetMinterPauserAutoId(
        "TLT",
        "Trustless Trust",
        ""
    )
    {}

    modifier onlyTokenOwner(uint tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can modify their assets");
        _;
    }

    function balanceOf(uint tokenId, address tokenAddress) public returns (uint) {
        return tokenBalances[tokenId][msg.sender][tokenAddress];
    }

    function deposit(uint tokenId, address[] memory assetAddresses, uint[] memory assetAmounts) public 
        onlyTokenOwner(tokenId) {
        require(assetAddresses.length == assetAmounts.length, "Number of assets and number of amounts must be equal");
        uint assetLength = assetAddresses.length;
        for (uint i = 0; i < assetLength; i++) {
            ERC20 erc20 = ERC20(assetAddresses[i]);
            require(erc20.transferFrom(msg.sender, address(this), assetAmounts[i]));
            tokenBalances[tokenId][msg.sender][assetAddresses[i]] += assetAmounts[i];
        }

        emit LogDeposit(msg.sender, tokenId);
    }

    function withdraw(uint tokenId, address[] memory assetAddresses, uint[] memory assetAmounts) public 
        onlyTokenOwner(tokenId) {
        
        require(assetAddresses.length == assetAmounts.length, "Number of assets and number of amounts must be equal");
        for (uint i = 0; i < assetAddresses.length; i++) {
            // Prevent reentrancy
            // uint oldBalance = tokenBalances[tokenId][msg.sender][assetAddresses[i]];

            if (tokenBalances[tokenId][msg.sender][assetAddresses[i]] < assetAmounts[i]) {
                emit LogInsufficientBalance(assetAddresses[i], msg.sender, tokenId);
            } else if (assetAddresses[i] != address(0)) {
                tokenBalances[tokenId][msg.sender][assetAddresses[i]] -= assetAmounts[i];
                ERC20 token = ERC20(assetAddresses[i]);
                require(token.transfer(msg.sender, assetAmounts[i]));
                // (bool success, bytes memory returnData) =
                //     address(token).call( // This creates a low level call to the token
                //         abi.encodePacked( // This encodes the function to call and the parameters to pass to that function
                //             token.transfer.selector, // This is the function identifier of the function we want to call
                //             abi.encode(msg.sender, assetAmounts[i]) // This encodes the parameter we want to pass to the function
                //         )
                //     );
                // if (!success) {
                //     tokenBalances[tokenId][msg.sender][assetAddresses[i]] = oldBalance;
                //     emit LogWithdrawalError(assetAddresses[i], msg.sender, tokenId);
                // }
            }
        }

        emit LogWithdrawal(msg.sender, tokenId);
    }

    // Prevent wrapping with itself
    function transferFrom(address _from, address _to, uint256 _tokenId) override public {
        require(_to != address(this));
        return super.transferFrom(_from, _to, _tokenId);
    }
}
