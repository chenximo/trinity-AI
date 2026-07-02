# 评审 Skill

## 1. READ

- 目标 Skill 的 `SKILL.md`、`DOMAIN.md`
- 若有：`tools.yaml`、`confirmation.md`
- L0 封发表对应行
- [`./references/review-checklist.md`](./references/review-checklist.md)
- CLI 型 Skill：[`../docs/SKILL-ARCHITECTURE-DESIGN.md`](../docs/SKILL-ARCHITECTURE-DESIGN.md)

## 2. 查边界

- `DOMAIN.md` 与 L0、README 是否一致
- 是否与邻近 Skill 职责重叠（handbook / api-acceptance / docs 三分尤其重要）

## 3. 查体量

- 小 Skill 是否被过度拆成五件套
- 大 Skill 是否缺 `workflows/` 或 `confirmation.md`
- 命令密集是否缺 `tools.yaml`；workflow 是否仍重复长命令表

## 4. 查真源

- repo 路径是否仍有效
- Skill 内是否重复了应 READ 的规范全文
- `tools.yaml` 的 `command` 是否在 `package.json`（若有）

## 5. 自动化

```bash
npm run skill:lint:tools
# 或单 Skill：
node scripts/lint-skill-tools.mjs --skill=trinity-official-pricing
```

## 6. 输出

评审结论：**通过** / **需改**（列具体文件与条目）
