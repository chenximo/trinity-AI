# 定价运营 · 四件事与 AI 派活

> **文档类型**：运营执行摘要 + 给 Cursor 的派活话术（**不是 Skill**）  
> **日期**：2026-08-27  
> **读者**：产品 / 定价运营 · Cursor  
> **不替代**：巡检命令 [`operations.md`](../../apps/trinity-product/docs/ai-api-platform/pricing-sources/operations.md) · 价审 SOP [`价审运营SOP-Admin价格校验.md`](./价审运营SOP-Admin价格校验.md) · 商务主路径 [`商务价格-本地生成与Cursor人审上传.md`](./商务价格-本地生成与Cursor人审上传.md)

---

## 0. 一句话

四件事都能做：**校验 → 刊例 Excel 进后台 → CLI 巡检钉钉 → 商务表人审后进后台**。  
**上架改手动**；**不要点「确认写价」**（批量写 `/v1/prices` 未在正式环境验过，两槽回退未落地）。改扣费价走模型刊例页手改，再重跑校验。

```text
CLI 巡检（拉最新 /v1/prices）→ 出 trinity-pricing-*.xlsx + 告警
        ├─ 钉钉：pricing:alert（不绑 Admin「触发价审」按钮）
        ├─ 刊例 Excel：人确认后 PUT catalog/excel（价目预览仓库）
        └─ 商务表：本地出 L3a/L3b → 人审 → PUT commercial/artifacts
都不自动上架，都不静默改线上刊例。
```

---

## 1. 硬规则（派活前先读）

| 做 | 不要 |
|----|------|
| `GET /v1/prices` 拉最新再下结论，汇报带 `fetchedAt` | 用过期 `prices-api-*.json` 当「当前线上」 |
| 改价：模型刊例页**手改** → 再 `inspect` | 点 Admin **确认写价**（除非产品当场明确「正式验写价」） |
| 新 SKU：**人手上架** | 校验通过就当已上架；P6b 缺口会一直亮 |
| 上传 Excel 前等人说「可以上传」 | 自己改 seed / annotations / trinity-map |
| 商务上传 **≠** 写 `/v1/prices` | 把商务表当刊例写回 |

封发 Skill：`trinity-official-pricing`。改种子须走 `confirmation.md`。

---

## 2. 四件事 · 能不能做

| # | 事 | 能不能做 | 怎么做 | 现状（2026-08-26） |
|---|----|----------|--------|-------------------|
| **1** | 价格校验 | **能跑** | `npm run pricing:inspect:{text,image,video}` | 管道通；**未全绿**（见 §5） |
| **2** | 刊例 Excel 上传后台 | **能传** | 价目预览手传，或人确认后 Agent `PUT …/catalog/excel` | Backend 已有路由；**不改线上价** |
| **3** | 触发校验 + 钉钉 | **能**（CLI） | inspect 末步 `pricing:alert` | 今天已推过；Admin「触发价审」**不自动钉钉** |
| **4** | 商务报价出表 → 确认后上传 | **能** | 本地 Python 出表 → 人审 → `PUT …/commercial/artifacts` | 主路径已定；Admin 一键出真表后置 |

Admin「价格校验 → 触发价审」出的是**确认单**（跟刊例草案），和 CLI 巡检钉钉是两条链。

---

## 3. 四件事怎么走

### 3.1 价格校验

对照官方（L1）/ 进货（L2–L3）/ 线上刊例（L4）。产出对比 Excel 与告警，**不写价**。

```bash
cd trinity-AI
npm run pricing:inspect:image    # 推荐按模态
npm run pricing:inspect:text
npm run pricing:inspect:video
# 周会全量：npm run pricing:inspect
```

| 看什么 | 路径 |
|--------|------|
| 刊例对比 Excel | `pricing/output/trinity-pricing-{text,image,video}.xlsx` |
| 机器对比 | `pricing/output/validate/listing-compare.json` |
| 告警 | `pricing/output/validate/pricing-alerts-{modality}.md` |

铁律：P6 对比表 ⊇ 线上 slug；P6b 刊例 ⊇ 已 map 官网模型/档。exit 1 = 仍有缺口，不是脚本崩了。

### 3.2 刊例 Excel 上传后台

文件：`trinity-pricing-text.xlsx` / `image` / `video`。  
页面：运营后台 → 模型刊例和定价 → **价目预览** → 刊例 Excel。  
API：`PUT /v1/admin/pricing/catalog/excel`（multipart：`modality` + `file` + `source=manual`）。

上传只登记给同事看/下。预览仍可能用本机缓存，列表提示「后端已登记」即可。

### 3.3 触发校验 + 钉钉

钉钉挂在 **CLI 告警**，环境变量 `PRICING_ALERT_WEBHOOK_URL`（可选关键词 `PRICING_ALERT_DINGTALK_KEYWORD`）。

```bash
npm run pricing:inspect:image          # 含 alert，推该模态摘要
npm run pricing:alert -- --modality=video
npm run pricing:alert -- --dry-run     # 只写 md，不推
npm run pricing:alert -- --test-ping   # 测机器人
```

Admin 点「触发价审」= 出确认单，**SOP 不绑钉钉**。不要把「触发价审」理解成「会推钉钉」。

### 3.4 商务报价

真表在本地生成；后台是仓库。细则见 [`商务价格-本地生成与Cursor人审上传.md`](./商务价格-本地生成与Cursor人审上传.md)。

```bash
export TRINITY_ADMIN_API_BASE=https://trinityadm.trinitydesk.ai/api
# TRINITY_ADMIN_TOKEN 或 USER+PASSWORD
python3 pricing/scripts/rebuild_workbook_from_live_api.py
python3 pricing/scripts/build_outward_quote_standard.py
```

| 文件 | 上传 kind | modality |
|------|-----------|----------|
| `商务洽谈折扣总表.xlsx` | `l3b-draft` | `all` |
| `Trinity模型报价表（内部）.xlsx` | `l3a-draft` | `internal` |
| `Trinity模型报价表.xlsx` | `l3a-draft` | `external` |

人审通过并说「可以上传」后：`PUT /v1/admin/pricing/commercial/artifacts`，或商务页「导入」。  
**上传 ≠ 写刊例。** 新模型进 `Trinity模型报价表_hehe.xlsx` 只补缺失行并标黄，不覆盖历史折扣。

---

## 4. 给 AI 的派活（复制即用）

默认封发 **`trinity-official-pricing`**。未说「可以上传 / 确认写价 / 改 seed」时，只跑只读链。

### 4.1 跑校验（可含钉钉）

```text
按 pricing/docs/定价运营-四件事与AI派活.md §3.1，
从 trinity-AI 根目录跑 npm run pricing:inspect:<text|image|video>。
必须 GET /v1/prices，结论带 fetchedAt。
不要点确认写价，不要改 /v1/prices，不要改 seed/annotations。
跑完用 listing-compare 和 pricing-alerts 汇总缺口（P6/P6b/未批注价差）。
钉钉：inspect 自带 alert；只要写 md 不要推网时加 --dry-run 或说「不要推钉钉」。
```

只要钉钉、不重跑全链：

```text
npm run pricing:alert -- --modality=<text|image|video>
不要改价、不要上传 Excel。
```

### 4.2 刊例 Excel 上传后台（须人先点头）

```text
校验已跑完。把 pricing/output/trinity-pricing-{text,image,video}.xlsx
上传到 Admin 价目预览：PUT /v1/admin/pricing/catalog/excel
（multipart：modality=text|image|video，source=manual）。
鉴权用现有 Admin JWT。上传不等于写 /v1/prices。
未说「可以上传刊例 Excel」时不要 PUT。
```

### 4.3 出商务表（先不出上传）

```text
按商务价格-本地生成与Cursor人审上传.md 本地出 L3b + L3a。
跑 rebuild_workbook_from_live_api.py 和 build_outward_quote_standard.py。
不要上传、不要写 /v1/prices。出表后列出文件路径等人审。
```

### 4.4 商务表确认后上传（须人说「可以上传」）

```text
人已审过，可以上传到后台。
PUT /v1/admin/pricing/commercial/artifacts：
- 商务洽谈折扣总表.xlsx → kind=l3b-draft，modality=all
- Trinity模型报价表（内部）.xlsx → kind=l3a-draft，modality=internal
- Trinity模型报价表.xlsx → kind=l3a-draft，modality=external
回报 artifact id。不要写 /v1/prices，不要点确认写价。
```

### 4.5 缺口拍板后（仍不写价）

```text
按我的决定处理 P6b/价差：上架我自己在后台做；例外才改 pricing-annotations；
map 指错才改 trinity-map（先确认再改）。
改完重跑对应模态 inspect。不要确认写价。
```

禁止类（不要派）：

```text
不要：确认写价；静默改 seed；把过期 prices-api 当线上；
商务表和刊例 Excel 混传；没人点头就 PUT。
```

---

## 5. 校验缺口快照（未全绿）

线上：生图 `2026-08-26T07:58Z` · 生视频 `07:59Z` · 生文 `2026-08-27T02:17:06Z`。P6 生图 9/9、生视频 38/38 已过。

| 模态 | 待拍板 |
|------|--------|
| 生图 P6b | `Kling-2.1` / `3.0` / `3.0-omni` / `O1` 官网有、生图刊例无（视频侧已有 omni/o1） |
| 生视频 P6b | 15 个无同 slug：混元 `hy-video-1.5`；可灵 v3/v2.6/v2.5-turbo/v2.1/v1；元潼 2.0/humanactor/fx；即梦 `doubao-seedance-2.0*`、`1.5-pro`、`1.0-pro*`（线上 `seedance-2.0-os` / `*-hc-os` **不是**同一 slug） |
| 生文 | 见确认表：[生文缺口-建议刊例-2026-08-27.md](./生文缺口-建议刊例-2026-08-27.md)（官网 + 建议美元刊例，三位向上进位） |

生图/生视频每条三选一：**人手上架 / 登记例外 / 改 map 指到现有 slug**。生文确认后在刊例页手改建议列，不要确认写价。

---

## 6. 和 Admin 三页的关系

| 页 | 四件事里干什么 |
|----|----------------|
| **价目预览** | ② 存/下刊例 Excel；抓上游 ≠ 写刊例 |
| **价格校验** | 出确认单；**先不要确认写价**；钉钉走 CLI |
| **商务价格** | ④ 导入/下载 L3a·L3b；不是真表计算器 |

场景分流仍见 [`ops-scenario-router.md`](../../.cursor/skills/trinity-official-pricing/workflows/ops-scenario-router.md)：①跟刊例 · ②调线路 · ④上新 · ⑤商务表。
