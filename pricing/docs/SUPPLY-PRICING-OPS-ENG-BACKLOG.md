# 模型供应与定价运营 · 研发需求清单

> **读者**：后端 / 管理端前端 / 定价 Job 负责人  
> **状态**：可排期 · 2026-07-31  
> **产品设计真源**：[SUPPLY-PRICING-OPS-DESIGN.md](./SUPPLY-PRICING-OPS-DESIGN.md)  
> **UI 原型**：`TrinityAI-web/apps/admin` → 路由 `/pricing/catalog` · `/pricing/review` · `/pricing/commercial`  
> **Skill 真源**：`.cursor/skills/trinity-official-pricing/` · CLI 见 `pricing/`  
> **原则**：机器出包与告警；**人确认后**才写生产刊例（禁止静默改价）

---

## 0. 一句话目标

把已跑通的 **定价 Skill / CLI** 与运营后台 **价目预览 · 价格校验 · 商务价格** 原型接成生产闭环：发起价审 → Job 出包 → 确认写价 → 「价格校验」翻转 → 上架门禁。

---

## 1. 范围与非目标

### 1.1 本清单包含

| 柱 | 本期 |
|----|------|
| ① 刊例治理 | **P0 必做**（价审 Job、确认写价、价格校验字段、上架门禁） |
| ① 刊例治理 | P1：上游链接、抓价 Job、告警；**价目预览 Excel 自动同步（C-01）按预览页需要做** |
| ② 账单核对 | P1 起（月度平台行 + 报告归档；实付仍人手填） |
| ③ 销售定价 | P2（商务价格：线路 snapshot → Job 出 L3b/L3a → draft+归档；公开矩阵方案 A；**不写** `/v1/prices`） |

### 1.2 明确不做

- AI / Job **不经确认**改生产刊例或上游实付  
- 用转售价反推官方价  
- 管理端内嵌重写整套 Node `pricing` 脚本（应用 Job 调现有 CLI）  
- 把「价审中/通过/驳回」做成模型主上市状态（用独立价审任务 +「价格校验」字段）

### 1.3 原型对照（前端已 Mock，接 API 即可）

| 页面 | 已有交互 | 后端缺口 |
|------|----------|----------|
| 价目预览 | Excel 本地上传预览（原型） | **C-01 Skill 产物自动进预览**；C-02 链接；C-03 抓价可选 |
| 价格校验 | 触发（模态+场景）、确认单、历史删 | 价审 CRUD + Job + 写价 |
| 商务价格 | 总表/交叉/按模型查（本地 Excel） | **S-01～S-04**：API 生成 + 矩阵钉住 + 归档 |

---

## 2. 优先级总表（每条：哪个页面 · 干什么 · 什么交付物）

> **不是每一条都等于「后台新加 REST API」。**  
> 交付物分几类：`模型域字段` · `Admin API` · `Job/Worker` · `薄配置/文件` · `已有 Skill/CLI（被调用）`。

| ID | 优先级 | **所属后台页面** | 路由（现网/原型） | 名称 | **作用** | **主要交付物** |
|----|--------|------------------|-------------------|------|----------|----------------|
| C-01 | **需要** | **价目预览** | `/pricing/catalog` | 刊例 Excel 自动同步 | Skill 生成的 xlsx **接口进预览页**（替代手传） | 上传/登记最新产物 + GET 预览/下载 |
| C-02 | **不做 / 可选** | **价目预览** | `/pricing/catalog` | 上游链接后台 CRUD | ~~多人改链接入库~~；链接真源改走仓库配置 | 可不做 API |
| C-03 | P1 | **价目预览** | `/pricing/catalog` | 触发上游抓价 | 异步跑 supplier | 触发 Job + 已有 CLI |
| R-01 | **P0** | **价格校验** | `/pricing/review` | 创建价审任务 | 点触发后落库任务 | 新 Admin API |
| R-02 | **P0** | **价格校验**（后台执行） | 由 `/pricing/review` 触发 | 定价 Job Worker | 出 draft+diff，不写生产价 | Worker/队列 |
| R-03 | **P0** | **价格校验** | `/pricing/review` | 查确认单/历史/**删除** | 工作台+历史供数；MVP 用删除代替驳回 | 新 Admin API + 换 Mock |
| R-04 | **P0** | **价格校验** | `/pricing/review` | 确认写价 | 人确认后写刊例 | 新 Admin API |
| R-05 | **P1 可选** | **价格校验** | `/pricing/review` | 驳回（原因态） | 明确「本次不跟价」；MVP 可用删除代替 | 新 Admin API（可后做） |
| A-01 | P1 | **价格校验**（告警子区/同导航） | `/pricing/review` 建议同模块 | 告警列表 | 钉钉告警进控制台待办 | 读 API/告警表 |
| R-06 | P2 | **价格校验**（自动入队） | `/pricing/review` | 半自动入队 | 少漏触发；写价仍要人确认 | 领域事件→入队 |
| S-01 | P2 | **商务价格** | `/pricing/commercial` | 线路 snapshot | 替代人工导出；供 L3b Job | Admin 读 API |
| S-02 | P2 | **商务价格** | `/pricing/commercial` | 生成 L3b/L3a draft | 触发 Job；latest draft | API + Worker（调现有 Python） |
| S-03 | P2 | **商务价格** | `/pricing/commercial` | 公开矩阵 + 快照 | 方案 A：生成钉矩阵；改矩阵确认后重生 | 配置 + API |
| S-04 | P2 | **商务价格** | `/pricing/commercial` | 人工归档 | draft→归档标签；可查看/对比 | 存储 + API |
| M-01 | **P0** | **模型管理 · 模型列表**（上架） | 模型列表上架操作 | 价格校验字段 + 上架门禁 | 没审过不准上架 | 模型字段 + 现有上架加条件 |
| B-01 | P1 | **月度对账** | `/billing/monthly-reconciliation` | 月度平台对账数 | 平台成本/Token | 账单域 API |
| B-02 | P1 | **月度对账** | `/billing/monthly-reconciliation` | 对账报告归档 | 存报告；实付仍手填 | 存储 + 读接口 |
| B-03 | P1 | **月度对账 / 统计** | 同上或统计子页 | Token·费用分项与**占比** | 入/出/缓等正式统计；可按月×上游 | 计量/账单统计 API |
| B-04 | P2 | **月度对账** | 告警 | 同上游**环比阈值**告警 | 积累数月基线后；财务风控 | 规则 + 钉钉/待办 |

> **交叉说明**：R-04 成功后回写 M-01（已校验），但 **M-01 的展示与上架拦截在「模型列表」**。R-02 无独立菜单，由「价格校验」触发。

### 2.0 按页面归类（研发按页认领）

#### A. 模型刊例和定价 → **价目预览** `/pricing/catalog`

| ID | 作用 | 交付物 |
|----|------|--------|
| C-01 | Skill 生成的刊例 Excel **自动进本页**预览/下载（替代手传） | 产物登记 API + GET |
| C-02 | （可选）打开上游公开页；**不做后台存链接** | 仓库配置 / 写死默认即可 |
| C-03 | 「获取价格」触发抓取（可选） | Job |

#### B. 模型刊例和定价 → **价格校验** `/pricing/review`

| ID | 作用 | 交付物 |
|----|------|--------|
| R-01 | 触发价审建任务 | API |
| R-02 | 跑 CLI 出确认单包 | Worker |
| R-03 | 确认单 / 历史（含 **删除**） | API |
| R-04 | 确认写价 | API |
| R-05 | 驳回带原因（**P1 可选**；MVP 不点确认或删记录即可） | API（可后做） |
| A-01 | 告警待办（同页 Tab 或入口） | 读 API |
| R-06 | 半自动入队（P2） | 事件入队 |

#### C. 模型刊例和定价 → **商务价格** `/pricing/commercial`

| ID | 作用 | 交付物 |
|----|------|--------|
| S-01 | 线路 snapshot（替代人工导出） | Admin 读 API |
| S-02 | 触发生成 L3b / L3a → latest draft | API + Job（调现有脚本） |
| S-03 | 公开矩阵生效配置；产物钉住本次快照；改矩阵须确认 | 配置 + API |
| S-04 | 人工归档（标签 · 日期）；归档只读；可对比 | 存储 + API |

#### D. **模型管理 · 模型列表**（上架）

| ID | 作用 | 交付物 |
|----|------|--------|
| M-01 | 展示「未校验/已校验」；上架门禁 | 字段 + 现有上架 API 加条件 |

#### E. **月度对账** `/billing/monthly-reconciliation`（柱②，可分队）

| ID | 作用 | 交付物 |
|----|------|--------|
| B-01 | 平台成本/Token | 账单 API |
| B-02 | 报告归档 | 存储 + 读 |

### 2.1 按交付物归类（方便排期）

| 类型 | 有哪些 | 所属页面 |
|------|--------|----------|
| **必须新开的价审 API（P0）** | R-01、R-03（含删除）、R-04 | **价格校验** |
| **P1 可选** | R-05 驳回 | **价格校验**；MVP 不点确认 / 删历史即可 |
| **模型域改动** | M-01 | **模型列表**（由价格校验 R-04 回写） |
| **价目预览必做** | C-01 | Skill xlsx → 接口同步 → 本页预览 |
| **Job / 流水线** | R-02、C-03、R-06 | 价格校验 / 价目预览 |
| **薄接口或配置** | A-01 | 价格校验告警 |
| **价目预览链接** | C-02 | **产品已倾向不做后台 CRUD**；公开 URL 写仓库/前端默认；点开跳转即可 |
| **Job（价目预览可选）** | C-03 | 上游抓价；可后做 |
| **账单柱** | B-01、B-02 | **月度对账** |
| **P2** | S-01～S-04 | **商务价格** |
| **已有、不要重造** | pricing CLI、手改计量价、`/v1/prices`、L3b/L3a Python | Job 与 R-04 / S-02 复用 |

### 2.2 一次价审里各 ID 怎么串起来

```text
【价格校验页】运营点「触发价审」
    → R-01 建任务（API）
    → R-02 Job 跑 CLI，产出 draft+diff（Worker）
    → R-03 本页展示确认单（API）
    → 人点「确认」R-04 写刊例
         + 回写【模型列表】M-01 = 已校验
       或不跟价：先不点确认；需要清掉则 R-03 删除
       （P1 可选：R-05 驳回并记原因）
【模型列表】以后点上架 → 读 M-01：未校验则拦截
```

### 2.3 一次商务价格生成怎么串起来（产品设计见 DESIGN §6.4）

```text
【商务价格页】运营点「生成」
    → S-01 拉线路 snapshot（Worker 内调；页上可不直连）
    → S-02 Job：rebuild → L3b draft；条件满足再 build_outward → L3a draft
         + S-03 钉住「本次公开矩阵」快照（折 · GM）展示在页上
    → 主区 GET latest draft（覆盖写；不自动进归档）

【改矩阵 · 方案 A】
    → 编辑公开矩阵 → S-03「确认矩阵」写入生效配置
    → 再点生成 L3a（或确认后自动重生）

【新成本族】
    → S-02 阻断或标「定折审」→ 人确认对内阶梯（可 AI 参考）写入配置 → 再生成

【归档】
    → S-04 当前 draft 打标签（v1.0 · 日期）；L3b+L3a+矩阵快照同包
    → 归档只读；列表可查看 / 对比；主区仍默认 latest draft
```

**瘦接口建议（P2 MVP）**：`GET supply-routes/snapshot` · `POST commercial/build` · `GET commercial/latest` · `POST commercial/matrix/confirm` · `POST commercial/archive` · `GET commercial/archives`。

---

## 3. P0 详细需求

### M-01 模型「价格校验」与上架门禁

**所属页面**：**模型管理 · 模型列表**（上架操作）；由 **价格校验** 页 R-04 确认写价后回写本字段。

**作用**：把「能不能卖」和「刊例有没有审过」拆开——上市状态只管上架/下架；本字段只管价是否经过价审确认。没有它，未审刊例可能被直接上架。

**背景**：上市状态仅保留上架/下架；价审结果用独立字段，不把任务态塞进主状态。

| 项 | 要求 |
|----|------|
| 字段名 | `priceValidation`（或等价）：`unchecked` / `checked`（展示：未校验 / 已校验） |
| 默认 | 新建模型 = `unchecked` |
| 写为已校验 | **仅**价审「确认写价」成功后（R-04）；可选：同事务 |
| 打回未校验 | 主供应线路变更；未经价审的刊例大改；运营「要求重审」 |
| 上架门禁 | `上架` 仅当 `priceValidation = checked`；超管强上须填原因并写审计 |
| 下架 | 随时可下；默认保留已校验 |
| Admin | 模型列表/详情展示字段；上架失败明确错误码 |

**验收**

1. 未校验模型点上架 → 业务错误（非 500）。  
2. 确认写价成功 → 相关模型变为已校验。  
3. 审计日志含操作者、briefId、前后状态。

---

### R-01 创建价审任务

**所属页面**：**价格校验** `/pricing/review`

**作用**：运营点「触发价审」时，系统先登记任务（模态、场景、批次），作为后续 Job、确认单、审计的主键；没有它，后台无法追踪「这次审的是哪一单」。

`POST /api/v1/admin/pricing/reviews`

**Request（建议）**

```json
{
  "modality": "text | image | video | all",
  "scenario": "上新跟价 | 官方上游变价 | 巡检跟进 | 自定义",
  "modelIds": ["optional", "subset"],
  "note": "optional"
}
```

**行为**

| `modality` | 行为 |
|------------|------|
| `text` / `image` / `video` | 创建 **1** 条任务，异步出该模态全量包（或指定 modelIds） |
| `all` | 创建 **1 个 batchId + 3 条任务**（生文/生图/生视频各一），**禁止**合成一份 prices-api |

**Response**：`batchId?`、`reviews[{ id, runId, modality, status: queued }]`

**验收**：与原型一致——「全部」= 三张确认单，不是一张大表。

---

### R-02 定价 Job Worker

**所属页面**：由 **价格校验** 触发（无独立菜单页）

**作用**：真正跑 Skill/CLI 的执行器。输入是 R-01 的任务，输出是「建议刊例包」（draft + diff）。**职责止于出包**，绝不直接改生产刊例——改价只允许走 R-04。

**职责**：消费价审任务 → 调用 monorepo 既有命令（勿重写算法）→ 上传产物 → 回写任务状态。

| 状态 | 含义 |
|------|------|
| `queued` | 已入队 |
| `running` | 执行中 |
| `ready` | 确认单可审（有 draft + diff） |
| `failed` | 失败原因可读 |

**建议调用链（按模态，与 Skill 对齐）**

```text
refresh/supplier（按需）→ gate/compare → gen → diff
产物：draftPrices(JSON) · diff(JSON/MD) · meta · 可选 Excel
```

**产物存储**：对象存储或制品库；任务表存 URL + 摘要（bucketSummary、conclusion）。

**验收**

1. Job 失败不写生产价。  
2. 同一 `Idempotency-Key` / `(modality, contentHash)` 不重复空跑（可配置）。  
3. 日志可追溯到 `runId`。

---

### R-03 查询价审 / 确认单

**所属页面**：**价格校验**（工作台确认单 + 历史记录 Tab）

**作用**：给「价格校验」工作台和历史页供数：任务是否跑完、简报摘要、每行模型旧价→建议价、风险标。前端换掉 localStorage Mock 就靠它。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/pricing/reviews` | 分页；筛 status / modality / batchId / 时间 |
| GET | `/admin/pricing/reviews/{id}` | 确认单 meta + 分桶行 + 产物 URL |
| DELETE | `/admin/pricing/reviews/{id}` | **P0**：清历史（MVP 用删除代替驳回）；已确认是否可删由配置决定 |

**确认单字段（对齐原型 `ReviewRecordMeta`）**

- runId、modality、scenario、batchId、创建/完成时间、操作者  
- 将写回 / 拦一下 / 关注 Δ% / 风险标 / 依据  
- bucketSummary：改价、草案新增、仅线上无草案、风险…  
- conclusion：`可确认写回` | `须补锚` | `须登记例外`  
- lines[]：modelId、旧价、建议价、Δ%、bucket、flags  

**验收**：Admin「价格校验」去掉 localStorage 后，历史与工作台数据来自本 API。

---

### R-04 确认写价（核心写接口）

**所属页面**：**价格校验**（确认写价弹窗）；成功后回写 **模型列表** 的 M-01

**作用**：唯一允许把「建议刊例」写成「线上刊例」的按钮背后的接口。人看过确认单后才调用；成功后模型变为「已校验」（M-01）。带幂等键，防止连点写两次。

`POST /api/v1/admin/pricing/reviews/{id}/confirm`

**Request**

```json
{
  "idempotencyKey": "uuid",
  "models": [
    {
      "model": "gpt-4.1",
      "user": { "input": 0, "output": 0, "cached": null },
      "cost": { "...": "..." },
      "official": { "...": "..." }
    }
  ],
  "note": "optional"
}
```

| 规则 | 说明 |
|------|------|
| 权限 | 运营/产品角色；写审计 |
| 幂等 | 同 `idempotencyKey` 重复提交返回首次结果 |
| 范围 | **仅提交可写回子集**（原型「将写回」）；须补锚/风险默认不进 body 或需显式 force+原因 |
| 落库 | 更新计量价策略 / 与现网 prices 投影一致的真源（与现有 Admin 改价同源） |
| 回写 | 成功模型 `priceValidation=checked`；任务 `status=confirmed` |
| 禁止 | 任务非 `ready` 时确认；空 models |

**验收**

1. 确认后 `/v1/prices`（或 Admin 刊例读）可见新价。  
2. 重复 confirm 不双写。  
3. 审计含 briefId=reviewId、模型列表、前后价摘要。

---

### R-05 驳回（P1 可选 · MVP 可不做）

**所属页面**：**价格校验**

**优先级判定（已拍）**：**P1 可选**。不影响主路径——不确认就不写价；清历史用 R-03 的 **DELETE** 即可。驳回仅在需要「明确否决 + 原因统计」时再补。

**作用**：给任务一个 `rejected` 结论并记原因，便于复盘；**不改**刊例、不改价格校验字段。与「删除」不同：删除是清记录，驳回是保留业务结论。

`POST /admin/pricing/reviews/{id}/reject`  
Body：`{ "reason": "..." }` → `status=rejected`

**MVP 代替做法**：运营不点确认；历史里删除该条（见 R-03 DELETE）。

---

## 4. P1 详细需求

> 含：C-01～C-03、A-01、B-01/B-02，以及上表 **R-05 驳回（可选）**。

### C-01 刊例 Excel 自动同步（价目预览 · **需要 API**）

**所属页面**：**价目预览** `/pricing/catalog`（上半「刊例 Excel」）

**理解（已对齐）**：不是运营本机随便传文件当主路径；而是 **Skill / CLI 生成 `trinity-pricing-{text|image|video}.xlsx` 后，经后台接口把「最新一份」登记上来**，预览页自动可看、可下载。人手上传仅作例外补洞。

**作用**：价目预览页始终对着 Skill 真源产物，避免「各人电脑上各传一份」。

**建议接口**

| 方法 | 路径 | 说明 |
|------|------|------|
| PUT/POST | `/admin/pricing/catalog/excel` | Job/CI/运营工具上传或登记某模态最新 xlsx（含 modality、版本、生成时间） |
| GET | `/admin/pricing/catalog/excel?modality=` | 下载或返回签名 URL |
| GET | `/admin/pricing/catalog/excel/meta` | 各模态当前文件名、大小、生成时间（列表区展示） |

**谁调用上传**：优先 **定价 Job / CI** 在 `pricing:upstream`（或 refresh）出表后自动 PUT；也允许人工调同一接口补传。

**验收**：Skill 出新表并同步后，打开价目预览无需再本地选文件即可预览对应模态。

### C-02 上游厂商价目链接（**建议不做后台 API**）

**所属页面**：**价目预览**（「上游厂商价目」区块）

**你的理解（对齐）**：链接本质只有两类用途——

1. **给人点开**：跳到上游公开/控制台价目页核对；  
2. **给 Skill/CLI 抓取**：命令与入口写在仓库（`SOURCES.md`、各 supplier 脚本），**不是**运营在后台填完再「下发」给 Skill。

因此 **不需要** 专门的「后台链接 CRUD API」。页面可用仓库默认 URL 写死/配置文件；要改链接改仓库发版即可。原型里的 localStorage 手填可保留给演示，不进研发必做。

**AIGC 特例（无公开页）**

- 现状已是人工真源：`pricing/suppliers/aigc/data/pricing-sheet.mjs`（商家给表 → 录入 → `npm run pricing:supplier:aigc`）。  
- **建议继续放在 `pricing/suppliers/aigc/`**，不要放到 `.cursor/skills/` 下（Skill 只编排，价目真源在 `pricing/suppliers`）。  
- 若商家给的是 Excel：可放 `pricing/suppliers/aigc/data/`（或 `incoming/`），用已有 `parse-aigc-*-excel.mjs` 管线；页面上标注「本地/仓库真源」+ 链到仓库路径说明即可，**不要假装有外链**。

### C-03 获取价格（可选）

**所属页面**：**价目预览**（上游行「获取价格」按钮）

**作用**：在链接之外，一键触发对应 `pricing:supplier:*` 抓取/刷新上游挂牌进工程真源。只更新上游数据，**不自动改 Trinity 刊例**（改刊例仍走价审）。

`POST /admin/pricing/upstream-sources/{id}/fetch` → 异步 Job 跑对应 `pricing:supplier:*`；成功更新「最近抓取时间」，**不直接写刊例**。

### A-01 告警列表

**所属页面**：建议挂在 **价格校验** 同模块（Tab/入口）；暂不单开菜单亦可

**作用**：巡检/门禁发现漂移后，除钉钉外在控制台也有待办列表，避免告警只存在聊天群里不好追踪。

`GET /admin/pricing/alerts`：与钉钉刊例告警同源；可跳转关联 review / brief。

### B-01 / B-02 账单（柱②）

**所属页面**：**月度对账** `/billing/monthly-reconciliation`（不属于「模型刊例和定价」三 Tab）

**作用（B-01）**：提供对账用的「平台侧」数字（某月某上游成本 USD、Token）。  
**作用（B-02）**：把核对报告存档，方便以后审计；上游实付仍由人确认后填写后台，系统不替人拍板。

- 平台侧：账单月、上游、平台成本 USD、平台 Token（入+出+缓）  
- 上游实付：表单录入（人）  
- 触发核对：可调 Skill 同口径或服务端复用逻辑 → 报告归档  
- **确认后人手填后台实付**（API 可提供「建议回填值」只读）

### B-03 平台侧结构统计（占比）（P1）

**所属页面**：月度对账或计量统计台（与宇光已加/在加的后台统计对齐）

**原则**：对账与风控数字**全部来自后台正式统计**，禁止拍脑袋占比。

**作用**：

- Token：输入 / 输出 / 缓存总量及**各自占比**  
- 消耗金额：分项及占比  
- 维度：账单月 × 上游（后续可下钻模型）  
- 派生：有效 $/百万 tokens 等  

**产品注记（2026-08-03）**：跨上游同月对比参考意义有限；**同一上游跨月**序列才是阈值基线。细则与 TODO 见 [账单与定价体系总览.md §5.5](./账单与定价体系总览.md)。

### B-04 同上游环比阈值告警（P2）

**前置**：B-03 连续落库 ≥3 个完整账单月后，产品定「正常带」初稿。

**作用**：占比或有效单价偏离带、量环比异常 → 钉钉/后台待办；**人确认**后再下钻柱②。上游与模型变多后替代月月人肉盯盘。例外月（大改价/大促）可打标宽限。

对应总览 **TODO-STAT-03～05**。

---

## 5. P2 详细需求

> **产品真源**：[SUPPLY-PRICING-OPS-DESIGN.md §6.4](./SUPPLY-PRICING-OPS-DESIGN.md)（商务价格控制台流程已拍）

### S-01 线路 snapshot

**所属页面**：商务价格（Worker 消费；页上可选调试预览）

**作用**：用后台已录入的线路（成本折、启停、模型、优先级/权重等）替代人工「线路管理导出 Excel」。

`GET /api/v1/admin/pricing/supply-routes/snapshot?modality=&enabled=`

字段对齐现导出「线路管理」列，供 `rebuild_discount_tier_workbook.py`（改造为读 JSON / stdin，勿硬编码 Downloads）。

### S-02 生成 L3b / L3a draft

**所属页面**：商务价格

**作用**：一键刷新 **latest draft**；算法复用仓库 Python，Admin 不重写 Excel 逻辑。

| 产物 | 脚本（现有） | 输入 |
|------|--------------|------|
| L3b | `.../rebuild_discount_tier_workbook.py` | S-01 + 成本族对内阶梯配置 |
| L3a | `pricing/scripts/build_outward_quote_standard.py` | L3b draft + L2 刊例（C-01/价审产物）+ 当前公开矩阵 |

`POST …/commercial/build`（`targets: l3b | l3a | both`）→ `GET …/commercial/latest`（含 status）。

- 成本族已在配置：全自动出 L3b。  
- 公开矩阵齐全：可自动出 L3a。  
- **无价审确认单、无删历史、不写 `/v1/prices`**。

### S-03 公开矩阵 · 方案 A

**所属页面**：商务价格 · 对外报价区

**作用**：

1. 每次 L3a draft **钉住**本次所用矩阵（成本族/特例 × Plus～Enterprise：**折 · GM**），页上只读展示。  
2. **当前生效矩阵**可编辑；与「本次」不一致时提示「请重新生成」。  
3. **改矩阵须「确认矩阵」**写入生效配置后再生成（**不**强制每次生成前确认）。  

配置建议抽离脚本常量为 `pricing/config/public-ladder-matrix.json`（或等价）；与 [定价方案-v0 §6.0](./定价方案-v0-三件套与广场.md) 对齐。

新成本族：对内阶梯缺 → 定折审（可 AI 参考 + 人确认）；是否进对外矩阵为产品策略（可只对内）。

### S-04 人工归档

**所属页面**：商务价格

**作用**：draft 可反复覆盖；**仅**人点归档才保留版本。

- 标签：`v1.0` + 日期 + 可选备注  
- 同包：L3b + L3a（internal/external）+ 矩阵快照  
- 归档只读；`GET archives` / `compare`（对比可 P2 后半）  
- 再生成只更新 draft，不覆盖已归档

### 其它 P2

| ID | **所属页面** | 作用 | 说明 |
|----|--------------|------|------|
| R-06 | **价格校验** | 少漏触发 | 下架+未校验且线路就绪 → 可选自动入队（仍要人确认写回） |
| — | 跨页 | 刊例↔销售折联动 | 价审写 L2 后提醒重跑 L3a / GM 检查 |

---

## 6. 错误码与审计（统一）

| 场景 | 建议 code |
|------|-----------|
| 未校验不可上架 | `PRICE_VALIDATION_REQUIRED` |
| 价审状态不允许确认 | `REVIEW_NOT_READY` |
| 幂等冲突 | `IDEMPOTENCY_REPLAY` |
| 含不可写模型 | `REVIEW_MODELS_NOT_WRITABLE` |
| 超管强上 | 必须 `forceReason` + 审计 |

所有写操作：`actorId`、`requestId`、`briefId`/`reviewId`、时间。

---

## 7. 与现有系统衔接

| 现有能力 | 衔接方式 |
|----------|----------|
| Admin 计量价编辑（模型页） | R-04 与手改共用写价服务；价审走批量+校验字段 |
| `GET /v1/prices` | 写后投影一致 |
| `trinity-official-pricing` CLI | **仅** Job Worker 调用；Admin 不直连 npm |
| 钉钉 webhook | A-01 入库或只读镜像 |
| 商用计费 / 商务 Excel | 柱③；运行时扣费仍商用计费域；L3b/L3a 生成走 S-*，**不写** `/v1/prices` |
| L3b / L3a Python | **仅** S-02 Worker 调用；改造输入为 snapshot/JSON，勿重写算法 |

---

## 8. 建议排期（研发）

```text
Sprint A（P0）
  M-01 字段 + 门禁
  R-01/R-03 任务表 + 查询 + 删除（可先人工上传包，Job 后置）
  R-04 确认写价（可先接「上传价审包 JSON」通道）

Sprint B（P0 闭环）
  R-02 Job Worker 接 CLI
  Admin 价格校验页换真 API

Sprint C（P1）
  C-01/C-02、A-01；R-05 驳回（可选）；B-01 视账单优先级

Sprint D（P2 · 商务价格）
  S-01 snapshot → S-02 Job 出 L3b/L3a draft
  S-03 矩阵钉住 + 确认；S-04 归档
  Admin `/pricing/commercial` 换真 API
```

**最小可上线（MVP）**：M-01 + R-01（支持上传包或单模态 Job）+ R-03（含删除）+ R-04 + Admin 换 Mock。**不含** R-05 驳回。  
**商务价格最小闭环**：S-01 + S-02（latest only）+ S-03（钉矩阵）+ S-04（归档）；对比可后做。

---

## 9. 验收清单（产品签字用）

- [ ] 触发价审（单模态 / 全部=三单）可在后台看到确认单  
- [ ] 确认写价后刊例变更且价格校验=已校验  
- [ ] 未校验无法上架；强上有审计  
- [ ] 不确认则不改价；历史可删除  
- [ ] （P1 可选）驳回带原因且不改价  
- [ ] 重复确认幂等  
- [ ] 历史可查可删  
- [ ] Job 失败有可读原因、不写库  
- [ ] （P1）上游链接手填持久化；Excel 可下载  
- [ ] （P2）商务：snapshot 生成 L3b；生成 L3a 并展示本次矩阵折·GM  
- [ ] （P2）改矩阵须确认后重生；归档含 L3b+L3a+矩阵；主区仍为 latest draft  

---

## 10. 开放问题（需研发/产品拍板后锁进接口）

1. 写价鉴权主体：登录运营账号 vs 服务账号（建议：用户 JWT + 服务端写库）。  
2. 「确认」与「上架」是否允许一键「确认并上架」（仍写两条审计）。  
3. 已确认任务是否允许物理删除。  
4. 价审包是否必须含 official 字段，还是仅 user/cost。  
5. Job 运行环境：CI runner / K8s CronJob / 专用 worker 机。

---

## 11. 参考路径

| 文档 / 代码 | 路径 |
|-------------|------|
| 运营系统设计 | `pricing/docs/SUPPLY-PRICING-OPS-DESIGN.md` |
| 治理工作流 | `pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md` |
| Admin 原型 README | `TrinityAI-web/apps/admin/src/views/admin-pricing/README.md` |
| 价审包类型 | `.../admin-pricing/priceReviewTypes.ts` |
| Fixture 形状 | `.../admin-pricing/fixtures/price-review-package-065.json` |
| Skill | `.cursor/skills/trinity-official-pricing/` |

---

## 12. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-31 | 初稿：自设计稿与 Admin 原型整理给研发的 P0–P2 需求清单 |
| 2026-07-31 | 补「作用 / 交付物 / 所属页面」；明确不全是新 API |
| 2026-07-31 | **R-05 驳回改为 P1 可选**；MVP 用 R-03 删除代替 |
| 2026-07-31 | **C-01 明确为价目预览必做**：Skill xlsx 经接口自动同步，非仅手传 |
| 2026-07-31 | **C-02 建议不做后台 CRUD**；链接=人点开 / Skill 用仓库配置；AIGC 继续 `suppliers/aigc` |
| 2026-08-03 | **B-03** 结构占比统计（P1）、**B-04** 同上游环比阈值告警（P2）；对齐总览 §5.5 TODO-STAT-* |
| 2026-08-05 | **S-01～S-04** 商务价格闭环：snapshot、Job 出 L3b/L3a、方案 A 矩阵、人工归档；对齐 DESIGN §6.4 |
