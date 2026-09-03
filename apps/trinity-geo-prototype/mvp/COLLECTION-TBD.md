# 采集 · 工程占位（待研发）

> **当前阶段**：产品/业务侧 **人工提供豆包回答** 即可跑通全链路；自动采集 **不阻塞** MVP 演示与商用规划。

## 工程师一句话（占位）

**定时任务 + 豆包消费端采集（Playwright/RPA 或官方 API，视与 App 一致性要求选型）→ 原始回答与截图入库 → 供 SOA/诊断消费。**

（备选补充：若先对齐「模型行为」而非「App 触点」，可经 Trinity 网关 `POST /v1/chat/completions` 调豆包模型做半自动采集；商用需再补 App 通道抽样对照。）

---

## 交付标准（研发完成后）

| 项 | 要求 |
|----|------|
| 输入 | `config/questions.json` 中的问题 ID + 问法 |
| 输出 | 写入 `data/{round}/records.json` 同结构，或调用现有 `import-manual` 批量导入 |
| 字段 | `question_id`、`platform=doubao`、`collection_channel`、`round`、`collected_at`、`answer_full`、可选截图路径 |
| 频率 | MVP 手动；商用 V1 目标 **每日** 每题至少 1 次 |
| 运维 | 采集成功率、失败原因可查（对接运营后台「数据监控」页） |

## 现有脚本（不阻塞业务）

| 脚本 | 状态 | 说明 |
|------|------|------|
| `import-manual.mjs` | **现用** | 人工粘贴豆包 App 回答 |
| `analyze.mjs` | **现用** | SOA、诊断、报告 |
| `collect.mjs` | 可选 | Trinity API 调豆包模型；工程师可替换为正式采集服务 |

---

*业务侧提交格式见 [人工提交模板](./MANUAL-SUBMIT.md)。*
