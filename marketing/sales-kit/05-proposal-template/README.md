# #5 销售建议书（对内）

| 项 | 说明 |
|----|------|
| 真源 | [`Trinity-销售建议书-对内.md`](./Trinity-销售建议书-对内.md) |
| 读者 | 销售 / 商务（**内部**；默认不随客户包外发） |
| 客户仍发 | A4 · Deck · 对外 `Trinity模型报价表.xlsx` |
| 导出 PDF | 见下 |

## 导出 PDF

```bash
# 在仓库 trinity-AI 根目录
python3 marketing/tools/export_md.py \
  marketing/sales-kit/05-proposal-template/Trinity-销售建议书-对内.md --pdf
```

PDF 默认写到同级 `export/`。依赖见 [`../../tools/README.md`](../../tools/README.md)。

## 历史

| 版本 | 说明 |
|------|------|
| v0.1 | 曾误做成客户向 Word 可填模板（已弃用） |
| v0.2 | 改为对内销售/商务作业手册（md → PDF） |
