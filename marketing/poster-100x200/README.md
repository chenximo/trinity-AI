# 站台海报 / 推广印刷素材（100×200）

本目录从官网仓库 `TrinityAI-web/print` 迁入，**不随线上 Web 发布**。

## 文件

| 文件 | 说明 |
|------|------|
| `trinity-poster-100x200-zh.html` | 站台海报可编辑源（浏览器预览） |
| `trinity-promo-flyer-zh.html` | A4 双面宣传单（正面 AI API · 背面 AI 云；价格弱化为商务咨询条） |
| `trinity-pricing-flyer-zh.html` | 旧文件名跳转 → 上项 |
| `export_poster_pdf.sh` | 导出 100×200 PDF（需 Playwright） |
| `build_poster_100x200.py` | 备用：PyMuPDF 生成（旧路径） |
| `assets/` | wordmark、二维码 |
| `output/` | 导出的 PDF 成品 |

## 预览

```bash
open marketing/poster-100x200/trinity-poster-100x200-zh.html
open marketing/poster-100x200/trinity-promo-flyer-zh.html
```

## 导出 PDF

```bash
cd marketing/poster-100x200
./export_poster_pdf.sh
# 或指定输出路径
./export_poster_pdf.sh ./output/Trinity-100x200推广素材-V1.3.pdf
```

依赖：`pip install playwright && python -m playwright install chromium`
