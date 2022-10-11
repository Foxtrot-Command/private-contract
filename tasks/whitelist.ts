import { task, types } from "hardhat/config";

task("whitelist", "Disable the whitelist")
  .addParam(
    "contract",
    "Advance days in the Hardhat EVM",
    "",
    types.string,
    true
  )
  .addParam(
    "status",
    "Change the status of the whitelist",
    "",
    types.boolean,
    true
  )
  .setAction(async (taskArgs, hre) => {
    if (taskArgs.contract === "") {
      console.log("Set a contract address");
      return true;
    }

    if (taskArgs.status === "") {
      console.log("Set the status (boolean value)");
      return true;
    }

    const [deployer] = await hre.ethers.getSigners();
    const privateSale = await (
      await hre.ethers.getContractFactory("FoxtrotPrivateSale")
    ).attach(taskArgs.contract);
    await privateSale.connect(deployer).setWhitelistStatus(taskArgs.status);
    console.log("Whitelist set to", taskArgs.status);
  });
