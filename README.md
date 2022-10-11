[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/badge/Solidity-0.8.4-white.svg?labelColor=white&logoColor=363636&color=363636&style=flat&logo=solidity)](https://docs.soliditylang.org/en/latest/)

# Public Private(2) Sale Smart contract

- Min amount buy amount 50 $BUSD
- TGE 8%
- Cliff 3 months
- 7,66% vesting monthly

## Overview

On-Chain vesting scheme enabled by smart contracts.

`FoxtrotPrivateSale` contract can release its token balance gradually like a typical vesting scheme, with a cliff and vesting period.

### 📦 Installation

```console
$ yarn
```

### ⛏️ Compile

```console
$ yarn compile
```

This task will compile all smart contracts in the `contracts` directory.
ABI files will be automatically exported in `artifacts/contracts/~` directory.

### 📚 Documentation

Documentation is auto-generated after each build in `docs` directory.

The generated output is a static website containing smart contract documentation.

### ⛓ Local Chain

```console
$ yarn nodo
```

### 🌡️ Testing

```console
$ yarn test
```

### 📊 Code coverage

```console
$ yarn coverage
```

The report will be printed in the console and a static website containing full report will be generated in `coverage` directory.

### ✨ Code style

```console
$ yarn prettier
```

### 💻 Verify & Publish contract source code

```console
$ npx hardhat verify --network bsc $CONTRACT_ADDRESS $CONSTRUCTOR_ARGUMENTS
```

Or you can use the script for autodeploy

```console
$ npx hardhat scripts/deployPrivateSale.ts
```

## 📄 License

**Token Vesting Contracts** is released under the [Apache-2.0](LICENSE).
