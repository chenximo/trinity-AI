---
title: Chat 在线体验
---

# Chat 在线体验

::: tip 指标待填（文内含 TODO）
- 填写 **当前已做**、**5.30 验收**、**6.30 商用**（✅ 🟡 ⬜）；试用范围待产品确认  
:::

<ul class="product-metrics">
  <li><strong>⬜</strong><span>模块盘点结论</span></li>
</ul>

> **对标**：[OpenRouter · Chat](https://openrouter.ai/chat)  
> **工程**：`apps/trinity-ai/src/views/chat/` · `/chat`

## 原型与体验

| | 链接 |
|--|------|
| **原型链接** | `TrinityAI/app/chat/index.html` |
| **体验地址** | [http://43.159.57.43/trinityai/chat](http://43.159.57.43/trinityai/chat)（本地：[127.0.0.1:5201/chat](http://127.0.0.1:5201/chat)） |

## 说明

浏览器内选模型、对话试用。与 [开发者文档](./developer-docs) 分工：文档教集成；Chat 给非开发者体验。

**TODO**：真推理是否已接 `chat/completions`。

---

## 子能力清单

| 子能力 | 5.30 验收 | 6.30 商用 | 当前已做 | 说明 |
|--------|:---------:|:---------:|:--------:|------|
| 选模型 + 会话 UI | ⬜ | ⬜ | ⬜ | |
| 发送 / 展示回复 | ⬜ | ⬜ | ⬜ | TODO：真调用 |
| 流式输出 | ⬜ | ⬜ | ⬜ | |
| 顶栏进入 Chat | ⬜ | ⬜ | ⬜ | |
| 广场带 model 跳转 | ⬜ | ⬜ | ⬜ | |
| 未登录试用策略 | ⬜ | ⬜ | ⬜ | |

---

## 5.30 验收（草案）

- [ ] 选模型后可发送并收到回复（真调用 `chat/completions`）
- [ ] 流式输出可用（若纳入本阶段）
- [ ] 与 [模型广场](./model-catalog) 跳转带 model 参数

## 6.30 商用（草案）

- [ ] 纳入 6.30 商用范围的子能力达标（对照 roadmap **6.30 商用** 列）
- [ ] 与 5.30 已交付能力衔接，无文档 / 数据口径冲突

---

## 关联

| 模块 | 关系 |
|------|------|
| [模型广场](./model-catalog) | 理想：卡片 → Chat |
| [开发者文档](./developer-docs) | API 集成 vs 试用 |
| 平台侧 · 生文 API | 后端 `chat/completions` |
