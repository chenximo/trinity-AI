# 真源路径

根目录：`trinity-AI/pricing/`

## official 供应商

| 路径 | 说明 |
|------|------|
| `suppliers/official/data/catalog/text.mjs` | 生文模型目录（32+） |
| `suppliers/official/data/catalog/image.mjs` | 生图模型目录 |
| `suppliers/official/data/catalog/video.mjs` | 生视频模型目录 |
| `suppliers/official/data/seeds/text.mjs` | 生文种子价（USD/M） |
| `suppliers/official/data/seeds/image.mjs` | 生图种子价 |
| `suppliers/official/data/seeds/video.mjs` | 生视频种子价 |
| `suppliers/official/data/pricing-urls.mjs` | 各厂商价目总页 |
| `suppliers/official/trinity-map.json` | Trinity ID → vendor（join 键） |
| `suppliers/official/fetch-pricing.mjs` | 拉取官网价 |
| `suppliers/official/gen-table.mjs` | 生成 Markdown 表 |
| `suppliers/official/scaffold-official-model.mjs` | 新增模型代码片段 |
| `suppliers/official/output/{text,image,video}/vendor-pricing.json` | **官方价真源** |
| `suppliers/official/output/{modality}/vendor-pricing-table.md` | 人读表 |

## 对比用上游与线上

| 路径 | 说明 |
|------|------|
| `suppliers/tokenhub/output/pricing-console-api.json` | TokenHub |
| `suppliers/bailian/output/pricing-api.json` | 百炼 |
| `suppliers/aigc/output/pricing-api.json` | AIGC |
| `output/online/prices-api.json` | 线上刊例 |
| `output/official/{text,image,video}.md` | 三方对比产出 |

## 文档

| 路径 | 说明 |
|------|------|
| `pricing/STRUCTURE.md` | 目录树 |
| `pricing/docs/OFFICIAL-PRICING-SKILL-DESIGN.md` | 设计稿 |
| `pricing/suppliers/official/README.md` | official 命令 |
| `pricing/suppliers/SOURCES.md` | 真源索引 |
