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
import {LibAuction} from "./libraries/LibAuction.sol";
import {IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

/**
 * @title Auction
 * @dev This contract handles the auction of NFTs, including bids and final transactions.
 */
contract Auction is IAuction,Initializable, OwnableUpgradeable, PausableUpgradeable,EIP712Upgradeable,ReentrancyGuardUpgradeable {
    mapping(uint256 => LibAuction.AuctionDetails) public auctions;
    uint256 public auctionCounter;

    // Asset contract address
    address public assetStorage;
    // NFT contract address
    address public nftContract;

    // EIP712 domain separator
    string private constant SIGNING_DOMAIN = "NFTAuction";
    string private constant SIGNATURE_VERSION = "1";

    event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, address indexed seller, uint256 reservePrice, uint256 duration, LibAuction.AuctionType auctionType);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 bidAmount);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 finalBid);

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
     * @param reservePrice 起拍价格
     * @param duration 拍卖持续时间（秒）
     * @param auctionType 拍卖类型（荷兰或英式拍卖）
     * @return auctionId 拍卖ID
     */
    function createAuction(
        uint256 tokenId, 
        uint256 reservePrice, 
        uint256 duration, 
        LibAuction.AuctionType auctionType
    ) external nonReentrant returns (uint256 auctionId) {
        // 转移NFT到AssetStorage合约进行管理
        require(IERC721(nftContract).ownerOf(tokenId) ==_msgSender(), "Not owner of the token");
        require(!IAssetStorage(assetStorage).isStored(tokenId), "This NFT has already been auctioned.");
        IAssetStorage(assetStorage).storeAsset(nftContract, tokenId,_msgSender());
        
        auctionCounter++;
        auctionId = auctionCounter;

        LibAuction.AuctionDetails storage auction = auctions[auctionId];
        auction.auctionId = auctionId;
        auction.tokenId = tokenId;
        auction.seller = msg.sender;
        auction.reservePrice = reservePrice;
        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + duration;
        auction.auctionType = auctionType;
        auction.isActive = true;

        emit AuctionCreated(auctionId, tokenId, msg.sender, reservePrice, duration, auctionType);
    }

    /**
     * @notice 出价
     * @param auctionId 拍卖ID
     * @param bidAmount 出价金额
     * @param signature EIP712签名
     */
    function placeBid(uint256 auctionId, uint256 bidAmount, bytes calldata signature) external payable {
        LibAuction.AuctionDetails storage auction = auctions[auctionId];
        require(auction.isActive, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(bidAmount > auction.reservePrice, "Bid is less than reservePrice");
        require(bidAmount > auction.highestBid, "Bid is too low");
        
        // 验证签名
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Bid(address bidder,uint256 auctionId,uint256 bidAmount)"),
            msg.sender,
            auctionId,
            bidAmount
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

        emit BidPlaced(auctionId, msg.sender, bidAmount);
    }

    /**
     * @notice 结束拍卖并转移NFT到竞标者
     * @param auctionId 拍卖ID
     */
    function endAuction(uint256 auctionId) external {
        LibAuction.AuctionDetails storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        require(auction.isActive, "Auction is already closed");

        auction.isActive = false;

        // 转移资产
        if(auction.highestBidder != address(0)&&auction.highestBid>=auction.reservePrice){
          IAssetStorage(assetStorage).transferAsset(nftContract,auction.highestBidder, auction.tokenId);
          IAssetStorage(assetStorage).transferETH(auction.seller,auction.highestBid,auction.highestBidder);
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
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
    function getAuctionDetails(uint256 auctionId) external view returns (LibAuction.AuctionDetails memory) {
        return auctions[auctionId];
    }
}
