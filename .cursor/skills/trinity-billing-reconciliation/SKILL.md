---
name: trinity-billing-reconciliation
description: >-
  Trinity 上游账单核对：用后台导出的平台成本/Token，对照人工拉取的上游账单（金额+Token），
  生成核对报告；确认通过后由人回填管理后台实付。含 L0 量金额闸门、差大时标准日结、
  notes 与报告模板。触发词：账单核对、对账、上游账单、billing-reconciliation、月度对账、
  平台成本、标准日结、腾讯云 AIGC、TokenHub 账单。勿与官方刊例价（trinity-official-pricing）混淆。
  禁止代写管理后台实付。
disable-model-invocation: true
---

# Trinity 上游账单核对 · Agent Skill

## 端到端流程（MUST）

```text
① 后台导出平台侧：账单月、起止、平台成本 USD、平台 Token（入+出+缓）
         ↓
② 人从上游控制台/发票手动拉：实付 ¥ / $、上游 Token（及账单文件）
         ↓
③ 本 Skill / Agent：对比核实 → 生成核对报告（报告先行）
         ↓
④ 人确认报告
         ↓
⑤ 人手动回填管理后台「上游实付」（Skill 默认不写后台）
```

## 读取顺序

```text
SKILL.md → workflows/<task>.md → references/（按需）→ repo 真源
DOMAIN.md、confirmation.md：边界或对外定稿时再 READ
```

边界：[`./DOMAIN.md`](./DOMAIN.md) · 确认：[`./confirmation.md`](./confirmation.md)

---

## 真源（MUST READ）

| 任务 | 必读 |
|------|------|
| 目录约定 | `pricing/billing-reconciliation/README.md` |
| 供应商子目录 | `pricing/billing-reconciliation/<supplier>/README.md` |
| 当月产出 | `…/YYYY-MM/notes.md`、核对报告 |
| 刊例下钻 | 临时封发 `trinity-official-pricing`（本 Skill 不改价目） |

路径：[`./references/source-paths.md`](./references/source-paths.md)

---

## 触发词

`账单核对` · `对账` · `上游账单` · `billing-reconciliation` · `月度对账` · `核对报告` · `腾讯云 AIGC` · `TokenHub 账单`

---

## 分流

| 用户意图 | Workflow |
|----------|----------|
| **默认**：出/改月度核对报告（L0 量+金额） | [`./workflows/generate-report.md`](./workflows/generate-report.md) |
| L0 闸门细则（阈值、差%算法） | [`./workflows/monthly-l0.md`](./workflows/monthly-l0.md) |
| 差大：标准日结 / 月桶 / 疑似测试 | [`./workflows/daily-standard.md`](./workflows/daily-standard.md) |
| 腾讯云 AIGC | [`./workflows/supplier-tencent-aigc.md`](./workflows/supplier-tencent-aigc.md) |
| TokenHub | [`./workflows/supplier-tokenhub.md`](./workflows/supplier-tokenhub.md) |
| 报告文案模板 | [`./references/report-template.md`](./references/report-template.md) |

---

## 硬规则

1. **报告先行、实付后填**：先产出核对报告；**禁止**在未获用户确认时改管理后台实付或冒充已回填。
2. **对账汇率默认 6.5**（上游现金 CNY÷6.5→USD）。禁止只换上游为市价、平台不动后宣称对平。详见 [`references/fx-and-cost.md`](./references/fx-and-cost.md)。
3. **左右勿反**：上游 = 供应商账单；平台 = Trinity 成本；¥ 总额只能写在上游。
4. **L0 必比两样**：花费/成本总额 + 总 Token；先闸门，超阈值再下钻。
5. **Token 口径**：平台默认「入+出+缓」；上游须声明来源；禁止 L2「百万 token」全量混比当对外结论。
6. **标准日结**：单日使用 + 完整扣费时间才可按日比；跨日/`-` → 月桶，禁止均摊下日结论。
7. **图/视频**勿塞进总 Token；另列张/秒或模态。
8. **禁止推测价**：刊例问题链 official-pricing，不得比例脑补缓存/单价。

---

## 收尾检查

- [ ] 报告含：上游金额（$+¥）、平台成本$、双方 Token（或注明缺）、差%、结论
- [ ] 左右未写反；窗口/未完成月已声明
- [ ] 产出写入 `billing-reconciliation/<supplier>/YYYY-MM/`（notes 或 report）
- [ ] **未**代用户改管理后台实付；确认后仅提示「可回填」
- [ ] 差大时已下钻或标明待下钻，未用均摊编造日期
