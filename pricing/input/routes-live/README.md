# routes-live（临时落盘，不保留）

本目录 **不是** 折扣真源缓存。

`rebuild_workbook_from_live_api.py` 每次会：
1. 删除旧的 `*-enabled.xlsx`
2. 从 Admin 现网重拉
3. 重建商务总表后再次删除导出文件

拉取失败会通知人工（控制台 + 钉钉），**不**回退旧缓存。
排查时若需保留本次导出，加 `--keep-exports`。
