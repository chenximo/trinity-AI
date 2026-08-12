# C-01 · Backend 刊例 Excel 存储 API · 研发交付

> **给研发请只看**：[`给研发-Backend交付-2026-08-12.md`](./给研发-Backend交付-2026-08-12.md)（已并入 §P1）  
> 下文为产品/internal 展开备查。

> **日期**：2026-08-12  
> **优先级**：P1（价目预览「始终有文件」）  
> **读者**：Backend 工程师（`TrinityAI-backend`）  
> **状态**：**未实现** — Admin 前端与定价 Worker 已按契约接入，等 Backend 补存储与路由。  
> **关联**：总需求 [`模型供应与定价运营-研发需求清单.md`](./模型供应与定价运营-研发需求清单.md) §C-01 · 价审 SOP [`价审运营SOP-Admin价格校验.md`](./价审运营SOP-Admin价格校验.md) · Worker [`../worker/src/catalogSync.ts`](../worker/src/catalogSync.ts)

---

## 0. 一句话

**价目预览页**需要把 `trinity-pricing-{text|image|video}.xlsx` **存到后台**，供所有人列表 / 预览 / 下载。  
Admin 前端 **已经调这些 URL**；定价 Worker 价审成功后也会 **异步 PUT** 同一接口。  
Backend 目前 **没有** 对应 Controller / 存储，导致正式环境上传失败，页面只能退回浏览器本机缓存。

---

## 1. 背景（产品口径）

| 概念 | 说明 |
|------|------|
| **价目预览** | Admin `/pricing/catalog`，上半「刊例 Excel」 |
| **价格校验** | Admin `/pricing/review`，出确认单 → 人确认才写 `/v1/prices` |
| **方案 C（已定）** | 价审 **先** 出确认单（不堵）；**成功后异步** 跑 `pricing:upstream*` 生成总册 → **PUT 本 API**；Excel 失败 **不推翻** 价审 `ready` |

两条线 **解耦**：价审 JSON ≠ 价目预览 Excel；Excel 由 C-01 单独登记。

---

## 2. 现状

| 侧 | 状态 |
|----|------|
| Admin 前端 | ✅ 已接 `pricingOpsApi.ts`（上传 / 列表 / 下载） |
| 定价 Worker | ✅ 价审交付后异步 `PUT …/catalog/excel`（`source=worker-post-review`） |
| **Backend** | ❌ 无 `catalog/excel` 相关实现（仓库内未检索到路由 / 实体） |

前端行为（Backend 未齐时）：

- 上传：提示「后端登记失败，仅本机预览」
- 列表：`hydrateCatalogFromRemote` 失败则静默忽略
- 下载：先试本机 blob，再试后端 download

---

## 3. 需要实现的 API（与前端契约对齐）

**Base path**（与现网 Admin 其它 pricing 接口一致）：

```text
/v1/admin/pricing/catalog/excel
```

**鉴权**：与其它 Admin 接口相同 — **Admin JWT**（`Authorization: Bearer …`）。  
Worker 侧使用长期 `ADMIN_API_TOKEN`（同一 JWT 形态）。**不要**仅用 `X-Trinity-Ops-Token`（那是 internal 价审挂包用的）。

### 3.1 上传 / 覆盖登记 · `PUT`

登记某模态 **当前最新** 一份 xlsx（同 modality **覆盖**，不保留无限历史即可；历史版本 P2 可选）。

```http
PUT /v1/admin/pricing/catalog/excel
Authorization: Bearer <admin-jwt>
Content-Type: multipart/form-data
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `modality` | string | 是 | `text` \| `image` \| `video` |
| `file` | file | 是 | `.xlsx` |
| `source` | string | 否 | 来源标记，见下表 |

**`source` 常见值**

| 值 | 调用方 |
|----|--------|
| `manual` | Admin 价目预览页手传 |
| `worker-post-review` | 价审 Worker 异步同步 |
| `cli` | 本地/CI 脚本（可选） |

**响应 200** — JSON，形状对齐前端 `PricingBinaryArtifactMeta`：

```json
{
  "id": 1,
  "kind": "catalog-excel",
  "modality": "text",
  "fileName": "trinity-pricing-text.xlsx",
  "sizeBytes": 123456,
  "source": "worker-post-review",
  "label": null,
  "meta": null,
  "createdAt": "2026-08-12T06:00:00Z"
}
```

**错误**

| 状态 | 场景 |
|------|------|
| 400 | 缺 modality / 非 xlsx / modality 非法 |
| 401/403 | 未登录或无 Admin 定价权限 |
| 413 | 文件过大（建议上限 ≥ 50MB，与 nginx 对齐） |

### 3.2 列表 · `GET`

```http
GET /v1/admin/pricing/catalog/excel
Authorization: Bearer <admin-jwt>
```

**响应 200** — 数组，**每个 modality 至多一条「当前最新」**（或全量当前指针；前端按 `modality` 匹配）：

```json
[
  {
    "id": 1,
    "kind": "catalog-excel",
    "modality": "text",
    "fileName": "trinity-pricing-text.xlsx",
    "sizeBytes": 123456,
    "source": "worker-post-review",
    "createdAt": "2026-08-12T06:00:00Z"
  }
]
```

无登记时返回 `[]`（不要 404）。

> 需求清单曾写 `GET …/meta` 单独路径；**现网前端用的是同路径 GET 列表**，实现 **以此为准**。若后续要 meta 别名，可做兼容转发。

### 3.3 下载 · `GET`

```http
GET /v1/admin/pricing/catalog/excel/{modality}/download
Authorization: Bearer <admin-jwt>
```

**响应 200**

- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="trinity-pricing-text.xlsx"`
- Body：二进制 xlsx

**404**：该 modality 尚无登记。

---

## 4. 前端 / Worker 代码位置（对接时对照）

| 说明 | 路径 |
|------|------|
| Admin API 封装 | `TrinityAI-web/apps/admin/src/api/pricingOpsApi.ts` |
| 价目预览页 | `TrinityAI-web/apps/admin/src/views/admin-pricing/PricingPage.vue` |
| 类型 `PricingBinaryArtifactMeta` | 同上 `pricingOpsApi.ts` |
| Worker 异步上传 | `trinity-AI/pricing/worker/src/catalogSync.ts` |
| 生成 xlsx 命令 | 根仓 `npm run pricing:upstream` / `pricing:upstream:image` / `pricing:upstream:video` |
| 产物路径 | `trinity-AI/pricing/output/trinity-pricing-{modality}.xlsx` |

Worker PUT 示例（字段与 Admin 手传一致）：

```javascript
FormData: modality=text, source=worker-post-review, file=<xlsx>
PUT {ADMIN_API_BASE}/v1/admin/pricing/catalog/excel
Authorization: Bearer {ADMIN_API_TOKEN}
```

---

## 5. 实现建议（Backend 可自由选型，满足契约即可）

### 5.1 存储

- 二进制：对象存储（COS/S3）或本地挂载目录 + DB 元数据
- DB 表（示意）：`pricing_binary_artifact` 或复用商务产物表加 `kind=catalog-excel`
  - `id`, `kind`, `modality`, `file_name`, `size_bytes`, `source`, `storage_key`, `created_at`, `updated_at`
- **同 modality 唯一「当前版」**：PUT 时 upsert；旧 blob 可删或归档（P1 删即可）

### 5.2 与商务产物 API 的关系

Admin 已有 **`/v1/admin/pricing/commercial/artifacts`**（l3a/l3b/snapshot），形状同为 `PricingBinaryArtifactMeta`。  
**推荐**：同一套 BinaryArtifact 抽象 + `kind` 区分，减少两套上传逻辑。  
若商务 API 也未落地，可 **一并实现** 共用 Service。

### 5.3 权限

- 与「模型刊例和定价」菜单权限一致
- Worker 使用 **服务账号 JWT** 或长期 token（运维签发，勿提交仓库）

---

## 6. 验收标准（Backend 自测 + 联调）

1. **手传**：Admin 价目预览上传 `trinity-pricing-text.xlsx` → GET 列表可见 → download 可下且能打开。  
2. **覆盖**：同 modality 再传 → 列表仍 1 条，文件名/大小/时间更新。  
3. **Worker 路径**（产品侧联调）：触发一次生文价审 → 数分钟内 GET 列表出现 `source=worker-post-review` 的 text 行（需 Worker 配 `ADMIN_API_BASE` + `ADMIN_API_TOKEN`）。  
4. **隔离**：image/video modality 互不覆盖。  
5. **失败不挡价审**：即使 PUT 失败，价审任务仍为 `ready`（Worker 已保证；Backend 无需参与价审状态机）。

---

## 7. 产品 / 运维侧（Backend 合并后做）

| 步骤 | 负责 | 说明 |
|------|------|------|
| 合并 Backend PR | 研发 | 部署到与 Admin 同环境 |
| 同步 Worker | 运维/产品 | 含 `catalogSync.ts` 的版本 |
| 配置 Worker | 运维 | `ADMIN_API_BASE`、`ADMIN_API_TOKEN` |
| 联调 | 产品 | 触发价审 → 价目预览有文件 |
| 临时手传 | 运营 | Backend 未上前仍可本机上传预览 |

---

## 8. 明确不做（P1 范围外）

- ❌ 在 Backend 里跑 `pricing:upstream`（生成仍在 Worker/CLI）
- ❌ 价审确认单 JSON 与 Excel 合并为一个接口
- ❌ 上游厂商链接 CRUD（见 C-02，走仓库配置）
- ❌ Excel 内容解析 / 预览渲染在后端（预览仍前端 SheetJS）

---

## 9. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-12 | 初稿：Backend 缺口说明 + 与 Admin/Worker 契约对齐，供后台工程师直接开发 |
