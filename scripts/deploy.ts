import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  let masterAccount: SignerWithAddress;

  [masterAccount] = await ethers.getSigners();

  const FoxtrotCommandToken = await hre.ethers.getContractFactory("MockFXD");
  const foxtrotToken = await FoxtrotCommandToken.deploy();

  const BusdToken = await hre.ethers.getContractFactory("MockBUSD");
  const busdToken = await BusdToken.deploy();

  const PrivateSale = await hre.ethers.getContractFactory("FoxtrotPrivateSale");
  const privateSale = await PrivateSale.deploy(
    masterAccount.address,
    busdToken.address
  );

  await foxtrotToken.deployed();
  await busdToken.deployed();
  await privateSale.deployed();

  await foxtrotToken
    .connect(masterAccount)
    .secureTransfer(
      foxtrotToken.address,
      privateSale.address,
      ethers.utils.parseEther("32250000"),
      "Test Purpouses"
    );

  //await foxtrotToken.connect(masterAccount).setAddressOfAllowedContract('Seed', seedSale.address);
  //await foxtrotToken.connect(masterAccount).safeTransferBusinessTokens('Seed');
  await privateSale.setContractToken(foxtrotToken.address);

  console.log("Token deployed to:", foxtrotToken.address);

  console.log(`
NEXT_PUBLIC_PRIVATE_ONE_CONTRACT=${privateSale.address}
NEXT_PUBLIC_BUSD_CONTRACT=${busdToken.address}
NEXT_PUBLIC_FXD_CONTRACT=${foxtrotToken.address}
  `);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
