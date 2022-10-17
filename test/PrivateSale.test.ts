import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber, formatEther, parseEther } from "./../utils";

describe("Private Sale", function () {
  let foxtrotToken: Contract,
    busdToken: Contract,
    privateSale: Contract,
    masterAccount: SignerWithAddress,
    userAccount: SignerWithAddress,
    userAccount2: SignerWithAddress,
    userAccount3: SignerWithAddress,
    companyVault: SignerWithAddress,
    addrs: SignerWithAddress[];

  const tokenomicsPercentTokens = parseEther(15050000);

  const TimeMachine = async (time: number) => {
    await ethers.provider.send("evm_increaseTime", [time]);
    await ethers.provider.send("evm_mine", []);
  };

  before(async () => {
    [masterAccount, userAccount, userAccount2, userAccount3, companyVault, ...addrs] =
      await ethers.getSigners();

    const BusdToken = await ethers.getContractFactory("MockBUSD");
    const FoxtrotCommandToken = await ethers.getContractFactory("MockFXD");
    const PrivateSale = await ethers.getContractFactory("FoxtrotPrivateSale");

    foxtrotToken = await FoxtrotCommandToken.deploy();
    busdToken = await BusdToken.deploy();
    privateSale = await PrivateSale.deploy(
      companyVault.address,
      busdToken.address
    );
  });

  describe("#Initialize sale", async () => {
    it("Grant antibot and Foundation excempt to Deployer", async () => {
      await foxtrotToken
        .connect(masterAccount)
        .setCooldownExempt(masterAccount.address, true);
      await foxtrotToken
        .connect(masterAccount)
        .setFoundationExempt(masterAccount.address, true);
      await foxtrotToken
        .connect(masterAccount)
        .setCooldownExempt(privateSale.address, true);
    });

    it("Should transfer Foxtrot Tokens to Private Sale balance", async () => {
      await foxtrotToken
        .connect(masterAccount)
        .secureTransfer(
          foxtrotToken.address,
          privateSale.address,
          tokenomicsPercentTokens,
          "Fullfill the privateSale contract"
        );
      await privateSale.setContractToken(foxtrotToken.address);
    });

    it("Should check Foxtrot Tokens balance in Private Sale contract", async () => {
      let balance = await privateSale.balance(foxtrotToken.address);
      expect(balance).to.equal(tokenomicsPercentTokens);
    });

    it("Should check if is UNIX TIMESTAMP enddate", async () => {
      const endDate = await privateSale.connect(masterAccount).getSaleEnd();
      expect(endDate).to.match(/^\d{10}$/, "Invalid unix timestamp")
    })

    it("Should claim date would be zero", async () => {
      const claimDate = await privateSale.connect(masterAccount).claimStartAt();
      expect(claimDate).to.equal(0);
    })

    describe("#BUSD deployment", async () => {
      it("master wallet should have all of the BUSD tokens", async () => {
        let balance = await busdToken.balanceOf(masterAccount.address);
        expect(balance).to.equal(parseEther(500000000));
      });
    });
  });

  describe("#Invest", async () => {
    it("Should send money from Master to User wallet to invest", async () => {
      let amount = parseEther(15000);
      await busdToken
        .connect(masterAccount)
        .transfer(userAccount.address, amount);
      let newBalance = await busdToken.balanceOf(userAccount.address);
      expect(newBalance).to.equal(amount);
    });

    it("Should approve allowance", async () => {
      let amount = parseEther(10000000);
      await busdToken.connect(userAccount).approve(privateSale.address, amount);

      let allowance = await busdToken.allowance(
        userAccount.address,
        privateSale.address
      );
      expect(allowance).to.equal(amount, "Allowance amount incorrect");
    });

    it("Should check userAccount BUSD balance", async () => {
      let expectedBalance = parseEther(15000);
      let actualBalance = await busdToken.balanceOf(userAccount.address);
      expect(actualBalance).to.equal(expectedBalance, "Balance incorrect!");
    });

    it("Should invest 50 BUSD from userAccount", async () => {
      let amount = parseEther(50);
      await expect(privateSale.connect(userAccount).invest(amount))
        .to.emit(privateSale, "Invest")
        .withArgs(userAccount.address, amount, parseEther(1666));
    });

    it("It should can invest left BUSD in whitelist balance", async () => {
      let amount = parseEther(5000);
      await expect(privateSale.connect(userAccount).invest(amount))
        .to.emit(privateSale, "Invest")
        .withArgs(userAccount.address, amount, parseEther(166666));
    });

    it("Company vault should have 10000 BUSD in the wallet", async () => {
      let expectedBalance = parseEther(5050);
      let balance = await busdToken.balanceOf(companyVault.address);
      expect(balance).to.equal(expectedBalance, "Balance incorrect!");
    });

    it("Should send money from Master to User wallet to invest", async () => {
      let amount = parseEther(15000);
      await busdToken
        .connect(masterAccount)
        .transfer(userAccount2.address, amount);
      let newBalance = await busdToken.balanceOf(userAccount2.address);
      expect(newBalance).to.equal(amount);
    });

    it("Should approve allowance", async () => {
      let amount = parseEther(10000000);
      await busdToken
        .connect(userAccount2)
        .approve(privateSale.address, amount);

      let allowance = await busdToken.allowance(
        userAccount2.address,
        privateSale.address
      );
      expect(allowance).to.equal(amount, "Allowance amount incorrect");
    });

    it("Should invest 10000 BUSD from userAccount2", async () => {
      let amount = parseEther(10000);
      await expect(privateSale.connect(userAccount2).invest(amount))
        .to.emit(privateSale, "Invest")
        .withArgs(userAccount2.address, amount, parseEther(333333));
    });
  });

  describe("#Claim", async () => {


      it("Should invest personating a address", async () => {
        await privateSale.manualInvest(userAccount3.address, parseEther(350));

        let accounting = await privateSale.investorAccounting(
          userAccount3.address
        );
        expect(accounting.total).to.equal(parseEther(11666), "Amount incorrect");
        expect(accounting.claimed).to.equal(0, "Amount incorrect");
        expect(accounting.locked).to.equal(parseEther(11666), "Amount incorrect");
      })


    it("Should check the total amount of accounting investor", async () => {
      let accounting = await privateSale.investorAccounting(
        userAccount.address
      );
      expect(accounting.total).to.equal(parseEther(168332), "Amount incorrect");
      expect(accounting.claimed).to.equal(0, "Amount incorrect");
      expect(accounting.locked).to.equal(
        parseEther(168332),
        "Amount incorrect"
      );
      expect(accounting.busd).to.equal(parseEther(5050), "Amount incorrect");
    });

    it("Should enable Claim status", async () => {
      const changeClaimStatusTx = await privateSale
        .connect(masterAccount)
        .changeClaimStatus();
      expect(
        await privateSale.isClaimEnabled(),
        "Change claim is not available"
      ).to.true;
      
      const tx = changeClaimStatusTx.wait();
      const event = await tx;
      expect(event.transactionHash).to.match(/^0x([A-Fa-f0-9]{64})$/)
    });

    it("It should not be possible to change Claim status again", async () => {
      await expect(
        privateSale.connect(masterAccount).changeClaimStatus()
      ).to.be.revertedWith("FXD: Claim already enabled");
    });

    it("Should check available tokens of X Address", async () => {
      let availableOf = await privateSale.availableOf(userAccount.address);
      expect(availableOf).to.equal(parseEther(13466.56));
    })

    it("Should be able to claim 8% of available tokens", async () => {
      await privateSale.connect(userAccount).claim();
      let balance = await foxtrotToken.balanceOf(userAccount.address);
      expect(Number(formatEther(balance))).to.equal(
        13466.56,
        "Balance of 8% tokens incorrect"
      );
    });

    it("It should NOT be possible to claim until 90 days of cliff time", async () => {
      await expect(privateSale.connect(userAccount).claim()).to.be.revertedWith(
        "FXD: Can't claim, 90 days cliff"
      );
    });
  });

  describe("#Admin functionalities", async () => {

    it("#~[TEST] Send BUSD to contract", async () => {
      await busdToken
        .connect(masterAccount)
        .transfer(privateSale.address, parseEther(999));

      expect(await busdToken.balanceOf(privateSale.address)).to.equal(parseEther(999))
    })

    it("Should be reverted because cannot withdraw Foxtrot Tokens", async () => {
      expect(privateSale
        .connect(masterAccount)
        .withdraw(foxtrotToken.address, userAccount3.address, parseEther(400))
      )
        .to.be.revertedWith("FXD: You can't withdraw Foxtrot Tokens");
    })

    it("Should withdraw all non Foxtrot Tokens from the Smart Contract", async () => {
      const withdraw = await privateSale
        .connect(masterAccount)
        .withdraw(busdToken.address, userAccount3.address, parseEther(999))

      expect(withdraw).to.emit(privateSale, 'transfer')
      expect(await busdToken.balanceOf(userAccount3.address)).to.equal(parseEther(999), 'Amount incorrect');
      expect(await busdToken.balanceOf(privateSale.address)).to.equal(0, 'Amount incorrect');

    })

    it("Should purge non selled tokens", async () => {
      await privateSale.setSaleEnd();

      let totalAmountOfBuyedTokens = 513_331 - 13466.56;
      await privateSale.connect(masterAccount).purgeNonSelledTokens();
      let balance_after = await privateSale.balance(foxtrotToken.address);
      expect(Number(formatEther(balance_after))).to.equal(
        totalAmountOfBuyedTokens,
        "Purge balance privateSale incorrect"
      );

      let balance = await foxtrotToken.balanceOf(foxtrotToken.address);
      expect(Number(formatEther(balance))).to.equal(
        214_486_669,
        "Purge balance foxtrotToken incorrect"
      );
    });
  });

  describe("#Time advanced", async () => {

    let times = {
      seconds: 0.0000029591,
      minutes: 0.00017754,
      hours: 0.0106527,
      days: 0.2556,
      month: 7.67,
    };

    // The time is accumulative
    let time_phases = [
      1,
      60,
      3600,
      86400,
      2592000,
      3 * 2592000,
      6 * 2592000,
      2 * 2592000,
      2592000,
    ];

    let phases = [
      "second",
      "minute",
      "hour",
      "day",
      "month",
      "4 months",
      "10 months",
      "12 months",
      "13 months",
    ];

    const testPercentages = async (
      account: SignerWithAddress,
      time: number,
      timeSelector: number
    ) => {
      let accounting = await privateSale.investorAccounting(account.address);
      let tge = accounting.total * 0.08;

      TimeMachine(time);
      await privateSale.connect(account).claim();
      let balance = await foxtrotToken.balanceOf(account.address);

      let balanceAfter = (tge * timeSelector) / 100;
      let balanceLenght = (balance + balanceAfter).length;

      expect(balance).to.be.equal(
        BigNumber(
          balance + balanceAfter.toString().substring(23, balanceLenght - 18)
        )
      );
    };

    describe("#~ Advance the cliff time", async () => {
      it("Should update the cliff time", async () => {
        TimeMachine(90 * 24 * 60 * 60);
      });
    });

    describe("#~ Time controller", async () => {
      let values = Object.values(times);
      let totalValues = time_phases.length;
      time_phases.map((time, index) => {
        let phaseName = /\d/.test(phases[index])
          ? phases[index]
          : 1 + " " + phases[index];

        if (totalValues - 1 !== index) {
          it(`The received percentage should be the correct at ${phaseName} [${values[index]
            ? values[index]
            : values[4] * Number(phaseName.replace(" months", ""))
            }]`, async () => {
              await testPercentages(userAccount, time, values[index]);
            });
        } else {
          it(`Should be reverted because tokens are already claimed at ${phaseName}`, async () => {
            await expect(
              privateSale.connect(userAccount).claim()
            ).to.be.revertedWith("FXD: Already claimed your tokens");
          });
        }
      });
    });
  });
});
