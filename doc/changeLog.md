# 合约更新日志 20250424

## 优化内容

### 1. 拍卖标识优化
- 将 `AuctionDetail` 中的拍卖 ID 替换为 `AuctionKey`。
- `AuctionKey` 包含一个通过哈希生成的唯一标识字段，提升标识的唯一性和安全性。

### 2. 字段名称统一
- 优化合约字段名称，使其与后端接口保持一致，确保前后端数据交互的兼容性和一致性。

### 3. 支持多类型 NFT 拍卖
- 在 `createAuction` 函数中新增 NFT 集合地址参数。
- 支持扩展其他类型的 NFT 拍卖，提升合约的通用性和灵活性。

### 4. 事件参数优化
- 根据后端需求，调整事件参数结构和内容。
- 优化事件信息，增强与后端系统的集成效率。

### 5. 无人竞拍处理逻辑
- 新增无人竞拍场景的处理逻辑。
- 确保合约在无竞标者时能够正确处理，提升健壮性和用户体验。

### 6. 合约升级
- NFTAuction 进行了升级，代理地址不变。
- Auction 因为结构发生了变化  所以合约重新部署，代理地址和实现地址都发生变化。
- 地址已更新在deploy.js中

## 备注
- 所有改动已与后端需求对齐，确保合约功能与系统整体设计一致。
- 下一步计划：进一步测试新功能，验证多类型 NFT 拍卖的兼容性。