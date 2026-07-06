# 真源路径

根目录：`trinity-AI/pricing/`

## official 供应商

| 路径 | 说明 |
|------|------|
| `tools.yaml` | L2 原子能力 manifest |
| `confirmation.md` | 确认规则 |
| `suppliers/official/data/catalog/text.mjs` | 生文模型目录（32+） |
| `suppliers/official/data/catalog/image.mjs` | 生图模型目录 |
| `suppliers/official/data/catalog/video.mjs` | 生视频模型目录 |
| `suppliers/official/data/seeds/text.mjs` | 生文种子价（USD/M） |
| `suppliers/official/data/seeds/image.mjs` | 生图种子价（`locked` / `sourceUrl`） |
| `suppliers/official/data/seeds/video.mjs` | 生视频种子价 |
| `suppliers/official/data/pricing-urls.mjs` | 各厂商价目总页 |
| `suppliers/official/trinity-map.json` | Trinity ID → vendor（join 键） |
| `suppliers/official/fetch-pricing.mjs` | 拉取官网价 |
| `suppliers/official/gen-table.mjs` | 生成 Markdown 表 |
| `suppliers/official/scaffold-official-model.mjs` | 新增模型代码片段 |
| `suppliers/official/output/{text,image,video}/vendor-pricing.json` | **官方价真源** |
| `suppliers/official/output/{modality}/vendor-pricing-table.md` | 人读表 |

## AIGC（按模态）

| 路径 | 说明 |
|------|------|
| `suppliers/aigc/data/pricing-sheet.mjs` | 生文商务 sheet |
| `suppliers/aigc/data/pricing-sheet-image.mjs` | 生图商务 sheet |
| `suppliers/aigc/output/pricing-api.json` | 生文 AIGC JSON |
| `suppliers/aigc/output/pricing-api-image.json` | 生图 AIGC JSON |
| `suppliers/aigc/trinity-map-image.json` | 生图 Trinity 映射 |

## 对比用上游与线上

| 路径 | 说明 |
|------|------|
| `suppliers/tokenhub/output/pricing-console-api.json` | TokenHub |
| `suppliers/bailian/output/pricing-api.json` | 百炼（生文 L3 为主） |
| `pricing/config/channels-image.mjs` | 生图渠道：`connected`（已接入 Excel）/ `pending`（待接入） |
| `suppliers/volcengine/output/image/pricing-api.json` | 火山生图 |
| `output/online/prices-api.json` | 线上刊例 |
| `output/official/text.md` | 生文刊例对比 |
| `output/official/image.md` | 生图刊例对比 |
| `output/upstream/summary.md` | 生文刊例对比副本 |
| `output/upstream/image-summary.md` | 生图刊例对比副本 |
| `output/trinity-pricing-text.xlsx` | 生文商务 Excel |
| `output/trinity-pricing-image.xlsx` | 生图商务 Excel |
| `output/validate/official-aigc-cross.{json,md}` | 生文 L1 交叉 |
| `output/validate/official-aigc-cross-image.{json,md}` | 生图 L1 交叉 |
| `output/validate/official-vs-suppliers.{json,md}` | 生文 L3 交叉 |
| `output/validate/official-vs-suppliers-image.{json,md}` | 生图 L3 交叉 |
| `output/validate/pricing-alerts.json` | 合并告警 |
| `config/pricing-annotations.mjs` | 已知例外登记 |

## 文档

| 路径 | 说明 |
|------|------|
| `pricing/STRUCTURE.md` | 目录树 |
| `pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md` | **治理工作流 L0–L4** |
| `apps/trinity-product/docs/ai-api-platform/pricing-sources/workflow.md` | 产品手册流程图 |
| `apps/trinity-product/docs/ai-api-platform/pricing-sources/official-pricing-urls.md` | 原厂链接（含生图逐模型表） |
| `pricing/docs/OFFICIAL-PRICING-SKILL-DESIGN.md` | 设计稿（历史） |
| `pricing/suppliers/official/README.md` | official 命令 |
| `pricing/suppliers/SOURCES.md` | 真源索引 |
