# trinity-official-pricing · 边界

## 本 Skill 负责

- `pricing/suppliers/official/**`（catalog、seeds、fetch、output、trinity-map）
- `pricing/pipeline/compare-official-pricing.mjs` 及产出 `output/official/{text,image,video}.*`
- `pricing/docs/OFFICIAL-PRICING-SKILL-DESIGN.md` 设计维护

## 不负责

| 领域 | 归谁 |
|------|------|
| TokenHub / 百炼 / AIGC 爬虫与价目表 | 各 supplier README；仅对比时读取 |
| 线上刊例拉取、`0.65` 草案、全量 diff | `pricing/README.md` 六步流程 |
| Trinity 平台实际上线改价 | 人工决策；本 Skill 只维护真源与对比 |
| 产品手册价目叙事 | `trinity-product-handbook` |
| 对外 API 文档 | `trinity-docs` |

## 与 trinity-api-acceptance 区分

- **api-acceptance**：模型能否调通、验收用例
- **official-pricing**：模型厂商官网**挂牌价**真源与价目对比

用户说「加一个模型」时：验收 → `trinity-api-acceptance`；官方价 → 本 Skill。
