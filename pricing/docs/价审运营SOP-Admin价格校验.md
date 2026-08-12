# 价审运营 SOP · Admin「价格校验」（2026-08-11）

> **读者**：产品 / 运营（日常执行）  
> **入口**：运营后台 → **模型刊例和定价** → **价格校验**（`/pricing/review`）  
> **关联**：系统设计 [SUPPLY-PRICING-OPS-DESIGN.md](./SUPPLY-PRICING-OPS-DESIGN.md) · 研发缺口 [模型供应与定价运营-研发需求清单.md](./模型供应与定价运营-研发需求清单.md) §8.1 · 刊例 [刊例策略-V1-V2-国际站优先.md](./刊例策略-V1-V2-国际站优先.md)  
> **不替代**：CLI 周巡检（手册 [日常操作](../../apps/trinity-product/docs/ai-api-platform/pricing-sources/operations.md)）——巡检发现偏差；本 SOP 管 **确认写回线上刊例**。

---

## 0. 一句话

```text
点「触发价审」出确认单 → 人审 diff →「确认写价」才改 /v1/prices。
不确认 = 不改价。写回默认只上浮；降价须白名单或 force+原因。
```

**运营四场景总机**（跟刊例 / 上游调线 / 上新 / 商务表；巡检并入跟刊例）：Skill [`ops-scenario-router.md`](../../.cursor/skills/trinity-official-pricing/workflows/ops-scenario-router.md) · 完整综述 [`定价系统-Agent架构与SOP-WorkSession.md`](./定价系统-Agent架构与SOP-WorkSession.md)。

---

## 1. 现网能力（已提交 Admin + Backend · 对齐用）

| 步骤 | 状态 | 说明 |
|------|------|------|
| 建价审任务 | ✅ | `POST /v1/admin/pricing/reviews`（可按模态拆多单） |
| 出包 | ✅ 过渡形态 | 配置 **各模态出包 URL**（`reviewPackageUrl*`）：后台 **优先 POST**（body 带 `taskId`/`taskCode`/`runId`/`modality`…），失败再 **GET**；同步返回价审包 → `ready`；仅 ACK → 等外部回传 |
| 外部回传挂原任务 | ✅ | `POST /internal/pricing/ops/review-tasks`（Ops Token）：带 `taskId`/`taskCode` + `packageJson` → 挂回**同一任务**，不另开无关单 |
| 手传 JSON | ✅ | `POST …/reviews/from-upload`（兜底） |
| 确认写价 | ✅ | `POST …/reviews/{id}/confirm`；仅 `ready` 可确认 |
| 写回闸 L-01 | ✅ | 默认 **只上浮不降**；白名单或 `force`+原因可例外；confirm **禁止**带 cost |
| 复原 | ✅ | `POST …/review/apply-batches/{id}/restore` |
| 价格校验字段 / 上架门禁 | ✅/视环境 | 确认后模型 `priceValidation=checked`；未校验不可上架（以现网配置为准） |

**尚未齐（方案 C 余量）**

| 项 | 说明 |
|----|------|
| 独立「价审 Webhook」字段 | 现用 **出包 URL** 兼 POST；未另建 `reviewGenerateWebhookUrl`（不必强行补字段，契约对齐即可） |
| Worker 真 CLI 出完整 diff 包 | ✅ 已通（`fetch→listing:v1v2→gen-listing-v2→diff:listing-v2→emit`，约数秒～十几秒；官方/供应商真源仍用仓内缓存，非每次重爬官网） |  
| Admin 出包 URL → Worker | ⚠️ 填 `http://<worker>:8787/v1/pricing-review/trigger`（同步回包；见 `pricing/worker/DEPLOY.md`） |  
| **C-01 价目预览始终有 Excel** | ⚠️ Worker 已异步出表+尝试 PUT；**Backend catalog/excel 存储 API 仍缺** → 正式页需先补后端 |  

---

## 2. 日常怎么跑（运营）

### 2.1 前置配置（运维 / 产品一次性）

1. 打开价格校验页 → **出包与抓价配置**。  
2. 填各模态 **出包 URL**（或模板含 `{modality}`）：  
   - **过渡 A**：静态/CDN JSON（GET）——适合已生成好的包。  
   - **过渡 B**：Worker / 出包服务 URL——须能接受 **POST**（带 task 身份）或至少 GET。  
3. 若走异步 Worker：确保 Worker 回传时用 **internal** 挂包（见 §1），且 Admin → Worker 网络可达。

### 2.2 触发 → 审单 → 写价

1. 选 **模态**（生文 / 图 / 视频 / 全部）与 **场景**（官方锚跟刊例 / 上新跟价 / 自定义）。  
   旧名「官方上游变价」「巡检跟进」已并入「官方锚跟刊例」（只看不写＝不点确认）。  
2. 点 **触发价审**。  
3. 任务列表出现后：  
   - 有确认单（`ready`）→ 打开审 **拟写回 / 维持 / 例外**。  
   - 仍排队 / 失败 → 看 `errorMessage`；可再触发或改走 **上传 JSON**。  
4. 核对写回闸：拟降价项默认不应进确认集（除非白名单/force）。  
5. 点 **确认写价** → 抽查 `GET /v1/prices` 与相关模型「价格校验=已校验」。  
6. 误写且批次仍可复原 → 用 **复原**（有资格时）。

### 2.3 明确不做

- ❌ 不确认就指望 Job 改线上刊例  
- ❌ 用转售挂牌当刊例真源（见刊例策略）  
- ❌ 把账单核对与本次跟价混成一步  

---

## 3. 与 CLI 巡检的分工

| 路径 | 谁跑 | 产出 | 是否改线上刊例 |
|------|------|------|----------------|
| `npm run pricing:inspect`（手册日常操作） | 定价 / 产品 | 对比表、告警、Excel | **否**（只告警） |
| 本 SOP · Admin 价格校验 | 运营 / 产品 | 确认单 → 写 L2 | **是**（确认后） |

推荐节奏：周巡检发现偏差 → Admin 触发价审 → 人确认写回。

---

## 4. 给研发 / Worker 的现网契约摘要

**Admin → 出包 URL（POST 优先）body 示例**

```json
{
  "taskId": 123,
  "taskCode": "pr-…",
  "runId": "…",
  "modality": "text",
  "scenario": "官方锚跟刊例",
  "batchId": null,
  "note": "…",
  "modelIds": null
}
```

**外部 → 挂回原任务（推荐）**

`POST /internal/pricing/ops/review-tasks`  
Header: `X-Trinity-Ops-Token: …`

```json
{
  "taskId": 123,
  "taskCode": "pr-…",
  "packageJson": { },
  "note": "worker callback"
}
```

同步若 POST 响应体已是价审包（含 `lines` / `draftPrices` / `buckets` / `writePayload` 之一）→ 任务直接 `ready`，无需再回调。

---

## 5. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-11 | 初版：对齐已提交 Admin/Backend 价审闭环；区分 CLI 巡检与确认写价；标注方案 C 余量 |
