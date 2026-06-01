---
title: 营销首页
---

# 营销首页

::: tip 填写说明
- **5.30 验收** / **6.30 商用** / **当前已做** 用 **✅ 🟡 ⬜**
- 工程真源：`apps/ai-cloud/src/views/home/HomePage.vue`
:::

> **路由**：`aic-home` · 门户 `/ai-cloud` · 独立 `/trinityai-demo/`  
> **静态对照**：原 `TrinityCloud/home.html` 已迁入 Vue，勿再改 HTML 真源

## 原型与体验

| | 链接 |
|--|------|
| **体验地址（门户）** | [http://127.0.0.1:5173/ai-cloud/](http://127.0.0.1:5173/ai-cloud/) |
| **体验地址（COS）** | [http://43.159.57.43/trinityai-demo/](http://43.159.57.43/trinityai-demo/) |

## 页面区块（锚点）

| 锚点 / 区块 | 内容摘要 | 当前已做 |
|-------------|----------|:--------:|
| 首屏 Hero | 一站式多云采购与管理、渠道优惠与专属支持 | 🟡 |
| `#cloud-solutions` | 六云 Tab（阿里/腾讯/华为/AWS/Azure/GCP）+ 场景 mockup | 🟡 |
| `#why` | 降本条、三大零承诺、四大赋能、合作价值 | 🟡 |
| `#benefits` | 专属福利三栏对比（服务 / Trinity / 厂商直销） | 🟡 |
| `#process` | 优惠购买五步流程 | 🟡 |
| `#consult` | 咨询表单（邮箱、电话、需求规模） | 🟡 |
| 顶栏 | AI 云 ▾ 六厂商直达、登录/注册（`TrinityAuthModal`） | 🟡 |
| 页脚 | 品牌、链接、合规 | 🟡 |

## 子能力清单

| 子能力 | 5.30 验收 | 6.30 商用 | 当前已做 | 说明 |
|--------|:---------:|:---------:|:--------:|------|
| 六云 Tab + 场景配图 | 🟡 | ⬜ | 🟡 | `*CloudSceneVisual.vue` |
| H5 适配（Tab 滚动、Hero、福利卡） | ⬜ | ⬜ | 🟡 | `max-width: 899px` 降级 |
| 咨询 FormSubmit 发信 | ⬜ | ⬜ | 🟡 | 默认 `starsea@trinitydesk.com` |
| 登录成功跳转控制台 | ⬜ | ⬜ | 🟡 | → `#accounts` |
| COS `/trinityai-demo/` 部署 | ⬜ | ⬜ | 🟡 | build 已支持，联调中 |

## 5.30 验收（草案）

- [ ] 六云 Tab 与场景 mockup 可浏览（桌面 + 移动基本可用）
- [ ] 咨询表单可提交（FormSubmit 或 mailto 兜底）
- [ ] 顶栏登录/注册弹层与协议页可演示

## 6.30 商用（草案）

- [ ] 配图与文案产品签字冻结一版
- [ ] 咨询走正式域名 / 自有后端，非第三方表单
- [ ] COS 正式环境与反代路径验收通过

## 关联

| 模块 | 关系 |
|------|------|
| [用户控制台](./account-console) | 登录后 `#accounts` |
| AI API 聚合平台 | 分轨业务，顶栏可互跳 |
