// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PaymentToken is ERC20 {
    constructor(uint256 initialsupply) ERC20("FreelanceToken", "FLT") {
        _mint(msg.sender, initialsupply);
    }
}