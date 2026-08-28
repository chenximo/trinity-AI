---
title: 商务洽谈折扣总表 · 回灌流程（SOP）
---

# 商务洽谈折扣总表 · 回灌流程（SOP）

> **文档类型**：商用计费 · **操作流程**（后续每新增一个上游成本折，按本文走）。  
> **读者**：产品、商务、运营（维护 Excel / 文档站）。  
> **产出**：[商务洽谈折扣总表.xlsx](../../../../../pricing/output/商务洽谈折扣总表.xlsx)（一本总册 · 9 Sheet，含「更新」）  
> **折数真源**：[定价策略与证据链](./pricing-strategy-evidence-chain)（改折先改证据链）  
> **脚本**：[`scripts/rebuild_discount_tier_workbook.py`](./scripts/rebuild_discount_tier_workbook.py)  
> **解析/外发回写**：`pricing/scripts/build_outward_quote_standard.py` → 内部册 + 外发仅折扣  
> **现网一键拉线路重建**：`pricing/scripts/rebuild_workbook_from_live_api.py`  
> **主路径 SOP**：[商务价格-本地生成与Cursor人审上传.md](../../../../../pricing/docs/商务价格-本地生成与Cursor人审上传.md)  
> **状态**：已拍 · 2026-08-13（主路径=本地生成+人审上传；Admin Job 后置）  
> **控制台目标（后置）**：[SUPPLY-PRICING-OPS-DESIGN.md §6.4](../../../../../pricing/docs/SUPPLY-PRICING-OPS-DESIGN.md)

---

## 0. 一句话流程

```text
【主路径 · 本地 + 人审上传 · 2026-08-13】
  rebuild_workbook_from_live_api（现网 export）→ L3b
  → build_outward_quote_standard → L3a 内部 + 外发仅折扣
  → 人审 → Cursor/Admin 上传 artifacts → 后台可下载
  （不写 /v1/prices）

【过渡 · 手导线路包】
线路管理导出 → pricing/input/routes-…/ → SOURCES_* → rebuild → build_outward

【后置 · 控制台 Job】
后台 snapshot → S-02 出真 draft → 人归档
```

---

## 1. Excel 页签（一本总册 · 含「更新」· 勿擅自加 src_*）

| 序 | Sheet | 职责 |
|----|-------|------|
| 1 | `更新` | 变更日志（新→旧）：日期 / 分类 / 说明 / 备注；重建时自动追加模型上新与成本族调整 |
| 2 | `00_说明` | 页签索引、重建命令、外发指针、线路源路径（不贴整表） |
| 3 | `01_报价解析汇总` | **报价依据**：外发口径 + 全量解析 + 原价专项 + 停用更低进价 |
| 4 | `10_商务总表-生文` | 成本族（低→高）× 对内阶梯浅→深（含 GM）× 模型清单 |
| 5 | `11_交叉模型-生文` | 跨折同名、P/W、推荐成本折 |
| 6 | `20_商务总表-生图` | 生图成本族 × 阶梯 × 模型（20260809 已回灌） |
| 7 | `21_交叉模型-生图` | 生图跨折（当前多为空） |
| 8 | `30_商务总表-生视频` | 生视频成本族 × 阶梯 × 模型（`routes-20260809-video/`） |
| 9 | `31_交叉模型-生视频` | 生视频跨折（如 `happyhorse-1.1`：0.40 vs 0.70） |

**不进总册**：各折扣 `src_*` 整表（原料只在 `pricing/input/`）。  
**另文件**：

| 文件 | 用途 |
|------|------|
| `Trinity模型报价表（内部）.xlsx` | 对内完整（文/图/视频 + 专项 sheet） |
| `Trinity模型报价表.xlsx` | **外发·仅有折扣**（客户包只用这份） |

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

现网 `--from-export-*`：**可解析的「X折」一律入表**，不因未写入 `FAMILY_ORDER` 丢模型。
未冻结族：主表只出本模态有线路的行；对客五档标「待定」。对外 L3a 先邻档插值，人审后再写入 `FAMILY_TIERS` / `PUBLIC_FAMILY_TIERS`。

| 情况 | 动作 |
|------|------|
| 已有族且阶梯已拍 | 只回灌模型，**不改** `FAMILY_TIERS` 折数 |
| **新**成本折 / 要改阶梯折 | 模型先入表 → 人审后改证据链 → 再改 `FAMILY_TIERS` |

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
