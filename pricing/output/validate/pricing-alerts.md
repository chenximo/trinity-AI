# 价目告警汇总

共 37 条

## 待处理

### [warn] peer_price_mismatch · `gpt-5.3-codex`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: OO::5.3-codex · 标准价: cache -2.8%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [warn] peer_price_mismatch · `claude-opus-4-8`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: CD::Opus 4.5 · 标准价: cache missing%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [warn] peer_price_mismatch · `deepseek-v3.2`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Deepseek::v3.2 · 标准价: cache -0.7%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [warn] peer_price_mismatch · `deepseek-v4-pro`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Deepseek::v4-pro (new) · 标准价: cache -3.8%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [warn] peer_price_mismatch · `glm-4-7-251222`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Zhipu::4.7 · 输入≤32k，输出≤0.2k: cache -0.7%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [warn] peer_price_mismatch · `minimax-m2.5`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Minimax::M2.5 · 标准价: input 7.7%, output 7.7%, cache 7.7%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [warn] peer_price_mismatch · `minimax-m2.7`

- **阶段**: L1_vs_L2
- **标题**: 官方↔AIGC 价格不一致
- **说明**: Minimax::M2.7 · 标准价: input 7.7%, output 7.7%, cache 7.7%
- **建议**: 查种子或 AIGC 商务价；无误后确认商务

### [error] supplier_tier_gap · `hy3-preview`

- **阶段**: L1_vs_L3
- **标题**: AIGC国内缺少官方档位 t:idx-0
- **说明**: 官方有档 t:idx-0，AIGC国内 无同档
- **建议**: 查 scrape；无误后联系 AIGC国内 商务

### [warn] supplier_price_gap · `hy-mt2-lite`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=0.3 TokenHub=null; output: 官方=1.2 TokenHub=null
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `hy-mt2-plus`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=0.5 TokenHub=null; output: 官方=2 TokenHub=null
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `hy-mt2-pro`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=0.5 TokenHub=null; output: 官方=2 TokenHub=null
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `hy-role`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=2.4 TokenHub=null; output: 官方=9.6 TokenHub=null
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `deepseek-v4-flash`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.02 百炼=0.2 (-90%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `deepseek-v4-flash`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.02 TokenHub=0.2 (-90%)
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `deepseek-v4-flash-202605`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.02 百炼=0.2 (-90%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `deepseek-v4-pro`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: input: 官方=3 百炼=12 (-75%); output: 官方=6 百炼=24 (-75%); cache: 官方=0.025 百炼=2.4 (-99%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `deepseek-v4-pro`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=3 TokenHub=12 (-75%); output: 官方=6 TokenHub=24 (-75%); cache: 官方=0.025 TokenHub=1 (-97.5%)
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `deepseek-v4-pro-202606`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: input: 官方=3 百炼=12 (-75%); output: 官方=6 百炼=24 (-75%); cache: 官方=0.025 百炼=2.4 (-99%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `qwen3.5-plus`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入≤128k: cache: 官方=0.08 百炼=0.16 (-50%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [error] supplier_tier_gap · `qwen3.5-plus`

- **阶段**: L1_vs_L3
- **标题**: 百炼缺少官方档位 t:128k-256k
- **说明**: 官方有档 t:128k-256k，百炼 无同档
- **建议**: 查 scrape；无误后联系 百炼 商务

### [warn] supplier_price_gap · `qwen3.5-flash`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入≤128k: cache: 官方=0.02 百炼=0.04 (-50%)
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [error] supplier_tier_gap · `qwen-plus`

- **阶段**: L1_vs_L3
- **标题**: 百炼缺少官方档位 t:128k-256k
- **说明**: 官方有档 t:128k-256k，百炼 无同档
- **建议**: 查 scrape；无误后联系 百炼 商务

### [error] supplier_tier_gap · `qwen3.6-plus`

- **阶段**: L1_vs_L3
- **标题**: 百炼缺少官方档位 t:256k-1m
- **说明**: 官方有档 t:256k-1m，百炼 无同档
- **建议**: 查 scrape；无误后联系 百炼 商务

### [error] supplier_tier_gap · `qwen3.7-plus`

- **阶段**: L1_vs_L3
- **标题**: 百炼缺少官方档位 t:256k-1m
- **说明**: 官方有档 t:256k-1m，百炼 无同档
- **建议**: 查 scrape；无误后联系 百炼 商务

### [error] supplier_tier_gap · `glm-4-7-251222`

- **阶段**: L1_vs_L3
- **标题**: 百炼档位数少于官方
- **说明**: 官方 3 档 · 百炼 2 档。官方 keys: t:in32k-out-le0.2k, t:in32k-out-gt0.2k, t:32k+；供应商 keys: t:0-32k, t:32k+
- **建议**: 确认 百炼 scrape 完整后，联系商务确认渠道价目

### [warn] supplier_price_gap · `glm-4-7-251222`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入>32k: cache: 官方=0.8 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入<=32k: cache: 官方=1 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5.1`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 输入<=32k: cache: 官方=1.3 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5.2`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=2 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `glm-5.2`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=8 TokenHub=null; output: 官方=28 TokenHub=null; cache: 官方=2 TokenHub=null
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `kimi-k2.5`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.7 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `kimi-k2.6`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=1.1 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `kimi-k2.7-code`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=1.3 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `kimi-k2.7-code`

- **阶段**: L1_vs_L3
- **标题**: TokenHub同档价格与官方不一致
- **说明**: 标准价: input: 官方=6.5 TokenHub=null; output: 官方=27 TokenHub=null; cache: 官方=1.3 TokenHub=null
- **建议**: 查 TokenHub 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `minimax-m2.5`

- **阶段**: L1_vs_L3
- **标题**: 百炼同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.21 百炼=null
- **建议**: 查 百炼 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `minimax-m2.5`

- **阶段**: L1_vs_L3
- **标题**: AIGC国内同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.21 AIGC国内=null
- **建议**: 查 AIGC国内 抓取与 normalize；无误后联系商务

### [warn] supplier_price_gap · `minimax-m2.7`

- **阶段**: L1_vs_L3
- **标题**: AIGC国内同档价格与官方不一致
- **说明**: 标准价: cache: 官方=0.42 AIGC国内=null
- **建议**: 查 AIGC国内 抓取与 normalize；无误后联系商务
