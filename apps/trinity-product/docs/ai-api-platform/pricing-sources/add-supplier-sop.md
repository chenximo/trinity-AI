---
title: 新增供应商 SOP
---

# 新增供应商 SOP

> **前提**：价目 pipeline 已存在；新增供应商 = **接一条进货线**，不是新建模态。  
> **Skill**：`.cursor/skills/trinity-official-pricing/workflows/add-supplier-channel.md`

---

## 一、先定渠道类型

| 类型 | 维护方式 | 示例 | 难度 |
|------|----------|------|------|
| **official 直连** | `official-direct/channels/*.mjs` | 网聚云联、中转站-cust | 低（价=official 筛选） |
| **爬虫公开文档** | scrape → `pricing-api.json` | 百炼、火山方舟 | 中 |
| **爬虫控制台** | Playwright + 登录态 | TokenHub | 中高 |
| **手工 sheet** | `pricing-sheet*.mjs` | **仅 AIGC** | 低（商务给表） |

---

## 二、official 直连（推荐模板）

价目 **来自 official 筛选**，无需独立挂牌 URL。

```
1. pricing/suppliers/official-direct/channels/<id>.mjs
2. channels/index.mjs 登记
3. gen-upstream SUPPLIERS 加一行（Excel Sheet）
4. npm run pricing:refresh
```

```bash
npm run pricing:supplier:official-direct:all
# 或单渠道
npm run pricing:supplier:wangju-cloudportal
npm run pricing:supplier:relay-cust
```

说明：`pricing/suppliers/official-direct/README.md`

---

## 三、爬虫渠道（百炼 / 火山）

```bash
npm run pricing:supplier:bailian:doc
npm run pricing:supplier:volcengine:all    # scrape + normalize 三模态
```

产出：`suppliers/{bailian,volcengine}/output/pricing-api.json`

接入 Excel：`pricing:refresh` 或对应 `upstream:*` 会自动拉分表。

**校验**：`pricing:validate:official-suppliers*`（L1↔L3 档位数与价格）

---

## 四、TokenHub

```bash
npm run pricing:supplier:tokenhub:console   # 需腾讯云登录 .profile
```

产出：`suppliers/tokenhub/output/pricing-console-api.json`

用于 L1↔L2 交叉（CNY 对 CNY）。

---

## 五、AIGC（手工价目表）

**唯一**无公开 URL、由商务 Excel 维护：

| 模态 | 真源 |
|------|------|
| 生文 | `aigc/data/pricing-sheet.mjs` |
| 生图 | `pricing-sheet-image.mjs` |
| 生视频 | `pricing-sheet-video.mjs` |

```bash
npm run pricing:supplier:aigc
npm run pricing:supplier:aigc:image
npm run pricing:supplier:aigc:video
npm run pricing:validate:aigc-excel    # Excel ↔ sheet 一致
```

---

## 六、交付 Checklist

```
- [ ] 渠道 JSON 真源可生成
- [ ] gen-upstream / refresh 后 Excel 有新 Sheet 或列
- [ ] pricing:validate:official-suppliers* 无未登记 error
- [ ] pricing:gate（合并前）
- [ ] 更新 pricing/suppliers/SOURCES.md（若新目录）
```

**未完成 `pricing:refresh` / `upstream:*` 不算交付。**

---

## 七、与「加模型」的区别

| | 加模型 | 加供应商 |
|--|--------|----------|
| 改什么 | catalog · seeds · map · registry | 渠道脚本 / sheet / official-direct |
| 影响 | 单个 SKU 价目行 | 整渠道多模型 |
| 典型命令 | `supplier:official:*` | `supplier:tokenhub` / `volcengine:all` |

两者常一起：新模型在新渠道挂牌 → 先加模型 L1，再确认 L2 渠道有对应 SKU。

---

## 关联

| 页 | 用途 |
|----|------|
| [采购渠道真源](./suppliers) | JSON 路径索引 |
| [新增模型 SOP](./add-model-sop) | 加 SKU |
| [价目全流程](./workflow) | L1↔L2↔L3 治理 |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | 初版 |
