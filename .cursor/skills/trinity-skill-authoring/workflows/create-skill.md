# 新建 Skill

## 1. 定档位

| 条件 | 档位 |
|------|------|
| 流程 ≥3 步 或 高风险 ≥2 类 | **大** |
| CLI/命令 ≥5 个、多 workflow 复用 | **大** + **`tools.yaml`** |
| 2～3 个主流程 | **中** |
| 单流程 / 硬约束 | **小** |

READ [`./references/skill-template.md`](./references/skill-template.md) · 架构 [`../docs/SKILL-ARCHITECTURE-DESIGN.md`](../docs/SKILL-ARCHITECTURE-DESIGN.md)

## 2. 写 SKILL.md

1. frontmatter：`name`、`description`（触发词）、`disable-model-invocation: true`
2. 顶部：读取顺序（含 `tools.yaml` 若有大 Skill）
3. 真源指针表（链 repo md，不贴全文）
4. 分流表 → 对应 `workflows/`
5. Hard rules ≤10 条
6. 收尾检查清单

## 3. 写 DOMAIN.md

- 管什么 / 不管什么（表格式）
- 与 2～3 个最易混用的 Skill 划界

## 4. 按需补齐

- **`tools.yaml`**：命令密集 Skill 必填（见架构 §3）
- `workflows/`：引用 tool id，不重复命令表
- `confirmation.md`：链 [`../common/confirmation.md`](../common/confirmation.md) + 领域特例；与 `confirm: required` 对齐
- `references/`：模板、真源路径表
- `tools/*.md`：单能力长文（可选，非 manifest）

## 5. 注册与校验

1. 更新 L0 `.cursor/skills/SKILL.md` 封发表
2. 更新 `./README.md` 一行
3. 跑 [`./references/review-checklist.md`](./references/review-checklist.md)
4. `npm run skill:lint:tools`（有 tools.yaml 时）
