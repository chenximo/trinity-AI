# S-01～S-05 · Backend 商务价格 API · 研发交付

> **给研发请只看**：[`给研发-Backend交付-2026-08-12.md`](./给研发-Backend交付-2026-08-12.md)（已并入 §P2）  
> 下文为产品/internal 展开备查。

> **日期**：2026-08-12  
> **优先级**：P2（排在 C-01 之后）  
> **读者**：Backend 工程师（`TrinityAI-backend`）  
> **状态**：**未实现** — Admin 前端已接部分契约；当前商务页用 localStorage mock。  
> **关联**：需求 [`模型供应与定价运营-研发需求清单.md`](./模型供应与定价运营-研发需求清单.md) §5

---

## 0. 一句话

商务价格页需要：**线路 snapshot → Job 出 L3b/L3a Excel → 矩阵确认 / 归档 → 下载报表**。  
算法在 **trinity-AI Python 脚本**里；Backend **只编排 Job + 存产物**，**不写** `/v1/prices`。

---

## 1. 产品边界（必读）

| 做 | 不做 |
|----|------|
| 拉线路同构 snapshot | 重写 L3b/L3a 算法 |
| 调 Python Job 出 draft xlsx | 自动改线上刊例价 |
| 存 L3b/L3a 产物 + 矩阵快照 | 用量档自动扣费 / 升档计价 |
| Admin JWT 鉴权下载 | 把档位列接到计费引擎 |

**产物真源（我方 CLI 已验）**

| 产物 | 脚本 | 路径 |
|------|------|------|
| L3b 对内总册 | `apps/trinity-product/docs/ai-api-platform/commercial-billing/scripts/rebuild_discount_tier_workbook.py` | `pricing/output/商务洽谈折扣总表.xlsx` |
| L3a 对外报价 | `pricing/scripts/build_outward_quote_standard.py` | `pricing/output/Trinity模型报价表.xlsx` |

---

## 2. 前端已接契约（真源）

`TrinityAI-web/apps/admin/src/api/pricingOpsApi.ts`

### 2.1 已实现类型（Backend 应对齐）

```typescript
type PricingBinaryArtifactMeta = {
  id: number;
  kind: string;
  modality?: string | null;
  fileName: string;
  sizeBytes: number;
  source: string;
  label?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
};

type PricingCommercialGenerateResult = {
  modality: string;
  snapshotArtifactId: number;
  draftMetaArtifactId: number;
  webhookConfigured: boolean;
  webhookAccepted: boolean;
  webhookMessage?: string | null;
  l3bFileNameHint: string;
  l3aFileNameHint: string;
  note: string;
};
```

### 2.2 Admin 已调用的路由

| 方法 | 路径 | 用途 |
|------|------|------|
| POST | `/v1/admin/pricing/commercial/generate` | 触发生成 |
| PUT | `/v1/admin/pricing/commercial/artifacts` | 手传产物（联调/兜底） |
| GET | `/v1/admin/pricing/commercial/artifacts?kind=` | 按 kind 列产物 |
| GET | `/v1/admin/pricing/commercial/artifacts/{id}/download` | 下载 |

**建议**：`commercial/artifacts` 与 C-01 `catalog/excel` **共用** BinaryArtifact 存储层（`kind` 区分）。

---

## 3. S-01 · 线路 snapshot

**替代**：人工导出 `model-supply-routes-*.xlsx`（Sheet=`线路管理`）

```http
GET /v1/admin/pricing/supply-routes/snapshot
Authorization: Bearer <admin-jwt>
```

| Query | 说明 |
|-------|------|
| `modality` | `text` \| `image` \| `video` \| `all` |
| `enabled` | `true` \| `false` \| `all`（默认 `true`） |

**响应**（JSON 示例结构，字段须与导出 Excel 可对账）：

```json
{
  "generatedAt": "2026-08-12T07:00:00Z",
  "modality": "all",
  "rows": [
    {
      "modelId": "gpt-4o",
      "modelName": "GPT-4o",
      "vendor": "openai",
      "routeName": "default",
      "priority": "P0",
      "weight": 100,
      "rpm": 500,
      "tpm": 300000,
      "discount": "7.5折",
      "circuitBreaker": "正常",
      "enabled": true,
      "officialPriceSpec": "input $2.5/M output $10/M",
      "routeCostSpec": "input ¥… output ¥…"
    }
  ]
}
```

**验收**

1. 同筛选下与后台「线路管理」导出 **逐列可对账**  
2. S-02 Job 消费 snapshot，不再读本机 `Downloads/*.xlsx`  
3. 可选：`?format=xlsx` 返回同构 Excel（P2 可后做）

---

## 4. S-02 · 生成 L3b / L3a draft

### 4.1 触发（前端已接）

```http
POST /v1/admin/pricing/commercial/generate
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "modality": "text",
  "matrix": { },
  "note": "optional"
}
```

**服务端流程**

1. 调 S-01 拉 snapshot → 落盘或内存  
2. 写临时工作目录，执行 Python：  
   - L3b：`rebuild_discount_tier_workbook.py`（输入改为 snapshot）  
   - L3a：`build_outward_quote_standard.py`（依赖 L3b 产出）  
3. 产物 PUT 到 `commercial/artifacts`（`kind=l3b-draft` / `l3a-draft`）  
4. 返回 `PricingCommercialGenerateResult`

**`modality`**：`text` | `image` | `video` | `all`（与产品页一致）

**Webhook 模式（可选，对齐价审）**

- `ops-settings.commercialGenerateWebhookUrl` 配置后，可 POST 外部 Worker 执行 Python（与 `upstreamFetchWebhookUrl` 同模式）  
- 未配置时 Backend 内嵌 Job 或同步子进程

### 4.2 Latest 元数据（建议新增，前端后续会接）

```http
GET /v1/admin/pricing/commercial/latest?modality=all
```

```json
{
  "status": "ready",
  "modality": "all",
  "generatedAt": "2026-08-12T07:05:00Z",
  "l3bArtifactId": 101,
  "l3aArtifactId": 102,
  "matrixSnapshot": { },
  "error": null
}
```

`status`: `pending` | `running` | `ready` | `failed`

**验收**

1. 生成后 L3b 为 8 Sheet 总册；L3a 为 `Trinity模型报价表.xlsx`（含 `00_折扣一览` + 文/图/视频）  
2. 与本地 CLI 产物 **Sheet 名与行数级对齐**（允许时间戳差）  
3. **不写** `/v1/prices`；失败不污染 latest 为 ready

---

## 5. S-03 · 公开矩阵确认

**配置真源建议**：`pricing/config/public-ladder-matrix.json`

```http
GET /v1/admin/pricing/commercial/matrix
PUT /v1/admin/pricing/commercial/matrix
POST /v1/admin/pricing/commercial/matrix/confirm
```

| 规则 | 说明 |
|------|------|
| 对外列 | 仅 **$5k / $10k / $50k**（勿外发 $1k/$30k） |
| 折底线 | **5.5**；0.40 族最深 5.5；0.50 族最深 6.0 |
| 达档口径 | 累积消耗（目录价计） |

**`POST …/matrix/confirm`**：将 draft 矩阵写入 **生效配置**；之后 S-02 生成须读生效版。  
每次 L3a draft 应 **钉住** 本次矩阵快照（写入 artifact `meta`）。

---

## 6. S-04 · 人工归档

```http
POST /v1/admin/pricing/commercial/archive
GET  /v1/admin/pricing/commercial/archives
GET  /v1/admin/pricing/commercial/archives/{id}
```

**POST body 示例**

```json
{
  "label": "v1.0",
  "note": "2026-08 例行",
  "fromLatest": true
}
```

**归档包**：L3b + L3a + 矩阵快照（artifact id 引用或打包 zip，二选一；推荐 id 引用）。  
归档 **只读**；新 generate 只覆盖 draft，不覆盖已归档。

---

## 7. S-05 · 产物列表与下载

与 §2.2 已接路由合并实现。

### 7.1 `kind` 约定

| kind | 说明 |
|------|------|
| `l3b-draft` | 最新 L3b draft |
| `l3a-draft` | 最新 L3a draft |
| `l3b-archive` | 归档 L3b |
| `l3a-archive` | 归档 L3a |
| `snapshot-routes` | S-01 快照（可选落库） |

### 7.2 上传（手传兜底）

```http
PUT /v1/admin/pricing/commercial/artifacts
Content-Type: multipart/form-data

kind=l3a-draft
modality=all
label=manual-upload
file=<xlsx>
```

### 7.3 下载

```http
GET /v1/admin/pricing/commercial/artifacts/{id}/download
```

**权限**：L3b 仅对内角色；L3a 可对销售角色开放（与现 Admin RBAC 对齐）。

**明确不是**：`GET /v1/prices`（线上刊例，非商务报表）。

---

## 8. 与 C-01 的关系

| 模块 | API 前缀 | 产物 |
|------|----------|------|
| 价目预览 C-01 | `/catalog/excel` | `trinity-pricing-{modality}.xlsx` |
| 商务 S-05 | `/commercial/artifacts` | L3b / L3a |

共用 **BinaryArtifact** 表 + 对象存储；`kind` + `modality` 区分。

---

## 9. 验收清单（研发自测 + 我方复验）

- [ ] S-01 snapshot 与线路管理导出可对账  
- [ ] S-02 generate → latest=ready；L3a 文件名含 `Trinity模型报价表`  
- [ ] S-03 改矩阵 → confirm → 再 generate 使用新矩阵  
- [ ] S-04 归档后 draft 再生成不覆盖归档  
- [ ] S-05 Admin 页下载打开 xlsx 正常（替换 localStorage mock）  
- [ ] 全程未调用 `/v1/prices` PUT

---

## 10. 我方现状（给研发参考）

| 项 | 状态 |
|----|------|
| CLI L3b/L3a | ✅ 2026-08-12 本地重跑通过 |
| Admin `/pricing/commercial` | ⏳ mock，等 S-* API |
| Worker 商务 Webhook | 可选；`commercialGenerateWebhookUrl` 字段已在 ops-settings |

---

## 11. 修订

| 日期 | 说明 |
|------|------|
| 2026-08-12 | 初稿：对齐 pricingOpsApi + 需求清单 §5 |
