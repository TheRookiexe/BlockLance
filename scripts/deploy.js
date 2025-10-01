const {ethers} = require('hardhat');

async function main() {
    const [deployer] = await ethers.getsigners();

    const Token = await ethers.getContractFactory('PaymentToken');
    const token = await Token.deploy(100000);
    await token.deployed();
    console.log("PaymentToken deployed at:", token.address);

    const Marketplace = await ethers.getContractFactory('FreelancerMarketplace');
    const marketplace = await Marketplace.deploy(token.adderss);
    await marketplace.deployed();
    console.log("Marketplace deployed at:", marketplace.adderss);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
