# Trinity 对外文档站 · 基本规范

> **文档状态**：执行中（2026-06-03）  
> **读者（本文件）**：仓库内维护者（产品、研发、AI）— **本文件不发布到对外文档站**  
> **对外站读者**：接入 Trinity 的**开发者客户**（用户侧客户）  
> **工程落点**：`apps/trinity-docs` · 默认 `http://127.0.0.1:5205/docs/`  
> **本页角色**：维护者协作规范；**`apps/trinity-docs/docs/**` 下正文须按 §2 写成纯客户视角**

---

## 1. 写作真源与 Review 流程（OpenRouter → 工程师契约）

对外文档站采用 **两层真源**，发布前须都过一遍：

```text
① OpenRouter 文档（结构与读者体验）
        ↓ 章节怎么分、示例怎么写、多模态/API Reference 怎么排
② 工程师 API对外接口支持参数.md（能力与字段）
        ↓ 是否已支持、路径/字段/约束是否与线上一致
apps/trinity-docs/docs/**/*.md（对外正文）
```

| 层级 | 真源 | 作用 |
|------|------|------|
| **体验与结构** | [OpenRouter 文档](https://openrouter.ai/docs) · [版式对齐](./Trinity文档站-OpenRouter版式对齐规范.md) | 三轨、API Reference **短页**、多模态指南（如 [Image Inputs](https://openrouter.ai/docs/guides/overview/multimodal/image-understanding)、[Image Generation](https://openrouter.ai/docs/guides/overview/multimodal/image-generation)）、`::: code-group` 语言顺序 |
| **能力与字段** | `docs/00-协作与工作流/工程师/API对外接口支持参数.md` | §0 头、生文、生图、生视频；**发布前 diff 的唯一条款真源** |
| **进度（不写进对外）** | `trinity-product` · `developer-docs.roadmap.yml` | 未开放能力、二期 UI（双栏示例、Try it） |

### 1.1 分工（对齐 OpenRouter，内容以工程师表为准）

| 对外落点 | 对标 OpenRouter | 正文从哪来 |
|----------|-----------------|------------|
| `api/*` 端点短页 | API Reference（如 send-chat-completion-request） | 工程师表 · **P0 字段** + 可复制示例 |
| `api/*-parameters` | Reference 长 schema / 调参 | 工程师表 · **全字段** |
| `multimodal/*`（图片输入/生成等） | Guides · Multimodal | 工程师 §2.1 / §二 + OR 章节结构 |
| `guides/*`（流式、请求参数索引等） | Guides | 概念与流程；**不全文复制**参数表 |
| `cookbook/*` | Cookbook | 工具配置步骤；链 API，不贴全表 |

**禁止**：为「像 OpenRouter」而写入 Trinity **未开放** 的接口或参数（如 `GET /v1/models?output_modalities=...`、OR 专属 `image_config` 子字段等）→ 只记在产品手册 roadmap。

### 1.2 工程师文档有、对外 deliberately 不写

维护者 review 时知悉即可，**不得**把下列内容抄进 `apps/trinity-docs/docs/`：

| 工程师文档 | 含义 | 对外写法 |
|------------|------|----------|
| `POST /v1/app/chat/completions` + JWT | 站内登录态接口，非 API Key | 不写；客户只用 `/v1/chat/completions` + Key |
| 落库字段 `request_id` vs 追踪/结算键 | 库表与 HTTP 头不是同一概念 | 只写 `X-Request-Id`、`X-Idempotency-Key`、`X-Conversation-Id` |
| `billing_settlement_idempotent_skip` 等日志关键字 | 研发排障 | 不写；客户只知「重试时结算键不变」 |
| `supports_multimodal`、`ChatUpstreamVisionPolicy` | 路由/模型配置内部名 | 写「在模型广场选择支持多模态的生文模型」 |
| 维护强约束、链 `大模型*.md` 等 | 仓库内协作 | 不写 |

### 1.3 发布前 Review 清单（对照工程师 `API对外接口支持参数.md`）

**§0 请求/响应头**

- [ ] 对外 [API 概述](../../apps/trinity-docs/docs/api/overview.md) 与相关页已写追踪/结算头及重试语义  
- [ ] 未写落库 `request_id`、日志关键字、`/app/chat/completions`

**§一 生文**

- [ ] 路径 `POST /v1/chat/completions`、示例 Key 前缀 `xh-...`  
- [ ] 高级参数页覆盖：`messages`、流式、`thinking_*`、`tools`、Part（`image_url` 等）与工程师表一致  
- [ ] [图片输入](../../apps/trinity-docs/docs/multimodal/image-input.md) 与 §2.1 一致（URL / Base64 / 70MB / 多图）  
- [ ] [视频输入](../../apps/trinity-docs/docs/multimodal/video-input.md) 与 §2.1 `file` Part 一致；与生视频 API 区分  
- [ ] 工程师表有、对外高级参数未列的字段（如 `service_tier`、`logit_bias`）→ 要么补对外，要么确认**尚未对客户开放**

**§二 生图**

- [ ] 强调同路径 `chat/completions` + `modalities` + `image_config`，**不是** `/images/generations`  
- [ ] `stream: true`、`trinity_async.*` 标明不支持  
- [ ] [图片生成](../../apps/trinity-docs/docs/multimodal/image-generation.md) / [高级参数 · 生图](../../apps/trinity-docs/docs/api/image-generation-parameters.md) 字段与 §二 一致  
- [ ] 看图（`image_url` Part）与生图（`reference_images`）易混说明已有

**§三 生视频**

- [ ] 创建 `POST /video/generations`、查询 `GET /video/tasks/{taskId}`  
- [ ] [高级参数 · 生视频](../../apps/trinity-docs/docs/api/video-generation-parameters.md) 覆盖创建任务主字段  
- [ ] §3.1 `object_id`、`reference_type`、`usage` vs `frame_images`：若工程师表有而对外缺 → 补 advanced 或标 roadmap 待补

**OpenRouter 对齐扫一眼**

- [ ] 多模态页具备：模型发现（模型广场）、基础示例、配置项、响应说明、最佳实践/排错（按 OR 同类页）  
- [ ] API 短页未塞进整段 OpenAPI YAML / 全量参数表  

核对通过后执行 §10 对外扫雷 + `npm run build:trinity-docs`。

---

## 2. 首要原则：对外正文零内部信息

**`apps/trinity-docs/docs/**/*.md` 会构建为对外站点，读者只会是开发者客户。** 下列内容**不得**出现在对外正文中（含 `::: tip` / FAQ / 页脚）：

| 禁止出现 | 应改为（对客户） |
|----------|------------------|
| 仓库路径 `docs/...`、`apps/...` | 不写；必要说明用「本文档站」 |
| `API对外接口支持参数.md`、工程师目录 | 「见本页 API 章节」「见 [对话补全](./api/chat-completions)」 |
| 产品手册、roadmap、周计划、5.30/6.30 | 不写 |
| 「一期 / 二期」「内测」「运营上架」「MVP」 | 「当前支持」「以控制台/模型广场为准」 |
| 「待产品填写」「待产品校验」「工程表」 | 「以控制台为准」「联系技术支持」 |
| 运营后台发布文档、Git 维护流程 | 不写 |
| 链到 `trinity-product`、飞书表 | 不写 |
| **`OpenRouter`、`openrouter.ai`、`openrouter` 字样** | **禁止**出现在对外正文（含中英文 `docs/`、`docs/en/`） |
| **「对标参考」「对标」「aligned with OpenRouter」** 及页首链到 openrouter.ai 的 Reference 行 | **禁止**；页首直接写 Trinity 场景与步骤 |
| **「与 OpenRouter 文档的差异」「OR 专属」** 等第三方对标句 | 改为「与其他平台示例的差异」「第三方专属」「OpenAI 兼容」等客户向表述 |

**维护者**核对字段、路径时可在仓库内查阅 `API对外接口支持参数.md`（§12），**不得**把该文件名或 `OpenRouter` 对标说明写进对外 md。  
**结构借鉴** OpenRouter 仅在 §1、版式规范等**维护者文档**内讨论；`apps/trinity-docs/docs/**` 读者只看到 Trinity 品牌与能力。

对外页只描述：**如何拿 Key、调哪些 API、填什么模型 ID、在 Cursor 等工具里怎么配、出错怎么办**。

### 2.1 版式与布局（改 `trinity-docs.css` 时 · 冻结）

以下约定写入主题 CSS，**勿在调留白时破坏**（细则见 [版式规范 §2.1.1](./Trinity文档站-OpenRouter版式对齐规范.md#211-vitepress-默认布局陷阱通病--必覆盖)）：

| 项 | 要求 |
| --- | --- |
| 本页目录 | `.aside-container` **保留 `position: fixed`**；禁止改 `sticky`（长文滚动时目录会跟着走） |
| 正文宽度 | 覆盖 `.VPDoc.has-aside .content-container { max-width: 688px }` → `max-width: none` |
| 中间区留白 | 只调 container 的 `padding-inline`（与 `--tdocs-doc-cluster-gap` 统一，当前 `5rem`）；**禁止**对 container 负 `margin` 外扩 |
| CC Switch 等地址 | `127.0.0.1:15721` 写明是 **CC Switch 本机默认**，非 Trinity 固定公网端点；Trinity 端点为 `https://api.trinitydesk.ai/v1` |

---

## 3. 与其它规范的关系（维护者真源地图）

| 文档 | 解决什么问题 | 何时读 |
|------|----------------|--------|
| **本页** | 对外用语、三轨分工、页面模板、同步与发布检查 | 新增/改任意 md **先读** |
| [Agent Skill · trinity-docs](../../.cursor/skills/trinity-docs/SKILL.md) | AI/维护者执行摘要 | 改 `trinity-docs` 时 **@trinity-docs** 或总机封发 |
| [信息架构与顶栏设计](./Trinity文档站-信息架构与顶栏设计.md) | 顶栏 Tab、侧栏目录、URL 前缀 | 加新轨 / 新侧栏分组 |
| [一期 MVP 文档清单](./Trinity文档站-一期MVP文档清单.md) | 有哪些页、验收闭环、一期边界 | 排期与勾选进度 |
| [OpenRouter 版式对齐](./Trinity文档站-OpenRouter版式对齐规范.md) | 布局、代码块 Tab、token 色 | 改 CSS / 版式 |
| [VitePress 方案](./Trinity文档站方案-VitePress与运营后台.md) | 架构、一期 Git / 二期运营发布 | 工程选型、部署 |
| `docs/00-协作与工作流/工程师/API对外接口支持参数.md` | **API 字段契约真源**（内测） | 改 API 页前 diff |
| [产品手册 · 开发者文档](../../apps/trinity-product/docs/ai-api-platform/user/developer-docs.md) | **进度与节点**（roadmap），不抄正文 | 周会 / 5.30·6.30 |

**维护者**日常入口：本页 **§1（OR + 工程师 review）** + §2 + [信息架构](./Trinity文档站-信息架构与顶栏设计.md) + [MVP 清单](./Trinity文档站-一期MVP文档清单.md)。

---

## 4. 站点定位（维护者分工，勿写入对外页）

| 载体 | 受众 | 说明 |
|------|------|------|
| **`trinity-docs` 对外正文** | 开发者客户 | 仅 API 接入与工具配置 |
| **本文件及 `docs/04/...`** | 仓库维护者 | 协作、IA、版式、与研发参数表对齐 |
| **`trinity-product` 等** | 内部 | 进度与节点，勿链到对外站 |

---

## 5. 信息架构（三轨）

顶栏二级导航（`DocsSubNav`）固定为三轨，**切换 Tab = 切换整棵左侧栏**：

| Tab | 对外名称 | URL 前缀 | 读者问题 |
|-----|----------|----------|----------|
| `docs` | **文档** | `/quickstart`、`/guides/`… | 怎么接、怎么跑通、多模态概念、排错 |
| `api` | **API** | `/api/` | 路径、字段、请求/响应示例 |
| `cookbook` | **应用场景** | `/cookbook/` | 在 Cursor / Claude Code / Codex 里怎么配 |

完整侧栏树见 [信息架构与顶栏设计 §4](./Trinity文档站-信息架构与顶栏设计.md#4-三轨左侧目录目标-ia)。

**禁止**：在 API 轨写长篇场景步骤；在 Cookbook 复述整张参数表；在文档轨复制 API 全字段表（用链接跳到 API 轨）。

---

## 6. 对外用语（正文必须遵守）

### 6.1 推荐说法

| 概念 | 对外写法 |
|------|----------|
| 请求体 `model` | **模型 ID**（与 [模型广场](https://trinity.ai/models) 一致） |
| API Key | 控制台创建的密钥，前缀一般为 **`xh-...`**；请求头 `Authorization: Bearer xh-...` |
| 网关地址 | **`TRINITY_BASE_URL`**，须含 **`/v1`** |
| 生图 | **`POST /v1/chat/completions`** + `modalities` + `image_config`（不是 `/images/generations`） |
| 生视频 | **`POST /v1/video/generations`**，查询 **`GET /v1/video/tasks/{taskId}`** |
| 追踪 / 计费重试 | 请求头 `X-Request-Id`、`X-Idempotency-Key`（重试同一笔业务时**结算键不变**） |

### 6.2 禁止对开发者客户出现的说法

见 §2 禁止表；另：勿用「slug 真源」「supply route」等研发用语。

### 6.3 样例与线上

- 文档示例 **`TRINITY_BASE_URL`**：`https://api.trinitydesk.ai/v1`；完整对话路径示例 `https://api.trinitydesk.ai/v1/chat/completions`。私有化/内测以运维为准；示例模型 ID 须在模型广场可见或标「示例」。  
- 文档与线上一致性问题：对外页写「请联系 [技术支持](mailto:support@trinity.ai)」（或实际支持渠道）；**勿**写「去改某内部 md」。

---

## 7. 三类页面怎么写

### 7.1 文档轨（指南）

- **目标**：最短路径、概念、流程、链接到 API。  
- **结构**：`##` 分节；步骤用有序列表；能力对比用表。  
- **示例**：`quickstart.md`（密钥 → 环境变量 → 首次请求 → 下一步表）。  
- **参数**：只写通用概念；细节链到 [请求参数](../../apps/trinity-docs/docs/guides/request-parameters.md) 与 API 页。

### 7.2 API 轨（API Reference · 短页，对标 OpenRouter）

- **目标**：一页一端点；左侧可读字段 + 可复制示例（双栏 UI 二期再做）。  
- **只写已开放能力**；未开放接口/字段**不得**出现在对外 API 页，进度写在 `trinity-product` · `developer-docs.roadmap.yml`。  
- **结构**（固定顺序）：  
  1. 标题 + `` `POST` `{TRINITY_BASE_URL}/...` `` + `Content-Type`  
  2. **Authentication** / **Headers** / **Body**（仅 P0 字段，通常 ≤5 行表）  
  3. **Response**（简短 + 可选 JSON 片段）  
  4. `::: code-group`（Python → TypeScript (fetch) → Shell）  
  5. **相关** → 对应「高级参数」指南  
- **禁止**在 API 页放：全量参数表、Part 长表、OpenAPI 大段 YAML、HTTP 状态码长表（链 `reference/error-codes`）。  
- **全字段 / 调参**：`api/*-parameters.md`（维护者从 `API对外接口支持参数.md` 同步）；`guides/request-parameters` 仅作索引。  
- **维护者发布前**：在仓库内与 `API对外接口支持参数.md` 核对（§12），对外页不写该文件名。

### 7.3 应用场景轨（Cookbook）

- **目标**：某工具里填 Base URL、Key、模型 ID 的步骤。  
- **结构**（每工具一页）：适用版本 → 前置 → 配置步骤 → 推荐模型 ID → 验收 → 故障排除 → 相关链接。  
- **禁止**：粘贴 API 全参数表；写「对标 OpenRouter」或链 `openrouter.ai`；用第三方平台专属头（Referer 排行等）除非产品明确要求。

---

## 8. Markdown 与组件约定

| 用法 | 约定 |
|------|------|
| 代码多语言 | `::: code-group`，优先 Shell + TypeScript + Python |
| 提示 | **`::: info`**（蓝底 + 图钉，默认标题「说明」）：一般说明、配置提示、示例补充；**`::: tip`**（浅绿 + 星标，默认「重要」）：密钥/安全/计费红线等**非常重要**内容；**`::: warning`**：已泄露、破坏性操作、易错计费 |
| 章节分隔 | 大节之间 `---` |
| 链接 | 站内相对路径 `](./api/overview.md)`；外链注明跳出 |
| 颜色 | **禁止** md 内魔法 hex；样式用 `trinity-docs.css` + `@trinity/tokens` |
| 行号 | 全局 `markdown.lineNumbers: true`（`config.ts`） |

版式细则 → [OpenRouter 版式对齐规范](./Trinity文档站-OpenRouter版式对齐规范.md)。

---

## 9. 新增或修改页面（维护者流程）

1. **定轨**：文档 / API / 应用场景？  
2. **加中文 md**：`apps/trinity-docs/docs/...`（**不要**放在 `docs/en/` 下），`slug` 与路径一致。  
3. **加英文镜像**：同路径写入 `apps/trinity-docs/docs/en/...`（完整翻译）；或先运行 `npm run docs:en-mirror -w @trinity/app-trinity-docs` 生成占位，再替换正文（删除文首 `<!-- tdocs-en-stub -->` 表示已翻译）。  
4. **注册侧栏**：在 `.vitepress/config/sidebars.ts` 的 `sidebarDocsZh` / `sidebarApiZh` / `sidebarCookbookZh` 增加条目（英文侧栏由 `localizeSidebar` 自动生成 `/en` 前缀与英文标签）。  
5. **新 Tab 级目录**：改 `docsNav.ts` 的 `SUBNAV_ZH` / `SUBNAV_EN` + `activeSubNavId` 判定。  
6. **内部进度**（可选）：`trinity-product` roadmap，**不**写入对外 md。  
7. **本地**：`npm run dev:trinity-docs` → 中/英各切换顶栏语言，三轨侧栏与互链各点一遍。  
8. **构建**：`npm run build:trinity-docs`。  
9. **对外扫雷**：在 `apps/trinity-docs/docs` 全文检索 §2 禁止词（`docs/00`、`产品手册`、`内测`、`一期`、`OpenRouter`、`openrouter`、`对标参考` 等）。

### 9.1 中英双语约定

| 项 | 约定 |
|----|------|
| 默认语言 | 中文为 **root**，URL 如 `/docs/quickstart` |
| 英文 URL | `/docs/en/quickstart`（`base` 为 `/docs/` 时） |
| `locales.en.link` | 必须为 **`/en/`** 前缀，勿写 `/en/quickstart`（否则切换语言会拼成 `/en/quickstart/quickstart`） |
| 路径对齐 | `foo/bar.md` ↔ `en/foo/bar.md` 一一对应 |
| 占位页 | 脚本生成；链到中文页 `[Read the Chinese version](/foo/bar)` |
| API 字段 | 英文名不翻译；只翻说明与表格描述列 |
| 语言切换 | VitePress 顶栏 `locales`（中文 / English） |

---

## 10. 发布前检查清单（维护者）

**对外正文**

- [ ] 无 §2 禁止的内部路径、手册、阶段用语  
- [ ] 中英文 `docs/` 正文无 `OpenRouter` / `openrouter` / `对标参考` / 页首 openrouter.ai 外链  
- [ ] 若改 `trinity-docs.css`：本页目录仍为 `fixed`；`content-container` 无 688px 限制  
- [ ] `TRINITY_BASE_URL`、路径与线上一致  
- [ ] 示例 **模型 ID** 在模型广场可见或已标「示例」  
- [ ] API Key 为 **`xh-...`** 表述  
- [ ] 新页已挂侧栏；Tab 高亮正确  
- [ ] 新中文页已有 `docs/en/` 镜像（翻译或占位 + `docs:en-mirror`）  

**仓库内（不展示给客户）**

- [ ] 已完成 §1.3 工程师契约 + OpenRouter 结构 review  
- [ ] 与 `API对外接口支持参数.md` 核对（§12）  
- [ ] `npm run build:trinity-docs` 通过  

产品校验项：[MVP 清单 §6](./Trinity文档站-一期MVP文档清单.md#6-产品校验项发布前)。

---

## 11. 当前能力边界（对外页可写范围）

**文档站已覆盖**：HTTP API · 生文 · 生图 · 生视频 · 流式 · 密钥 · 错误/限额说明 · 编程工具接入（Cursor / Claude Code / Codex CLI）

**勿在对外站承诺或空链**：独立 Client/Agent SDK 文档、未上线的工具教程

维护者边界详见 [MVP 清单 §1](./Trinity文档站-一期MVP文档清单.md#1-一期边界)。

---

## 12. 维护者专用：API 字段核对真源

仅维护者在仓库内打开，**禁止**复制路径到 `apps/trinity-docs/docs/`：

`docs/00-协作与工作流/工程师/API对外接口支持参数.md`

**流程**：先按 [OpenRouter](https://openrouter.ai/docs) 与 §7 定结构与示例形态 → 再按 **§1.3** 与本文件 §12 逐条 diff 工程师表 → 通过的才保留在对外正文；未开放项只更新 `developer-docs.roadmap.yml`。

**改参数顺序（强约束，与工程师文档文末一致）**：

1. 先改 `API对外接口支持参数.md`  
2. 再改 `apps/trinity-docs` 对应 API 短页 / `api/*-parameters` / `multimodal/*`  
3. 必要时改 `trinity-product` roadmap（不写进对外 md）

---

## 13. 本地命令（速查）

```bash
npm run dev:trinity-docs    # http://127.0.0.1:5205/docs/
npm run build:trinity-docs
```

开发枢纽 `:5173` 顶栏「文档」外链到 `:5205`（独立进程，非门户内嵌）。

---

## 14. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-09 | §2：禁止对外正文出现 OpenRouter / 对标参考；新增 §2.1 版式布局冻结；§10 扫雷项 |
| 2026-06-03 | §1：OpenRouter 对齐 + 工程师 `API对外接口支持参数.md` review 流程与勾选清单 |
| 2026-06-03 | 明确对外读者为开发者客户；§2 禁止内部信息进入 `trinity-docs/docs` |
| 2026-06-03 | 首版：三轨、用语、页面模板与发布检查 |
