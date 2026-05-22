# AI 云 · 营销首页

> **唯一维护入口**：[`HomePage.vue`](./HomePage.vue)（模板 + 样式 + 交互；登录用 `@trinity/ui` `TrinityAuthModal`）

本应用为 Vue 单文件实现，静态 HTML 已迁移完毕，**请直接改 `HomePage.vue`**，勿再通过生成脚本从 HTML 覆盖。

## 页面模块

| 锚点 | 内容 |
|------|------|
| 首屏 | 一站式多云采购与管理、渠道优惠与 7×24 支持、集采降本叙事 |
| `#cloud-solutions` | 五云 Tab（GPU / 推理 / 治理叙事） |
| `#why` | 顶部降本条+四指标 / 核心模式三卡 / 四大优势 / 合作价值六点 |
| `#benefits` | 专属福利三栏对比（服务项目 / Trinity / 厂商直销） |
| `#process` | 优惠购买五步流程 |
| `#cloud` | AI 云服务四卡（纳管 / GPU / 成本 / 合规） |
| `#arch` | 架构优势 |
| `#promo` | 限时优惠 |
| `#consult` | 咨询表单（邮箱 + 电话）+ 侧栏联系方式 |

## 路由

| path | name |
|------|------|
| ``（`/ai-cloud`） | `aic-home` |

登录 / OAuth 演示提交后进入 `aic-account-console#accounts`。
