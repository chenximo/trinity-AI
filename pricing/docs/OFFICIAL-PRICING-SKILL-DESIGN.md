# 模型官方价目 Skill 设计方案

> 状态：已实现 · 2026-06-28  
> Skill：`.cursor/skills/trinity-official-pricing/`
> 关联目录：`pricing/suppliers/official/` · [STRUCTURE.md](../STRUCTURE.md) · [official/README.md](../suppliers/official/README.md)

---

## 1. 背景与目标

Trinity 价目体系需要区分三类价格，且**模型原厂官网公开价**必须可维护、可对比、可按模态独立查看：

| 价格层级 | 含义 | 真源位置 |
|----------|------|----------|
| **官方价（原厂）** | 各模型厂商官网文档/API 说明页的权威挂牌价 | `suppliers/official/output/{modality}/` |
| **上游价（转售）** | TokenHub / 百炼 / AIGC 等转售渠道挂牌价 | `suppliers/{tokenhub,bailian,aigc}/` |
| **线上刊例** | Trinity 平台对用户实际扣费价 | `output/prices-api.json` |

### 设计目标

1. **补充模型官方价**：用户说「补充 `xxx` 模型的官方价格」时，有固定流程（价目、官网链接、目录条目、映射、验证）。
2. **方便对比**：在 Trinity AI 场景下能对照 **官方价 ↔ 上游价 ↔ 线上刊例**。
3. **模态独立**：生文、生图、生视频各有独立目录、JSON 真源与人读表格。
4. **可重复执行**：通过 Skill 教 Agent 走标准步骤，减少漏改、错模态。

---

## 2. 现状评估

### 2.1 已具备（`official/` 模态拆分）

```
suppliers/official/
├── data/catalog/     text.mjs | image.mjs | video.mjs
├── data/seeds/       text.mjs | image.mjs | video.mjs
├── fetch-pricing.mjs --modality=text|image|video|all
├── gen-table.mjs
├── trinity-map.json
└── output/
    ├── text/vendor-pricing.json + vendor-pricing-table.md
    ├── image/...
    └── video/...
```

| npm 命令 | 产出 |
|----------|------|
| `pricing:supplier:official:text` | 生文官方价（USD / 百万 tokens） |
| `pricing:supplier:official:image` | 生图官方价（CNY / 张） |
| `pricing:supplier:official:video` | 生视频官方价（CNY / 积分·次，分档） |
| `pricing:supplier:official:all` | 三种模态一次拉取 |

### 2.2 需求满足度

| 需求 | 满足度 | 说明 |
|------|--------|------|
| 补充 xxx 官方价（含链接、价目） | **约 80%** | 数据结构与脚本已有；缺标准化「加模型」编排与脚手架 |
| 官方 vs 上游 vs 线上对比 | **约 40%** | `pricing:upstream` / `validate` 仅覆盖线上 ↔ 三上游；**未接入 `official`** |
| 生文/生图/生视频独立表 | **100%** | 各模态独立 `output/{modality}/vendor-pricing-table.md` |
| 可重复的 Agent 流程 | **0%** | 尚无 Skill |

### 2.3 主要缺口

1. **`official` 未接入 `pipeline` 汇总**：`upstream-pricing.json` 不含原厂价列。
2. **`trinity-map.json` 不完整**：目前 mainly 生文国际模型；生图/生视频映射待扩展。
3. **无「加模型」标准作业**：catalog / seed / map / fetch 四步靠人工记忆。
4. **对比命令缺失**：无 `pricing:compare:official` 一类单模型或按模态全表对照。

---

## 3. 推荐架构

三层分工，避免重复造轮子：

```
┌─────────────────────────────────────────┐
│  Layer A：Skill（编排）                  │
│  .cursor/skills/trinity-official-pricing │
│  用户自然语言 → 标准 checklist → 调脚本   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Layer B：数据层（已有）                 │
│  pricing/suppliers/official/             │
│  catalog · seeds · fetch · output        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Layer C：对比层（待小扩展）             │
│  pricing/pipeline/compare-official.mjs   │
│  官方 + 上游 + 线上 → 按模态 Markdown    │
└─────────────────────────────────────────┘
```

| 层 | 职责 | 是否新建 |
|----|------|----------|
| **Skill** | 「补充官方价」「刷新」「出对比」的步骤与检查清单 | 新建 |
| **official/** | 真源数据、抓取、按模态 JSON/MD | 已有，小改 |
| **pipeline** | 三方 join、按模态对比表 | 扩展 |

**不需要**另建 Cursor Hooks、CI 自动工作流或独立 Web 流程；价目维护以**人工触发 + Agent 辅助**为主。

---

## 4. Skill 设计

### 4.1 存放位置

建议 **项目级 Skill**（与 `trinity-AI` 仓库同仓）：

```
trinity-AI/.cursor/skills/trinity-official-pricing/
├── SKILL.md           # 主流程（< 200 行）
├── add-model.md       # 按模态的 catalog / seed 模板与示例
└── compare.md         # 三方对比步骤（pipeline 就绪后启用）
```

`SKILL.md` 通过链接引用仓库内文档，避免重复维护：

- [pricing/STRUCTURE.md](../STRUCTURE.md)
- [pricing/suppliers/official/README.md](../suppliers/official/README.md)
- [pricing/suppliers/SOURCES.md](../suppliers/SOURCES.md)

### 4.2 触发场景（description 关键词）

- 补充 / 更新 **官方价**、**原厂价**、vendor pricing
- 某模型的 **官网链接**、权威公开价
- 对比 **官方价 vs 上游价 vs 线上刊例**
- 生文 / 生图 / 生视频 官方价目表

### 4.3 核心工作流：补充模型官方价

用户示例：「补充 `gpt-5.6` 的官方价格」。

```
Task Progress:
- [ ] Step 1: 判定模态（text | image | video）
- [ ] Step 2: 查重（catalog、trinity-map、TokenHub）
- [ ] Step 3: 核实官网真源（docUrl、pricingUrl、价目）
- [ ] Step 4: 改 catalog + seeds + trinity-map
- [ ] Step 5: 抓取并验证 JSON
- [ ] Step 6: 生成 / 展示人读表
- [ ] Step 7: （可选）三方对比
```

#### Step 1 — 判定模态

| 模态 | 典型特征 | catalog 文件 |
|------|----------|--------------|
| `text` | 按 token 计费；对话/推理模型 | `data/catalog/text.mjs` |
| `image` | 元/张、PICTURE 单位 | `data/catalog/image.mjs` |
| `video` | 积分/次、分辨率分档 | `data/catalog/video.mjs` |

参考：`TokenHub pricing-console-api.json` 的 `tags`（`图片生成` / `视频生成`）、Trinity `GET /v1/prices?modality=`。

#### Step 2 — 查重

在以下位置搜索 `vendorModelId` 与 Trinity `modelId`：

- `official/data/catalog/{modality}.mjs`
- `official/trinity-map.json`
- `suppliers/tokenhub/output/pricing-console-api.json`
- 各上游 `trinity-map.json`（aigc 等）

已存在 → 走**更新**分支（改 seed + 重新 fetch）；不存在 → 走**新增**分支。

#### Step 3 — 核实官网真源

必须能公开引用，至少两项：

| 字段 | 说明 |
|------|------|
| `docUrl` | 官方模型说明页（首选） |
| `pricingUrl` | 价目汇总页（模型页无价目时，见 `data/pricing-urls.mjs`） |

价目核对来源优先级：

1. 官网模型页 / pricing 页 live 解析（`fetch-pricing.mjs`）
2. 人工对照官网写入 `data/seeds/{modality}.mjs`
3. 更新 `TEXT_SEED_VERIFIED_AT`（生文）或 seed 内 `note` 注明核实日期

#### Step 4 — 改三处数据

**生文（text）**

| 文件 | 内容 |
|------|------|
| `data/catalog/text.mjs` | `CatalogEntry`：`vendor`, `vendorModelId`, `docUrl`, `status`, … |
| `data/seeds/text.mjs` | `{ input, output, cache?, note? }`（USD / 百万 tokens） |
| `trinity-map.json` | `"<trinity-id>": { "vendor", "vendorModelId" }` |

**生图（image）**

| 文件 | 种子格式 |
|------|----------|
| `data/catalog/image.mjs` | 同上结构 |
| `data/seeds/image.mjs` | `tiers: [{ tierLabel, price, unit }]`（如 `元/张`） |

**生视频（video）**

| 文件 | 种子格式 |
|------|----------|
| `data/catalog/video.mjs` | 厂商：`tencent_hunyuan` / `kling` / `vidu` / `tencent_youtu` |
| `data/seeds/video.mjs` | 多档 `tiers`（分辨率 / 时长 → `积分/次`） |

详细字段模板见计划中的 `add-model.md`（Skill 附属文件）。

#### Step 5 — 抓取验证

```bash
cd trinity-AI
npm run pricing:supplier:official:text -- <vendorModelId>
npm run pricing:supplier:official:image -- hy-image-v3.0
npm run pricing:supplier:official:video -- kl-video-v3
```

检查 `output/{modality}/vendor-pricing.json`：

- `fetchStatus`: `ok` | `seed` | `parse_failed` | `fetch_failed`
- `tiers` 是否与官网一致
- `priceSource` 是否指向正确 URL

#### Step 6 — 人读表

`gen-table.mjs` 随 fetch 自动执行，产出：

`suppliers/official/output/{modality}/vendor-pricing-table.md`

向用户汇报：模态、厂商、档位、价、抓取状态、文档链接。

#### Step 7 — （可选）三方对比

依赖 Layer C pipeline 扩展（见第 5 节）。对比前确保：

```bash
npm run pricing:fetch -- --modality=text    # 或 image / video
npm run pricing:supplier:tokenhub:console   # 按需
npm run pricing:supplier:official:{modality}
npm run pricing:compare:official -- <trinity-model-id>   # 待实现
```

---

## 5. Pipeline 扩展：三方对比

### 5.1 目标产出

按模态生成对照表，例如 `output/official-vs-upstream-text.md`：

| Trinity ID | 官方价 | TokenHub | 百炼 | AIGC | 线上刊例 | 备注 |
|------------|--------|----------|------|------|----------|------|
| `gpt-5.5` | $5 / $30 | ¥… | ¥… | $… | $… | 主档 input/output |

生图/生视频列单位不同（张、积分·次），**按模态分文件**，不强行合并到生文 Excel。

### 5.2 建议命令

```bash
# 单模型
npm run pricing:compare:official -- gpt-5.5

# 整模态
npm run pricing:compare:official -- --modality=video

# 全模态
npm run pricing:compare:official -- --modality=all
```

实现位置建议：`pricing/pipeline/compare-official-pricing.mjs`

### 5.3 读取真源

| 数据 | 路径 |
|------|------|
| 官方价 | `suppliers/official/output/{modality}/vendor-pricing.json` |
| TokenHub | `suppliers/tokenhub/output/pricing-console-api.json` |
| 百炼 | `suppliers/bailian/output/pricing-api.json` |
| AIGC | `suppliers/aigc/output/pricing-api.json` |
| 线上 | `output/prices-api.json`（支持 `modality`） |
| 映射 | `official/trinity-map.json` + 各上游 `trinity-map.json` |

join 键：Trinity `modelId` → `vendorModelId` / 上游 modelId。

### 5.4 与现有命令关系

| 现有命令 | 对比对象 | 与本设计关系 |
|----------|----------|--------------|
| `pricing:validate` | 线上 vs 三上游（抽样） | 保留；不含官方价 |
| `pricing:upstream` | 汇总三上游 + 刊例 | 可后续增加 optional 官方列 |
| `pricing:diff:065` | 线上 vs 0.65 草案 | 独立用途，不替代官方对比 |
| **`pricing:compare:official`**（新） | 官方 + 上游 + 线上 | 满足目标 2 |

---

## 6. 模态与表格约定

### 6.0 上线真源：官方阶梯价（已实现）

**`suppliers/official/output/{modality}/vendor-pricing.json` 中的 `models[].tiers[]` 为拟上线对照的官方真源。**

- 生文：每档 `tierLabel` + `input` / `output` / `cache` + `currency`（USD 国际 / CNY 国内）
- 生图/生视频：每档 `tierLabel` + `price` + `unit`
- 单档模型也占 1 档（`tierLabel: "标准价"`）
- 国内模型入库时 **必须按官网写全档**，不可只留一个扁平价

### 6.1 官方价表（已有）

| 模态 | 表头要点 | 真源 |
|------|----------|------|
| text | 输入价 / 输出价 / 缓存价（USD/M） | `output/text/vendor-pricing-table.md` |
| image | 档位 / 价格 / 单位（元/张） | `output/image/...` |
| video | 档位 / 价格 / 单位（积分/次） | `output/video/...` |

### 6.2 对比表（待建）

每种模态单独一份 Markdown；**不**把生视频积分价与生文 token 价混在同一表头。

可选后续：在 `trinity-pricing.xlsx` 增加 **Official-Text** / **Official-Image** / **Official-Video** Sheet（优先级低于 Markdown 对照）。

---

## 7. `trinity-map.json` 演进

当前仅覆盖部分生文国际模型。建议：

```json
{
  "_comment": "Trinity modelId → official vendor",
  "gpt-5.5": { "modality": "text", "vendor": "openai", "vendorModelId": "gpt-5.5" },
  "hy-image-v3.0": { "modality": "image", "vendor": "tencent_hunyuan", "vendorModelId": "hy-image-v3.0" },
  "kl-video-v3": { "modality": "video", "vendor": "kling", "vendorModelId": "kl-video-v3" }
}
```

或按模态拆文件：`trinity-map.text.json` / `.image.json` / `.video.json`（与 catalog 对称）。

Skill 维护规则：**每新增 catalog 条目且 Trinity 已上架，必须同步 map**。

---

## 8. 是否需要「工作流」？

| 类型 | 是否需要 | 说明 |
|------|----------|------|
| **Skill 内 checklist** | ✅ 需要 | 解决「补充 xxx」可重复、不漏步骤 |
| **npm scripts** | ✅ 已有 | fetch / gen-table / upstream 等 |
| **Cursor Hooks / CI** | ❌ 暂不需要 | 价目人工触发，非每次 commit 全量爬 |
| **独立 Web 工作流** | ❌ 不需要 | 过重 |

**工作流** = Skill 步骤清单 + 少量 pipeline 命令，不另建 Hook 系统。

---

## 9. 落地顺序

| 阶段 | 内容 | 预估 | 产出 |
|------|------|------|------|
| **P0** | 编写 Skill（`SKILL.md` + workflows） | ✅ | `.cursor/skills/trinity-official-pricing/` |
| **P1** | `pricing:compare:official` pipeline | ✅ | `output/official-vs-upstream-*.md` |
| **P2** | 扩展 `trinity-map`（含 image/video） | ✅ | `modality` 字段 + 15 条媒体映射 |
| **P3** | 脚手架 `scaffold-official-model.mjs` | ✅ | 输出 catalog/seed/map 片段 |
| **P4** | `upstream` 可选接入官方列 / Excel Sheet | 低优 | 待做 |

---

## 10. 结论

| 问题 | 结论 |
|------|------|
| 现有 `official/` 方案能否满足？ | **目标 1、3 基本满足；目标 2 需 pipeline 小扩展；目标 4 需 Skill** |
| 改造为 Skill 是否方便？ | **方便**——数据层已按模态拆分，Skill 只做编排与模板 |
| 是否需要独立工作流系统？ | **不需要**——Skill checklist + npm 命令即可 |

**推荐路径**：先落 Skill（立刻改善「补充 xxx 官方价」体验），再实现 `pricing:compare:official`（完成三方对比闭环）。

---

## 11. 文档索引

| 文档 | 说明 |
|------|------|
| [STRUCTURE.md](../STRUCTURE.md) | `pricing/` 完整目录树 |
| [suppliers/official/README.md](../suppliers/official/README.md) | 原厂价目命令与维护 |
| [suppliers/SOURCES.md](../suppliers/SOURCES.md) | 各供应商 JSON 真源 |
| [README.md](../README.md) | 价目六步流程 |
| 本文 | Skill + 对比层设计稿 |
