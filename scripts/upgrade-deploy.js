const { ethers, upgrades } = require("hardhat");
/**
 *  npx hardhat run scripts/upgrade-deploy.js --network sepolia
 *  New NFTAuctionV2 implementation deployed to: 0x724A68B5965CdC2098B07f7BDdF7543E739E6253
 */
async function main() {
  // 代理合约地址（从之前的部署日志获取）
  const nftAuctionProxyAddress = "0x2Ac3d1FED9531A7d384eD41bb1bd4a12563c1f18"; 
  const auctionProxyAddress = "0xe3360c5Ee0f097633FCE8fAE1f2F923F483ddAEA";
  // 测试代理合约
//   const nftAuctionProxyAddress = "0x2Ac3d1FED9531A7d384eD41bb1bd4a12563c1f18"; 
//   const auctionProxyAddress = "0xe3360c5Ee0f097633FCE8fAE1f2F923F483ddAEA";

  // 获取新版本的NFTAuction合约
//   const NFTAuctionV2 = await ethers.getContractFactory("NFTAuction");
//   console.log("Upgrading NFTAuction to V2...");
  // 执行升级
//   const upgradedNftAuction = await upgrades.upgradeProxy(nftAuctionProxyAddress, NFTAuctionV2);
  // 等待升级完成
//   await upgradedNftAuction.deployed();
  // 获取新实现合约的地址
//   const implementationAddressNftAuction = await upgrades.erc1967.getImplementationAddress(nftAuctionProxyAddress);
//   console.log("NFTAuction proxy upgraded at:", nftAuctionProxyAddress);
//   console.log("New implementation deployed to:", implementationAddressNftAuction);


  // 获取新版本的Auction合约
  const AuctionV2 = await ethers.getContractFactory("Auction");
  console.log("Upgrading Auction to V2...");
  // 执行升级
  const upgradedAuction = await upgrades.upgradeProxy(auctionProxyAddress, AuctionV2);
  // 等待升级完成
  await upgradedAuction.deployed();
  // 获取新实现合约的地址
  const implementationAddressAuction = await upgrades.erc1967.getImplementationAddress(auctionProxyAddress);
  console.log("Auction proxy upgraded at:", auctionProxyAddress);
  console.log("New Auction implementation deployed to:", implementationAddressAuction);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });