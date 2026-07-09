---
title: 需求分析助手 · 路线 A 落地文档
---

# 需求分析助手 · 路线 A 落地文档

> **路线**：A — **钉钉**群机器人 Stream + 薄后端服务  
> **性质**：内部自用 MVP，验证「群聊整理 → 收件箱」产品价值  
> **产品真源**：[产品需求分析](./prd)  
> **工程真源**：`trinity-AI/tools/dingtalk-requirement-inbox/`（`feishu-requirement-inbox/` 为早期脚手架，不再作为主路径）  
> **状态**：等应用发布审批（2026-07-08）· Stream / dry-run 已通  
> **待办**：[待办清单](./todo)

---

## 1. 文档范围

本文是路线 A 的**工程落地真源**，覆盖：

- 系统架构与模块边界  
- 钉钉应用配置、权限、Stream 接入  
- HTTP 接口、环境变量、部署方式  
- LLM 摘录、Notable 写入、字段映射  
- 里程碑、验收、运维与风险  

**不在本文**：周会排期、backlog YAML 自动写入、对外商用。

---

## 2. 产品目标（P0）

### 2.1 一句话

在固定 **钉钉**需求群里，PM `@需求助手 整理` 一段对话，服务自动拆成若干条可确认的 Bug/需求，写入 **钉钉多维表「需求收件箱」**。

### 2.2 必须做到

| # | 能力 |
|---|------|
| 1 | 仅 `@机器人` 且口令含 **整理** 时触发 |
| 2 | 拉取触发消息所在会话的近期消息（默认 **50 条** 且 **2 小时内**） |
| 3 | LLM 输出结构化 JSON，一条真实问题一条 candidate |
| 4 | 批量写入 Bitable，状态 **待确认** |
| 5 | 群内回复：`已整理 N 条，请在「需求收件箱」确认（待确认）` |

### 2.3 明确不做（P0）

- 自动写入 Bug 表 / `product-backlog.yml`  
- 全群消息自动收录  
- 自建 MySQL / Redis 业务库（仅允许可选本地日志文件）  
- 飞书卡片确认（P1）  
- 图片附件同步到表（P1；P0 仅 `含截图` 复选框）

---

## 3. 系统架构

```text
┌─────────────────────────────────────────────────────────────┐
│ 固定钉钉需求群                                                │
│   PM: @需求助手 整理                                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ Stream: /v1.0/im/bot/messages/get
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ dingtalk-requirement-inbox（薄服务）                          │
│    1. Stream 收 @ +「整理」                                   │
│    2. Chat.Message.Read 拉近期群消息（含 picture）            │
│    3. LlmExtractor（Trinity API）                             │
│    4. NotableWriter 写钉钉多维表                              │
│    5. sessionWebhook 群内回复                                 │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
                ▼                         ▼
     Trinity API（LLM）          钉钉多维表「需求收件箱」
```

### 3.1 技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| 运行时 | **Python 3.11+ / FastAPI** | 单进程；Stream 长连接可独立进程 |
| 通道 | **钉钉企业内部应用 · 群机器人** | **Stream 模式**（免公网回调） |
| 群历史 | **`Chat.Message.Read`** | 聊天消息记忆；需申请灰度权限 |
| LLM | **Trinity API** | OpenAI 兼容 |
| 存储 | **钉钉多维表** | 钉钉文档内建表 |
| 回复 | **`sessionWebhook`** | 触发消息自带，有效期内回复群内 |

### 3.2 相对飞书路线的变化

| 项 | 飞书（已搁置） | 钉钉（当前） |
|----|----------------|--------------|
| 讨论群 | 飞书群 | **钉钉群** |
| 贴图 | 不便 | **可直接贴图**，`picture` 消息可识别 |
| 收件箱 | 飞书 Bitable | **钉钉多维表** |
| 入站 | HTTPS 事件回调 | **Stream**（本地开发更省事） |
| 拉历史 | `im/v1/messages` 较直接 | 依赖 `Chat.Message.Read`（**前置申请**） |

### 3.2 设计原则

1. **无状态**：重启不丢业务数据（真源在 Bitable）  
2. **幂等弱保证**：同一条触发消息 `message_id` 在 10 分钟内重复投递只处理一次（内存去重，P1 可换 Redis）  
3. **失败可见**：写表或 LLM 失败时群内回复错误摘要 + 日志留痕  
4. **Prompt 真源在 Git**：改摘录规则走 PR，不靠控制台手改  

---

## 4. 工程目录

```text
trinity-AI/tools/dingtalk-requirement-inbox/
├── README.md
├── requirements.txt
├── .env.example
├── prompt.md                 # 与 feishu 版共用摘录逻辑
├── schema.json
├── src/
│   ├── main.py               # FastAPI + Stream worker 入口
│   ├── stream_worker.py      # 钉钉 Stream 收消息
│   ├── pipeline.py
│   ├── dingtalk/
│   │   ├── client.py         # Token、消息记忆、sessionWebhook 回复
│   │   └── notable.py        # 多维表写入
│   └── llm/extract.py
└── tests/
```

---

## 5. 钉钉应用配置

### 5.1 创建应用

1. [钉钉开放平台](https://open.dingtalk.com/) → **企业内部应用**  
2. 名称：**Trinity 需求助手**  
3. 启用 **机器人** → 消息接收模式选 **Stream 模式**（推荐）

### 5.2 权限（P0）

| 权限 | 用途 |
|------|------|
| 机器人接收消息 | Stream topic `/v1.0/im/bot/messages/get` |
| **`Chat.Message.Read`** | 拉取群聊近期消息（**灰度，需申请**） |
| 多维表 / 文档写权限 | 新增收件箱记录 |

### 5.3 Stream 接入

- ClientId / ClientSecret：应用凭证  
- 监听 topic：`/v1.0/im/bot/messages/get`  
- 过滤：`isInAtList == true` 且正文含「整理」  
- 回复：使用消息体中的 `sessionWebhook`（注意过期时间）

### 5.4 机器人进群

- 拉入 **固定需求钉钉群**  
- 记录 `conversationId` → `DINGTALK_ALLOWED_CONVERSATION_IDS`

### 5.5 多维表

1. 钉钉文档 → 新建 **多维表**：**Trinity · 需求收件箱**  
2. 按 [§8 字段映射](#8-钉钉需求收件箱--字段映射) 建列  
3. 记录 **多维表 id**、**数据表名/ id**

---

## 6. 环境变量

复制 `tools/dingtalk-requirement-inbox/.env.example`：

| 变量 | 必填 | 说明 |
|------|:----:|------|
| `DINGTALK_CLIENT_ID` | ✅ | 应用 ClientId |
| `DINGTALK_CLIENT_SECRET` | ✅ | 应用 ClientSecret |
| `DINGTALK_ALLOWED_CONVERSATION_IDS` | | 允许的群 conversationId |
| `NOTABLE_BASE_ID` | ✅ | 多维表 base id |
| `NOTABLE_SHEET_NAME` | ✅ | 数据表名 |
| `NOTABLE_OPERATOR_UNION_ID` | ✅ | 写表操作人 unionId |
| `NOTABLE_WRITE_ENABLED` | | 默认 `false`；权限开通后改 `true` |
| `CHAT_MESSAGE_READ_ENABLED` | | 默认 `false`；`messages.py` 接好后改 `true` |
| `TRINITY_BASE_URL` | ✅ | Trinity API |
| `TRINITY_API_KEY` | ✅ | API Key |
| `LLM_MODEL` | | 推荐 `gpt-4o`（须支持 `json_object`） |
| `MESSAGE_LIMIT` | | 默认 `50` |
| `MESSAGE_WINDOW_HOURS` | | 默认 `2` |

---

## 7. 接口（薄服务）

| 接口 | 说明 |
|------|------|
| Stream worker | 主路径：收 @整理 → 异步整理 |
| `GET /health` | 探活 |
| `POST /internal/dry-run` | 本地调试 LLM（复用 `prompt.md`） |

## 8. 钉钉「需求收件箱」· 字段映射

Bitable 列名（中文）与 LLM / 代码字段对应：

| Bitable 列名 | 类型 | 写入来源 |
|--------------|------|----------|
| 创建时间 | 日期 | 服务端当前时间 |
| 批次 ID | 文本 | `batch_id`，格式 `YYYYMMDD-HHMM-xxxx` |
| 类型 | 单选 | `bug→Bug` `feature→需求` `doc→文档` `question→咨询` |
| 标题 | 文本 | `candidate.title` |
| 摘要 | 多行文本 | `candidate.summary` |
| 建议模块 | 文本 | `candidate.module_suggestion` |
| 提出人 | 文本 | `candidate.reporter` |
| 含截图 | 复选框 | `candidate.has_screenshot` |
| 原消息链接 | URL | `candidate.message_link` |
| 会话摘要 | 多行文本 | `session_summary`（同批次相同） |
| 状态 | 单选 | 固定 **待确认** |
| 触发消息 ID | 文本 | 钉钉 `msgId`（追溯用，P0 可选列） |
| 群 ID | 文本 | `conversationId`（可选列） |

`noise` 类型 **不写入** 表。

---

## 9. 核心流程

### 9.1 触发识别

```text
收到 Stream 消息（topic /v1.0/im/bot/messages/get）
  → isInAtList == true
  → 正文包含「整理」
```
  → chat_id 在 FEISHU_ALLOWED_CHAT_IDS（若已配置）
```

口令：

| 口令 | 行为 |
|------|------|
| `@需求助手 整理` | P0 唯一支持 |
| `@需求助手 整理 昨天` | P1 |

### 9.2 消息拉取

1. `GET /open-apis/im/v1/messages?container_id_type=chat&container_id={chat_id}&page_size=50`  
2. 按 `create_time` 过滤：仅保留最近 `MESSAGE_WINDOW_HOURS` 小时内  
3. 最多 `MESSAGE_LIMIT` 条，按时间正序排列  
4. 预处理为：

```json
{
  "message_id": "om_xxx",
  "sender_name": "张三",
  "create_time": "2026-07-08T14:30:00+08:00",
  "text": "消息正文",
  "has_image": false,
  "message_link": "https://applink.feishu.cn/..."
}
```

**P0 线程边界**：不解析回复链，仅「近期 N 条 + 时间窗」。PM 应在讨论结束后触发。

### 9.3 LLM 摘录

- 系统 Prompt：读 `prompt.md`  
- 用户消息：上述 `messages[]` 的 JSON 字符串  
- 模型：`LLM_MODEL`，`response_format: json_object`  
- 解析后校验 `schema.json` 必要字段  
- 过滤 `type == "noise"` 的 candidates  

### 9.4 写表与回复

1. 生成 `batch_id`  
2. 对每个 candidate 调用 Bitable 新增记录 API  
3. 回复触发消息：

```text
已整理 4 条，请在「需求收件箱」确认（待确认）
批次：20260708-1520-a3f2
```

失败时：

```text
整理失败：无法连接模型服务。请稍后重试或手工录入收件箱。
```

---

## 10. LLM 摘录规则

完整 Prompt 见 `tools/feishu-requirement-inbox/prompt.md`。

### 10.1 类型定义

| type | 含义 | 是否写入表 |
|------|------|:----------:|
| `bug` | 缺陷、报错、不可用 | ✅ |
| `feature` | 新能力、体验改进 | ✅ |
| `doc` | 文档 / 配置缺口 | ✅ |
| `question` | 已解答咨询 | ✅（PM 可忽略） |
| `noise` | 闲聊、致谢 | ❌ |

### 10.2 输出 JSON Schema

见 `tools/feishu-requirement-inbox/schema.json`。

### 10.3 验收样本（Codex 断流）

`tests/fixtures/codex-sample-messages.json` 为固定样本输入。

**至少应产出 ≥3 条**有效 candidate，PM 认可 ≥2 条可直接采纳。期望标题见 [产品需求分析 §7.4](./prd#74-固定样本--期望摘录codex-断流-case)。

---

## 11. 部署

### 11.1 本地开发

```bash
cd trinity-AI/tools/dingtalk-requirement-inbox
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 填写密钥（路径在本目录，非仓库根 .env）

# Stream 机器人（免公网）
python -m src.main stream

# 或仅 dry-run API
python -m src.main api

# 或两者同时
python -m src.main all
```

dry-run 验收：

```bash
curl -s -X POST http://127.0.0.1:8788/internal/dry-run \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: dev-only-change-me" \
  -d @tests/fixtures/codex-sample-messages.json
```

### 11.2 生产（推荐顺序）

| 方式 | 适用 |
|------|------|
| **腾讯云 SCF + API 网关** | 低流量、免运维 |
| **VPS + systemd + nginx** | 已有内网机 |
| **Docker 单容器** | 与现有运维统一 |

### 11.3 健康检查与日志

- 负载均衡探活：`GET /health`  
- 日志：stdout JSON 行（`batch_id`、`message_id`、`candidate_count`、`duration_ms`）  
- **不记录**消息正文到持久日志（隐私）；仅 debug 模式可开  

---

## 12. 里程碑

| 阶段 | 内容 | 工期 | 完成标准 |
|------|------|------|----------|
| **A-M1** | 钉钉应用 + Stream 收 @ + 发布审批 | 2～3 天 | 机器人进群；`@整理` 有回执 |
| **A-M2** | 拉消息 + LLM + 写表 + Codex 样本 | 2～3 天 | 样本 ≥3 条；字段齐全 |
| **A-M3** | 固定群试点 1 周 | 1 周 | §13 验收全过 |

---

## 13. 验收标准（P0 上线）

- [ ] 固定需求群已接入机器人；仅 **@整理** 触发  
- [ ] Codex 断流样本整理出 ≥ **3** 条有效 candidate，PM 认可 ≥ **2** 条  
- [ ] 每条写入收件箱：类型、标题、摘要、链接、状态=待确认  
- [ ] `noise` 不写入表  
- [ ] 试点 **1 周** 内 PM 确认入库 ≥ **10** 条  
- [ ] 未确认行从未出现在 Bug 表 / backlog  

---

## 14. 运维与风险

| 风险 | 缓解 |
|------|------|
| LLM 漏提 / 误提 | 人工确认；保留原消息链接 |
| 群聊敏感信息 | 内部群 only；Prompt 禁止复述密钥 |
| 飞书 / Trinity 不可用 | 群内失败提示；PM 手工建表行 |
| 线程边界不准 | P0 固定时间窗 + 条数；群规要求讨论结束后整理 |
| 事件重复投递 | `message_id` 10 分钟去重 |
| 3 秒回调超时 | 异步 BackgroundTasks |

---

## 15. P1 待办（试点后）

- [ ] 回复链 / 话题级消息边界  
- [ ] `@需求助手 整理 昨天` 时间范围  
- [ ] 截图附件同步到 Bitable  
- [ ] 确认卡片（飞书 interactive）  
- [ ] 同标题去重建议  
- [ ] 失败告警 Webhook（钉钉 / 飞书群机器人）  

---

## 16. 待拍板

| 项 | 决定 |
|----|------|
| 固定需求群 conversationId | 【待填】→ `DINGTALK_ALLOWED_CONVERSATION_IDS` |
| 需求收件箱多维表 | 【待填】→ `NOTABLE_BASE_ID` / `NOTABLE_SHEET_NAME` |
| 消息窗口 | 默认 50 条 + 2 小时 |
| LLM 模型 | **`gpt-4o`**（Trinity 上须支持 `json_object`） |
| 应用发布 | ⏳ 组织审批中（2026-07-08 提交） |
| 负责人 | 【待填】 |

---

## 17. 与手册真源的关系

| 层级 | 真源 | 本服务 |
|------|------|--------|
| 进线 | 需求收件箱（钉钉多维表） | ✅ 写入 |
| Bug | [飞书 Bug 表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne) | PM 手工 |
| 待排期 | [product-backlog.yml](../../ai-api-platform/product-backlog.yml) | PM 周会迁入 |
| 本周 | week-progress | 不自动写 |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-08 | 迁入 `assistant-tools/requirement-inbox/` |
| 2026-07-08 | **主通道改为钉钉**（Stream + 多维表 + 贴图） |
| 2026-07-08 | 新增 [待办清单](./todo)；Stream / dry-run 验收通过 |

---

*产品需求见 [产品需求分析](./prd)；本文只描述路线 A 实现。*
