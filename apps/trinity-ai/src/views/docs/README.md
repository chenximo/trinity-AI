# 文档中心模块（过渡）

> **文档站真源方案**（Markdown + VitePress + 二期运营后台）：  
> [`docs/04-工程与迁移/Trinity文档站方案-VitePress与运营后台.md`](../../../../docs/04-工程与迁移/Trinity文档站方案-VitePress与运营后台.md)  
> 目录与五件套约定：[`docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`](../../../../docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md)

## 1. 一句话

本目录为 **`tai-docs` 路由占位**（侧栏 + 页内章节演示）；**正式文档站**将迁至 **`apps/trinity-docs`（VitePress）**，内容真源为 **`.md`**，二期由 **`trinity-ai-admin` · `admin-docs`** 上传/发布 md 并触发构建。上线文档站后，本模块改为 **外链跳转** 或删除，避免双轨维护。

## 2. 五件套（本目录仅五个文件）

| 文件 | 职责 |
|------|------|
| `DocsPage.vue` | 路由入口 `tai-docs`（过渡 UI） |
| `docs.css` | 模块增量样式 |
| `docsInteractions.ts` | 页内锚点、`hash` 同步 |
| `mock.ts` | **仅过渡期**章节数据；**非**正式文档真源 |
| `README.md` | 本说明 |

## 3. 路由

| 路径（独立 `trinity-ai`） | 路由 name | 说明 |
|---------------------------|-----------|------|
| `/docs` | `tai-docs` | 懒加载；文档站就绪后改为跳转 VitePress |

## 4. 目标态（见仓库级方案文档）

| 角色 | 路径 |
|------|------|
| 用户可见文档站 | `apps/trinity-docs` + VitePress |
| 内容格式 | `docs/**/*.md`（一期 Git；二期后台发布构建） |
| 运营编辑 | `apps/trinity-ai-admin/src/views/admin-docs/` |
| 静态对照 | `TrinityAI/app/docs.html` |

## 5. 接 API / 正式开发

**用户站不再接「读文档正文 API」**；若接 API，仅用于二期 **构建流水线**拉取已发布 md，而非 `DocsPage` 渲染。

1. 搭建 `apps/trinity-docs` 后，顶栏「文档」链到文档站 URL。  
2. 本目录 `mock.ts` / 模板正文删除或改为 `RouterLink` 外链。  

## 6. 参考

- [Trinity文档站方案-VitePress与运营后台.md](../../../../docs/04-工程与迁移/Trinity文档站方案-VitePress与运营后台.md)
- [TrinityAI用户站Vue还原计划.md](../../../../docs/04-工程与迁移/TrinityAI用户站Vue还原计划.md) 阶段 D

## 二次开发补充

无
