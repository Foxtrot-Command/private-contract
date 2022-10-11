import { task, types } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("change-claim", "Change claim status")
  .addParam("contract", "Contract to be used in", "", types.string, true)
  .setAction(async (taskArgs, hre) => {
    if (taskArgs.contract === "") {
      console.log("Set a contract address");
      return true;
    }

    const [deployer] = await hre.ethers.getSigners();
    const privateSale = await (
      await hre.ethers.getContractFactory("FoxtrotPrivateSale")
    ).attach(taskArgs.contract);
    await privateSale.connect(deployer).changeClaimStatus();
    console.log("Status changed, correctly");
  });
