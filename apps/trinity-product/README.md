# Trinity 产品手册（VitePress）

与对外开发者文档 **`apps/trinity-docs`** 分离；用于产品能力树浏览、对内/对外宣讲（可导出 PDF）。

## 开发

```bash
# 仓库根目录
npm install
npm run dev:trinity-product
```

打开 [http://127.0.0.1:5206/product/](http://127.0.0.1:5206/product/)

本地根路径预览：`VITEPRESS_BASE=/ npm run dev -w @trinity/app-trinity-product`

### 开发编辑（仅 `dev`，与 trinity-docs 相同）

任意手册页右下角 **「编辑本页」**：

- 左侧编辑 `apps/trinity-product/docs/**/*.md` 源文  
- 右侧 **Markdown 实时预览**  
- **保存** 写入磁盘后自动刷新页面  

仅 localhost 可用；`build` 产物不含此功能。

### Mermaid 图

正文里 ` ```mermaid ` 代码块在**正常浏览**与**编辑预览**中都会渲染成图（已启用 `vitepress-plugin-mermaid`）。

## 构建

```bash
npm run build:trinity-product
# 产物 apps/trinity-product/.vitepress/dist
```

部署子路径默认 `base: /product/`；可通过 `VITEPRESS_BASE` 覆盖。

## 内容真源

- **浏览与编辑（推荐）**：`apps/trinity-product/docs/`
- **路线图摘抄 / PPT**：`docs/05-产品与PRD/roadmap/`（逐步与手册同步，避免双份长期分叉）

## 导出 PDF / Word

- PDF：浏览器打开页面 → 打印 → 存为 PDF
- Word：`pandoc apps/trinity-product/docs/ai-api-platform/user/model-catalog.md -o model-catalog.docx`
