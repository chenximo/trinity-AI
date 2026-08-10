---
title: 商务洽谈折扣总表 · 回灌流程（SOP）
---

# 商务洽谈折扣总表 · 回灌流程（SOP）

> **文档类型**：商用计费 · **操作流程**（后续每新增一个上游成本折，按本文走）。  
> **读者**：产品、商务、运营（维护 Excel / 文档站）。  
> **产出**：[商务洽谈折扣总表.xlsx](../../../../../pricing/output/商务洽谈折扣总表.xlsx)（一本总册 · 8 Sheet）  
> **折数真源**：[定价策略与证据链](./pricing-strategy-evidence-chain)（改折先改证据链）  
> **脚本**：[`scripts/rebuild_discount_tier_workbook.py`](./scripts/rebuild_discount_tier_workbook.py)  
> **解析/外发回写**：`pricing/scripts/build_outward_quote_standard.py` → `01_报价解析汇总` + 外发 xlsx  
> **状态**：已拍 · 2026-08-09（一本总册；线路整表不进册）  
> **控制台目标流程**：[SUPPLY-PRICING-OPS-DESIGN.md §6.4](../../../../../pricing/docs/SUPPLY-PRICING-OPS-DESIGN.md)

---

## 0. 一句话流程

```text
【过渡 · 本地】
线路管理导出（按成本折筛选）→ 归档 pricing/input/routes-…/
  → 登记脚本 SOURCES_* → 跑 rebuild → 抽查 10/11 · 20/21 · 30/31
  → 跑 build_outward_quote_standard → 回写 01 + 外发（含 03_生视频）

【目标 · 控制台】
后台线路 API → L3b draft → L3a draft → 人归档；分册下载另议
```

---

## 1. Excel 页签（一本总册 · 勿擅自加 src_*）

| 序 | Sheet | 职责 |
|----|-------|------|
| 1 | `00_说明` | 页签索引、重建命令、外发指针、线路源路径（不贴整表） |
| 2 | `01_报价解析汇总` | **报价依据**：外发口径 + 全量解析 + 原价专项 + 停用更低进价 |
| 3 | `10_商务总表-生文` | 成本族（低→高）× 对内阶梯浅→深（含 GM）× 模型清单 |
| 4 | `11_交叉模型-生文` | 跨折同名、P/W、推荐成本折 |
| 5 | `20_商务总表-生图` | 生图成本族 × 阶梯 × 模型（20260809 已回灌） |
| 6 | `21_交叉模型-生图` | 生图跨折（当前多为空） |
| 7 | `30_商务总表-生视频` | 生视频成本族 × 阶梯 × 模型（`routes-20260809-video/`） |
| 8 | `31_交叉模型-生视频` | 生视频跨折（如 `happyhorse-1.1`：0.40 vs 0.70） |

**不进总册**：各折扣 `src_*` 整表（原料只在 `pricing/input/`）。  
**另文件**：`Trinity模型报价表.xlsx`（`00_折扣一览`/`01_生文`/`02_生图`/`03_生视频`，整本可发；仅此一份）。

---

## 2. 已拍档名（勿擅自改）

对内称呼：`Standard → Plus → Mid → Growth → Scale → Enterprise`  
对内门槛：**$1k / $5k / $10k / $30k / $50k**（五档）。  
对外 L3a **仅三档**：**$5k / $10k / $50k**（对应 Mid / Growth / Enterprise）。

| 对内英文 | 门槛 | 是否进对外报价表 |
|------|------|------|
| Standard | &lt;$1k | 目录价列（无阶梯） |
| Plus | ≥$1k | ❌ 仅对内 |
| Mid | ≥$5k | **对外·≥$5k** |
| Growth | ≥$10k | **对外·≥$10k** |
| Scale | ≥$30k | ❌ 仅对内 |
| Enterprise | ≥$50k | **对外·≥$50k** |

对外表头带「对外」；对客折底线暂定 **5.5**（0.40 最深 5.5 · 0.50 最深 6.0）。释义见证据链 §3.0 / 定价方案 §6.0。

---

## 3. 新增一个成本折（标准步骤）

### Step A · 导出源文件

1. 线路管理按 **目标折扣** + **启用** 导出。  
2. 归档到 `pricing/input/routes-YYYYMMDD-text/`（或模态专用目录）。  
3. 必备列：`模型编码` · `线路名` · `优先级` · `权重` · `折扣` · `启停`。

### Step B · 折数是否已在证据链？

| 情况 | 动作 |
|------|------|
| 已有族且阶梯已拍 | 只回灌模型，**不改** `FAMILY_TIERS` 折数 |
| **新**成本折 / 要改阶梯折 | **先改**证据链 → 再改脚本 `FAMILY_TIERS` |

### Step C · 登记脚本 `SOURCES`

```python
(ROUTES_TEXT / "080.xlsx", "8折", "0.80"),
```

### Step D · 跑脚本

```bash
cd trinity-AI/apps/trinity-product/docs/ai-api-platform/commercial-billing
python3 scripts/rebuild_discount_tier_workbook.py
# 然后回写 01 + 外发
python3 ../../../../../pricing/scripts/build_outward_quote_standard.py
```

默认写出 `pricing/output/商务洽谈折扣总表.xlsx`。

---

## 4. 抽查清单

- [ ] `00_说明` 线路源路径与导入数正确  
- [ ] `10` 各成本族模型数与启用导出一致  
- [ ] `11` 交叉推荐合理  
- [ ] 无 `src_*` 页签  
- [ ] 跑外发后 `01` 非「待回写」占位  
