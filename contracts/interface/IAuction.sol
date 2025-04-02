// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {LibAuction} from "../libraries/LibAuction.sol";

interface IAuction {

    /**
     * @notice Create a new auction
     * @param tokenId The ID of the NFT being auctioned.
     * @param reservePrice The starting price of the auction.
     * @param duration The duration of the auction in seconds.
     * @param auctionType The type of auction (Dutch or English).
     * @return auctionId The ID of the newly created auction.
     */
    function createAuction(
        uint256 tokenId, 
        uint256 reservePrice, 
        uint256 duration, 
        LibAuction.AuctionType auctionType
    ) external returns (uint256 auctionId);

    /**
     * @notice Place a bid on an auction
     * @param auctionId The ID of the auction.
     * @param bidAmount The amount of the bid.
     */
    function placeBid(uint256 auctionId, uint256 bidAmount, bytes calldata signature) external payable;

    /**
     * @notice End an auction and transfer the NFT to the winner
     * @param auctionId The ID of the auction to end.
     */
    function endAuction(uint256 auctionId) external;
}
