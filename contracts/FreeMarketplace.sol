// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract FreelanceMarketplace is ERC721 {
    IERC20 public token;
    uint256 public moduleCount;

    struct Module {
        uint256 id;
        address client;
        address freelancer;
        string ipfsHash;
        bool submitted;
        bool paid;
    }

    mapping(uint256 => Module) public modules;

    constructor(address tokenAddress) ERC721("ModuleNFT", "MNFT"){
        token = IERC20(tokenAddress);
    }

    function addModule(address freelancer) external returns (uint256) {
        moduleCount++;
        modules[moduleCount] = Module(moduleCount, msg.sender, freelancer, "", false, false);
        _mint(freelancer, moduleCount);
        return moduleCount;
    }

    function submitModule(uint256 moduleId, string memory ipfsHash) external {
        Module storage m = modules[moduleId];
        require(msg.sender == m.freelancer, "Only assigned freelancer can submit");
        m.ipfsHash = ipfsHash;
        m.submitted = true;
    }

    function approveModule(uint256 moduleId, uint256 paymentAmount) external {
        Module storage m = modules[moduleId];
        require(msg.sender == m.client, "Only client can approve");
        require(m.submitted && !m.paid, "Module not submitted or already paid");
        token.transfer(m.freelancer, paymentAmount);
        m.paid = true;
    }
}