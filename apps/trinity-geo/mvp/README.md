# Trinity × 豆包 · GEO MVP

> **客户走查**：HTML 控制台 `marketing/console/`（`bun run dev` → `/console`）。  
> **本目录**：问题集、种子采集、CLI 分析；不再提供 Vue `/demo` 六环演示台。

## 预览控制台

```bash
cd apps/trinity-geo
bun run dev
# → http://127.0.0.1:5203/__geo_marketing/console/dashboard.html
```

## 人工采集（业务侧）

把豆包回答按 [MANUAL-SUBMIT.md](./MANUAL-SUBMIT.md) 入库，再跑分析脚本。

## 工程师 · 自动采集

见 [COLLECTION-TBD.md](./COLLECTION-TBD.md)。

## 代码结构

```
mvp/config/         # brand、questions JSON
mvp/data/r1/        # 种子采集记录
mvp/scripts/        # CLI 导入 / 采集 / 分析
```

## 相关文档

- [GEO MVP 实践手册](../../trinity-product/docs/geo/mvp-practice.md)
- [R1 演示叙事](./reports/R1-narrative.md)
