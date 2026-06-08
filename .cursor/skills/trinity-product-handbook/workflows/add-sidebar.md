# 加侧栏

## 文件

`apps/trinity-product/.vitepress/config.ts`

## 步骤

1. 确认新页路径与页型（见 [`update-product-page.md`](./update-product-page.md)）
2. 在对应 `sidebar` 分组追加 `{ text, link }`
3. 父级 **子总览** 模块表加一行（链到新叶子）
4. 若属周计划 focus → 更新 `weekProgressFocusLeaves.ts`

## API 测试分组

侧栏已有「API 测试」链 `api-test/` — **内容** 改验收封发 `trinity-api-acceptance`，本 workflow 只改导航项文案/顺序。

## 自检

- 链接相对路径与 VitePress `base` 一致
- `npm run dev:trinity-product` 侧栏可点通
