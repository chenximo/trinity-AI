# 维护用例

> 能力清单：[`../tools.yaml`](../tools.yaml) · 确认：[`../confirmation.md`](../confirmation.md)

## 能力引用

| 步骤 | tool id |
|------|---------|
| 改用例 | `acceptance.cases.edit` |
| 悬停说明 | `acceptance.param-hints.edit` |
| 工程师 md | `acceptance.engineer-params.edit` |
| 用例表 | `acceptance.roadmap.edit` |
| 验证 | `acceptance.dev.product` + `acceptance.run.all` |

## 真源

`apps/trinity-product/acceptance/cases/chat-completions.json`

配套：`chatParamHints.ts` · `api-test/roadmap.md`

## 改用例步骤

1. READ 工程师 `API对外接口支持参数.md` §生文
2. READ 现有 JSON 与 `roadmap.md` 用例表
3. `acceptance.cases.edit`：保持 `model` **不写死**
4. 按需 `acceptance.param-hints.edit`
5. `acceptance.run.all` 验证
6. `acceptance.roadmap.edit`（若增删 ID）

## 用例 ID 命名

`T-API-01`、`T-MSG-01`、`T-STREAM-01` 等（见实行计划 §5）

## 二期预留

文档驱动生成见 `roadmap.md` §二期；一期手维护 JSON。
