const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("PaymentToken");
    const token = await Token.deploy(ethers.utils.parseUnits("100000", 18));
    await token.deployed();
    console.log("PaymentToken deployed at:", token.address);

    const Marketplace = await ethers.getContractFactory("FreelanceMarketplace");
    const marketplace = await Marketplace.deploy(token.address);
    await marketplace.deployed();
    console.log("Marketplace deployed at:", marketplace.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
