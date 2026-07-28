# 上游账单核对（Billing Reconciliation）

按**上游供应商**存放平台导出账单与上游官方/控制台账单，用于成本对账。

> **与价目流水线区分**：`suppliers/` / `pipeline/` 管**挂牌价与刊例**；本目录管**实际账单金额**核对。

```
billing-reconciliation/
├── README.md                 ← 本文件
└── tencent-aigc/             ← 腾讯云 AIGC
    ├── README.md
    └── YYYY-MM/              ← 账单月
        ├── trinity-platform-*.csv    # 平台侧导出
        └── tencent-*.csv             # 腾讯云侧账单
```

后续其他上游（如 TokenHub、百炼）可平行加目录：`tokenhub/`、`bailian/` 等。
