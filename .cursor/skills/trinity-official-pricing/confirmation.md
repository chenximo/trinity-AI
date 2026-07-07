# trinity-official-pricing · 确认规则

> 通用规则：[`../common/confirmation.md`](../common/confirmation.md)  
> 能力清单：[`./tools.yaml`](./tools.yaml) · `confirm` 字段为真源

## 须先确认再执行（`confirm: required`）

| tool id | 操作 | 说明 |
|---------|------|------|
| `pricing.seed.edit` | 改 `seeds/*.mjs` | 影响 L1 官方锚点；改后须 **`pricing.refresh`** + `pricing.gate` |
| `pricing.catalog.edit` | 改 `catalog/*.mjs` | 新增/下线模型目录 |
| `pricing.map.edit` | 改 `trinity-map.json` | 影响对比 join 键 |
| `pricing.aigc.sheet.edit` | 改 AIGC `pricing-sheet` | 影响 L1 交叉与刊例对比 |
| `pricing.alert` | `npm run pricing:alert` | 配置 `PRICING_ALERT_WEBHOOK_URL` 时会 POST 商务 |
| `pricing.publish.official.video` | `npm run pricing:publish-official:video` | 覆盖 `output/online/prices-api-video.json`（L4 本地缓存） |
| `pricing.publish.official.image` | `npm run pricing:publish-official:image` | 覆盖 `output/online/prices-api-image.json` |

## 建议确认（`confirm: optional`）

| tool id | 操作 | 说明 |
|---------|------|------|
| `pricing.tier-key.edit` | 改 `tier-key.mjs` | 影响多模型档位对齐规则 |

## 不需要确认（`confirm: none`）

- 只读校验：`pricing.gate`、`pricing.validate.*`
- 拉取/对比/刷新：`pricing.supplier.*`、`pricing.refresh`、`pricing.compare.official`、`pricing.fetch`、`pricing.upstream`
- 脚手架：`pricing.scaffold.model`（仅输出片段，不写盘除非用户要求粘贴）
- 本地跳过线上拉取：`PRICING_SKIP_ONLINE_FETCH=1`

## git 提交

以下路径变更 **提交前须用户同意**（对应 `git: true` 的编辑类 tool）：

- `pricing/suppliers/official/data/seeds/`
- `pricing/suppliers/official/data/catalog/`
- `pricing/suppliers/official/trinity-map.json`
- `pricing/suppliers/aigc/data/pricing-sheet.mjs`
- `pricing/suppliers/aigc/trinity-map.json`

产出物（`output/validate/`、`output/official/`）是否入库由用户决定；gate 报告可随修复一并提交。

## 确认话术模板

```text
将修改官方种子 pricing/suppliers/official/data/seeds/<file>.mjs（影响 L1 锚点），
改完后会跑 pricing:refresh（含 Excel）与 pricing:gate。是否继续？
```

```text
将执行 pricing:publish-official:video，把 draft 写入 output/online/prices-api.json（当前为单模态共享路径）。是否继续？
```
