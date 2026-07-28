# 腾讯云 AIGC · 账单核对

上游：**腾讯云 AIGC**（平台供应商字段多为 `腾讯云AIGC`）。

## 目录约定

| 路径 | 说明 |
|------|------|
| `YYYY-MM/` | 账单月（与腾讯「账单月」对齐，如 `2026-06`） |
| `trinity-platform-*.csv` | Trinity / 平台侧对账导出（结算时间、用户、模型、用户花费、平台成本等） |
| `tencent-*.csv` | 腾讯云控制台 L2 资源账单等（按计费周期） |

## 已入库

### 2026-06

| 文件 | 来源 | 说明 |
|------|------|------|
| [trinity-platform-reconciliation-20260728.csv](./2026-06/trinity-platform-reconciliation-20260728.csv) | 平台导出 `billing-reconciliation-20260728-104403.csv` | 供应商含腾讯云 AIGC；金额 USD |
| [tencent-L2-资源账单-100048741014-202606-按计费周期-part.csv](./2026-06/tencent-L2-资源账单-100048741014-202606-按计费周期-part.csv) | 腾讯云 L2 资源账单（账号 `100048741014`） | 账单月 2026-06；金额元 |
| [notes.md](./2026-06/notes.md) | 核对笔记 | **总账未对平**（@6.5 约 2.64×）；详见笔记 |

### 2026-07

| 文件 | 来源 | 说明 |
|------|------|------|
| [trinity-platform-reconciliation-20260728.csv](./2026-07/trinity-platform-reconciliation-20260728.csv) | 平台导出 `billing-reconciliation-20260728-111803.csv` | 供应商含腾讯云 AIGC；金额 USD |
| [tencent-L2-资源账单-100048741014-202607-按计费周期-part.csv](./2026-07/tencent-L2-资源账单-100048741014-202607-按计费周期-part.csv) | 腾讯 L2 zip 解压（账号 `100048741014`） | 账单月 2026-07；金额元 |
| [notes.md](./2026-07/notes.md) | 核对笔记 | **接近但仍有缺口**（@6.5 约 **1.14×** / +$17）；详见笔记 |

> 平台 CSV 含「合计」行，加总时需排除。
