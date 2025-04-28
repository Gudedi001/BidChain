// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IAssetStorage} from "./interface/IAssetStorage.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {LibTransferSafeUpgradeable, IERC721} from "./libraries/LibTransferSafeUpgradeable.sol";

contract AssetStorage is IAssetStorage, ReentrancyGuard {
    // using LibTransferSafeUpgradeable for address;
    // using LibTransferSafeUpgradeable for IERC721;
    // 资产存储账户
    mapping(address => uint256) private _balances;
    // 记录NFT的存储情况，存储地址 -> NFT ID -> 是否存储
    mapping(address => mapping(uint256 => bool)) private _storedAssets;

    // 事件：ETH存入
    event DepositeETH(address indexed account, uint256 amount);
    // 事件：ETH提取
    event WithdrawnETH(address indexed account, uint256 amount);
    // 事件：ETH退还
    event refundETH(address indexed account, uint256 amount);
    // 事件：NFT存储
    event AssetStored(address indexed owner, uint256 tokenId);
    // 事件：NFT提取
    event AssetWithdrawn(address indexed owner, uint256 tokenId);

    // 存入ETH
    function depositETH(uint256 amount,address bidder) external payable {
        require(msg.value >= amount, "HV: not match ETHAmount");
        _balances[bidder] += msg.value;
        emit DepositeETH(bidder, msg.value);
    }

    // 提取ETH
    function withdrawETH(address to,uint256 amount) external nonReentrant {
        require(_balances[to] >= amount, "Insufficient balance");
        _balances[to] -= amount;
        payable(to).transfer(amount);
        emit WithdrawnETH(msg.sender, amount);
    }

    // 转移ETH
    function transferETH(address to,uint256 amount,address from) external nonReentrant {
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        payable(to).transfer(amount);
        emit refundETH(to, amount);
    }

    // 查询账户余额
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice 存储NFT
     * @param nftContract 地址：NFT的合约地址
     * @param tokenId NFT的ID
     */
    function storeAsset(address nftContract, uint256 tokenId,address owner) external {
        // IERC721(nftContract).safeTransferNFT(owner, address(this), tokenId);
        IERC721(nftContract).transferFrom(owner, address(this), tokenId);
        _storedAssets[address(this)][tokenId] = true;
        emit AssetStored(address(this), tokenId);
    }

    /**
     * @notice 提取NFT  流拍
     * @param nftContract 地址：NFT的合约地址
     * @param tokenId NFT的ID
     */
    function withdrawAsset(address nftContract, uint256 tokenId,address to) external nonReentrant {
        require(_storedAssets[address(this)][tokenId], "NFT not stored");
        IERC721(nftContract).transferFrom(address(this), to, tokenId);
        _storedAssets[address(this)][tokenId] = false;
        emit AssetWithdrawn(to, tokenId);
    }

    /**
     * @notice 转移NFT
     * @param nftContract 地址：NFT的合约地址
     * @param tokenId NFT的ID
       @param to 接口NFT地址
     */
    function transferAsset(address nftContract,address to, uint256 tokenId) external nonReentrant {
        require(_storedAssets[address(this)][tokenId], "NFT not stored");
        IERC721(nftContract).transferFrom(address(this), to, tokenId);
        _storedAssets[address(this)][tokenId] = false;
        emit AssetWithdrawn(to, tokenId);
    }

    /**
     * @notice 查询某个地址的NFT是否存储
     * @param tokenId NFT的ID
     * @return 是否存储
     */
    function isStored(uint256 tokenId) external view returns (bool) {
        return _storedAssets[address(this)][tokenId];
    }

    receive() external payable {}

    uint256[10] private __gap;
}
