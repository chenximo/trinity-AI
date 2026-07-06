# Workflow · 刷新某模态全量官方价

> 能力清单：[`../tools.yaml`](../tools.yaml)

## 能力引用

| 意图 | tool id |
|------|---------|
| 生文 | `pricing.supplier.official.text` |
| 生图 | `pricing.supplier.official.image` |
| 生视频 | `pricing.supplier.official.video` |
| 全模态 | `pricing.supplier.official.all` |
| 刷新后对比（可选） | `pricing.upstream`（生文）/ `pricing.upstream.image`（生图） |

在 `trinity-AI` 目录执行对应 tool 的 `command`（见 tools.yaml）。

## 产出

- `suppliers/official/output/{modality}/vendor-pricing.json`
- `suppliers/official/output/{modality}/vendor-pricing-table.md`

## 注意

- 国际生文 live 抓取常失败（403/SPA）→ 自动 fallback `seeds/text.mjs`
- 国内生图/生视频目前以种子价为主；核实后设 `locked: true`
- 全量刷新耗时：约 `模型数 × 300ms` + 网络

## 刷新后（可选）

| 模态 | 命令 | Excel |
|------|------|-------|
| 生文 | `pricing.refresh` 或 `pricing.upstream` | `trinity-pricing-text.xlsx` |
| 生图 | `pricing.refresh` 或 `pricing.upstream.image` | `trinity-pricing-image.xlsx` |

L2 交叉：`pricing.validate.official-aigc` / `.image`（见 pricing-gate workflow）。
