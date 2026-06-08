# trinity-docs · 领域边界

## 本 Skill 管什么

- `apps/trinity-docs/**` 对外开发者文档（中/英）
- OpenRouter 版式对齐、三轨 IA（文档 / API / cookbook）
- 侧栏 `sidebars.ts`、build、`docs:en-mirror`
- 发布前对照工程师 `API对外接口支持参数.md`

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| 产品手册 `trinity-product` | `trinity-product-handbook` |
| 内测验收台、用例 JSON、Chat API Test | `trinity-api-acceptance` |
| 工程师参数 md 真源（先改契约再同步 docs） | 工程师 md → 本 Skill 写入对外页 |
| Vue apps 业务实现 | `trinity-vue-prototype-monorepo` |

## 防火墙

- **禁止**写入对外正文：站内路径、内测用语、未开放能力、产品手册叙事
- `developer-docs.roadmap.yml` 记未开放进度，**不**写进对外 md
