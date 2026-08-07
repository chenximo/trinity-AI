# Trinity 品牌产品介绍 Deck

16:9 产品介绍册（**AI API + AI 云**合订），HTML 预览 → PDF 导出。

## 文件

| 文件 | 说明 |
|------|------|
| [目录.md](./目录.md) | 页级目录 v3 |
| [Trinity产品介绍.md](./Trinity产品介绍.md) | 内容真源（含销售备注） |
| [index.html](./index.html) | 19 页可预览 / 可打印稿 |
| [deck.css](./deck.css) | 版式与 16:9 打印样式 |
| [assets/](./assets/) | 正式 wordmark / mark（勿反色） |
| [export_deck_pdf.sh](./export_deck_pdf.sh) | Playwright 导出 PDF |
| `output/` | 导出成品 |

## 预览

```bash
open marketing/brand-deck/index.html
```

## 导出 PDF

需已安装 Playwright + Chromium（与 `marketing/poster-100x200` 相同）：

```bash
cd marketing/brand-deck
chmod +x export_deck_pdf.sh
./export_deck_pdf.sh
# 或指定路径：
# ./export_deck_pdf.sh ./output/Trinity-品牌产品介绍-v3.pdf
```

## 字号阶梯（`deck.css`）

| Token | 尺寸 | 用途 |
|-------|------|------|
| `--fs-display` | 40px | 封面主标题 |
| `--fs-title` | 36px | 页标题（如「目录」） |
| `--fs-subtitle` | 20px | 卡片 / 章节名 |
| `--fs-lead` | 17px | 页导语 |
| `--fs-body` | 15px | 正文 |
| `--fs-body-sm` | 14px | 次级正文、目录行 |
| `--fs-label` | 13px | 标签、章节英文 |
| `--fs-meta` | 12px | 页脚 |
| `--fs-num` | 32px | 目录大序号 |

改字号只改 `:root` 变量即可全册生效。
