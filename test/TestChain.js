const { ethers } = require("hardhat");

async function main() {
  // 创建 JsonRpcProvider 连接 Arbitrum Sepolia
  const provider = new ethers.providers.JsonRpcProvider("https://arb-sepolia.g.alchemy.com/v2/6Bf3RM8Z7ZgQWxqox-QTqsy5fjtI2yf2");

  // 获取最新区块
  const block = await provider.getBlock("latest");

  console.log("block number is =",block);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
