// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenC is ERC20 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor () ERC20("TokenC", "C") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
}
