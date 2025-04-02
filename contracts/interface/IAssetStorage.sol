// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Interface for the AssetStorage contract
interface IAssetStorage {
    // Deposit ETH into the contract
    function depositETH(uint256 amount,address bidder) external payable;

    // Withdraw ETH from the contract
    function withdrawETH(address to,uint256 amount) external;
    // transfer ETH from the contract
    function transferETH(address to,uint256 amount,address from) external;

    // Query the ETH balance of an account
    function balanceOf(address account) external view returns (uint256);

    // Store an NFT in the contract
    function storeAsset(address nftContract, uint256 tokenId,address owner) external;

    // Withdraw an NFT from the contract
    function withdrawAsset(address nftContract, uint256 tokenId,address to) external;
    // Transfer an NFT from the contract
    function transferAsset(address nftContract,address to, uint256 tokenId) external;

    // Check if an NFT is stored for a specific owner
    function isStored(uint256 tokenId) external view returns (bool);
}