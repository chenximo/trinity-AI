# Markdown 导出（Word / PDF）

把 `.md` 导出为 `.docx` 与 `.pdf`（中文友好版式，A4）。

## 安装（一次）

```bash
pip3 install --user -r marketing/tools/requirements-md-export.txt
python3 -m playwright install chromium
```

## 用法

```bash
# 默认：同时导出 Word + PDF → 与 md 同级的 export/
python3 marketing/tools/export_md.py marketing/公众号-Trinity品牌介绍-AI云与API聚合.md

# 只导出 Word / 只导出 PDF
python3 marketing/tools/export_md.py path/to/file.md --docx
python3 marketing/tools/export_md.py path/to/file.md --pdf

# 指定输出目录
python3 marketing/tools/export_md.py path/to/file.md -o marketing/output/
```

## 说明

| 格式 | 实现 |
|------|------|
| PDF | Markdown → HTML → Playwright Chromium 打印（与海报导出同思路） |
| Word | Markdown → HTML → `htmldocx` / `python-docx` |

表格、标题、列表、引用、粗体均可；复杂 HTML / 图片路径请用相对路径并保证文件存在。
