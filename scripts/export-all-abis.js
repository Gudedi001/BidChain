/**
 *  npx hardhat compile
 *  npx hardhat run scripts/export-all-abis.js
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 获取所有编译后的合约名称
  const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
  
  // 指定输出目录
  const outputDir = path.resolve(__dirname, "../frontend/src/abis"); // 调整为你前端的路径
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // 创建目录如果不存在
  }

  // 遍历所有合约
  for (const contractName of contractNames) {
    // 提取合约短名称（去掉路径前缀）
    const shortName = contractName.split(":")[1];
    const artifact = await hre.artifacts.readArtifact(shortName);
    const abi = artifact.abi;

    // 保存 ABI 到文件
    const outputPath = path.join(outputDir, `${shortName}ABI.json`);
    fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
    console.log(`Exported ABI for ${shortName} to ${outputPath}`);
  }

  console.log("All ABIs exported successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });