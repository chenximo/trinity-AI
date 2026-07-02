# Skill 评审检查清单

## 结构

- [ ] 目录名与 `name` 一致
- [ ] 体量档位正确（大/中/小），未过度齐套化
- [ ] `SKILL.md` ≤200 行；更长内容在 `references/` 或 `workflows/`
- [ ] 有 `DOMAIN.md`（小 Skill 可简短）
- [ ] 大/中 Skill 有 `confirmation.md`
- [ ] 有 `workflows/` 时，每个 workflow 对应一个明确用户意图
- [ ] 命令密集（≥5 npm/脚本）时考虑 `tools.yaml`，workflow 引用 tool id 而非重复命令表
- [ ] `confirm: required` 与 `confirmation.md` 条目一致

## 架构（命令密集 Skill）

- [ ] 已读 [SKILL-ARCHITECTURE-DESIGN.md](../../docs/SKILL-ARCHITECTURE-DESIGN.md) 相关章节
- [ ] `tools.yaml` 的 `command` 与 `package.json` scripts 一致（若有）

## 内容

- [ ] `description` 含 **WHEN + 中文触发词**
- [ ] 真源在 repo md / 规范页，Skill 无大段重复 PRD 全文
- [ ] 与邻近 Skill 边界写清，且与 `DOMAIN.md`、L0 封发表一致
- [ ] 默认 `disable-model-invocation: true`；省略须有理由
- [ ] 读取顺序写在 `SKILL.md` 顶部

## 总机

- [ ] L0 `.cursor/skills/SKILL.md` 封发表有对应一行
- [ ] `README.md` 场景表已更新
- [ ] 歧义场景（加模型、更新报告等）在 L0 有消解规则

## 禁止

- [ ] 无 phase 状态机 / BLOCKED 门禁（文档类 Skill）
- [ ] 无第三套口头规范替代 repo 真源
- [ ] 未把 `~/.cursor/skills-cursor/` 内容抄进 repo
