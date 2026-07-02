# Trinity Skills · 通用确认规则

> 各子 Skill 的 `confirmation.md` **须链本文**并只写领域特例。  
> 与 `tools.yaml` 中 `confirm: required` 的能力一一对应。

## 须先确认（`confirm: required`）

| 类别 | 操作 | 说明 |
|------|------|------|
| **Git 真源** | commit / push  seeds、用例 JSON、报告 data.json、pricing-sheet 等 | 影响团队共享真源 |
| **覆盖数据** | 覆盖已有汇总报告、验收 data.json、validate 产出入库 | 不可 silent 覆盖 |
| **外呼** | POST webhook、推商务/运维告警 | 含 `PRICING_ALERT_WEBHOOK_URL` 等 |
| **删除** | 删用例、删 Skill、删模块/views、删静态遗留 | 不可逆 |
| **全局变更** | 根 workspace 依赖 major 升级、重构 `apps/`/`packages/` 目录 | 影响面大 |
| **对外发布** | 对外 docs 发布、营销价目/口径变更 | 客户可见 |

## 建议确认（`confirm: optional`）

| 类别 | 操作 |
|------|------|
| 规则引擎 | 改 tier-key、全局 token、影响多模型的映射规则 |
| 跨 Skill | 改 L0 总机封发表、合并/拆分 Skill |

## 不需要确认（`confirm: none`）

- 本地 `npm run dev` / 只读 validate / gate dry-run
- 脚手架输出片段（未写入磁盘）
- 本地缓存（`acceptance/runs/`、浏览器 localStorage）— 但**清缓存前**须告知用户
- 环境变量跳过：`PRICING_SKIP_ONLINE_FETCH=1`

## 确认话术（通用模板）

```text
将 [操作描述]，可能影响 [真源路径/受众]，是否继续？
```
