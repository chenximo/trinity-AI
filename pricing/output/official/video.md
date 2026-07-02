# 官方价 vs 上游 vs 线上刊例（生视频）

> 生成 2026-07-02T02:36:08Z · 模型 13 个 · 行 13（生文按全档位展开）
> 官方价：`suppliers/official/output/video/vendor-pricing.json`（2026-07-01T04:03:47Z）
> 线上刊例：`output/online/prices-api.json`（2026-06-30T13:38:49Z）
> TokenHub：2026-06-30T03:32:07Z
> 国内 CNY→USD（平台线上一致）：÷6.5 · 粗算参考：÷7.25

| Trinity ID | 原厂模型 | 官方价 | TokenHub | 百炼 | AIGC国内 | 线上刊例 | 官方抓取 | 备注 |
|------------|----------|--------|----------|------|----------|----------|----------|------|
| hy-video-1.5 | hy-video-1.5 | 720p: 1.5 积分/次; 1080p: 3 积分/次 | 720p: 1.5 积分/次; 1080p: 3 积分/次 | — | — | — | seed | TokenHub hy-video-1.5 |
| kl-video-v3 | kl-video-v3 | 统一价: 2.5-25 积分/次 | : 1.8-45 积分/次 | — | — | — | seed | TokenHub kl-video-v3 |
| kl-video-v2-6 | kl-video-v2-6 | 统一价: 2.5-12 积分/次 | : 2.5-12 积分/次 | — | — | — | seed | TokenHub kl-video-v2-6 |
| kl-video-v2-5-turbo | kl-video-v2-5-turbo | 统一价: 1.5-8 积分/次 | : 1.5-5 积分/次 | — | — | — | seed | TokenHub kl-video-v2-5-turbo |
| kl-video-v2-1 | kl-video-v2-1 | 统一价: 1-6 积分/次 | : 2-7 积分/次 | — | — | — | seed | TokenHub kl-video-v2-1 |
| kl-video-v1 | kl-video-v1 | 统一价: 0.5-4 积分/次 | : 1-7 积分/次 | — | — | — | seed | TokenHub kl-video-v1 |
| vd-video-q3-pro | vd-video-q3-pro | 540P: 1-16 积分/次; 720P: 1.5-24 积分/次; 1080P: 2-32 积分/次 | 540P: 0.9-14.4 积分/次; 720P: 2-32 积分/次; 1080P: 2.4-38.4 积分/次 | — | — | — | seed | TokenHub vd-video-q3-pro |
| vd-video-q3-turbo | vd-video-q3-turbo | 540P: 0.7-11.2 积分/次; 720P: 1.2-19.2 积分/次; 1080P: 1.3-20.8 积分/次 | 540P: 0.7-11.2 积分/次; 720P: 1.2-19.2 积分/次; 1080P: 1.3-20.8 积分/次 | — | — | — | seed | TokenHub vd-video-q3-turbo |
| vd-video-q2 | vd-video-q2 | 540P: 0.5-8 积分/次; 720P: 0.8-12.8 积分/次; 1080P: 1-16 积分/次 | 540P: 1-2.8 积分/次; 720P: 1.5-6 积分/次; 1080P: 2-11 积分/次 | — | — | — | seed | TokenHub vd-video-q2 |
| vd-video-q2-turbo | vd-video-q2-turbo | 540P: 0.3-4.8 积分/次; 720P: 0.5-8 积分/次; 1080P: 0.6-9.6 积分/次 | 540P: 0.6-2.4 积分/次; 720P: 0.8-9.8 积分/次; 1080P: 3.5-12.5 积分/次 | — | — | — | seed | TokenHub vd-video-q2-turbo |
| yt-video-2.0 | yt-video-2.0 | 统一价: 2-10 积分/次 | 480p: 2 积分/次; 720p: 5 积分/次; 1080p: 5 积分/次 | — | — | — | seed | TokenHub yt-video-2.0 |
| yt-video-humanactor | yt-video-humanactor | 统一价: 3-15 积分/次 | 720p: 1 积分/s; 1080p: 2 积分/s | — | — | — | seed | TokenHub yt-video-humanactor |
| yt-video-fx | yt-video-fx | 统一价: 1.5-8 积分/次 | 360p: 1~4 积分/次; 720p: 2~6 积分/次 | — | — | — | seed | TokenHub yt-video-fx |

## 说明

- **官方价**：各模型厂商官网文档权威挂牌价（`official` 供应商）
- **TokenHub / 百炼 / AIGC**：Trinity 转售上游挂牌价
- **线上刊例**：`GET /v1/prices` 当前对用户扣费价（USD）
- **生文多档**：每档单独一行，避免只比第一档造成误判（如 glm-5 输入长度档 vs 总 token 档）
- 国内模型线上 USD ≈ 官方 CNY ÷ 6.5（`gen-65` 规则）
- 官网 vs OpenRouter 对比见 `output/openrouter/text.md`
- 对比前请确保已运行 `pricing:supplier:official:{modality}` 与 `pricing:fetch`
- `官方抓取` 为 `未拉取` 表示 map 有映射但尚未写入 vendor-pricing.json
- 生成命令：`npm run pricing:compare:official -- --modality=video`