# 原厂直连渠道（official-direct）

价目 **从 `official/` 筛选或全量复制**，不爬控制台、不维护独立价表。

## 新增渠道（只改配置）

1. 新建 `channels/<supplier-id>.mjs`（复制 `relay-cust.mjs` 改 `vendors` / `brand` / `excelSheet` 等）
2. 在 `channels/index.mjs` 的 `OFFICIAL_DIRECT_CHANNELS` 数组里 **push 一行**
3. 建目录 `pricing/suppliers/<supplier-id>/`（可只有 `README.md`；产出写在 `output/`）
4. **一次性**接入 `gen-upstream-pricing.mjs` 的 `SUPPLIERS`（Excel Sheet 名、列前缀）
5. `package.json` 加 `pricing:supplier:<id>` 别名（可选，指向本 build）
6. `npm run pricing:refresh`

## 命令

```bash
# 单个渠道
npm run pricing:supplier:relay-cust
# 或
node pricing/suppliers/official-direct/build-pricing.mjs --channel=relay-cust

# 全部原厂直连渠道
node pricing/suppliers/official-direct/build-pricing.mjs --all
```

## 已登记渠道

| supplierId | vendors | 说明 |
|------------|---------|------|
| `wangju-cloudportal` | openai, google | 网聚云联·云门户 |
| `relay-cust` | 全量 | 中转站-cust / AIUPNode |
