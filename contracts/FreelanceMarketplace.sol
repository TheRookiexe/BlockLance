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

    event ModuleAdded(uint256 indexed id, address indexed client, address indexed freelancer);
    event ModuleSubmitted(uint256 indexed id, string ipfsHash);
    event ModuleApproved(uint256 indexed id, uint256 paymentAmount);

    constructor(address tokenAddress) ERC721("ModuleNFT", "MNFT") {
        token = IERC20(tokenAddress);
    }

    function addModule(address freelancer) external returns (uint256) {
        moduleCount++;
        modules[moduleCount] = Module({
            id: moduleCount,
            client: msg.sender,
            freelancer: freelancer,
            ipfsHash: "",
            submitted: false,
            paid: false
        });

        _mint(freelancer, moduleCount);

        emit ModuleAdded(moduleCount, msg.sender, freelancer);
        return moduleCount;
    }

    function submitModule(uint256 moduleId, string memory ipfsHash) external {
        Module storage m = modules[moduleId];
        require(m.freelancer != address(0), "Module does not exist");
        require(msg.sender == m.freelancer, "Only assigned freelancer can submit");
        require(!m.submitted, "Already submitted");

        m.ipfsHash = ipfsHash;
        m.submitted = true;

        emit ModuleSubmitted(moduleId, ipfsHash);
    }

    function approveModule(uint256 moduleId, uint256 paymentAmount) external {
        Module storage m = modules[moduleId];
        require(m.client != address(0), "Module does not exist");
        require(msg.sender == m.client, "Only client can approve");
        require(m.submitted, "Module not submitted");
        require(!m.paid, "Already paid");
        require(paymentAmount > 0, "Payment must be > 0");

        // Client must approve tokens first
        bool success = token.transferFrom(m.client, m.freelancer, paymentAmount);
        require(success, "Token transfer failed");

        m.paid = true;

        emit ModuleApproved(moduleId, paymentAmount);
    }
}
