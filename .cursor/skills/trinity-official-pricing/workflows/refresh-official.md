# Workflow · 刷新某模态全量官方价

## 命令

```bash
cd trinity-AI

npm run pricing:supplier:official:text
npm run pricing:supplier:official:image
npm run pricing:supplier:official:video
# 或
npm run pricing:supplier:official:all
```

## 产出

- `suppliers/official/output/{modality}/vendor-pricing.json`
- `suppliers/official/output/{modality}/vendor-pricing-table.md`

## 注意

- 国际生文 live 抓取常失败（403/SPA）→ 自动 fallback `seeds/text.mjs`
- 国内生图/生视频目前以种子价为主
- 全量刷新耗时：约 `模型数 × 300ms` + 网络；生文 32 款约 1–2 分钟

## 刷新后（可选）

```bash
npm run pricing:compare:official -- --modality=all
```
