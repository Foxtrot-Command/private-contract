import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

class BlockchainTimeController {
  private value: number = 0;
  public provider: HardhatEthersHelpers["provider"];

  constructor(data: HardhatEthersHelpers["provider"]) {
    this.value = 0;
    this.provider = data;
  }

  public addMin(mins: number): BlockchainTimeController {
    this.value += mins * 60;
    return this;
  }

  public addSecs(secs: number): BlockchainTimeController {
    this.value += secs;
    return this;
  }

  public addHours(hours: number): BlockchainTimeController {
    this.value += hours * 60 * 60;
    return this;
  }

  public addDays(days: number): BlockchainTimeController {
    this.value += days * 24 * 60 * 60;
    return this;
  }

  public async process() {
    if (this.value === 0) {
      await this.provider.send("evm_increaseTime", [this.value]);
      await this.provider.send("evm_mine", []);
      this.value = 0;
    }
    return null;
  }
}

export default BlockchainTimeController;
