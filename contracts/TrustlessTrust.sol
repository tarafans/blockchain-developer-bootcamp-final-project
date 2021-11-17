// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

/// @title An NFT factory to wrap ERC20s
/// @author @hdahme
/// @dev This is moderately inefficient with gas
contract TrustlessTrust is ERC721PresetMinterPauserAutoId {

    event LogDeposit(address indexed actor, uint indexed tokenId);
    event LogWithdrawal(address indexed actor, uint indexed tokenId);
    event LogInsufficientBalance(address indexed tokenAddress, address indexed actor, uint indexed tokenId);
    event LogWithdrawalError(address indexed tokenAddress, address indexed actor, uint indexed tokenId);

    // Token id => token owners => ERC20 address => ERC20 balance. 
    // This could be done a little more efficiently with structs, but ¯\_( ツ )_/¯
    mapping(uint => mapping(address => mapping(address => uint))) tokenBalances;

    
    constructor() ERC721PresetMinterPauserAutoId(
        "TLT",
        "Trustless Trust",
        ""
    )
    {}

    /// @notice Ensures only the token owner can call the modified function
    /// @param tokenId The tokenId to operate on
    modifier onlyTokenOwner(uint tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can modify their assets");
        _;
    }

    /// @notice Fetches the user's balance of the specified token
    /// @param tokenId The tokenId to operate on
    /// @param tokenAddress The address of the wrapped ERC20 
    /// @return The user's balance of the relevant asset, in the relevant token
    function balanceOf(uint tokenId, address tokenAddress) public view returns (uint) {
        return tokenBalances[tokenId][msg.sender][tokenAddress];
    }

    /// @notice Deposits <amounts> of <assets> to this token
    /// @param tokenId The tokenId to operate on
    /// @param assetAddresses An array of the ERC20 addresses to deposit
    /// @param assetAmounts An array of the amount of ERC20 to deposit
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

    /// @notice Withdraws <amounts> of <assets> to from token
    /// @param tokenId The tokenId to operate on
    /// @param assetAddresses An array of the ERC20 addresses to withdraw
    /// @param assetAmounts An array of the amount of ERC20 to withdraw
    function withdraw(uint tokenId, address[] memory assetAddresses, uint[] memory assetAmounts) public 
        onlyTokenOwner(tokenId) {
        
        require(assetAddresses.length == assetAmounts.length, "Number of assets and number of amounts must be equal");
        for (uint i = 0; i < assetAddresses.length; i++) {
            if (tokenBalances[tokenId][msg.sender][assetAddresses[i]] < assetAmounts[i]) {
                emit LogInsufficientBalance(assetAddresses[i], msg.sender, tokenId);
            } else if (assetAddresses[i] != address(0)) {
                // Prevent reentrancy
                tokenBalances[tokenId][msg.sender][assetAddresses[i]] -= assetAmounts[i];
                ERC20 token = ERC20(assetAddresses[i]);
                require(token.transfer(msg.sender, assetAmounts[i]));
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
