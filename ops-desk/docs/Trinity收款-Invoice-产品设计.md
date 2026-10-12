# Trinity 收款 · Commercial Invoice（产品设计草案）

> **状态**：v0.2 · 2026-10-10（Ops Desk「收款」已落地 Trinity 出单）  
> **模板真源**：[`../templates/trinity-invoice-template.xlsx`](../templates/trinity-invoice-template.xlsx)  
> **入口**：顶栏 **收款** → `/receipts`（Trinity 页签出 USD Invoice；国内页签跳转开票信息）  
> **与国内开票关系**：USD Commercial Invoice **不占用**国内增值税 50 万月额度。

---

## 1. 业务口径

| | Trinity 收款 | 国内收款（已做） |
|--|--------------|------------------|
| 收款主体 | **TRINITY AI INC**（美） | 陕西/西安星瀚等境内主体 |
| 币种 | **USD** | CNY |
| 单据 | Commercial Invoice（本模板） | 增值税发票 + 钉钉开票申请 |
| 客户例 | FAR VISION、瑞云/Fengyee、hehe 海外账单等 | 山河、亿点、hehe 国内云结算 |

---

## 2. 模板结构（已从样例抽象）

每个 Invoice sheet 固定区块：

| 位置 | 字段 | 样例 |
|------|------|------|
| A1 | 标题 | `Invoice` |
| D2 | Invoice No. | `20260917001`（建议规则：`YYYYMMDD` + 当日序号） |
| D3 | Invoice Date | 申请日 / 当天 |
| A4 | Bill To | 客户英文法定名 |
| A5 | Address | 客户英文地址 |
| 表头 | Description / Campaign / Period / Amount/USD | |
| 明细行 | 服务描述 | `Advertising fee` / `Computer services` 等 |
| D8 | Total/USD | 合计（可多行后汇总） |
| A12 | Payment Instructions | 固定：TRINITY AI INC + JPMorgan 账户信息 |

**章子** sheet：印章图（导出 PDF/打印时叠加，实现阶段再定）。

历史样例 sheet（可作回归对照）：`FAR`、`hehe8月账单`、`hehe9月账单`、`瑞云账单～9.07~9.12`、`瑞云账单～9.13~9.30`。

---

## 3. Ops Desk 建议能力（未实现）

| ID | 需求 | 验收 |
|----|------|------|
| T1 | 维护 Bill To 主数据（客户英文名、地址、默认 Description） | CRUD |
| T2 | 新建 Invoice：选客户 → 填 Period / Amount / Campaign → 生成 xlsx | 下载可打开，版式对齐模板 |
| T3 | Invoice No. 自动生成且不重复 | 同日多张递增 |
| T4 | 按月列表 / 删除；状态：草稿 → 已发出 → 已收款 | 可筛选 |
| T5 | Payment Instructions 只读配置（勿散落在多处硬编码） | 改配置即全单生效 |

**不做（本期）**：替换 Stripe 流水；国内税控额度；自动邮件（可 P1）。

---

## 4. 与现有模块导航

```text
出付款申请（打给云厂）
开票信息（国内增值税）
消耗台账
→ 建议新增：Trinity Invoice（USD 收款单）
```

---

## 5. 修订

| 日期 | 说明 |
|------|------|
| 2026-10-10 | v0.1：模板入库 + 字段抽象；实现待排期 |
