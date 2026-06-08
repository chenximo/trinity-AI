# 更新产品页

## 1. 判断页型

| 意图 | 页型 | 模板 |
|------|------|------|
| 手册首页 | 站点总览 | `references/template-site-index.md` |
| 业务线全景 | 产品总览 | `references/template-product-overview.md` |
| 用户/平台/运营模块表 | 子总览 | `references/template-sub-overview.md` |
| 单模块说明 | 标准叶子 | `references/template-leaf.md` + 真源 `user/models/list.md` |

## 2. READ

- `产品手册文档规范.md`（§〇 冻结样板）
- 对应模板与站点真源页（防漂移）

## 3. 编辑

- 遵守硬规则：体验/在线四行仅产品总览；叶子五件套含 `roadmap.yml` + `<ProductRoadmap />`
- 长 PRD → `docs/05-产品与PRD/`，叶子附录链出

## 4. 收尾

- 新建模块 → 同步 [`add-sidebar.md`](./add-sidebar.md) + 子总览表一行
- 自检文档规范 §五检查清单
