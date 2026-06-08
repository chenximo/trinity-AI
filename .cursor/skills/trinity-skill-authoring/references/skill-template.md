# Skill 目录模板

## 大 Skill（流程 ≥3 步 或 高风险操作 ≥2 类）

```
.cursor/skills/<skill-name>/
├── SKILL.md              # 入口：分流 + 真源指针 + 读取顺序
├── DOMAIN.md             # 边界真源（不管什么、交给谁）
├── references/           # 模板、真源路径表、分场景长文
├── workflows/            # 按任务拆分的执行步骤
├── confirmation.md       # 须用户确认的操作
└── tools/                # 可选：可执行脚本说明（验收类）；优先用 scripts/ 放脚本
```

适用：`trinity-api-acceptance`、`trinity-product-handbook`、`trinity-vue-prototype-monorepo`

## 中 Skill（2～3 个主流程）

```
.cursor/skills/<skill-name>/
├── SKILL.md
├── DOMAIN.md
├── references/           # 可选
├── workflows/            # 1～3 个
└── confirmation.md
```

适用：`trinity-docs`、`trinity-user-console`、`trinity-tob-marketing-site`

## 小 Skill（单流程或硬约束为主）

```
.cursor/skills/<skill-name>/
├── SKILL.md              # 含「与其它 Skill 边界」一节
└── DOMAIN.md             # 简短边界即可
```

适用：`trinity-design-tokens`、`trinity-admin-ruoyi-list`

## SKILL.md 读取顺序（写在正文顶部）

```text
SKILL.md → workflows/<task>.md（按分流）→ references/（按需）→ repo 真源 md
DOMAIN.md、confirmation.md：封发确认或边界争议时再 READ，不要每轮全读。
```

## frontmatter 约定

```yaml
---
name: kebab-case-id          # 与目录名一致
description: >-              # WHAT + WHEN + 触发词 + 勿混用
disable-model-invocation: true   # 子 Skill 默认 true；仅 L0 总机省略
---
```
