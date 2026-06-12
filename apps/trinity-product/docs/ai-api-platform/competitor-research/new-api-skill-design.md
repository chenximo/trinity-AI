---
title: Trinity Skill · 设计要点（附录）
---

# Trinity Skill · 设计要点（附录）

> 友商 [newapi Skill](https://docs.newapi.pro/zh/docs/skills/newapi) 拆解与 Trinity 映射。执行优先级见 [New API · newapi Skill 落地方案](./new-api-skill#5-可落地执行方案分优先级)。

## 1. 定位

| 是 | 不是 |
|----|------|
| IDE 里查模型、管 Key、写配置 | Admin 渠道/上架后台 |
| 开发者 DX 触点 | 替代 [模型广场](https://trinitydesk.ai/models) 网页 |
| `xh-` Key 的脚本化安全操作 | 让 AI 直接读 `.env` |

## 2. 三层架构

```
SKILL.md          → 触发词、安全铁律、指令表
docs/*.md         → 每个 action 的执行步骤
scripts/*.js      → HTTP、脱敏、剪贴板、写配置
        ↓
TRINITY 管理 /api/*  +  网关 /v1/*
```

**原则**：AI 只读 Markdown；凡涉及真实 `xh-` Key，必须走脚本，stdout 不得出明文。

## 3. 安全规范（须写入 SKILL.md）

1. 禁止在对话、日志、命令参数中暴露完整 `xh-` Key。  
2. 管理请求必须走 `scripts/api.js` / `gateway.js`，禁止 AI 直接 `curl`。  
3. 禁止 AI 读 `.env`、环境变量凭证、`copy-key` 后的剪贴板。  
4. `create-key` 后不得再调 API 把 Key 取回对话。  
5. 查看配置文件必须先 `scan-config`（`inject-key.js --scan`）。  
6. 写配置用占位符 `__TRINITY_KEY_{id}__`，由脚本原子替换。  
7. `sanitize.js` 须脱敏 `xh-` 与 `Bearer`（友商仅 `sk-`，Trinity 须扩展）。

## 4. 指令映射（newapi → trinity）

| newapi | trinity（建议） | Phase |
|--------|-----------------|-------|
| `/newapi models` | `/trinity models` | P0 |
| `/newapi help` | `/trinity help` | P0 |
| `/newapi model`（友商无，Trinity 增） | `/trinity model <id>` | P1 |
| `/newapi tokens` | `/trinity keys` | P2 |
| `/newapi create-token` | `/trinity create-key` | P2 |
| `/newapi copy-token` | `/trinity copy-key` | P2 |
| `/newapi apply-token` | `/trinity apply-key` | P2 |
| `/newapi scan-config` | `/trinity scan-config` | P2 |

## 5. 环境变量

| 变量 | 用途 | Phase |
|------|------|-------|
| `TRINITY_BASE_URL` | 网关，如 `https://api.trinitydesk.ai/v1` | P0 |
| `TRINITY_API_KEY` | `xh-...`，调 `/v1/*` | P0 |
| `TRINITY_ADMIN_URL` | 管理 API 根（若与网关分离） | P2 |
| `TRINITY_ACCESS_TOKEN` | 管理 API 访问令牌 | P2 |
| `TRINITY_USER_ID` | 管理 API 用户标识（若需要） | P2 |

友商对照：`NEWAPI_BASE_URL` / `NEWAPI_ACCESS_TOKEN` / `NEWAPI_USER_ID`。

## 6. 文件对照（fork 友商时改什么）

| 友商文件 | Trinity 改动 |
|----------|--------------|
| `SKILL.md` | 名称 `trinity`，前缀 `xh-`，链 doc.trinitydesk.ai |
| `scripts/sanitize.js` | 增加 `xh-` 规则 |
| `scripts/fetch-key.js` | 路径与响应字段按 Trinity 管理 API |
| `docs/help.md` | FAQ + `llms.txt` 指向 Trinity 文档站 |
| 占位符 | `__NEWAPI_TOKEN_*` → `__TRINITY_KEY_*` |

## 7. 与 Trinity 产品文档分工

| 内容 | 放对外 doc.trinitydesk.ai | 放 trinity-skills |
|------|---------------------------|-------------------|
| 为什么用 Trinity、HTTP 示例 | ✅ Quickstart | `help` 摘要 + 链接 |
| Cursor 图文配置步骤 | ✅ Cookbook | `apply-key` 为主路径 |
| 在 IDE 里执行安全动作 | ❌ | ✅ Skill + scripts |

## 8. 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 自 TRINITY_SKILL 调研稿迁入产品手册 |
