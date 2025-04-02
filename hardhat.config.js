require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require('hardhat-contract-sizer')
require('@openzeppelin/hardhat-upgrades')
require("@nomicfoundation/hardhat-chai-matchers");

// config
const { config: dotenvConfig } = require("dotenv")
const { resolve } = require("path")
dotenvConfig({ path: resolve(__dirname, "./.env") })

const SEPOLIA_PK_ONE = process.env.SEPOLIA_PK_ONE
const SEPOLIA_PK_TWO = process.env.SEPOLIA_PK_TWO
// if (!SEPOLIA_PK_ONE) {
//   throw new Error("Please set at least one private key in a .env file")
// }

const MAINNET_PK = process.env.MAINNET_PK
const MAINNET_ALCHEMY_AK = process.env.MAINNET_ALCHEMY_AK

const SEPOLIA_ALCHEMY_AK = process.env.SEPOLIA_ALCHEMY_AK
// if (!SEPOLIA_ALCHEMY_AK) {
//   throw new Error("Please set your SEPOLIA_ALCHEMY_AK in a .env file")
// }

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
      viaIR: true,
    },
    metadata: {
      bytecodeHash: 'none',
    }
  },
  networks: {
    hardhat: {
      // Hardhat Network 的配置
      chainId: 31337, // 默认链 ID
      accounts: {
        count: 20, // 生成 20 个测试账户
        initialBalance: "10000000000000000000000", // 每个账户 10000 ETH（以 wei 为单位）
      },
      gas: "auto", // 自动设置 gas 限制
      gasPrice: "auto", // 自动设置 gas 价格
      blockGasLimit: 30000000, // 区块 gas 限制
      allowUnlimitedContractSize: false, // 是否允许无限大的合约（调试用）
    },
    localhost: {
      url: "http://127.0.0.1:8545", // 本地 Hardhat Network 的默认地址
      chainId: 31337, // 与 hardhat 网络保持一致
    },
    // arbitrumSepolia: {
    //   url: "https://arb-sepolia.g.alchemy.com/v2/6Bf3RM8Z7ZgQWxqox-QTqsy5fjtI2yf2",
    //   accounts: [process.env.PRIVATE_KEY] // 你的私钥，需要在 .env 文件中存储
    // }
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
}
