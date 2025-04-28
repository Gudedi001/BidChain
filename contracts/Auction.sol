// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {IAssetStorage} from "./interface/IAssetStorage.sol";
import {IAuction} from "./interface/IAuction.sol";
import {LibAuction,AuctionKey} from "./libraries/LibAuction.sol";
import {IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

/**
 * @title Auction
 * @dev This contract handles the auction of NFTs, including bids and final transactions.
 */
contract Auction is IAuction,Initializable, OwnableUpgradeable, PausableUpgradeable,EIP712Upgradeable,ReentrancyGuardUpgradeable {
    mapping(AuctionKey => LibAuction.AuctionDetails) public auctions;
    uint256 public auctionCounter;

    // Asset contract address
    address public assetStorage;
    // NFT contract address
    address public nftContract;

    // EIP712 domain separator
    string private constant SIGNING_DOMAIN = "NFTAuction";
    string private constant SIGNATURE_VERSION = "1";
    //(auctionId, tokenId, msg.sender, startPrice, auction.startTime,auction.endTime,auctionType,minBidIncrement);
    event AuctionCreated(AuctionKey indexed auctionKey, uint256 indexed tokenId, address indexed seller, uint256 startPrice, uint256 startTime, uint256 endTime, LibAuction.AuctionType auctionType, uint256 minBidIncrement,address nftAddress);
    event BidPlaced(AuctionKey indexed auctionKey, address indexed bidder, uint256 bidAmount);
    event AuctionEnded(AuctionKey indexed auctionKey, address winner, uint256 finalBid);

    // 构造函数
    function initialize(address _assetStorage,address _nftContract) initializer public {
        __Ownable_init(_msgSender());
        __Pausable_init();
        __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
        __ReentrancyGuard_init();
        assetStorage = _assetStorage;
        nftContract = _nftContract;
    }

    /**
     * @notice 创建一个新的NFT拍卖
     * @param tokenId NFT的ID
     * @param startPrice 起拍价格
     * @param duration 拍卖持续时间（秒）
     * @param auctionType 拍卖类型（荷兰或英式拍卖）
       @param minBidIncrement 最小加价幅度
       @param collectionAddress NFT集合
     * @return auctionKey 拍卖ID
     */
    function createAuction(
        uint256 tokenId, 
        uint256 startPrice, 
        uint256 duration, 
        LibAuction.AuctionType auctionType,
        uint256 minBidIncrement,
        address collectionAddress
    ) external nonReentrant returns (AuctionKey auctionKey) {
        // 转移NFT到AssetStorage合约进行管理
        require(IERC721(collectionAddress).ownerOf(tokenId) ==_msgSender(), "Not owner of the token");
        require(collectionAddress != address(0), "Collection address can't be zero");
        IAssetStorage(assetStorage).storeAsset(collectionAddress, tokenId,_msgSender());
        auctionKey = LibAuction.hash(
            collectionAddress,
            tokenId,
            msg.sender,
            startPrice,
            block.timestamp,
            block.timestamp + duration,
            auctionType,
            minBidIncrement
        );
        LibAuction.AuctionDetails memory auction = LibAuction.AuctionDetails({
        auctionKey: auctionKey,
        tokenId: tokenId,
        NFTCollection: collectionAddress,
        seller: msg.sender,
        startPrice: startPrice,
        startTime: block.timestamp,
        endTime: block.timestamp + duration,
        highestBid: 0,
        highestBidder: address(0),
        auctionType: auctionType,
        minBidIncrement: minBidIncrement,
        isActive: true
        });

        auctions[auctionKey] = auction;

        emit AuctionCreated(auctionKey, tokenId, msg.sender, startPrice, auction.startTime,auction.endTime,auctionType,minBidIncrement,collectionAddress);
    }

    /**
     * @notice 出价
     * @param auctionKey 拍卖ID
     * @param bidAmount 出价金额
     * @param signature EIP712签名
     */
    function placeBid(AuctionKey auctionKey, uint256 bidAmount, bytes calldata signature) external payable {
        LibAuction.AuctionDetails storage auction = auctions[auctionKey];
        require(auction.isActive, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(bidAmount > auction.startPrice, "Bid is less than reservePrice");
        require(bidAmount > auction.highestBid, "Bid is too low");
        require(bidAmount - auction.highestBid >= auction.minBidIncrement, "Bid is less than minBidIncrement");
        
        // 验证签名
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Bid(address bidder,bytes32 auctionId,uint256 bidAmount,address nftAddress)"),
            msg.sender,
            auctionKey,
            bidAmount,
            auction.NFTCollection
        )));
        // 恢复签名者地址
        address signer = ECDSA.recover(digest, signature);
        require(signer == msg.sender, "Invalid signature");
        //存储竞价ETH
        IAssetStorage(assetStorage).depositETH{value: uint256(bidAmount)}(bidAmount,msg.sender);
        // 退还上一个竞标者的资金
        if (auction.highestBidder != address(0)) {
            IAssetStorage(assetStorage).transferETH(auction.highestBidder,auction.highestBid,auction.highestBidder);
        }
        auction.highestBid = bidAmount;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionKey, msg.sender, bidAmount);
    }

    /**
     * @notice 结束拍卖并转移NFT到竞标者
     * @param auctionKey 拍卖ID
     */
    function endAuction(AuctionKey auctionKey) external {
        LibAuction.AuctionDetails storage auction = auctions[auctionKey];
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        require(auction.isActive, "Auction is already closed");

        auction.isActive = false;

        // 转移资产
        if(auction.highestBidder != address(0)&&auction.highestBid>=auction.startPrice){
          IAssetStorage(assetStorage).transferAsset(auction.NFTCollection,auction.highestBidder, auction.tokenId);
          IAssetStorage(assetStorage).transferETH(auction.seller,auction.highestBid,auction.highestBidder);
        }
        //没有投标人
        if(auction.highestBidder == address(0)){
          IAssetStorage(assetStorage).withdrawAsset(auction.NFTCollection,auction.tokenId,auction.seller);
        }

        emit AuctionEnded(auctionKey, auction.highestBidder, auction.highestBid);
    }

    /**
     * @notice 设置资产存储合约地址
     * @param newAssetStorage 新的资产存储合约地址
     */
    function setAssetStorage(address newAssetStorage) external onlyOwner {
        assetStorage = newAssetStorage;
    }

    /**
     * @notice 设置NFT集合地址
     * @param newNftContract 新的资产存储合约地址
     */
    function setNftContract(address newNftContract) external onlyOwner {
        nftContract = newNftContract;
    }
    
    // 查看拍卖详情
    function getAuctionDetails(AuctionKey auctionKey) external view returns (LibAuction.AuctionDetails memory) {
        return auctions[auctionKey];
    }
}
