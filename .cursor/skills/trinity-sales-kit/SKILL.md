---
name: trinity-sales-kit
description: >-
  Trinity 销售套件与外发印刷/讲解物料：海报、A4、brand-deck、一页通/一纸禅、
  从官网或 /apps 抽句。冻旧版再出新版；客户附件无深折。
  在改 marketing/销售真源、marketing/销售套件、营销服务号、宣讲 Deck 文案时使用。
  触发词：销售套件、销售真源、七件套、海报、一纸禅、A4 宣传单、brand-deck、一页通、外发物料。
  勿与 trinity-tob-marketing-site 官网 Vue 页、trinity-product-handbook 手册结构、
  trinity-official-pricing 刊例数字混用。
disable-model-invocation: true
---

# Trinity · 销售套件

## 读取顺序

```text
SKILL.md → workflows/<task>.md → references/channel-map.md
         → references/print-design.md（新海报 / 一纸禅 / 新 A4 版式）
         → repo 真源 md
DOMAIN.md、confirmation.md：封发确认或升默认外发时再 READ。
```

边界：[`./DOMAIN.md`](./DOMAIN.md) · 确认：[`./confirmation.md`](./confirmation.md)

## 形态（中档 · 清单 + 两闸）

不写 ReAct 圈名、不做 phase 状态机。Agent 照常调工具。硬规则：

1. **没 READ 本跳对应真源，不准起草能力 / 价格 / 适合谁。**
2. **闸 1（目的）**：渠道或「用来做什么」不清 → 先问。打样可跳过追问，**新版式仍出三版 HTML**。只改一句、不改版式才跳过三版。
3. **闸 2（灌版）**：未说可外发、未说升默认 → 只出新文件预览，不覆盖工作稿、不默认导出 PDF。

## 分流

| 用户意图 | Workflow |
|----------|----------|
| 海报 / A4 / 一纸禅 | [`./workflows/update-print.md`](./workflows/update-print.md) |
| 讲解 Deck / brand-deck | [`./workflows/update-deck.md`](./workflows/update-deck.md) |
| 按网页或新特性抽到物料 | [`./workflows/rewrite-from-source.md`](./workflows/rewrite-from-source.md) |

渠道取句表：[`./references/channel-map.md`](./references/channel-map.md)  
印刷视觉：[`./references/print-design.md`](./references/print-design.md)（借鉴 huashu-design **机制**，不安装其仓）

## 真源（指针，不贴全文）

| 用途 | 路径 |
|------|------|
| 套件清单、缺口、红线 | `apps/trinity-product/docs/ai-api-platform/commercial-billing/sales-kit.md` |
| 浅档话术、深折不上页 | `…/pricing-marketing-strategy.md` |
| 场景与模型 ID | `…/marketing-scene-playlist.md` |
| 宣讲页序 | `…/sales-deck-outline.md` |
| **销售套件成品（PDF+清单）** | `marketing/销售套件/` |
| **销售真源** | `marketing/销售真源/`（`宣讲Deck` · `建议书` · `展会印刷`） |
| **营销服务号** | `marketing/营销服务号/`（`真源/` · `可对外/`） |
| 案例示意 | `…/case-studies.md` |
| 对内算折 | 证据链 + L3b Excel（**不进客户附件**） |
| GEO 产品页 | 现网 `https://trinitydesk.ai/apps`（爬虫页，不是应用市场） |
| Deck 工序 | `docs/08-方法论与汇报/讲解Deck-四步生成范例.md` |
| 产品名 | 对外 **AI API 聚合产品**，不写「聚合平台」 |

## 硬规则（≤10）

1. 改成品先冻原文件（`*-v1` 或登记 README），新版用新文件。
2. 先定渠道再写；海报 ≠ A4 ≠ Deck ≠ `/apps` ≠ 一纸禅。
3. 客户附件禁止商务深折表、成本族、内部 SKU。
4. 未拍的试用额度、SLA、省钱比例不写死。
5. 「最高可省」不能写成固定折数。
6. 展架不点名竞品对打；`/apps` 品类对比不原样搬上海报。
7. 「不适合谁」只留网页。一纸禅禁止空页：3 米外一句，1 米内 ≥3 个有出处锚点。
8. 1+2 合并为 A4，不默认另做画册；站台海报不替代 A4。
9. 协议终稿归法务。
10. 对用户不要念「现在 Reason / Act」。

## 检查清单

- [ ] 已 READ 本跳真源与 channel-map 对应行
- [ ] 闸 1 已过或符合捷径
- [ ] 旧版已冻 / 新版未覆盖默认工作稿（除非用户点名升默认）
- [ ] 无深折、无未拍 SLA、无假客户名
- [ ] 新版式已出 3 个可打开 HTML（或符合捷径）；三版不同温
- [ ] 印刷件预览用 `open`；导出仅在用户要求时跑脚本
