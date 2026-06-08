# trinity-vue-prototype-monorepo · 领域边界

## 本 Skill 管什么

- `apps/*`、`packages/*` Monorepo 结构与依赖方向
- 五件套交付、Mock 契约、路由溯源
- 双仓协作、消费原型、本地预览命令
- 新建模块脚手架（非领域 UI 细则）

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| 产品手册 docs | `trinity-product-handbook` |
| 验收台 acceptance | `trinity-api-acceptance` |
| 对外 docs | `trinity-docs` |
| 用户控制台规则 ID | `trinity-user-console` |
| 运营后台列表 | `trinity-admin-ruoyi-list` |
| 营销页模块 | `trinity-tob-marketing-site` |
| 全局 token 定义 | `trinity-design-tokens` |

## 二次封发

实现具体页面时叠加领域 Skill：console 页 → `trinity-user-console`；admin 列表 → `trinity-admin-ruoyi-list`；营销首页 → `trinity-tob-marketing-site`。

## 双仓

- 文档真源：`trinity-AI/docs/04-工程与迁移/…`
- 原型代码可能在 `TrinityAI-web`；push/消费见 `双仓协作与原型交付.md`
