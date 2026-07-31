# 上游账单核对（Billing Reconciliation）

按**上游供应商**存放平台导出、上游账单副本与**核对报告**。

> **Skill**：[`.cursor/skills/trinity-billing-reconciliation/`](../../.cursor/skills/trinity-billing-reconciliation/SKILL.md)  
> **流程**：平台导出（成本+Token）→ 人拉上游账单 → Skill 出报告 → **人确认后**回填后台实付。  
> **与价目区分**：`suppliers/` 管挂牌价；本目录管实际账单。

```
billing-reconciliation/
├── README.md
└── <supplier>/                 # tencent-aigc、tokenhub…
    ├── README.md
    └── YYYY-MM/
        ├── trinity-platform-*.csv      # 平台导出副本
        ├── <upstream-bill>.*           # 人工拉取的上游账单
        ├── recon-report.md             # 核对报告（或写入 notes）
        ├── notes.md
        └── daily-standard-settlement-* # 差大时
```
