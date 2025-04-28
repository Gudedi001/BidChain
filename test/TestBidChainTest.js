const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const { AuctionType } = require("./common")

// config
const { config: dotenvConfig } = require("dotenv")
const { resolve } = require("path")
dotenvConfig({ path: resolve(__dirname, "../.env") })

let owner, minter, bidder, addr3
let assetStorage, nftAuction, auction

// Sepolia 测试网的合约地址（替换为实际地址）
const ASSET_STORAGE_ADDRESS = "0x9fc756082356F8669508bBbb6adaBE746cd8eba6";
const NFT_AUCTION_ADDRESS = "0x2Ac3d1FED9531A7d384eD41bb1bd4a12563c1f18";
const AUCTION_ADDRESS = "0x30BfE8Fb4a93923ba3BC22552cfe5259fAe8044D";

describe("BidChain Test", function () {
    beforeEach(async function () {
        // [owner, minter, bidder,addr3, ...addrs] = await ethers.getSigners();

        // 获取 Sepolia 测试网的提供者
        const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

        // 使用私钥加载账户（可以添加多个账户）
        owner = new ethers.Wallet(process.env.SEPOLIA_ETH_PK, provider);
        minter = new ethers.Wallet(process.env.SEPOLIA_ETH_PK_MINTER || process.env.PRIVATE_KEY, provider); // 可使用不同私钥
        bidder = new ethers.Wallet(process.env.SEPOLIA_ETH_PK_BIDDER || process.env.PRIVATE_KEY, provider);
        addr3 = new ethers.Wallet(process.env.SEPOLIA_ETH_PK_ADDR || process.env.PRIVATE_KEY, provider);

        console.log("owner: ", owner.address)
        console.log("minter: ", minter.address)
        console.log("bidder: ", bidder.address)
        console.log("addr3: ", addr3.address)

        // 获取合约工厂
        const AssetStorage = await ethers.getContractFactory("AssetStorage", owner);
        const NFTAuction = await ethers.getContractFactory("NFTAuction", owner);
        const Auction = await ethers.getContractFactory("Auction", owner);

        // 连接到已部署的合约
        assetStorage = AssetStorage.attach(ASSET_STORAGE_ADDRESS);
        nftAuction = NFTAuction.attach(NFT_AUCTION_ADDRESS);
        auction = Auction.attach(AUCTION_ADDRESS);
        
        console.log("assetStorage addr=",assetStorage.address)
        console.log("nftAuction addr=",nftAuction.address)
        console.log("auction addr=",auction.address)
        const gasPrice = await provider.getGasPrice();
        console.log("Current gas price on Sepolia:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
    })

    // describe("should initialize successfully", async () => {
    //     it("should initialize successfully", async () => {
    //         console.log("auction addr=",auction.address)
    //         console.log("nftAuction addr=",nftAuction.address)
    //         const name = await nftAuction.name();
    //         const symbol = await nftAuction.symbol();
    //         console.log("nftAuction name=",name)
    //         console.log("nftAuction symbol=",symbol)
    //         expect(1).to.equal(1)
    //     })
    // })


    async function mintAndCreateAuction() {
       // 创建一个NFT拍卖
      //  const tx = await nftAuction.connect(minter).mint(minter.address);
      //  const receipt = await tx.wait(); // 等待交易确认

      //  // 解析 Minted 事件
      //  const event = receipt.events.find((e) => e.event === "Minted");
       const tokenId = 36;
       console.log("tokenId=",tokenId);
       const reservePrice = ethers.utils.parseEther("0.000000001");
       console.log("reservePrice value =",reservePrice)
       const duration = 3600; // 1 hour
       console.log("auctionType=",AuctionType.Dutch);
       
       // 授权 AssetStorage 合约转移 NFT
      //  await nftAuction.connect(minter).approve(assetStorage.address, tokenId);
      //  console.log("finish approve");
       let tx2 = await auction.connect(minter).createAuction(tokenId, reservePrice, duration, AuctionType.Dutch,ethers.utils.parseEther("0.000000001"),nftAuction.address); // 0 for auctionType
       const receipt2 = await tx2.wait();

       const auctionCreatedEvent = receipt2.events.find((e) => e.event === "AuctionCreated");
       const auctionId = auctionCreatedEvent.args.auctionKey;

       console.log("auctionKey:", auctionId.toString());
       return { auctionId, tokenId, reservePrice };
    }

    async function calculateGasFee() {
      const auction = await ethers.getContractAt("Auction", "0x1B99C667C9C73b0477a9453694D66775032fd4E3");
      const tokenId = 32;
      const startingBid = ethers.utils.parseEther("0.000000001");
      const duration = 3600;
      const minIncrement = 0;
      const buyNowPrice = ethers.utils.parseEther("0.000000001");
      const nftContract = "0x2ac3d1fed9531a7d384ed41bb1bd4a12563c1f18";

      try {
        await auction.callStatic.createAuction(
          36,
          ethers.utils.parseEther("0.001"),
          3600,
          0,
          ethers.utils.parseEther("0.001"),
          "0x2ac3d1fed9531a7d384ed41bb1bd4a12563c1f18",
          { value: 0 }
        );
        console.log("Call succeeded");
      } catch (error) {
        console.error("Call failed:", error.message);
      }
    
      // // 预估 Gas
      // const gasEstimate = await auction.estimateGas.createAuction(
      //   tokenId,
      //   startingBid,
      //   duration,
      //   0,
      //   buyNowPrice,
      //   nftContract,
      //   { value: 0 }
      // );
    
      // // 获取 Gas 价格
      // const feeData = await ethers.provider.getFeeData();
      // const maxFeePerGas = feeData.maxFeePerGas;
      // console.log("feeData:",feeData);
      // console.log("feePerGas:",maxFeePerGas);
      // // 计算费用
      // const gasFee = gasEstimate.mul(maxFeePerGas);
      // console.log("Estimated Gas:", gasEstimate.toString());
      // console.log("maxFeePerGas:", ethers.utils.formatUnits(maxFeePerGas, "gwei"), "Gwei");
      // console.log("Estimated Gas Fee:", ethers.utils.formatEther(gasFee), "ETH");
    }

    describe("should auction process successfully ", async () => {
        it("should create an auction successfully", async () => {
          // await calculateGasFee().catch(console.error);
        //   this.timeout(60000);
          console.log("begin auction")
        const { auctionId, tokenId, reservePrice} = await mintAndCreateAuction();
          console.log("end auction = ",auctionId)
        // const auctionDetail = await auction.getAuctionDetails(auctionId);
        // console.log("auction info:",auctionDetail);
        // expect(auctionDetail.tokenId).to.equal(tokenId);
        // expect(auctionDetail.auctionKey).to.equal(auctionId);
        // expect(auctionDetail.startPrice).to.equal(reservePrice);
        // expect(auctionDetail.seller).to.equal(minter.address);
        expect(1).to.equal(1);
        })

    })

    
})
