import { task, types } from "hardhat/config";

task("sale-end", "Set the private sale to end")
  .addParam(
    "contract",
    "Advance days in the Hardhat EVM",
    "",
    types.string,
    true
  )
  .setAction(async (taskArgs, hre) => {
    if (taskArgs.contract === "") {
      console.log("Set a contract address");
      return true;
    }

    const [deployer] = await hre.ethers.getSigners();
    const privateSale = await (
      await hre.ethers.getContractFactory("FoxtrotPrivateSale")
    ).attach(taskArgs.contract);
    await privateSale.connect(deployer).setSaleEnd();
    console.log("Sale closed");
  });
