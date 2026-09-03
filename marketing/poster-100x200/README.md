# 站台海报 / 推广印刷素材（100×200）

本目录从官网仓库 `TrinityAI-web/print` 迁入，**不随线上 Web 发布**。

## 文件

| 文件 | 说明 |
|------|------|
| `trinity-poster-100x200-zh.html` | 站台海报工作稿（与 v1 同内容：云 × API 双引擎） |
| `trinity-poster-100x200-zh-v1.html` | **冻结**：原双引擎版（云集采 + API 聚合） |
| `trinity-poster-100x200-zh-v2.html` | 只讲 AI API，口径对齐 [trinitydesk.ai/apps](https://trinitydesk.ai/apps) |
| `trinity-poster-100x200-zh-zen.html` | **打样 A** 留白构图（一纸禅，非空页） |
| `trinity-poster-100x200-zh-grid.html` | **打样 B** 瑞士网格 |
| `trinity-poster-100x200-zh-dense.html` | **打样 C** 信息图密度 |
| `zen-directions.html` | **三方向并排**（先看这张） |
| `trinity-promo-flyer-zh.html` | A4 双面宣传单（正面 AI API · 背面 AI 云；价格弱化为商务咨询条） |
| `trinity-pricing-flyer-zh.html` | 旧文件名跳转 → 上项 |
| `export_poster_pdf.sh` | 导出 100×200 站台海报 PDF（需 Playwright） |
| `export_flyer_pdf.sh` | 导出 A4 双面宣传单 PDF（需 Playwright） |
| `build_poster_100x200.py` | 备用：PyMuPDF 生成（旧路径） |
| `assets/` | wordmark、二维码 |
| `output/` | 导出的 PDF 成品 |

## 预览

```bash
open marketing/poster-100x200/zen-directions.html
open marketing/poster-100x200/trinity-poster-100x200-zh-zen.html
open marketing/poster-100x200/trinity-poster-100x200-zh-grid.html
open marketing/poster-100x200/trinity-poster-100x200-zh-dense.html
```

## 导出 PDF

**A4 宣传单**（推荐，尺寸准确）：

```bash
cd marketing/poster-100x200
./export_flyer_pdf.sh
# 或指定输出路径
./export_flyer_pdf.sh ./output/Trinity-A4宣传单.pdf
```

也可在浏览器打开 `trinity-promo-flyer-zh.html`，点顶栏「打印 / 导出 PDF」，纸张选 **A4**、边距无、勾选背景图形；双面印刷选「长边翻转」。

**100×200 站台海报**：

```bash
./export_poster_pdf.sh
# 或指定输出路径（默认导出 v1 双引擎）
./export_poster_pdf.sh ./output/Trinity-100x200推广素材-V1.3.pdf
# v2（/apps 口径）
./export_poster_pdf.sh ./output/Trinity-100x200推广素材-V2.0.pdf ./trinity-poster-100x200-zh-v2.html
# 一纸禅打样（非默认）
./export_poster_pdf.sh ./output/Trinity-100x200一纸禅-打样.pdf ./trinity-poster-100x200-zh-zen.html
```

依赖：`pip install playwright && python -m playwright install chromium`
