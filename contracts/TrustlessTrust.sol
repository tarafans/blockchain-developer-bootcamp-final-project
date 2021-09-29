// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract TrustlessTrust is ERC721PresetMinterPauserAutoId {

    constructor() ERC721PresetMinterPauserAutoId(
        "TLT",
        "Trustless Trust",
        ""
    )
    {}

    function create(address[] memory assetAddresses, uint[] memory assetAmounts) public {
        require(assetAddresses.length == assetAmounts.length, "Number of assets and number of amounts must be equal");
        uint assetLength = assetAddresses.length;
        for (uint i=0; i<assetLength; i++) {
            ERC20 erc20 = ERC20(assetAddresses[i]);
            require(erc20.transferFrom(msg.sender, address(this), assetAmounts[i]));
        }
    }
}
