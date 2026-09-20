# 上游对账（常规供应商月结）

平台成本导出 ↔ 供应商账单 ↔ **上游发票**。按供应商 → 自然月（`YYYY-MM`）。

```text
<供应商>/YYYY-MM/
├── trinity-platform-*.csv
├── <上游账单>.*
├── recon-report.md / notes.md
└── 发票/                 ← 上游开给我们的 Invoice / 电子发票
```

| 供应商 | 目录 |
|--------|------|
| TokenHub | [`tokenhub/`](./tokenhub/) |
| 腾讯云 AIGC | [`tencent-aigc/`](./tencent-aigc/) |

大客专项 → [`../大客户对账/`](../大客户对账/)。