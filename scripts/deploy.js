import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const Token = await ethers.getContractFactory("PaymentToken");
  const token = await Token.deploy(1000000n); 
  await token.deployed();
  console.log("PaymentToken deployed at:", token.address);

  const Marketplace = await ethers.getContractFactory("FreelanceMarketplace");
  const marketplace = await Marketplace.deploy(token.address);
  await marketplace.deployed();
  console.log("FreelanceMarketplace deployed at:", marketplace.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
