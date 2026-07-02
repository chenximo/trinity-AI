---
name: trinity-api-acceptance
description: >-
  Trinity API 生文验收：模型测试、生文验收台、Chat API Test 汇总报告、用例 JSON、
  acceptance runner 与报告组件。在改 apps/trinity-product/acceptance/**、
  api-test/**、ApiAcceptanceConsole、chat-completions 用例或验收路线图时使用。
  触发词：API 验收、生文验收台、Chat API Test、验收台、models.mvp、chat-completions.json、
  跑模型测试、导出测试汇总。勿与 trinity-product-handbook 手册叙事、trinity-docs 对外文档混用。
disable-model-invocation: true
---

# Trinity API 验收 · Agent Skill

## 读取顺序

```text
SKILL.md → workflows/<task>.md → tools.yaml（执行 / 编辑真源前）
         → references/source-paths.md → repo 真源
DOMAIN.md、confirmation.md：confirm:required 或覆盖报告时再 READ
```

边界：[`./DOMAIN.md`](./DOMAIN.md) · 能力清单：[`./tools.yaml`](./tools.yaml) · 确认：[`./confirmation.md`](./confirmation.md)

---

## 真源（MUST READ）

| 任务 | 必读 |
|------|------|
| 实行计划、MVP 范围 | `docs/00-协作与工作流/工程师/API生文验收台-实行计划.md` |
| 参数契约（内测） | `docs/00-协作与工作流/工程师/API对外接口支持参数.md` |
| 验收站入口与流程 | `apps/trinity-product/docs/ai-api-platform/api-test/chat-completions.md` |
| 路线图（一期/二期） | `apps/trinity-product/docs/ai-api-platform/api-test/roadmap.md` |
| 用例 JSON | `apps/trinity-product/acceptance/cases/chat-completions.json` |
| 模型列表 | `apps/trinity-product/acceptance/config/models.mvp.json` |
| 汇总数据 | `apps/trinity-product/docs/ai-api-platform/api-test/reports/chat-api-test.data.json` |

路径全表：[`./references/source-paths.md`](./references/source-paths.md)

---

## 触发词

`API 验收` · `生文验收台` · `Chat API Test` · `验收台` · `跑模型` · `导出测试汇总` · `chat-completions.json` · `models.mvp` · `ApiAcceptanceConsole`

---

## 分流

| 用户意图 | Workflow |
|----------|----------|
| 本地跑模型、运行全部 | [`./workflows/run-model-test.md`](./workflows/run-model-test.md) |
| 导出/更新 Chat API Test 报告 | [`./workflows/update-report.md`](./workflows/update-report.md) |
| 新增或调整测试模型 | [`./workflows/add-model.md`](./workflows/add-model.md) |
| 维护用例 JSON / param hints | [`./workflows/maintain-cases.md`](./workflows/maintain-cases.md) |
| 预览 URL、环境、导出格式 | [`./tools/preview-and-export.md`](./tools/preview-and-export.md)（链 `acceptance.dev.product`） |

常用 tool id：`acceptance.dev.product` · `acceptance.run.all` · `acceptance.report.export` — 全表见 [`tools.yaml`](./tools.yaml)。

---

## 硬规则

1. **一期 MVP**：仅 `POST /v1/chat/completions`；`model` 由顶栏注入，不写死在用例 JSON。
2. **双份维护**：工程师参数 md 与 `cases/*.json`、`chatParamHints.ts` 一期双轨；改参数须对照两边。
3. **报告进 git**：`acceptance.report.export` 前见 `confirmation.md`。
4. **不改对外 docs**：`trinity-docs` 另 Skill。
5. **不改手册叙事**：`trinity-product-handbook` 管 roadmap 叙述。
6. **组件改动**：本 Skill；大规模 Vue 重构叠加 `trinity-vue-prototype-monorepo`。

---

## 检查清单

- [ ] 用例 ID 与 `roadmap.md` 表一致
- [ ] 改 JSON 后 dev 可「运行全部」
- [ ] 导出后 `chat-api-test.data.json` 可被报告页读取
- [ ] 未误改 `trinity-docs` 对外正文
