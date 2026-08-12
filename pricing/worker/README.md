# 价审出包 Worker（R-02）

> **Node.js + TypeScript** 小服务：Admin「触发价审」→ POST 本服务 → 跑 `trinity-AI` 的 `npm run pricing:…` → 回写价审包 JSON。  
> **不**改写定价算法；**不**直接写线上刊例（写价仍走后台「确认」）。  
> **运营 SOP**：[../docs/价审运营SOP-Admin价格校验.md](../docs/价审运营SOP-Admin价格校验.md)  
> **契约对齐（2026-08-11）**：Admin 现网对「出包 URL」**优先 POST**，body 用 `taskId`/`taskCode`（不是单独的 `reviewGenerateWebhookUrl`）。挂包优先走 **`POST /internal/pricing/ops/review-tasks`**。

## 本地启动

```bash
cd pricing/worker
cp .env.example .env   # 先保持 PRICING_WORKER_DRY_RUN=1
npm install
npm run dev
# GET http://127.0.0.1:8787/healthz
```

根仓也可：`npm run pricing:worker`（需先在 `pricing/worker` 装过依赖）。

## 与现网 Admin 怎么接（推荐）

1. Admin「出包配置」把某模态 **出包 URL** 设为：  
   `http://<worker-host>:8787/v1/pricing-review/trigger`  
   （或反代地址；须能接受 **POST JSON**）
2. 运营点「触发价审」→ Admin 对本 URL **POST**：

```json
{
  "taskId": 123,
  "taskCode": "pr-…",
  "runId": "…",
  "modality": "text",
  "scenario": "巡检跟进",
  "batchId": null,
  "note": "…",
  "modelIds": null
}
```

3. Worker 两种回包方式（二选一即可）：  
   - **同步**：HTTP 200 直接返回价审包 JSON（含 `lines` / `draftPrices` / `buckets` / `writePayload` 之一）→ Admin 立刻 `ready`  
   - **异步**：先回 `{ "accepted": true }`（或 `status: accepted|queued|ok`）→ 跑完后 **挂原任务**：

```http
POST https://<admin-api>/internal/pricing/ops/review-tasks
X-Trinity-Ops-Token: <ops token>
Content-Type: application/json
```

```json
{
  "taskId": 123,
  "taskCode": "pr-…",
  "packageJson": { },
  "note": "worker callback"
}
```

> **兼容**：旧字段 `reviewId` 可视作 `taskId`。  
> **勿默认** Admin JWT `PUT /v1/admin/pricing/reviews/{id}/package`（现网无此路由）。  
> 无 internal 时兜底：`POST …/reviews/from-upload`（会**新开任务**，仅应急）。

## 触发路由（本服务）

`POST /v1/pricing-review/trigger`  
Header（可选）：`Authorization: Bearer <WORKER_TOKEN>` —— **Admin 现网不带 Bearer**；内网可把 `WORKER_TOKEN` 留空关闭校验，靠安全组。

实现上应同时认：`taskId` | `taskCode` | `reviewId`，以及可选 `callbackUrl`（若仍配置，优先指向 **internal** 挂包 URL 的封装，而非已废弃的 JWT PUT 设想）。

默认 **异步 202**（`?async=0` 可同步等结果）。

## dry-run vs 真跑

| `PRICING_WORKER_DRY_RUN` | 行为 |
|--------------------------|------|
| `1`（默认示例） | 不跑 npm，返回最小价审包，打通按钮→回写 |
| `0` | 按模态跑默认 CLI，再组装包 |

默认 CLI（可用 `PRICING_WORKER_STEPS_*` 覆盖）：

| 模态 | 默认步骤 |
|------|----------|
| text | `pricing:fetch` → `pricing:listing:v1v2` → `pricing:gen-listing-v2` → `pricing:diff:listing-v2` → `pricing:emit-review-package` |
| image / video | 空（暂未接；可用环境变量自行配置） |

例：`PRICING_WORKER_STEPS_TEXT=pricing:review-text`（根仓等价串联脚本）。

> 口径：V1=线上刊例；V2=`listing-v2_prices-api.json`（国际站优先）；对比=V2 vs V1。`0.65_*` 归档保留，默认不进 SOP。

## C-01 价目预览 Excel（方案 C）

价审确认单 **交付成功后**，Worker **异步**（不挡 `ready`）：

1. 按模态跑 `pricing:upstream` / `pricing:upstream:image` / `pricing:upstream:video`
2. 若配置了 `PACKAGE_OUT_DIR`，复制 `trinity-pricing-{modality}.xlsx` 到该目录（Worker 侧始终有文件）
3. 若配置了 `ADMIN_API_BASE` + `ADMIN_API_TOKEN`，`PUT /v1/admin/pricing/catalog/excel`（`source=worker-post-review`）

关闭：`PRICING_WORKER_CATALOG_SYNC=0`。  
**注意**：Backend 尚无 catalog/excel 时，上传会告警失败，但不影响价审；正式预览「始终有文件」需先补后端 C-01。  
**研发一包交接**：[`../docs/研发交接-定价价审价目预览-2026-08-12.md`](../docs/研发交接-定价价审价目预览-2026-08-12.md)

## 服务器部署（示意）

```bash
# 机上需 Node 20+，并 clone trinity-AI
cd /opt/trinity-AI && git pull && npm ci
cd pricing/worker && npm ci
# systemd: ExecStart=/usr/bin/npm --prefix /opt/trinity-AI/pricing/worker start
# 环境文件加载 .env；防火墙只放行内网访问 8787
```

## 健康检查

`GET /healthz` → `{ ok, dryRun, trinityAiRoot, inflight }`
