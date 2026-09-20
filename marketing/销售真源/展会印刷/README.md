# 站台海报 / 推广印刷素材（100×200）

本目录从官网仓库 `TrinityAI-web/print` 迁入，**不随线上 Web 发布**。

## 文件（定稿）

| 文件 | 说明 |
|------|------|
| `trinity-poster-100x200-zh.html` | **站台海报工作稿 / 默认外发**（云 × API 双引擎） |
| `trinity-poster-100x200-zh-v1.html` | 冻结归档：双引擎原版（对照用） |
| `trinity-promo-flyer-zh.html` | **A4 双面宣传单（定稿，先不动）**（正面 AI API · 背面 AI 云） |
| `trinity-flyer-api-zh.html` | **A4 单页 · AI API**（冷发 / 单产品邮件） |
| `trinity-flyer-cloud-zh.html` | **A4 单页 · AI 云**（冷发 / 单产品邮件） |
| `export_poster_pdf.sh` | 导出 100×200 站台海报 PDF |
| `export_flyer_pdf.sh` | 导出 A4 双面宣传单 PDF |
| `export_single_flyer_pdf.sh` | 导出 A4 单页（`api` / `cloud` / `all`） |
| `build_poster_100x200.py` | 备用：PyMuPDF 生成（旧路径） |
| `assets/` | wordmark、二维码 |
| `output/` | 导出的 PDF 成品 |

## 预览

```bash
open marketing/销售真源/展会印刷/trinity-poster-100x200-zh.html
open marketing/销售真源/展会印刷/trinity-promo-flyer-zh.html
open marketing/销售真源/展会印刷/trinity-flyer-api-zh.html
open marketing/销售真源/展会印刷/trinity-flyer-cloud-zh.html
```

## 导出 PDF

成品请复制到 `marketing/销售套件/pdf/`。

**A4 双面宣传单**：

```bash
cd marketing/销售真源/展会印刷
./export_flyer_pdf.sh
# → output/Trinity-A4宣传单-AI-API-AI云.pdf
```

**A4 单页（API / 云）**：

```bash
./export_single_flyer_pdf.sh all
# → output/Trinity-A4单页-AI-API.pdf
# → output/Trinity-A4单页-AI云.pdf
```

**100×200 站台海报**：

```bash
./export_poster_pdf.sh
# → output/Trinity-100x200推广素材-V1.3.pdf
```

依赖：`pip install playwright && python -m playwright install chromium`

## 已清理（2026-09-07）

未升默认外发的打样与过期成品已删除：`*-zen/grid/dense`、`zen-directions`、`*-v2`、旧名跳转 `pricing-flyer`，以及 `output` 内 V1.1/V1.2、80×200 旧 PDF。
