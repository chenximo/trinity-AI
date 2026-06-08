# 新建 Skill

## 1. 定档位

| 条件 | 档位 |
|------|------|
| 流程 ≥3 步 或 高风险 ≥2 类 | **大** |
| 2～3 个主流程 | **中** |
| 单流程 / 硬约束 | **小** |

READ `./references/skill-template.md` 选目录结构。

## 2. 写 SKILL.md

1. frontmatter：`name`、`description`（触发词）、`disable-model-invocation: true`
2. 顶部：读取顺序
3. 真源指针表（链 repo md，不贴全文）
4. 分流表 → 对应 `workflows/`
5. Hard rules ≤10 条
6. 收尾检查清单

## 3. 写 DOMAIN.md

- 管什么 / 不管什么（表格式）
- 与 2～3 个最易混用的 Skill 划界

## 4. 按需补齐

- `workflows/`：每个主意图一个文件
- `confirmation.md`：提交、删除、覆盖、全局变更
- `references/`：模板、真源路径表

## 5. 注册

1. 更新 L0 `.cursor/skills/SKILL.md` 封发表
2. 更新 `./README.md` 一行
3. 跑 `./references/review-checklist.md`
