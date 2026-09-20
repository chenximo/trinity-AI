# 价目告警汇总

共 40 条

## 待人工决策

### [warn] peer_price_mismatch · `deepseek-v4-flash`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Deepseek::v4-flash (new) · 标准价: input 50%, output 125%
- **建议**: 查种子或 AIGC 商务价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_price_mismatch · `deepseek-v4-pro`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Deepseek::v4-pro (new) · 标准价: input 50%, output 125.2%, cache 475%
- **建议**: 查种子或 AIGC 商务价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_tier_mismatch · `deepseek-v4-flash`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Deepseek::v4-flash (new) · 标准价: input 50%, output 125%, cache 150%
- **建议**: 查种子或 AIGC 商务价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_tier_mismatch · `deepseek-v4-pro`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Deepseek::v4-pro (new) · 标准价: input 50%, output 125%, cache 500%
- **建议**: 查种子或 AIGC 商务价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_price_mismatch · `deepseek-v4-flash`

- **阶段**: L1_vs_L2
- **标题**: 官方↔TokenHub 价格不一致
- **说明**: 标准价: input 50%, output 125%, cache 150%
- **建议**: 查种子或 TokenHub 价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_price_mismatch · `deepseek-v4-flash-202605`

- **阶段**: L1_vs_L2
- **标题**: 官方↔TokenHub 价格不一致
- **说明**: 标准价: input 50%, output 125%, cache 150%
- **建议**: 查种子或 TokenHub 价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_price_mismatch · `deepseek-v4-pro`

- **阶段**: L1_vs_L2
- **标题**: 官方↔TokenHub 价格不一致
- **说明**: 标准价: input 50%, output 125%, cache 500%
- **建议**: 查种子或 TokenHub 价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] peer_price_mismatch · `deepseek-v4-pro-202606`

- **阶段**: L1_vs_L2
- **标题**: 官方↔TokenHub 价格不一致
- **说明**: 标准价: input 50%, output 125%, cache 500%
- **建议**: 查种子或 TokenHub 价；先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认

### [warn] supplier_price_gap · `glm-5`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入<=32k: cache: 官方=1 百炼=0.8 (25%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入≥32k: cache: 官方=1.5 百炼=1.2 (25%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5.1`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入<=32k: cache: 官方=1.3 百炼=1.2 (8.3%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5.1`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入≥32k: cache: 官方=2 百炼=1.6 (25%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [error] supplier_tier_gap · `minimax-m3`

- **阶段**: L1_vs_L3
- **标题**: 百炼档位数少于官方
- **说明**: 官方 2 档 · 百炼 1 档。官方 keys: t:0-512k, t:512k+；供应商 keys: uniform
- **建议**: 确认 百炼 scrape 完整后，联系商务确认渠道价目

### [warn] listing_price_gap · `qwen-flash`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入≤128k · 入⚠+116.7% 出⚠+73.3% 缓⚠+8.3%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen-turbo`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 标准价 · 入⚠+8.3% 出⚠+116.7% 缓—
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen3.6-flash`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入≤256k · 入⚠+35.4% 出⚠+35.4% 缓⚠-32.3%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen3.6-plus`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入≤256k · 入⚠+62.5% 出⚠+62.5% 缓⚠-18.7%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen3.7-max`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 标准价 · 入⚠+35.4% 出⚠+35.4% 缓⚠-32.3%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen3.7-plus`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入≤256k · 入⚠+30% 出⚠+30% 缓⚠-35%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen3.7-plus`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 256k<输入≤1M · 入⚠+30% 出⚠+30% 缓⚠-35%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `deepseek-v3.2`

- **阶段**: L1_vs_L4
- **标题**: 生文线上档位在官方锚中缺失
- **说明**: 输入≤32k · t:0-32k
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `deepseek-v3.2`

- **阶段**: L1_vs_L4
- **标题**: 生文线上档位在官方锚中缺失
- **说明**: 输入(32k,128k] · t:32k-128k
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `qwen-flash`

- **阶段**: L1_vs_L4
- **标题**: 生文线上档位在官方锚中缺失
- **说明**: 0<Token≤256K · t:0-256k
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

## 已登记例外

- `deepseek-v4-flash` · 百炼同档价格与官方不一致
- `deepseek-v4-flash` · TokenHub同档价格与官方不一致
- `deepseek-v4-flash` · AIGC国内同档价格与官方不一致
- `deepseek-v4-flash-202605` · 百炼同档价格与官方不一致
- `deepseek-v4-flash-202605` · TokenHub同档价格与官方不一致
- `deepseek-v4-pro` · 百炼同档价格与官方不一致
- `deepseek-v4-pro` · TokenHub同档价格与官方不一致
- `deepseek-v4-pro` · AIGC国内同档价格与官方不一致
- `deepseek-v4-pro-202606` · 百炼同档价格与官方不一致
- `deepseek-v4-pro-202606` · TokenHub同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `glm-4-7-251222` · 百炼档位数少于官方