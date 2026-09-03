# 路由与 HTML 原型对照

独立 app 基址：`http://localhost:5203` · 门户：`/trinity-geo/console/*`

| Vue 路由 name | 路径（独立 app） | HTML 原型 |
|---------------|------------------|-----------|
| `trinity-geo` | `/` | `marketing/index.html` |
| `geo-dashboard` | `/console` | `marketing/console/dashboard.html` |
| `geo-citations` | `/console/citations` | `marketing/console/citations.html` |
| `geo-sentiment` | `/console/sentiment` | `marketing/console/sentiment.html` |
| `geo-monitoring` | `/console/monitoring` | `marketing/console/monitoring.html` |
| `geo-keywords` | `/console/keywords` | `marketing/console/keywords.html` |
| `geo-keyword-detail` | `/console/keyword-detail?q=Q00` | `marketing/console/keyword-detail.html` |
| `geo-answer-detail` | `/console/answer-detail?id=Q00-doubao` | `marketing/console/answer-detail.html` |
| `geo-answer-detail-brand` | `/console/answer-detail-brand` | `marketing/console/answer-detail-brand.html` |
| `geo-competitors` | `/console/competitors` | `marketing/console/competitors.html` |
| `geo-competitors-manage` | `/console/competitors-manage` | `marketing/console/competitors-manage.html` |
| `geo-competitor-detail` | `/console/competitor-detail?id=openrouter` | `marketing/console/competitor-detail.html` |
| `geo-diagnosis` | `/console/diagnosis` | `marketing/console/diagnosis.html` |
| `geo-audit` | `/console/audit` | `marketing/console/audit.html` |
| `geo-audit-reports` | `/console/audit-reports` | `marketing/console/audit-reports.html` |
| `geo-optimize` | `/console/optimize` | `marketing/console/optimize.html` |
| `geo-optimize-detail` | `/console/optimize-detail?id=opt-s1s2` | `marketing/console/optimize-detail.html` |
| `geo-verify` | `/console/verify` | `marketing/console/verify.html` |
| `geo-reports` | `/console/reports` | `marketing/console/reports.html` |
| `geo-report-preview` | `/console/report-preview` | `marketing/console/report-preview.html` |
| `geo-settings-brand` | `/console/brand-settings` | `marketing/console/brand-settings.html` |
| `geo-settings-account` | `/console/settings-account` | `marketing/console/settings-account.html` |
| `geo-settings-notifications` | `/console/settings-notifications` | `marketing/console/settings-notifications.html` |

门户路径在以上路径前加 `/trinity-geo` 前缀（如 `/trinity-geo/console/citations`）。

仍走 HTML 原型：`trinity-geo-product`、`trinity-geo-pricing` → `__geo_marketing`。

实现清单见各 `src/views/*/README.md`；路由真源：`src/geoRoutes.ts`。
