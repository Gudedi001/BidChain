const { keccak256, toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require('ethers');

/**
 * 
 * DepositeETH(address,uint256) => 0x8fb45ce1e0ffa9f14d4c2d76eb516f9a3d5cd63e596178438dfe6218b1df467c
WithdrawnETH(address,uint256) => 0x5817fe91d2748c33f168d8a78037fc073adaf6ec8e3613a758d44a2cfae4563d
refundETH(address,uint256) => 0x4bd227668c0bcbf74838a3226efa2261e9397e36e059fac0c814dc862f856986
AssetStored(address,uint256) => 0xae548e542623413c77b6f88e4dd75ef1abdbf6d4594e63046d20167d1b718e08
AssetWithdrawn(address,uint256) => 0x94b055d454fefc95ba06924afbaac83912b1575d621a7d32a4675303246bb7d0
AuctionCreated(uint256,uint256,address,uint256,uint256,uint8) => 0x28172c0d052e483d0039fa59cecc3b1785b9c5ec2de2411ff2a171bfc737bbfa
BidPlaced(uint256,address,uint256) => 0x0e54eff26401bf69b81b26f60bd85ef47f5d85275c1d268d84f68d6897431c47
AuctionEnded(uint256,address,uint256) => 0xd2aa34a4fdbbc6dff6a3e56f46e0f3ae2a31d7785ff3487aa5c95c642acea501
Minted(address,uint256) => 0x30385c845b448a36257a6a1716e6ad2e1bc2cbe333cde1e69fe849ad6511adfe
OwnershipTransferred(address,address,uint256) => 0xc13a1166d81cd3b0b352a367aebab95f3a6f6bc695fdab8e9a9d335239c3861b
 * 
 *  npx hardhat compile
 *  npx hardhat run scripts/eventHashes.js
 */
const eventSignatures = [
  "DepositeETH(address,uint256)",
  "WithdrawnETH(address,uint256)",
  "refundETH(address,uint256)",
  "AssetStored(address,uint256)",
  "AssetWithdrawn(address,uint256)",
  "AuctionCreated(uint256,uint256,address,uint256,uint256,uint8)",
  "BidPlaced(uint256,address,uint256)",
  "AuctionEnded(uint256,address,uint256)",
  "Minted(address,uint256)",
  "OwnershipTransferred(address,address,uint256)"
];

for (const sig of eventSignatures) {
//   const hash = keccak256(toUtf8Bytes(sig));
  const hash_1 = ethers.utils.id(sig);
//   console.log(`${sig} => ${hash}`);
  console.log(`${sig} => ${hash_1}`);
}

// for (const signature of eventSignatures) {
//     const hash = ethers.utils.id(signature);
//     console.log(`${signature} => ${hash}`);
//   }
