// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

type AuctionKey is bytes32;

library LibAuction {
    
    enum AuctionType { Dutch, English }//拍卖类型

    struct AuctionDetails {
        AuctionKey auctionKey; // 唯一标识每个拍卖的ID
        address NFTCollection; //NFT集合
        uint256 tokenId;   // 被拍卖的NFT的ID
        address seller;    // 卖家的地址
        uint256 startPrice; // 拍卖的保留价（最低起拍价）
        uint256 startTime; // 拍卖开始时间（以秒为单位的时间戳）
        uint256 endTime;   // 拍卖结束时间（以秒为单位的时间戳）
        uint256 highestBid; // 当前最高出价
        address highestBidder; // 当前最高出价者的地址
        AuctionType auctionType; // 拍卖类型（荷兰拍卖或英式拍卖）
        uint256 minBidIncrement; // 最小加价幅度
        bool isActive; //拍卖状态  是否拍卖中
    }

    bytes32 public constant AUCTIONDETAIL_TYPEHASH =
        keccak256(
            "AuctionDetails(AuctionKey auctionKey,address NFTCollection,uint256 tokenId,address seller,uint256 startPrice,uint256 startTime,uint256 endTime,uint256 highestBid,address highestBidder,AuctionType auctionType,uint256 minBidIncrement)"
        );

    function hash(address nftAddress,uint256 tokenId,address seller,uint256 startPrice,uint256 startTime,uint256 endTime,AuctionType auctionType,uint256 minBidIncrement) internal pure returns (AuctionKey) {
        return
            AuctionKey.wrap(
                keccak256(
                    abi.encodePacked(
                        AUCTIONDETAIL_TYPEHASH,
                        nftAddress,
                        tokenId,
                        seller,
                        startPrice,
                        startTime,
                        endTime,
                        auctionType,
                        minBidIncrement
                    )
                )
            );
    }


}
