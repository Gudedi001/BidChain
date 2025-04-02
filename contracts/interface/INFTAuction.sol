// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface INFTAuction {
    // Mint a new NFT
    function mint(address to) external returns (uint256);

    // Get the owner of an NFT
    function getNFTOwner(uint256 tokenId) external view returns (address);

    // Set the minting limit for each user
    function setMintLimit(uint256 _limit) external;

    // Add minter role to an account
    function addMinter(address account) external;

    // Remove minter role from an account
    function removeMinter(address account) external;

    // Check if an account has the minter role
    function isMinter(address account) external view returns (bool);

    // Get the current mint limit
    function mintLimit() external view returns (uint256);

    // Get the number of NFTs minted by a user
    function userMintCount(address user) external view returns (uint256);
}
