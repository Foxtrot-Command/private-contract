import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  let masterAccount;
  let privateSaleVault2 = "0x5Cb9dDb9e859CF87fE515597306483D7198B9471";
  let fxdToken = "0x15df8d414ab0add3e989af15fea7d279e4c2c58a";
  let busdToken = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

  [masterAccount] = await ethers.getSigners();

  const PrivateSale = await hre.ethers.getContractFactory("FoxtrotPrivateSale");
  const privateSale = await PrivateSale.deploy(privateSaleVault2, busdToken);

  try {
    await hre.run("verify:verify", {
      address: privateSale.address,
      contract: "contracts/FoxtrotPrivateSale.sol:FoxtrotPrivateSale",
      constructorArguments: [privateSaleVault2, busdToken],
    });
  } catch (err: any) {
    if (err.message.includes("Reason: Already Verified")) {
      console.log("Contract is already verified!");
    }
  }

  await privateSale.setContractToken(fxdToken);

  console.log("Contract address: %s", privateSale.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
