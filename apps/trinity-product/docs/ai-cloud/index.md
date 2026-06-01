---
title: AI 云
---

# AI 云 · 总览

<ul class="product-metrics">
  <li><strong>5.30</strong><span>商用 v1</span></li>
  <li><strong>6.30</strong><span>商用 v2</span></li>
</ul>

> **工程**：`apps/ai-cloud` · 门户 `/ai-cloud` · COS 演示 `/trinityai-demo/`  
> **对标**：ToB 多云代理营销站 + 企业用户控制台（非运营后台）  
> **原型真源**：`apps/ai-cloud/src/views/home/HomePage.vue` · `apps/ai-cloud/src/views/account/ConsolePage.vue`

## 一句话

企业 **多云采购与管理**：官网讲清渠道优惠与六云能力，注册/登录后进入 **用户控制台** 自助看账号、费用、发票与联系顾问。

## 模块总览

| 模块 | 说明 | 当前已做 | 5.30 能力 | 6.30 能力 | 手册 |
|------|------|:--------:|:---------:|:---------:|------|
| [营销首页](./marketing-home) | 首屏、六云 Tab、优势、福利、流程、咨询 | 🟡 | 🟡 | ⬜ | 已建 |
| [用户控制台](./account-console) | 账号 / 费用 / 发票 / 联系我们 | 🟡 | 🟡 | ⬜ | 已建 |
| 登录 / 注册 | 顶栏弹层 · OAuth · 协议页 | 🟡 | 🟡 | ⬜ | 见营销首页 |
| 壳层与部署 | 门户嵌套 · COS 子路径 · H5 | 🟡 | ⬜ | ⬜ | 见营销首页 |

## 原型与体验

| 环境 | URL |
|------|-----|
| **门户 dev** | [http://127.0.0.1:5173/ai-cloud/](http://127.0.0.1:5173/ai-cloud/) |
| **独立 dev** | [http://127.0.0.1:5202/](http://127.0.0.1:5202/) |
| **COS 演示** | [http://43.159.57.43/trinityai-demo/](http://43.159.57.43/trinityai-demo/) |
| **控制台** | `/ai-cloud/account/console#accounts`（hash 切换面板） |

本地：`npm run dev:ai-cloud` 或 `npm run dev:portal`。

## 5.30 能力主链（草案）

官网可演示 → 咨询可提交 → 登录后进控制台 → 账号列表 + 费用/发票面板可读（mock 或准 live）

## 6.30 能力主链（草案）

六云场景定稿 → 控制台接真 API → 发票/企业对账闭环 → COS 正式域名与白名单

## 相关链接

| 用途 | 路径 |
|------|------|
| 首页工程 README | `apps/ai-cloud/src/views/home/README.md` |
| 控制台工程 README | `apps/ai-cloud/src/views/account/README.md` |
| 产品需求真源 | `docs/03-用户控制台系统/AI云-用户控制台系统-需求理解.md` |
| ToB 协作 skill | `.cursor/skills/trinity-tob-marketing-site/SKILL.md` |
