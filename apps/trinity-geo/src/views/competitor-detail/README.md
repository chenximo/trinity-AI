# competitor-detail · 竞品详情

| 项 | 值 |
|---|---|
| 路由 | `geo-competitor-detail` → `/console/competitor-detail?id=` |
| 原型 | `trinity-geo-prototype/marketing/console/competitor-detail.html` |
| 侧栏 nav | `competitors` |

## 五件套

- `CompetitorDetailPage.vue` — 主模板
- `mock.ts` — openrouter / tokenhub / litellm / siliconflow 样本
- `competitorDetailInteractions.ts` — 读取 `route.query.id`
- `competitor-detail.css` — 链接等增量样式
- `README.md`

## Query 参数

| `?id=` | 样本 |
|--------|------|
| `openrouter`（默认） | Q00 首推占位 |
| `tokenhub` | 国内大厂网关 |
| `litellm` | 开源备选 |
| `siliconflow` | 国产推理平台 |

## 下游链接

- `geo-competitors`、`geo-competitors-manage`
- `geo-keyword-detail`、`geo-answer-detail`
