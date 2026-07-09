---
title: 需求分析助手 · 待办清单
---

# 需求分析助手 · 待办清单

> **主通道**：钉钉（Stream 机器人 + 多维表 + Trinity LLM）  
> **工程**：`trinity-AI/tools/dingtalk-requirement-inbox/`  
> **更新**：2026-07-08  
> **决策**：先完成钉钉路线；飞书脚手架 `feishu-requirement-inbox/` 保留作备选，不并行推进。

---

## 当前进度一览

| 模块 | 状态 | 说明 |
|------|------|------|
| 产品 / 工程文档 | ✅ 已建 | [prd](./prd) · [route-a](./route-a) · [index](./index) |
| 钉钉应用创建 | ✅ 已完成 | **Trinity需求助手**，机器人 Stream 模式 |
| 应用版本发布 | ⏳ 审批中 | 预计次日通过；通过前无法在业务群添加机器人 |
| Stream 长连接 | ✅ 已验证 | 本地 `python -m src.main stream` 可连上钉钉 |
| LLM 摘录（dry-run） | ✅ 已验证 | Codex 样本产出 4 条 candidate；模型 `gpt-4o` |
| 群内 @整理（预览） | ⏳ 待发布 | 依赖应用发布 + 机器人进群 |
| `Chat.Message.Read` | ⏳ 灰度申请中 | 开通前仅整理触发消息本身 |
| Notable 写表权限 | ⏳ 审批中 | 预计次日；开通前 `NOTABLE_WRITE_ENABLED=false` |
| `messages.py` 群历史 API | 🔲 未实现 | 权限下来后对接 |
| 多维表「需求收件箱」 | 🔲 PM 待建 | 按 [prd §8](./prd#8-钉钉需求收件箱字段) 建列 |
| 试点群接入 | 🔲 待发布 | 记录 `conversationId` → `.env` |

---

## 明天（审批通过后）— 必做

### 钉钉开放平台

- [ ] 确认 **版本管理与发布** 已通过，发布内容勾选 **机器人**
- [ ] 确认可见范围包含试点群成员
- [ ] 确认以下权限已生效：
  - [ ] `Notable.Base.Read.All` / `Notable.Base.Write.All`
  - [ ] 机器人接收消息（Stream）
  - [ ] `Chat.Message.Read`（若灰度已批；未批则继续预览模式）

### 进群与配置

- [ ] 将 **Trinity需求助手** 拉入固定需求钉钉群
- [ ] 记录群 `conversationId`，写入 `.env`：

```env
DINGTALK_ALLOWED_CONVERSATION_IDS=cidxxxx==
```

- [ ] 建好 **Trinity · 需求收件箱** 多维表，填写：

```env
NOTABLE_WRITE_ENABLED=true
NOTABLE_BASE_ID=...
NOTABLE_SHEET_NAME=需求收件箱
NOTABLE_OPERATOR_UNION_ID=...
```

### 本地服务

```bash
cd trinity-AI/tools/dingtalk-requirement-inbox
source .venv/bin/activate
python -m src.main all   # Stream + dry-run API 同时运行
```

### 验收（当天）

- [ ] 群里 `@Trinity需求助手 整理` → 收到机器人回复（预览或写表）
- [ ] 若 `Chat.Message.Read` 未开通：确认预览模式仅用触发消息也能回复
- [ ] 若 Notable 已开通：收件箱新增行，状态 **待确认**
- [ ] dry-run 复测：`POST /internal/dry-run` + Codex 样本 ≥3 条

---

## 工程待办（研发）

### P0 — 试点前

- [ ] 实现 `src/dingtalk/messages.py`：`Chat.Message.Read` 拉近期群消息（50 条 / 2 小时窗）
- [ ] Notable 写表联调：字段映射与 [route-a §8](./route-a#8-钉钉需求收件箱--字段映射) 对齐
- [ ] 发布后首次 `@整理` 端到端日志留档（`conversationId`、批次 ID、条数）
- [ ] 确认 `.env` 在 `tools/dingtalk-requirement-inbox/.env`（非仓库根 `.env`）

### P0 — 试点一周

- [ ] 固定需求群群公告（群规：讨论结束后 PM `@整理`）
- [ ] PM 确认入库 ≥10 条
- [ ] 根据误提 / 漏提改 `prompt.md`（走 PR）

### P1 — 试点后

- [ ] 回复链 / 话题级消息边界
- [ ] 截图附件同步到多维表
- [ ] 同标题去重建议
- [ ] 失败告警 Webhook
- [ ] 生产部署（VPS / Docker / 内网机常驻 Stream）

---

## PM 待办

- [ ] 确定 **固定需求钉钉群**（群名、成员范围）
- [ ] 创建 **Trinity · 需求收件箱** 多维表（字段见 prd §8）
- [ ] 推动应用 **版本发布审批**（用途说明见 [route-a §5](./route-a#51-创建应用)）
- [ ] 试点 1 周内：收件箱确认 → 手工同步 [飞书 Bug 表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne) / backlog
- [ ] 验收 Codex 断流样本：≥3 条有效 candidate，≥2 条可直接采纳

---

## 已完成的里程碑

| 日期 | 事项 |
|------|------|
| 2026-07-08 | 文档迁入 `assistant-tools/requirement-inbox/` |
| 2026-07-08 | 主通道定为钉钉；脚手架 `dingtalk-requirement-inbox` |
| 2026-07-08 | 钉钉应用创建、Stream 配置、凭证写入 `.env` |
| 2026-07-08 | dry-run 通过；`LLM_MODEL` 修正为 `gpt-4o` |
| 2026-07-08 | 评估飞书备选路线；决定先等钉钉审批 |

---

## 阻塞项

| 阻塞 | 负责 | 解除条件 |
|------|------|----------|
| 群里加不了机器人 | 组织管理员 | 应用版本发布审批通过 |
| 无法读群历史 | 钉钉灰度 | `Chat.Message.Read` 审批 + `messages.py` 实现 |
| 无法写收件箱 | 组织管理员 | Notable 权限 + 多维表建好 + `.env` 开启写表 |

---

## 相关链接

| 资源 | 路径 |
|------|------|
| 产品 PRD | [prd.md](./prd) |
| 工程落地 | [route-a.md](./route-a) |
| 钉钉服务 README | `trinity-AI/tools/dingtalk-requirement-inbox/README.md` |
| 配置模板 | `trinity-AI/tools/dingtalk-requirement-inbox/.env.example` |
| Codex 验收样本 | `trinity-AI/tools/dingtalk-requirement-inbox/tests/fixtures/codex-sample-messages.json` |
| 飞书备选脚手架 | `trinity-AI/tools/feishu-requirement-inbox/`（搁置） |

---

*审批通过或首次 `@整理` 测完后，请更新本文「当前进度一览」勾选状态。*
