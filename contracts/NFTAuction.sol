// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {INFTAuction} from "./interface/INFTAuction.sol";

/**
 * @title NFTAuction
 * @dev This contract handles the minting and ownership management of NFTs.
 */
contract NFTAuction is INFTAuction, Initializable,ERC721Upgradeable, 
OwnableUpgradeable, PausableUpgradeable, AccessControlUpgradeable,ReentrancyGuardUpgradeable {

    event Minted(address indexed owner, uint256 tokenId);
    event OwnershipTransferred(address indexed from, address indexed to, uint256 tokenId);

    uint256 private _tokenIdCounter;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public mintLimit; // 每个用户最多铸造的数量
    mapping(address => uint256) public userMintCount;

    function initialize(
        uint256 _mintLimit,
        string memory name, 
        string memory symbol
    ) public initializer {
        __ERC721_init(name,symbol);
        __Ownable_init(_msgSender());
        __Pausable_init();
        __ReentrancyGuard_init();
        __Context_init();
        __AccessControl_init();
        // _setRoleAdmin(_msgSender());
        mintLimit = _mintLimit; // 设置铸造上限
    }

    // 需要显式覆盖 supportsInterface
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Mint a new NFT
     * @dev Creates a new NFT and assigns ownership.
     * @param to The address that will receive the NFT.
     * @return tokenId The ID of the minted token.
     */
    function mint(address to) external nonReentrant whenNotPaused returns (uint256) {
        require(userMintCount[to] < mintLimit, "Mint limit reached");
        uint256 tokenId = _tokenIdCounter;
        _mint(to, tokenId);
        _tokenIdCounter++;
        emit Minted(to, tokenId);
        return tokenId;
    }

    /**
     * @notice Get the owner of an NFT
     * @param tokenId The ID of the token.
     * @return The address of the NFT owner.
     */
    function getNFTOwner(uint256 tokenId) external view returns (address) {
        return ownerOf(tokenId);
    }

    /**
     * @notice 设置铸造上限
     * @param _limit 每个用户的铸造上限
     */
    function setMintLimit(uint256 _limit) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintLimit = _limit;
    }

    /**
     * @notice 添加铸造权限
     * @param account 被赋予权限的地址
     */
    function addMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    /**
     * @notice 移除铸造权限
     * @param account 被移除权限的地址
     */
    function removeMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }

    /**
     * @notice 判断某个地址是否为铸造者
     * @param account 地址
     * @return true 如果是铸造者
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }
}
