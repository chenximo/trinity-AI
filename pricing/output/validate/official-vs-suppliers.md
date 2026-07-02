# 官方真源 ↔ 转售渠道（L3）

> 2026-07-02T09:54:27Z

## ⚠ 存在问题

| 指标 | 数量 |
|------|------|
| 对比项（模型×渠道） | 186 |
| 一致 | 31 |
| 有问题（未登记例外） | 28 |
| 渠道无覆盖 | 46 |
| 阻塞告警 | 34 |

### 档位/价格不一致

- `hy3-preview` · **aigc-domestic** · 官方 3 档 / 渠道 3 档 · 2 项
- `hy-mt2-lite` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `hy-mt2-plus` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `hy-mt2-pro` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `hy-role` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `deepseek-v4-flash` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `deepseek-v4-flash` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `deepseek-v4-flash-202605` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `deepseek-v4-pro` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `deepseek-v4-pro` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `deepseek-v4-pro-202606` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `qwen3.5-plus` · **bailian** · 官方 3 档 / 渠道 3 档 · 5 项
- `qwen3.5-flash` · **bailian** · 官方 3 档 / 渠道 3 档 · 3 项
- `qwen-plus` · **bailian** · 官方 3 档 / 渠道 3 档 · 4 项
- `qwen3.6-plus` · **bailian** · 官方 2 档 / 渠道 2 档 · 2 项
- `qwen3.7-plus` · **bailian** · 官方 2 档 / 渠道 2 档 · 2 项
- `glm-4-7-251222` · **bailian** · 官方 3 档 / 渠道 2 档 · 5 项
- `glm-5` · **bailian** · 官方 2 档 / 渠道 2 档 · 2 项
- `glm-5.1` · **bailian** · 官方 2 档 / 渠道 2 档 · 2 项
- `glm-5.2` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `glm-5.2` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `kimi-k2.5` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `kimi-k2.6` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `kimi-k2.7-code` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `kimi-k2.7-code` · **tokenhub** · 官方 1 档 / 渠道 1 档 · 1 项
- `minimax-m2.5` · **bailian** · 官方 1 档 / 渠道 1 档 · 1 项
- `minimax-m2.5` · **aigc-domestic** · 官方 1 档 / 渠道 1 档 · 1 项
- `minimax-m2.7` · **aigc-domestic** · 官方 1 档 / 渠道 1 档 · 1 项

### 告警摘要

- **[error]** supplier_tier_gap · `hy3-preview` · aigc-domestic · AIGC国内缺少官方档位 t:idx-0
- **[warn]** supplier_price_gap · `hy-mt2-lite` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `hy-mt2-plus` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `hy-mt2-pro` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `hy-role` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `deepseek-v4-flash` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `deepseek-v4-flash` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `deepseek-v4-flash-202605` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `deepseek-v4-pro` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `deepseek-v4-pro` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `deepseek-v4-pro-202606` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `qwen3.5-plus` · bailian · 百炼同档价格与官方不一致
- **[error]** supplier_tier_gap · `qwen3.5-plus` · bailian · 百炼缺少官方档位 t:128k-256k
- **[warn]** supplier_price_gap · `qwen3.5-flash` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `qwen3.5-flash` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `qwen3.5-flash` · bailian · 百炼同档价格与官方不一致
- **[error]** supplier_tier_gap · `qwen-plus` · bailian · 百炼缺少官方档位 t:128k-256k
- **[error]** supplier_tier_gap · `qwen3.6-plus` · bailian · 百炼缺少官方档位 t:256k-1m
- **[error]** supplier_tier_gap · `qwen3.7-plus` · bailian · 百炼缺少官方档位 t:256k-1m
- **[error]** supplier_tier_gap · `glm-4-7-251222` · bailian · 百炼档位数少于官方
- **[warn]** supplier_price_gap · `glm-4-7-251222` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `glm-5` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `glm-5` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `glm-5.1` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `glm-5.1` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `glm-5.2` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `glm-5.2` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `kimi-k2.5` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `kimi-k2.6` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `kimi-k2.7-code` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `kimi-k2.7-code` · tokenhub · TokenHub同档价格与官方不一致
- **[warn]** supplier_price_gap · `minimax-m2.5` · bailian · 百炼同档价格与官方不一致
- **[warn]** supplier_price_gap · `minimax-m2.5` · aigc-domestic · AIGC国内同档价格与官方不一致
- **[warn]** supplier_price_gap · `minimax-m2.7` · aigc-domestic · AIGC国内同档价格与官方不一致
