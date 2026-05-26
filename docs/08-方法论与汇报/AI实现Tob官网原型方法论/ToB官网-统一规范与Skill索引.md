# ToB 官网原型 · 统一规范与 Skill 索引

> **文档状态**：方法论（与 Agent Skill 配套）  
> **Agent 操作手册（执行入口）**：`.cursor/skills/trinity-tob-marketing-site/SKILL.md`  
> **一句话**：ToB 营销页 = **设计 token + 版式 + 组件 + 页面模块 + 配图子流程 + 工程部署** 统一由 **一个 Skill** 调度，细则仍落在 Trinity 全局色板与 Monorepo 规范。

---

## 1. 为什么要「一个 Skill」？

| 只有 scattered 文档 | 统一 `trinity-tob-marketing-site` Skill |
|---------------------|----------------------------------------|
| 每次派活重复贴色板、15%、按钮类名 | 任务写「ToB 官网规范」即自动读检查清单 |
| 配图、Hero、页脚各说各话 | 模块字典 + 方案矩阵子流程在同一入口 |
| 易与控制台/后台规范混淆 | Skill 描述里写明 **何时用 / 何时不用** |

Skill **不是**替代 `trinity-design-tokens` / `trinity-vue-prototype-monorepo`，而是 **编排层**：先定范围 → 再叠全局规范 → 再进专题（如方案矩阵配图）。

```text
用户派活
    ↓
trinity-tob-marketing-site（本目录 + 检查清单）
    ↓
├── trinity-design-tokens（色、按钮、弹窗、禁止魔法色）
├── trinity-vue-prototype-monorepo（apps 结构、Mock、packages）
└── AI实现Tob官网原型方法论/（方案矩阵配图 + ref-01 参考图）
```

---

## 2. 需要统一哪些维度？（清单）

除你提到的 **色板、字体** 外，ToB 营销页建议 **一并纳入**：

| 维度 | 统一什么 | 真源 |
|------|----------|------|
| **A. 色板与主题** | 主色、渐变 CTA、表面层级、暗色 token | `assets/trinity-base.css`、`/design-tokens` |
| **B. 字体与字阶** | Inter + Noto Sans SC；营销页 px 字阶（display / title / body…） | `Trinity版式与视觉规范.md` §1.3；AI 云 `--home-font-*` |
| **C. 版式与留白** | 顶栏/页脚 50px；正文区 15%；section 间距；bento 栅格 | `Trinity版式与视觉规范.md` §2；`HomePage.vue` |
| **D. 组件形态** | 主/次按钮、顶栏导航、Tab、表单字段、登录弹窗、页脚 | `design-spec`；`@trinity/ui` |
| **E. 页面模块** | Hero、四宫格、方案矩阵、why、bento、福利、流程、咨询、页脚 | AI 云 `HomePage` 锚点表 |
| **F. 方案矩阵配图** | 叠卡 UI 场景 mockup；参考图 ref-01；六 Tab 等高 | 本目录 `ToB官网-方案矩阵…` + `方案矩阵配图-参考图/` |
| **G. 工程** | Vue 单文件/组件化、门户路由、COS `base` 子路径、SPA 回退 | `apps/ai-cloud` README；`vite.config` `VITE_APP_BASE` |
| **H. 原型边界** | 无真实 API、咨询表单占位、不改未要求模块 | Skill 内 NEVER 规则 |

**排版** 已含在 **B + C**：字阶（字号/字重/行高）+ 栏外距（50px / 15%）+ 区块栅格，不要与「版式」拆成两套口头规范。

---

## 3. Skill 与现有规范的关系

| 层级 | 文件 | 角色 |
|------|------|------|
| **编排** | `.cursor/skills/trinity-tob-marketing-site/SKILL.md` | ToB 营销页 **唯一入口**（模块 + 规则 ID + 派活模板） |
| **全局色/UI** | `.cursor/skills/trinity-design-tokens/SKILL.md` | 色板、按钮、形式 2 筛选、弹窗 |
| **工程** | `.cursor/skills/trinity-vue-prototype-monorepo/SKILL.md` | Monorepo、app 命名、Mock |
| **控制台** | `.cursor/skills/trinity-user-console/SKILL.md` | **不**用于营销首页 |
| **运营后台** | `.cursor/skills/trinity-admin-ruoyi-list/SKILL.md` | **不**用于营销首页 |
| **规则常驻** | `.cursor/rules/trinity-design-spec-first.mdc` | 所有 UI 任务默认对齐 design-spec |

---

## 4. 怎么用（给人 / 给 PM）

**给 Agent（推荐）**

```
按 ToB 官网规范，只改 #cloud-solutions 阿里云 Tab 左侧配图；
参考 ref-01；场景：双11、架构师对话、费用看板。
```

或：

```
遵循 trinity-tob-marketing-site，检查 AI 云首页是否符合 15% 正文与字阶 token。
```

**给人自学**

1. 读本目录 [README.md](./README.md)  
2. 读 [ToB官网-统一规范与Skill索引.md](./ToB官网-统一规范与Skill索引.md)（本文）  
3. 配图专项 → [ToB官网-方案矩阵导览区配图协作方法论.md](./ToB官网-方案矩阵导览区配图协作方法论.md)  

---

## 5. 后续扩展（仍挂本目录）

| 待补文档（可选） | 内容 |
|------------------|------|
| `ToB官网-Hero与首屏规范.md` | 轨道动效、统计 pill、CTA 层级 |
| `ToB官网-咨询表单与转化.md` | `#consult` 字段、校验、与 COS 静态站 |
| `design-spec` 营销页专节 | 浏览器验收用可点击样例 |

扩展时：**先改 Skill 一条规则 ID + 模块字典一行**，再写长文，避免 Skill 与文档脱节。
