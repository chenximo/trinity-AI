# 新建模块

> 能力清单：[`../tools.yaml`](../tools.yaml)

## READ

- `Trinity原型模块目录与交付规范.md`（五件套）
- `Trinity前端Vue与Monorepo工程方案.md`

## 能力引用

| 步骤 | tool id |
|------|---------|
| 改 views / 路由 | `monorepo.views.edit` |
| 改 packages | `monorepo.packages.edit` |
| 本地预览 | 见 [`local-preview.md`](./local-preview.md) 各 `monorepo.dev.*` |

## 步骤

1. 定 app：`apps/<name>` 或 `views/<module>`
2. 五件套：说明 · 工程 · 体验 · roadmap/验收 · 附录
3. Mock + TS 类型同源
4. 路由溯源表
5. 产品进度 → `trinity-product` `roadmap.yml`（handbook 协作）

## 检查

- [ ] 依赖方向：ui 不引 app
- [ ] 视觉可对照 `/design-spec`
