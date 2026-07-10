# 价目告警汇总

共 16 条

## 待人工决策

### [warn] supplier_price_gap · `glm-5`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入<=32k: cache: 官方=1 百炼=0.8 (25%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5.1`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入<=32k: cache: 官方=1.3 百炼=1.2 (8.3%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [error] supplier_tier_gap · `minimax-m3`

- **阶段**: L1_vs_L3
- **标题**: 百炼档位数少于官方
- **说明**: 官方 2 档 · 百炼 1 档。官方 keys: res:sub-1k, res:sub-1k；供应商 keys: uniform
- **建议**: 确认 百炼 scrape 完整后，联系商务确认渠道价目

### [warn] listing_tier_gap · `deepseek-v3.2`

- **阶段**: L1_vs_L4
- **标题**: 生文线上档位在官方锚中缺失
- **说明**: 输入≤32k · t:0-32k
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `vidu-q2`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例与官方草案不一致
- **说明**: 4k · 线上 $0.141923 vs 草案 $0.161538 (13.8%) · 涨价
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `vidu-q2-pro`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例与官方草案不一致
- **说明**: 1080p · 线上 $0.138462 vs 草案 $0.043103 (-68.9%) · 降价
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `vidu-q2-turbo`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例与官方草案不一致
- **说明**: 1080p · 线上 $0.036154 vs 草案 $0.072308 (100%) · 涨价
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `vidu-q3-pro`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例与官方草案不一致
- **说明**: 1080p · 线上 $0.075 vs 草案 $0.15 (100%) · 涨价
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `vidu-q3-turbo`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例与官方草案不一致
- **说明**: 1080p · 线上 $0.035 vs 草案 $0.07 (100%) · 涨价
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

## 已登记例外

- `deepseek-v4-flash` · 百炼同档价格与官方不一致
- `deepseek-v4-flash-202605` · 百炼同档价格与官方不一致
- `deepseek-v4-pro` · 百炼同档价格与官方不一致
- `deepseek-v4-pro-202606` · 百炼同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `glm-4-7-251222` · 百炼档位数少于官方