# 维护用例

## 真源

`apps/trinity-product/acceptance/cases/chat-completions.json`

配套：

- `acceptance/config/chatParamHints.ts` — 表格悬停说明
- `api-test/roadmap.md` — 用例 ID 与文档参数意图对照表

## 改用例步骤

1. READ 工程师 `API对外接口支持参数.md` §生文
2. READ 现有 JSON 与 `roadmap.md` 用例表
3. 编辑 JSON：保持 `model` **不写死**（顶栏注入）
4. 同步 `chatParamHints.ts` 若字段说明变化
5. dev 验收台 **运行全部** 验证
6. 更新 `roadmap.md` 用例表（若增删 ID）

## 用例 ID 命名

`T-API-01`、`T-MSG-01`、`T-STREAM-01`、`T-PARAM-01`、`T-NEG-01` 等（见实行计划 §5）

## 二期预留

文档驱动生成（`acceptance/spec/`、`acceptance/scripts/`）见 `roadmap.md` §二期；一期手维护 JSON。

## 确认

删除用例或改断言契约 → [`../confirmation.md`](../confirmation.md)
