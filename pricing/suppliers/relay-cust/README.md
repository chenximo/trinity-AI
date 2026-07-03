# 中转站-cust（AIUPNode）

[AIUPNode](https://www.aiupnode.com/pricing) 为**原厂直连**进货渠道；挂牌价与 `suppliers/official` **全量生文**对齐，**不爬**控制台。

## 真源

| 文件 | 说明 |
|------|------|
| `output/pricing-api.json` | 结构化价目（由 official 复制） |
| `trinity-map.json` | Trinity ID ↔ upstreamModelId |

## 生成

```bash
npm run pricing:supplier:official:text
npm run pricing:supplier:relay-cust
npm run pricing:refresh
```

## 与 official 的关系

- 价目从 `official` **全量复制**，构建器见 `pricing/suppliers/official-direct/`。
- 上游汇总 Excel Sheet：**中转站-cust**
