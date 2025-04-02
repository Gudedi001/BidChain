# EasySwap Hardhat Project

## Prerequisites

### 1. Install dependencies
before install dependencies, please make sure you have installed node and npm.
and install hardhat by following [hardhat official guide](https://hardhat.org/hardhat-runner/docs/getting-started#installation).

```shell
npm install
```

### 2. copy .env.example to .env
```shell
cp .env.example .env
```

### 3. modify .env
including following fields:
 - SEPOLIA_ALCHEMY_AK
 - SEPOLIA_PK_ONE
 - SEPOLIA_PK_TWO


## How to run it

### 1. Compile
```shell
npx hardhat compile
```

### 2. Test
```shell
npx hardhat test
```

## How to deploy

### 1. Deploy
deploy to sepolia testnet
```shell
npx hardhat run --network sepolia scripts/deploy.js
```

deploy test erc721 
```shell
npx hardhat run --network sepolia scripts/deploy_721.js
```

## Advanced

### 1. Get Contract Size
```shell
npx hardhat size-contracts
```

### 2. see storage layout of contract
```shell
slither-read-storage ./contracts/Auction.sol --contract-name Auction --solc-remaps @=node_modules/@ --json storage_layout.json
```
see more [slither](https://github.com/crytic/slither)
