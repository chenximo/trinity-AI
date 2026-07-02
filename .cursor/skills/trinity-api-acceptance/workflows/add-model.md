# 新增模型

> 能力清单：[`../tools.yaml`](../tools.yaml) · 确认：[`../confirmation.md`](../confirmation.md)

## 能力引用

| 方式 | tool id |
|------|---------|
| 临时（顶栏） | 无 — 不写文件 |
| 持久 MVP | `acceptance.models.edit` |

## 临时（单次测试）

验收台顶栏 **新增**，输入模型 ID。刷新后丢失。

## 持久（MVP 列表）

1. READ `acceptance/config/models.mvp.json`
2. 追加一行：`id`、`label`、`priority` 等（**须确认**）
3. **不必**复制用例 — `model` 由顶栏注入
4. `acceptance.dev.product` → 选新模型 → `acceptance.run.all` → `acceptance.report.export`

## 与文档对齐

- 新增对外模型 → 评估 `trinity-docs`（另封发）
- 内测 `internal-api-doc` 可链工程师 md
