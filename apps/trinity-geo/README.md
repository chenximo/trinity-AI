# Trinity GEO · Vue 交付工程

GEO 用户站 **生产向** Vue 应用（五件套）。HTML 走查原型在 **`apps/trinity-geo-prototype`**。

## 本地预览

```bash
# 交付工程（本目录）
cd apps/trinity-geo && bun run dev
# → http://127.0.0.1:5203/          营销首页（Vue · 对照 marketing/index.html）
# → http://127.0.0.1:5203/console   工作台 · 可见性总览

# 开发枢纽
npm run dev   # 仓库根
# → http://127.0.0.1:5173/trinity-geo/console

# HTML 原型馆（对照）
npm run dev:trinity-geo-prototype
# → http://127.0.0.1:5203/__geo_marketing/console/dashboard.html
```

## 目录职责

| 路径 | 说明 |
|------|------|
| `src/views/*` | 五件套页面（**真源**） |
| `src/assets/geo-css/` | vendored 自原型 `marketing/css`，**样式真源** |
| `src/geoRoutes.ts` | 路由表（portal 复用） |
| `doc/` | 路由 ↔ 原型对照 |

## 迁移约定

- **类名**：与 `trinity-geo-prototype/marketing/console/*.html` 保持一致，不另起一套。
- **样式**：`main.ts` 引入 `shell.css` + `vue-bridge.css`；模块 `*.css` 只写增量。
- **RouterLink**：作按钮时加 `geo-btn` 等原型同类名。

## 迁移进度

- ✅ 壳层 + 总览（`shell` + `dashboard`）
- ✅ 问题集管理（`keywords`）
- ✅ 关键词详情（`keyword-detail` · Q00）
- ✅ 回答详情（`answer-detail` · Q00 豆包）
- ✅ 诊断列表（`diagnosis` · D1–D5）
- ✅ 优化待办（`optimize` · Q00 S1+S2）
- ✅ 效果验证（`verify` · Q00/Q01 R1→R2）
- ✅ **Q00 主链**（dashboard → … → verify）已齐
- ✅ 优化详情（`optimize-detail` · opt-s1s2）
- 📋 Q00 走查清单：`doc/Q00-WALKTHROUGH.md`
- ✅ 营销首页（`marketing/home` · 整页 + `shell` 顶栏/页脚）

## 参考

- 产品手册：`apps/trinity-product/docs/geo/`
- HTML 原型：`apps/trinity-geo-prototype/marketing/`
