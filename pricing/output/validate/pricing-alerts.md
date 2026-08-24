# 价目告警汇总

共 92 条

## 待人工决策

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
- **说明**: 官方 2 档 · 百炼 1 档。官方 keys: res:sub-1k, res:sub-1k；供应商 keys: uniform
- **建议**: 确认 百炼 scrape 完整后，联系商务确认渠道价目

### [warn] listing_price_gap · `gpt-5.6-luna`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入>272K context · 入⚠-50% 出⚠-33.3% 缓⚠-50%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `gpt-5.6-sol`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入>272K context · 入⚠-50% 出⚠-33.3% 缓⚠-50%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `gpt-5.6-terra`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入>272K context · 入⚠-50% 出⚠-33.3% 缓⚠-50%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `minimax-m3`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入>512k · 入⚠-50% 出⚠-50% 缓⚠-50%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen-flash`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 输入≤128k · 入⚠+116.7% 出⚠+73.3% 缓⚠+8.3%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_price_gap · `qwen-max`

- **阶段**: L1_vs_L4
- **标题**: 生文刊例与官方锚不一致
- **说明**: 标准价 · 入⚠+333.3% 出⚠+333.3% 缓—
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
- **说明**: 256k<输入≤1M · 入⚠-56.7% 出⚠-56.7% 缓⚠-78.3%
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `deepseek-v3.2`

- **阶段**: L1_vs_L4
- **标题**: 生文线上档位在官方锚中缺失
- **说明**: 输入≤32k · t:0-32k
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `gemini-2.5-flash-image`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: — · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `gemini-3.1-flash-image`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: — · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `gemini-3.1-flash-lite-image`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: — · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `gpt-image-2`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: — · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq2-image`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: 1k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq2-image`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: 2k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq2-image`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例缺档
- **说明**: 4k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_official_coverage_gap · `Kling-2.1`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例未覆盖官网档位
- **说明**: 官网有「图生图 · 1K」，Trinity 刊例未挂该能力档
- **建议**: 对照 klingai.com/document-api/pricing/base/image 等官网价目，补齐 Trinity 能力/分辨率刊例；或确认下架

### [warn] listing_official_coverage_gap · `Kling-2.1`

- **阶段**: L1_vs_L4
- **标题**: 生图刊例未覆盖官网档位
- **说明**: 官网有「图生图 · 2K」，Trinity 刊例未挂该能力档
- **建议**: 对照 klingai.com/document-api/pricing/base/image 等官网价目，补齐 Trinity 能力/分辨率刊例；或确认下架

### [warn] listing_tier_gap · `grok-imagine-video-1.5`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `grok-imagine-video-1.5`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `grok-imagine-video-1.5`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.0`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.0`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.0`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.0-video-edit`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.0-video-edit`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.1`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.1`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `happyhorse-1.1`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `minimax-h3`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 2k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `minimax-h3`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 768p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-fast-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-fast-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-mini-overseas-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-mini-overseas-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 4k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-overseas-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-overseas-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 4k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-overseas-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 480p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `seedance-2.0-overseas-hc-os`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 4k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1-fast`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1-fast`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 4k · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1-fast`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1-lite`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `veo-3.1-lite`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 540p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-mix`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-mix`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-pro`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-pro`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 540p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-pro`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-pro-fast`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-pro-fast`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-turbo`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-turbo`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 540p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `viduq3-turbo`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.6`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.6`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.6-flash`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.6-flash`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.7`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.7`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.7-videoedit`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 1080p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

### [warn] listing_tier_gap · `wan2.7-videoedit`

- **阶段**: L1_vs_L4
- **标题**: 生视频刊例缺档
- **说明**: 720p · 线上/草案缺项
- **建议**: 需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑

## 已登记例外

- `deepseek-v4-flash` · 百炼同档价格与官方不一致
- `deepseek-v4-flash-202605` · 百炼同档价格与官方不一致
- `deepseek-v4-pro` · 百炼同档价格与官方不一致
- `deepseek-v4-pro-202606` · 百炼同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-plus` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `qwen3.5-flash` · 百炼同档价格与官方不一致
- `glm-4-7-251222` · 百炼档位数少于官方