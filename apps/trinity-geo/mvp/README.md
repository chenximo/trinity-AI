# Trinity × 豆包 · GEO MVP

> **可演示系统**：浏览器内完整六环，不仅是文档。  
> **营销官网**：`/` · **MVP 演示台**：`/demo`

## 启动演示系统

```bash
cd apps/trinity-geo
bun run dev
# → http://127.0.0.1:5203/demo
```

## 演示系统包含什么

| 模块 | 路由步骤 | 能力 |
|------|----------|------|
| 总览 | Dashboard | SOA、六环完成度、样本概览 |
| ① 策略 | 策略规划 | 品牌、竞品、13 条问题集 |
| ② 采集 | 监测采集 | **人工粘贴豆包回答** + 工程师自动采集占位 |
| ③ 测量 | 测量 | SOA 表、进答案/位置/竞品、原文弹窗 |
| ④ 诊断 | 诊断 | D1–D4 规则、P0/P1 优先级 |
| ⑤ 优化 | 优化行动 | 待办勾选（待办/进行中/已完成） |
| ⑥ 验证 | R1 vs R2 | 优化前后 SOA 对比 |

数据持久化在浏览器 `localStorage`；内置 Q00 豆包实测种子数据。

## 人工采集（业务侧）

在演示台 **② 监测采集** 粘贴豆包回答即可，无需等工程。

批量/脚本路径见 [MANUAL-SUBMIT.md](./MANUAL-SUBMIT.md)。

## 工程师 · 自动采集

见 [COLLECTION-TBD.md](./COLLECTION-TBD.md)（一句话占位，不阻塞演示）。

## 代码结构

```
src/demo/           # 分析引擎、状态、种子数据
src/views/demo/     # 演示台 UI
mvp/config/         # brand、questions JSON（与演示台共用）
mvp/data/r1/        # 种子采集记录
mvp/scripts/        # CLI 导入/分析（可选）
```

## 相关文档

- [GEO MVP 实践手册](../../trinity-product/docs/geo/mvp-practice.md)
- [R1 演示叙事](./reports/R1-narrative.md)
