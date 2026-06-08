# 新增模型

## 临时（单次测试）

验收台顶栏 **新增**，输入模型 ID（如 `gpt-5.4`）。不写文件，刷新后丢失。

## 持久（MVP 列表）

1. READ `acceptance/config/models.mvp.json`
2. 按表结构追加一行：`id`、`label`、`priority` 等
3. **不必**为每个模型复制用例文件 — `model` 由顶栏注入
4. dev 验收台刷新，选新模型 → 运行全部 → 导出报告

## 与文档对齐

- 工程师参数 md §模型差异 — 有新增对外模型时同步 `trinity-docs`（另封发）
- 内测镜像 `internal-api-doc` — 可链工程师 md，验收台不维护对外措辞

## 确认

持久入库 `models.mvp.json` 并提交 → 见 [`../confirmation.md`](../confirmation.md)
