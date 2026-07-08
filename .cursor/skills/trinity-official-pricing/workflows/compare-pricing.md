# Workflow · 三方价对比（官方 vs 上游 vs 线上）

> 能力清单：[`../tools.yaml`](../tools.yaml)  
> **治理拓扑各模态相同**：L1 锁定 → L2 交叉 → L3 渠道 → **L4 刊例对比** → 汇总 Excel；仅单位与分档轴不同。

## 能力引用（按模态）

| 阶段 | 生文 `text` | 生图 `image` |
|------|-------------|--------------|
| 拉官方价 | `pricing.supplier.official.text` | `pricing.supplier.official.image` |
| 构建 AIGC | `pricing.supplier.aigc` | `pricing.supplier.aigc.image` |
| L1 交叉 | `pricing.validate.official-aigc` | `pricing.validate.official-aigc.image` |
| L3 渠道交叉 | `pricing.validate.official-suppliers` | `pricing.validate.official-suppliers.image` |
| **刊例对比 + 汇总** | `pricing.upstream` 或 `pricing.refresh`（含生文+生图） | `pricing.upstream.image` |
| 人读对比（可选） | `pricing.compare.official` | （已含在 upstream.image） |

`pricing.compare.official` 与 `pricing.upstream` 会自动 `GET /v1/prices` 刷新线上刊例；本地可设 `PRICING_SKIP_ONLINE_FETCH=1`。  
单独拉刊例可用 `pricing.fetch`。

### 对比参数（`pricing.compare.official`）

- 单模型：`… -- <vendorModelId>`
- 整模态：`… -- --modality=text|image|video|all`

## 产出

| 文件 | 模态 | 说明 |
|------|------|------|
| `pricing/output/official/text.md` | 生文 | 刊例对比（与 Excel 同源） |
| `pricing/output/official/image.md` | 生图 | 刊例对比（与 Excel 同源） |
| `pricing/output/official/video.md` | 生视频 | 刊例对比 |
| `pricing/output/upstream/summary.md` | 生文 | 同上副本 |
| `pricing/output/upstream/image-summary.md` | 生图 | 同上副本 |
| `pricing/output/trinity-pricing-text.xlsx` | 生文 | 商务 Excel |
| `pricing/output/trinity-pricing-image.xlsx` | 生图 | 商务 Excel |
| `pricing/output/official/{modality}.json` / `.csv` | 各模态 | 机器可读 |

### Excel Sheet 结构

**三模态 L4 主表列约定一致**（`pricing/pipeline/lib/compare-l4-columns.mjs`）：

- 锚点：**厂商官方价**
- 进货参照：**AIGC国内 · AIGC国际 · TokenHub · OpenRouter**（生图/生视频 OR 暂无则 `—`）
- 被校验：**线上刊例**
- 对比：各渠道 `*vs官方` + **刊例结论** + **备注**
- **不进主表**：百炼、火山方舟等 L3（见分表 · `汇总-供应商vs官方`）

**生文** `trinity-pricing-text.xlsx`：

1. `刊例对比校验-生文` — L4 主表（另含 token 三维 `刊例vs官方_入/出/缓`）
2. `汇总-供应商vs官方` — L3 渠道 vs 官方专表
3. TokenHub / 百炼 / AIGC / 火山… 分表

**生图** `trinity-pricing-image.xlsx`（单位为元/张）：

1. `刊例对比校验-生图` — L4 主表（档位轴：分辨率档）
2. `汇总-供应商vs官方-生图` — L3 汇总
3. `AIGC国内站-生图` / `AIGC国际站-生图` — 分表含 **厂商官方价 · 挂牌 · vs官方**

**生视频** `trinity-pricing-video.xlsx`：

1. `刊例对比校验-生视频` — L4 主表（档位轴：AIGC属性 × 分辨率；末列 `线上刊例 slug`）
2. `汇总-供应商vs官方-生视频`
3. `AIGC国内站-生视频` / `AIGC国际站-生视频` / `火山方舟-生视频`（火山仅 L3 分表）

**当前已接入进货渠道：生图/生视频仅 AIGC 国内/国际出汇总分表。** TokenHub、火山方舟等仅有价目参照或 L2/L3 校验；接入后在 `channels-{image,video}.mjs` 设 `connected: true`。

生图无百炼 / 网聚 / 中转（生文专属 SKU）；未来接入时在同一文件新增条目。

渠道清单：`pricing/config/channels-image.mjs`（`IMAGE_CONNECTED_SUPPLIERS` / `IMAGE_PENDING_SUPPLIERS`）。

`pricing:refresh` 会同时刷新生文与生图 Excel；单改生图官方价后也可只跑 `pricing.upstream.image`。

## 表头含义（刊例对比主表）

| 列族 | 来源 / 说明 |
|------|-------------|
| 厂商官方价 | `official/output/{modality}/vendor-pricing.json`（L1 锚点） |
| AIGC国内 / AIGC国际 | `aigc/output/pricing-api*.json`（L2） |
| TokenHub | `tokenhub/output/pricing-console-api.json`（L2） |
| OpenRouter | `openrouter/`（生文有数据；生图/生视频列预留，暂无则 `—`） |
| 线上刊例 | `output/online/prices-api-{modality}.json`（L4） |
| 百炼 / 火山方舟 | **仅 L3 分表**，不进刊例对比主表 |

join 键：`official/trinity-map.json` 的 Trinity `modelId`（生视频另见 `video-model-registry.mjs` · `线上刊例 slug`）。

## 推荐执行顺序（生图）

1. `pricing.supplier.official.image` — 刷新 L1
2. `pricing.validate.official-aigc.image` — L2 交叉（锁定前必绿或登记例外）
3. `pricing.supplier.aigc.image` — 刷新 AIGC 生图 JSON（upstream 也会写）
4. **`pricing.upstream.image`** — 刊例对比 + Excel（**L1 锁定后再跑更有意义**）

生文改价后：`pricing.refresh` → `pricing.gate`（见 pricing-gate workflow）。

## 汇报要点

- 官方价与上游价差（注意 CNY vs USD 单位）
- 线上刊例相对上游是否已加价
- `officialStatus` / `seedLocked` 为未核实种子时提示补 catalog/seed
- 生图国际模型（OpenAI/Gemini/MJ）：国内 AIGC vs 官方 可能不可比（币种/转售）

## 与 validate / gate 区别

| | `pricing.upstream.image` | `pricing.validate.official-aigc.image` | `pricing.gate` |
|--|--------------------------|--------------------------------------|----------------|
| 含官方价 | ✅ | ✅（种子） | ✅ |
| 含 L4 线上刊例 | ✅ | ❌ | ❌ |
| 含 L1 AIGC/TokenHub 交叉 | 人读表 | ✅ 阻断 | ✅ |
| 含 L3 渠道交叉 | 人读表 | ❌ | ✅ |
| 自动刷新线上价 | ✅ | ❌ | ❌ |
| 产出 Excel | ✅ | ❌ | ❌ |

门禁详情：[`pricing-gate.md`](./pricing-gate.md) · 治理文档：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`
