# Workflow · ops-scenario-router（运营场景总机）

> **定稿**：2026-08-11 · 产品四场景（③ 巡检已并入①）  
> **读者**：Agent / 定价运营 · **不**代替各子 workflow 的 CLI 逐步表  
> **Admin 真源**：运营后台 → 模型刊例和定价（价目预览 / 价格校验 / 商务价格）  
> **关联**：[`../SKILL.md`](../SKILL.md) · [价审运营SOP](../../../../pricing/docs/价审运营SOP-Admin价格校验.md) · [Agent 架构总览](../../../../pricing/docs/定价系统-Agent架构与SOP-WorkSession.md) · [研发需求清单](../../../../pricing/docs/模型供应与定价运营-研发需求清单.md) · [刊例策略 V1/V2](../../../../pricing/docs/刊例策略-V1-V2-国际站优先.md)

---

## 0. 一句话

```text
先问「要交付哪一种产物」→ 进下面四条之一。
禁止把「上游调倍率」和「官方锚跟刊例」混成同一个「变价」。
巡检/只看不写 = 开①看确认单，不点「确认写价」（可手动或以后定时触发同一链）。
```

本文件**只分流**；具体命令见 `tools.yaml` 与下表「子 workflow」。

---

## 1. 判定顺序（必须按序）

```text
1. 只要对外/对内商务报价表（L3a/L3b），不改扣费刊例？ → ⑤ commercial-quote
2. 上游挂牌变了，先调进货线路成本/倍率（不是改 /v1/prices）？ → ② adjust-upstream-route-rate
3. 货架上还没有该模型，或没有可靠 trinity-map？ → ④ onboard-model（再问 B1/B2）
4. 其余：已上架模型要按官方锚对齐刊例，或例行看 diff？ → ① follow-official-listing
```

弱自动：可根据 Excel/告警**推荐**场景，最终以人在 Admin 选择或用户明示为准。

---

## 2. 四场景卡

### ① `follow-official-listing` · 官方锚跟刊例

| 项 | 内容 |
|----|------|
| **目标产物** | 价审确认单（draft + diff）→ 人确认后写 **`/v1/prices`** |
| **Admin** | **价格校验** · 场景建议名 **「官方锚跟刊例」**（现网过渡名：`官方上游变价` / `巡检跟进` 均视为走本链；**巡检不单列**） |
| **人路径** | 触发 → 价审汇总（中间态：Δ% / 风险标）→ **确认写价** 才改线上；不确认 = 不改价 |
| **Worker steps（指针）** | official 刷新（按需）→ `pricing:fetch` → `pricing:upstream` → listing/gen（如 `pricing:gen-65` / V2）→ `pricing:diff:*` → `pricing:emit-review-package` |
| **子 workflow** | [`refresh-official.md`](./refresh-official.md)（按需）· [`compare-pricing.md`](./compare-pricing.md) · [`rollout-listing-price.md`](./rollout-listing-price.md)（图/视频 gen→diff→publish 本地缓存时） |
| **禁止** | 用转售上游挂牌冒充 V2 官方锚；Job **静默**写刊例 |

**原「③ 巡检」**：并入本场景。需要巡逻时手动（或日后定时）跑同一 Worker 链，看完不点写回即可。

---

### ② `adjust-upstream-route-rate` · 上游路线调价

| 项 | 内容 |
|----|------|
| **目标产物** | 某上游**线路**的建议倍率/成本 → 人保存线路配置 |
| **Admin** | **价目预览**（获取价格 / 线路）· **「上游路线调价」**；**≠** 价格校验的「确认写价」 |
| **人路径** | 抓上游 → 看进货价差 → 改倍率/成本并保存；若还要动对外刊例 → **另开①** |
| **Job/步骤（指针）** | `pricing:supplier:*` 抓取 →（建议倍率/成本，产品规则另定）→ 人改线路 |
| **子 workflow** | 上游真源见 `pricing/suppliers/SOURCES.md`；渠道接入见 [`add-supplier-channel.md`](./add-supplier-channel.md) |
| **现状** | 产品语义已定；Admin 闭环多为缺口（勿假装已与①共用确认写价） |
| **禁止** | 把上游变价直接当成①的「确认写回刊例」 |

---

### ④ `onboard-model` · 上新跟价（B1 / B2）

| 项 | 内容 |
|----|------|
| **目标产物** | 新 SKU：映射 + 首次建议刊例 → 确认写价 + **上架门禁**（价格校验字段） |
| **Admin** | **价格校验** · **「上新跟价」** + 子类型（或 note） |
| **B1 已有上游** | 渠道已在 → 补 catalog/map/模型 → 价审链（可近似①的出包）→ 确认写价 → 上架 |
| **B2 新上游** | Worker **自动 detect-new**：跑 `pricing:upstream:access` → 对比上游全量 vs 线上刊例 → 未接入项按渠道分组；**渠道已有 CLI** → B1，**渠道未接/无产物** → B2；再出包 |
| **Admin 操作** | 仅需选模态 + **「上新跟价」**；B1/B2 与渠道由 Worker 判定（`note: onboard=auto`） |
| **P0 前置校验（已落地）** | 当 Admin 触发 `上新跟价` 且携带 `modelIds` 时，Worker 会校验 `pricing/suppliers/official/trinity-map.json` 覆盖这些 `modelIds`（并要求 vendorModelId 非空）；不满足则拒绝出包，避免“映射缺失导致的空草案”。 |
| **子 workflow** | [`add-official-model.md`](./add-official-model.md) · [`add-official-model-video.md`](./add-official-model-video.md) · B2：按 `channel=` 决定先跑哪个 `pricing:supplier:<...>` → 再走 B1（新增未知渠道仍走 [`add-supplier-channel.md`](./add-supplier-channel.md) 完成脚本接入） |
| **禁止** | 无 map 或缺 `channel=` 时仍“按 B2 强行出包”；应退化为 P0 + 主链（或先补配置/接入） |

问一句即可区分 B1/B2：*「只是老渠道价目多了一行，还是连进货渠道都是新的？」*

---

### ⑤ `commercial-quote` · 商务报价表

| 项 | 内容 |
|----|------|
| **目标产物** | L3a / L3b Excel（对外三档等） |
| **Admin** | **商务价格** · 生成 / 下载 |
| **人路径** | 生成报表；**不写** `/v1/prices` |
| **归属** | 商用计费 / 商务柱；**不**强行塞进 official-pricing 执行链；本 router 只负责指到正确入口 |
| **真源** | 需求清单 S-01～S-05 · `pricing/docs` 商务相关设计 |
| **禁止** | 在价目预览或价审确认单里「生成商务表并写刊例」 |

---

## 3. Admin ↔ router ↔ 现网 scenario 对照

| Router id | Admin 落点 | 建议展示名 | 现网 `scenario` |
|-----------|------------|------------|-----------------|
| ① `follow-official-listing` | 价格校验 | **官方锚跟刊例** | `官方锚跟刊例`（旧值 `官方上游变价` / `巡检跟进` 读入归一到本项） |
| ② `adjust-upstream-route-rate` | 价目预览 / 线路 | 上游路线调价 | **不进**价审写价枚举 |
| ④ `onboard-model` | 价格校验 | 上新跟价（+ B1/B2） | `上新跟价` |
| ⑤ `commercial-quote` | 商务价格 | 生成/下载报价表 | **无**价审 scenario |

`自定义`：人写 note；Agent 仍须归到四条之一或明确拒绝混写刊例+倍率。

---

## 4. Worker / Job 步骤指针（详情不在此维护）

| 场景 | 默认意图 | 步骤要点 |
|------|----------|----------|
| ① | 出确认单，备写刊例 | fetch → upstream → gen → diff → emit；（按需）official refresh |
| ② | 更新上游真源 + 建议线路参数 | supplier fetch → 建议倍率/成本 → **人保存线路** |
| ④ | 同①出包，前置 map/渠道 | B2 先渠道；B1/完成后 ≈ ① |
| ⑤ | 商务脚本/Job | L3b/L3a；禁止写 `/v1/prices` |

场景不同 → 步骤清单应不同；**禁止**永远共用一条「万能链」却贴错业务名。

---

## 5. 检查清单（分流结束前）

- [ ] 已按 §1 判定到且仅到四条之一  
- [ ] ① 与 ② 未混用（上游倍率 ≠ 确认写刊例）  
- [x] ④ 已做 P0：按 `modelIds` 覆盖校验（`official/trinity-map.json`）  
- [x] ④ 已区分 B1/B2（Worker detect-new 自动判定；Admin 无需手选）  
- [ ] ⑤ 未走价格校验写价  
- [ ] 「只要看 diff」已说明：开①、不点确认（或价目预览刷新对照）  
- [ ] 已 READ 对应子 workflow / 真源后再改仓库或触发 Job  
