# Workflow · 价目门禁（L1 → L3 → 告警）

> 治理真源：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`

## 何时跑

- 改 `official/seeds`、`trinity-map`、`tier-key`、AIGC `pricing-sheet` 后
- 发刊例 / 商务调价前
- 定期巡检（建议每周）

## 前置（按需）

```bash
cd trinity-AI

# 官方价
npm run pricing:supplier:official:text

# L2 进货参照（L1 交叉需要）
npm run pricing:supplier:aigc
npm run pricing:supplier:tokenhub:console   # TokenHub CNY 交叉

# L3 转售（L3 校验需要）
npm run pricing:supplier:bailian:doc
```

对比 / 刊例生成会自动 `GET /v1/prices` 刷新 `prices-api.json`（本地可 `PRICING_SKIP_ONLINE_FETCH=1` 跳过）。

## 一条龙

```bash
npm run pricing:gate
```

等价于依次执行：

| 步骤 | 命令 | 层级 |
|------|------|------|
| 1 | `pricing:validate:official-aigc` | **L1** 官方 ↔ AIGC 国内/国际 · TokenHub |
| 2 | `pricing:validate:official-suppliers` | **L3** 官方 ↔ 百炼/转售 |
| 3 | `pricing:alert`（dry-run） | 合并告警 JSON |

## 分项命令

```bash
npm run pricing:validate:official-aigc
npm run pricing:validate:official-suppliers
npm run pricing:alert              # 需 PRICING_ALERT_WEBHOOK_URL 才真正推送
```

## 产出

| 文件 | 说明 |
|------|------|
| `output/validate/official-aigc-cross.{json,md}` | L1 交叉报告 |
| `output/validate/official-vs-suppliers.{json,md}` | L3 交叉报告 |
| `output/validate/official-vs-suppliers-alerts.json` | L3 结构化告警 |
| `output/validate/pricing-alerts.json` | 合并告警（L1+L3） |

## 通过 / 失败语义

| 结果 | 含义 | 动作 |
|------|------|------|
| L1 fail | 官方与 AIGC/TokenHub 不一致，或同族档位不足 | **先修种子 / tierKey / 映射**；确认无误再告警商务 |
| L3 fail | 官方与百炼等转售档位数或价格不一致 | **先查 scrape**；抓取无误再告警厂商商务 |
| `tokenhubNoCoverage` | TokenHub 未上架该模型 | **不 fail**，仅记录 |
| `aigcIntlSkipped` | AIGC 无国际价（如 hy3） | **不 fail**，刊例对比显示 `—` |

## 与对比命令关系

| | `pricing:gate` | `pricing:compare:official` |
|--|----------------|---------------------------|
| 目的 | 阻断错误种子进入下游 | 人读对照表 |
| 含 L4 线上刊例 | ❌ | ✅ |
| 自动刷新线上价 | ❌ | ✅ |

刊例对比见 [`compare-pricing.md`](./compare-pricing.md)。
