const { ethers, upgrades } = require("hardhat")

/**  * 2025/04/07 in arbitrum sepolia testnet
 * Block Scan address:https://sepolia.arbiscan.io/
 * assetStorage contract deployed to: 0x6a18C66B385b6F33D3090308a926c83582C4FAEA
 * nftAuction contract deployed to: 0x82C38fF1ca69Cf0f9589dc05D2B76049034B7C95
     nftAuction ImplementationAddress: 0x66d0Ff0405fff81508095cE1BCaf9B3A7D437526
     nftAuction AdminAddress: 0x86062B455CAf4D47d3f0393DD9336B5e8FE57a7E
   auction contract deployed to: 0xfC5E2DE38f9f5e0A5b8992C5093b0C6F56Dd7220
      auction ImplementationAddress: 0x2Ac3d1FED9531A7d384eD41bb1bd4a12563c1f18
      auction AdminAddress: 0x86062B455CAf4D47d3f0393DD9336B5e8FE57a7E

    2025/04/07 in ETH sepolia testnet
    Block Scan address:https://sepolia.arbiscan.io/
 * assetStorage contract deployed to: 0x66d0Ff0405fff81508095cE1BCaf9B3A7D437526
 * nftAuction contract deployed to: 0x2Ac3d1FED9531A7d384eD41bb1bd4a12563c1f18
     nftAuction ImplementationAddress: 0xd271D45A50796D9b7b71808888E8B988534D3FA1
     nftAuction AdminAddress: 0x86062B455CAf4D47d3f0393DD9336B5e8FE57a7E
   auction contract deployed to: 0xe3360c5Ee0f097633FCE8fAE1f2F923F483ddAEA
      auction ImplementationAddress: 0xfC5E2DE38f9f5e0A5b8992C5093b0C6F56Dd7220
      auction AdminAddress: 0x86062B455CAf4D47d3f0393DD9336B5e8FE57a7E


    npx hardhat run scripts/deploy.js --network arbitrumSepolia
    npx hardhat run scripts/deploy.js --network sepolia
 */

async function main() {
    // check network
    // const network = await ethers.provider.getNetwork();
    // console.log("Current network:", network.name, network.chainId);
    //get deployer
    // const [deployer] = await ethers.getSigners()
    // console.log("deployer: ", deployer.address)

    //deploy AssetStorage
    // let assetStorage = await ethers.getContractFactory("AssetStorage")
    // assetStorage = await assetStorage.deploy();
    // await assetStorage.deployed();
    // console.log("AssetStorage contract deployed to:", assetStorage.address);

    //deploy NFTAuction
    // let nftAuction = await ethers.getContractFactory("NFTAuction")
    // nftAuction = await upgrades.deployProxy(nftAuction,[5,"BIDC","BIDCSYMPOL"], { initializer: 'initialize' });
    // await nftAuction.deployed()
    // console.log("NFTAuction contract deployed to:", nftAuction.address);
    // console.log(await upgrades.erc1967.getImplementationAddress(nftAuction.address), " nftAuction getImplementationAddress");

    //deploy Auction
    // let nftAddress="0x82C38fF1ca69Cf0f9589dc05D2B76049034B7C95";
    // let assetAddress="0x6a18C66B385b6F33D3090308a926c83582C4FAEA";
    // let auction = await ethers.getContractFactory("Auction");
    // auction = await upgrades.deployProxy(auction,[assetAddress,nftAddress], { initializer: 'initialize' });
    // await auction.deployed()
    // console.log("Auction contract deployed to:", auction.address);
    // console.log(await upgrades.erc1967.getImplementationAddress(auction.address), " auction getImplementationAddress");

  // https://sepolia.arbiscan.io/  arbitrum 区块浏览地址
  
  // let nftAddress = "";
  // let auctionAddress = "";
  // // const network = await ethers.provider.getNetwork();
  // // console.log("Current network:", network.name, network.chainId);

  // const auctionEntity = await (
  //   await ethers.getContractFactory("Auction")
  // ).attach(auctionAddress);

  // try {
  //   const tx = await auctionEntity.setNftContract(nftAddress);
  //   await tx.wait();
  //   console.log("auction setNftContract tx:", tx.hash);
  // } catch (error) {
  //   console.error("Transaction failed:", error);
  // }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
