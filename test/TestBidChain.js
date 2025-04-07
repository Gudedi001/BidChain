const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const { toBn } = require("evm-bn")
const { exp } = require("@prb/math")
const { AuctionType } = require("./common")
const { keccak256 } = ethers.utils;
const { recoverTypedSignature_v4 } = require("eth-sig-util");

let owner, minter, bidder, addrs, addr3
let assetStorage, nftAuction, auction


describe("BidChain Test", function () {
    beforeEach(async function () {
        [owner, minter, bidder,addr3, ...addrs] = await ethers.getSigners();
        console.log("owner: ", owner.address)
        console.log("minter: ", minter.address)
        console.log("bidder: ", bidder.address)
        console.log("addr3: ", addr3.address)

        assetStorage = await ethers.getContractFactory("AssetStorage")
        nftAuction = await ethers.getContractFactory("NFTAuction")
        auction = await ethers.getContractFactory("Auction")

        assetStorage = await assetStorage.deploy()
        nftAuction = await upgrades.deployProxy(nftAuction,[5,"BIDC","BIDCSYMPOL"], { initializer: 'initialize' });
        auction = await upgrades.deployProxy(auction,[assetStorage.address,nftAuction.address], { initializer: 'initialize' });
        
        console.log("assetStorage addr=",assetStorage.address)
        console.log("nftAuction addr=",nftAuction.address)
        console.log("auction addr=",auction.address)
    })

    describe("should initialize successfully", async () => {
        it("should initialize successfully", async () => {
            console.log("auction addr=",auction.address)
            console.log("nftAuction addr=",nftAuction.address)
            const name = await nftAuction.name();
            const symbol = await nftAuction.symbol();
            console.log("nftAuction name=",name)
            console.log("nftAuction symbol=",symbol)
            expect(1).to.equal(1)
        })
    })

    describe("should NFT mint successfully ", async () => {
        it("should NFT mint successfully", async () => {
        // 铸造一个NFT并验证
        const tx = await nftAuction.connect(minter).mint(minter.address);
        const receipt = await tx.wait(); // 等待交易确认

        // 解析 Minted 事件
        const event = receipt.events.find((e) => e.event === "Minted");
        const tokenId = event.args.tokenId;

        console.log("nft id=", tokenId.toString());
        
        expect(await nftAuction.ownerOf(tokenId)).to.equal(minter.address);
        })
    })

    describe("should auction process successfully ", async () => {
        // 生成 EIP712 签名
        function getBidSignature(auctionId, bidAmount, bidder) {
            const domain = {
            name: "NFTAuction",
            version: "1",
            chainId: 31337, // 主网链ID
            verifyingContract: auction.address
            };

            const types = {
                Bid: [
                    { name: "bidder", type: "address" },
                    { name: "auctionId", type: "uint256" },
                    { name: "bidAmount", type: "uint256" },
                ]
            };

            const value = {
                bidder: bidder.address,
                auctionId: auctionId,
                bidAmount: bidAmount
            };

            // const data = { domain, types, value };

            // 使用 eth-sig-util 来生成签名
            console.log("do signature");
            const signature = bidder._signTypedData(domain, types, value);
            console.log("done signature");
            return signature;
        }

        it("should create an auction successfully", async () => {
        // 创建一个NFT拍卖
        const tx = await nftAuction.connect(minter).mint(minter.address);
        const receipt = await tx.wait(); // 等待交易确认

        // 解析 Minted 事件
        const event = receipt.events.find((e) => e.event === "Minted");
        const tokenId = event.args.tokenId;
        const reservePrice = ethers.utils.parseEther("1");
        console.log("reservePrice value =",reservePrice)
        const duration = 3600; // 1 hour
        console.log("auctionType=",AuctionType.Dutch);

        // 授权 AssetStorage 合约转移 NFT
        await nftAuction.connect(minter).approve(assetStorage.address, tokenId);

        let tx2 = await auction.connect(minter).createAuction(tokenId, reservePrice, duration, AuctionType.Dutch); // 0 for auctionType
        const receipt2 = await tx2.wait();

        const auctionCreatedEvent = receipt2.events.find((e) => e.event === "AuctionCreated");
        const auctionId = auctionCreatedEvent.args.auctionId;

        console.log("auctionId:", auctionId.toString());
        
        console.log("auctionId=",auctionId);
        const auctionDetail = await auction.getAuctionDetails(auctionId);
        expect(auctionDetail.tokenId).to.equal(tokenId);
        expect(auctionDetail.auctionId).to.equal(auctionId);
        expect(auctionDetail.reservePrice).to.equal(reservePrice);
        expect(auctionDetail.seller).to.equal(minter.address);
        })

        it("should allow bidder to place a valid bid", async function () {
            // 创建一个NFT拍卖
            const tx = await nftAuction.connect(minter).mint(minter.address);
            const receipt = await tx.wait(); // 等待交易确认

            // 解析 Minted 事件
            const event = receipt.events.find((e) => e.event === "Minted");
            const tokenId = event.args.tokenId;
            const reservePrice = ethers.utils.parseEther("1");
            console.log("reservePrice value =",reservePrice)
            const duration = 3600; // 1 hour
            console.log("auctionType=",AuctionType.Dutch);

            // 授权 AssetStorage 合约转移 NFT
            await nftAuction.connect(minter).approve(assetStorage.address, tokenId);

            let tx2 = await auction.connect(minter).createAuction(tokenId, reservePrice, duration, AuctionType.Dutch); // 0 for auctionType
            const receipt2 = await tx2.wait();

            const auctionCreatedEvent = receipt2.events.find((e) => e.event === "AuctionCreated");
            const auctionId = auctionCreatedEvent.args.auctionId;

            const bidAmount = ethers.utils.parseEther("2"); // 竞标金额
            console.log("begin signature");
            // 获取有效签名
            const signature = await getBidSignature(auctionId, bidAmount, bidder);
            console.log("signature value=",signature);
            // 通过 bidder 地址发起投标
            await expect(
              auction.connect(bidder).placeBid(auctionId, bidAmount, signature,{value: bidAmount})
            )
              .to.emit(auction, "BidPlaced")
              .withArgs(auctionId, bidder.address, bidAmount);
            console.log("placeBid done");
            // 验证拍卖的最新状态
            const auctionDetails = await auction.getAuctionDetails(auctionId);
            expect(auctionDetails.highestBid).to.equal(bidAmount);
            expect(auctionDetails.highestBidder).to.equal(bidder.address);
          });

          it("should revert if the bid signature is invalid", async function () {
            // 创建一个NFT拍卖
            const tx = await nftAuction.connect(minter).mint(minter.address);
            const receipt = await tx.wait(); // 等待交易确认

            // 解析 Minted 事件
            const event = receipt.events.find((e) => e.event === "Minted");
            const tokenId = event.args.tokenId;
            const reservePrice = ethers.utils.parseEther("1");
            console.log("reservePrice value =",reservePrice)
            const duration = 3600; // 1 hour
            console.log("auctionType=",AuctionType.Dutch);

            // 授权 AssetStorage 合约转移 NFT
            await nftAuction.connect(minter).approve(assetStorage.address, tokenId);

            let tx2 = await auction.connect(minter).createAuction(tokenId, reservePrice, duration, AuctionType.Dutch); // 0 for auctionType
            const receipt2 = await tx2.wait();

            const auctionCreatedEvent = receipt2.events.find((e) => e.event === "AuctionCreated");
            const auctionId = auctionCreatedEvent.args.auctionId;

            const bidAmount = ethers.utils.parseEther("2"); // 竞标金额
            console.log("begin signature");
            // // 获取有效签名
            // const signature = await getBidSignature(auctionId, bidAmount, bidder);
            // console.log("signature value=",signature);
        
            // 使用错误的签名（来自另一个地址）
            const invalidBidder = addr3;
            const invalidSignature = await getBidSignature(auctionId, bidAmount, invalidBidder);
        
            await expect(
              auction.connect(bidder).placeBid(auctionId, bidAmount, invalidSignature)
            ).to.be.revertedWith("Invalid signature");
          });
        
          it("should revert if the auction has ended", async function () {
            // 创建一个NFT拍卖
            const tx = await nftAuction.connect(minter).mint(minter.address);
            const receipt = await tx.wait(); // 等待交易确认

            // 解析 Minted 事件
            const event = receipt.events.find((e) => e.event === "Minted");
            const tokenId = event.args.tokenId;
            const reservePrice = ethers.utils.parseEther("1");
            console.log("reservePrice value =",reservePrice)
            const duration = 3600; // 1 hour
            console.log("auctionType=",AuctionType.Dutch);

            // 授权 AssetStorage 合约转移 NFT
            await nftAuction.connect(minter).approve(assetStorage.address, tokenId);

            let tx2 = await auction.connect(minter).createAuction(tokenId, reservePrice, duration, AuctionType.Dutch); // 0 for auctionType
            const receipt2 = await tx2.wait();

            const auctionCreatedEvent = receipt2.events.find((e) => e.event === "AuctionCreated");
            const auctionId = auctionCreatedEvent.args.auctionId;

            const bidAmount = ethers.utils.parseEther("2"); // 竞标金额
            console.log("begin signature");
        
            // 模拟拍卖结束时间
            await ethers.provider.send("evm_increaseTime", [3601]); // 增加1秒，拍卖结束
            await ethers.provider.send("evm_mine", []); // 确保链上时间更新
        
            // 获取有效签名
            const signature = await getBidSignature(auctionId, bidAmount, bidder);
        
            await expect(
              auction.connect(bidder).placeBid(auctionId, bidAmount, signature)
            ).to.be.revertedWith("Auction has ended");
          });

          it("should end the auction", async function () {
            // 创建一个NFT拍卖
            const tx = await nftAuction.connect(minter).mint(minter.address);
            const receipt = await tx.wait(); // 等待交易确认

            // 解析 Minted 事件
            const event = receipt.events.find((e) => e.event === "Minted");
            const tokenId = event.args.tokenId;
            const reservePrice = ethers.utils.parseEther("1");
            console.log("reservePrice value =",reservePrice)
            const duration = 3600; // 1 hour
            console.log("auctionType=",AuctionType.Dutch);

            // 授权 AssetStorage 合约转移 NFT
            await nftAuction.connect(minter).approve(assetStorage.address, tokenId);

            let tx2 = await auction.connect(minter).createAuction(tokenId, reservePrice, duration, AuctionType.Dutch); // 0 for auctionType
            const receipt2 = await tx2.wait();

            const auctionCreatedEvent = receipt2.events.find((e) => e.event === "AuctionCreated");
            const auctionId = auctionCreatedEvent.args.auctionId;

            const bidAmount = ethers.utils.parseEther("2"); // 竞标金额
            console.log("begin signature");
            // 获取有效签名
            const signature = await getBidSignature(auctionId, bidAmount, bidder);
            console.log("signature value=",signature);
            // 通过 bidder 地址发起投标
            await expect(
              auction.connect(bidder).placeBid(auctionId, bidAmount, signature,{value: bidAmount})
            )
              .to.emit(auction, "BidPlaced")
              .withArgs(auctionId, bidder.address, bidAmount);
            console.log("placeBid done");

            // 模拟拍卖结束时间
            await ethers.provider.send("evm_increaseTime", [3601]); // 增加1秒，拍卖结束
            await ethers.provider.send("evm_mine", []); // 确保链上时间更新
            // 结束拍卖
            await auction.endAuction(auctionId);
        
            const auctionDetails = await auction.getAuctionDetails(auctionId);
            
            expect(auctionDetails.isActive).to.equal(false);
            // 检查NFT转移
            expect(await nftAuction.ownerOf(tokenId)).to.equal(bidder.address);
          });

    })

    
})
