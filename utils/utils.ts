import { ethers } from "hardhat";

export const BigNumber = (value: any) => ethers.BigNumber.from(value);
export const parseEther = (value: number) =>
  ethers.utils.parseEther(String(value));
export const formatEther = (value: number) =>
  Number(ethers.utils.formatEther(String(value)));
