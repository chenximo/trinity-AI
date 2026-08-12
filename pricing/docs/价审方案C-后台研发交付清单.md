# 价审方案 C · 后台还需提供的清单（给研发）

> **日期**：2026-08-10 · **修订**：2026-08-11（对齐已提交 Backend/Admin）  
> **对象**：Admin Backend + Admin 前端（`TrinityAI-web/apps/admin`）  
> **目标**：运营点「触发价审」→ 后台 **POST** 出包端/Worker → 包挂回**同一任务** → 人确认写价。  
> **范围外（本清单不要求后台做）**：定价算法、trinity-AI CLI、Worker 真跑 CLI（由定价/运维侧 `pricing/worker` 负责）。  
> **对照**：总缺口见 [`模型供应与定价运营-研发需求清单.md`](./模型供应与定价运营-研发需求清单.md) §8.1；运营步骤见 [`价审运营SOP-Admin价格校验.md`](./价审运营SOP-Admin价格校验.md)；Worker 见 [`../worker/README.md`](../worker/README.md)。

---

## 0. 一句话（2026-08-11）

**后台主路径已齐**：`reviewPackageUrl*` **优先 POST**（body 含 `taskId`/`taskCode`）→ 同步包或 ACK；挂包走 **`POST /internal/pricing/ops/review-tasks`**；confirm + 只上浮写回闸已有。  
**下一棒在 Worker/运维**：契约对齐现网字段、网络可达、真 CLI 出包——不必再要求新建 `reviewGenerateWebhookUrl`。

---

## 1. P0 状态（打通按钮 → 出包端）

### 1.1～1.4 后台侧 · **已落地（勿按旧稿重做）**

| 原 ID | 现网做法 | 状态 |
|-------|----------|------|
| C-W1 | 使用 `reviewPackageUrlText/Image/Video/Template`，**不**另建 `reviewGenerateWebhookUrl` | ✅ |
| C-W2 | `POST /reviews` 后对解析出的 URL **优先 POST**（`taskId`/`taskCode`/`runId`/`modality`…）；ACK→等回传；价审包 JSON→`ready`；失败写 `errorMessage` + placeholder | ✅ |
| C-W3 | 挂包：`POST /internal/pricing/ops/review-tasks` + `packageJson` + `taskId`/`taskCode`（Ops Token） | ✅ |
| C-W4 | Admin 出包配置 + 触发/上传/确认/复原 | ✅（轮询 UX 可继续打磨） |

**Admin → 出包 URL 的 POST body（真源）**

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

**挂包回原任务（真源）**

```http
POST /internal/pricing/ops/review-tasks
X-Trinity-Ops-Token: …
```

```json
{
  "taskId": 123,
  "taskCode": "pr-…",
  "packageJson": { },
  "note": "worker callback"
}
```

`packageJson` 形状对齐：  
`TrinityAI-web/apps/admin/src/views/admin-pricing/fixtures/price-review-package-065.json`  
（含 draft / diff 分桶 / meta；后续补 L-01 的 V1/V2 字段，后台先存整包即可）。

手传 `from-upload` **保留作兜底**；主路径应挂原任务，避免「触发一张、上传又开一张」。

---

### 1.5 联调依赖（运维 · C-W5）+ Worker 契约（C-W6）· **仍为 P0**

| 项 | 说明 |
|----|------|
| 网络 | Admin **出站**能访问出包 URL/Worker；Worker **出站**能打到 Admin **internal** 挂包 |
| 配置 | 出包 URL = Worker 触发地址（或 Nginx 反代） |
| 健康检查 | `GET …/healthz` → `{ ok: true }`（若用 `pricing/worker`） |
| **C-W6** | Worker 须认 `taskId`/`taskCode`（可与 `reviewId` 兼容）；回调改 internal，或 **同步响应价审包**；勿默认 JWT `PUT …/reviews/{id}/package`（现网无此 Admin 路由） |

后台联调可用 dry-run Worker 验收「按钮 → ready」，不依赖真 CLI。

---

## 2. P0 写价侧（字段对齐）

| ID | 事项 | 状态 |
|----|------|------|
| C-R1 | `POST …/reviews/{id}/confirm` + 写回闸只上浮 | ✅ 代码已有；与真包联调验收 |
| C-R2 | M-01 价格校验 / 上架门禁 | ✅/视环境 |
| C-R3 | 失败/重试 UX | ⚠️ 可继续打磨 |

---

## 3. 明确「后台本迭代不做 / 已过时要求」

| 项 | 谁做 / 说明 |
|----|-------------|
| ~~新建 `reviewGenerateWebhookUrl`~~ | **不做**；用 `reviewPackageUrl*` |
| ~~Admin JWT `PUT …/reviews/{id}/package`~~ | **现网用 internal**；非必须再造 JWT 路由 |
| Worker 进程、systemd、关 dry-run | 运维 / 定价 |
| `pricing:listing:v1v2` / `emit-review-package` | 定价仓 CLI |
| Cursor Skill 当 HTTP 服务 | **禁止** |
| 静默改线上刊例 | **禁止** |

---

## 4. 验收剧本（提测用）

1. 出包配置填 **Worker/出包 URL**（手传可留空）。  
2. 触发「生文」价审 → 后台日志可见对出包 URL 的 POST。  
3. 同步包或 internal 回调 → 同一 `taskId` 变为 `ready`。  
4. 不点确认 → 线上刊例不变。  
5. 关掉出包端或填错 URL → 错误可读，可重试。  
6. （有真包后）确认写价 → 刊例变 + 价格校验已校验。

---

## 5. 接口速查（2026-08-11）

| 优先级 | 接口 / 配置 | 状态 |
|--------|-------------|------|
| 已有 | `ops-settings` · `reviewPackageUrl*` | ✅ POST 优先出包 |
| 已有 | `POST /v1/admin/pricing/reviews` | ✅ 建任务并投递 |
| 已有 | `POST /internal/pricing/ops/review-tasks` | ✅ 挂包 / 建占位 |
| 已有 | `GET …/reviews`、`GET …/reviews/{id}` | ✅ |
| 已有 | `POST …/reviews/{id}/confirm` | ✅ |
| 已有 | `POST …/reviews/from-upload` | ✅ 手传兜底 |
| P0 余量 | Worker 认 `taskId` + internal 回调 | C-W6 |
| P0 余量 | 真 CLI 出包 | C-P* |

---

## 6. 参考代码 / 文档

| 说明 | 路径 |
|------|------|
| 运营 SOP | [`价审运营SOP-Admin价格校验.md`](./价审运营SOP-Admin价格校验.md) |
| 现 ops-settings 类型 | `TrinityAI-web/apps/admin/src/api/pricingOpsApi.ts` |
| 价审 API | `…/api/pricingReviewApi.ts` |
| 价格校验页 | `…/views/admin-pricing/PricingPage.vue` |
| 价审包 fixture | `…/fixtures/price-review-package-065.json` |
| Backend `PriceReviewService` | `TrinityAI-backend` · `pricereview/PriceReviewService.java` |
| Worker | `trinity-AI/pricing/worker/README.md` |
| 产品缺口总表 | `trinity-AI/pricing/docs/模型供应与定价运营-研发需求清单.md` §8.1 |

---

## 7. 建议排期（修订）

| 顺序 | 交付 | 说明 |
|------|------|------|
| 已完成 | 后台触发 / POST 出包 / 挂原任务 / confirm / 闸 | 见 §1 |
| Next | C-W5 网络 + C-W6 Worker 契约 | dry-run 即可验按钮→ready |
| 随后 | C-P* 真包 + 确认写价联调 | — |
| **P1 · C-01** | **`PUT/GET /v1/admin/pricing/catalog/excel`** | 价目预览始终有文件；Worker 已异步出表并尝试 PUT（`source=worker-post-review`）；缺此 API 时正式预览仍只能本机缓存。**接口契约**：[`C-01-Backend-刊例Excel存储API-研发交付.md`](./C-01-Backend-刊例Excel存储API-研发交付.md) |
