// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library LibAuction {
    
    enum AuctionType { Dutch, English }//拍卖类型

    struct AuctionDetails {
        uint256 auctionId; // 唯一标识每个拍卖的ID
        uint256 tokenId;   // 被拍卖的NFT的ID
        address seller;    // 卖家的地址
        uint256 reservePrice; // 拍卖的保留价（最低起拍价）
        uint256 startTime; // 拍卖开始时间（以秒为单位的时间戳）
        uint256 endTime;   // 拍卖结束时间（以秒为单位的时间戳）
        uint256 highestBid; // 当前最高出价
        address highestBidder; // 当前最高出价者的地址
        AuctionType auctionType; // 拍卖类型（荷兰拍卖或英式拍卖）
        bool isActive; // 拍卖是否仍然有效
    }

    bytes32 public constant ASSET_TYPEHASH =
        keccak256("Asset(uint256 tokenId,address collection,uint96 amount)");

    bytes32 public constant ORDER_TYPEHASH =
        keccak256(
            "Order(uint8 side,uint8 saleKind,address maker,Asset nft,uint128 price,uint64 expiry,uint64 salt)Asset(uint256 tokenId,address collection,uint96 amount)"
        );

}
