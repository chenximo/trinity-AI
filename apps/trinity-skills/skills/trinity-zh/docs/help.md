# 帮助与参考

Trinity Skill 问题统一入口。先读本文，再按类型回答。

**一律用简体中文回复用户。**

---

## 类型一：Skill 本身怎么用

用户可能会问：

- 「Trinity 是什么」
- 「怎么查模型」
- 「CONFIG_MISSING 怎么办」
- 「为什么看不到完整密钥」

### Trinity 是什么？

[Trinity](https://trinitydesk.ai/) 是 AI API 聚合平台，应用通过 OpenAI 兼容网关（`https://api.trinitydesk.ai/v1`）和 `xh-` 密钥调用模型。

本 Skill 让你在 IDE 里查模型、（后续）管密钥，**不用把密钥贴进对话**。

官方文档：[doc.trinitydesk.ai 快速开始](https://doc.trinitydesk.ai/quickstart?lang=zh)

### 常见问题

**问：为什么对话里看不到完整的 `xh-` 密钥？**  
答：安全策略。明文密钥禁止出现在对话中。P2 会提供 `copy-key` / `apply-key`（对标 newapi Skill）。

**问：`TRINITY_API_KEY` 在哪拿？**  
答：[控制台 · API 密钥](https://trinitydesk.ai/account/keys)，创建 `xh-` 开头的密钥。

**问：`TRINITY_BASE_URL` 是什么？**  
答：网关根地址，默认 `https://api.trinitydesk.ai/v1`（无尾部斜杠）。与 Cursor「Override OpenAI Base URL」一致。

**问：出现 `[CONFIG_MISSING]` 怎么办？**  
答：运行 `node scripts/init-env.cjs`，会在项目根生成 `.env`（`TRINITY_BASE_URL` 已写好），你只需填写 `TRINITY_API_KEY=xh-...`。不要让 AI 反复重试。

**问：怎么列生图 / 生视频模型？**  
答：带 `modality` 查询参数，见 `docs/actions-query.md`：`GET /models?modality=image` 或 `video`。默认 `GET /models` 仅为 **生文**。

**问：为什么没有价格，或怎么找「最便宜」？**  
答：P0 只列 ID 与基础 `metadata`。**不要**用列表里的价字段做排序筛选；按价筛选需 P1 专用 API。暂可看 [模型广场](https://trinity.ai/models)。

**问：怎么安装本 Skill（内部）？**  
答：

```bash
npx skills add /path/to/trinity-AI/apps/trinity-skills --skill trinity-zh
```

对外发布版为英文 `trinity`，见仓库 README。

**问：能让 AI 用 curl 调 API 吗？**  
答：不能。必须用 `scripts/gateway.cjs`。

---

## 类型二：Trinity 产品 / HTTP API

HTTP 格式、Cookbook（Cursor、Claude Code 等）、计费说明：

1. [快速开始](https://doc.trinitydesk.ai/quickstart?lang=zh)
2. [Cookbook 应用场景](https://doc.trinitydesk.ai/cookbook/)
3. [模型广场](https://trinitydesk.ai/models)（网页浏览）

英文文档：[doc.trinitydesk.ai/en/quickstart](https://doc.trinitydesk.ai/en/quickstart)

P1 可能增加 `llms.txt` 自动拉文档。
