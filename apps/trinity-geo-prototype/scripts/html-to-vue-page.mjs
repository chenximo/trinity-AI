#!/usr/bin/env node
/**
 * 一次性：把 marketing/console/*.html 的 <main>（及 toast / onboard）收成 Vue 页面。
 * 页内 ./xxx.html 由 GeoConsoleLayout 拦截；原 marketing/js 以 ?raw 在 onMounted eval。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const consoleDir = path.join(root, "marketing/console");
const viewsRoot = path.join(root, "src/views");

/** @type {{ html: string, dir: string, page: string, nav: string, title: string, js?: string }[]} */
const pages = [
  { html: "dashboard.html", dir: "dashboard", page: "DashboardPage", nav: "dashboard", title: "可见性总览", js: "dashboard.js" },
  { html: "citations.html", dir: "citations", page: "CitationsPage", nav: "citations", title: "引用与信源" },
  { html: "sentiment.html", dir: "sentiment", page: "SentimentPage", nav: "sentiment", title: "情感与口碑" },
  { html: "monitoring.html", dir: "monitoring", page: "MonitoringPage", nav: "monitoring", title: "监测采集", js: "monitoring.js" },
  { html: "keywords.html", dir: "keywords", page: "KeywordsPage", nav: "monitoring", title: "问题集管理", js: "keywords.js" },
  { html: "keyword-detail.html", dir: "keyword-detail", page: "KeywordDetailPage", nav: "monitoring", title: "关键词详情", js: "keyword-detail.js" },
  { html: "answer-detail.html", dir: "answer-detail", page: "AnswerDetailPage", nav: "monitoring", title: "回答详情" },
  { html: "answer-detail-brand.html", dir: "answer-detail-brand", page: "AnswerDetailBrandPage", nav: "monitoring", title: "回答详情 CCR" },
  { html: "competitors.html", dir: "competitors", page: "CompetitorsPage", nav: "competitors", title: "竞品概览", js: "competitors.js" },
  { html: "competitors-manage.html", dir: "competitors-manage", page: "CompetitorsManagePage", nav: "competitors", title: "竞品管理", js: "competitors-manage.js" },
  { html: "competitor-detail.html", dir: "competitor-detail", page: "CompetitorDetailPage", nav: "competitors", title: "竞品详情" },
  { html: "diagnosis.html", dir: "diagnosis", page: "DiagnosisPage", nav: "diagnosis", title: "诊断列表", js: "diagnosis.js" },
  { html: "audit.html", dir: "audit", page: "AuditPage", nav: "diagnosis", title: "页面审计", js: "audit.js" },
  { html: "audit-reports.html", dir: "audit-reports", page: "AuditReportsPage", nav: "diagnosis", title: "审计报告" },
  { html: "optimize.html", dir: "optimize", page: "OptimizePage", nav: "optimize", title: "优化待办", js: "optimize.js" },
  { html: "optimize-detail.html", dir: "optimize-detail", page: "OptimizeDetailPage", nav: "optimize", title: "优化详情" },
  { html: "verify.html", dir: "verify", page: "VerifyPage", nav: "optimize", title: "效果验证", js: "verify.js" },
  { html: "reports.html", dir: "reports", page: "ReportsPage", nav: "reports", title: "报告列表", js: "reports.js" },
  { html: "report-preview.html", dir: "report-preview", page: "ReportPreviewPage", nav: "reports", title: "报告预览" },
  { html: "brand-settings.html", dir: "brand-settings", page: "BrandSettingsPage", nav: "settings", title: "品牌设置", js: "brand-settings.js" },
  { html: "settings-account.html", dir: "settings-account", page: "SettingsAccountPage", nav: "settings", title: "账户与套餐" },
  { html: "settings-notifications.html", dir: "settings-notifications", page: "SettingsNotificationsPage", nav: "settings", title: "通知与告警" },
];

function extractMainOuter(html) {
  const m = html.match(/<main\b[\s\S]*?<\/main>/i);
  if (!m) throw new Error("no <main>");
  return m[0];
}

function extractExtras(html) {
  const after = html.split(/<\/main>/i)[1] ?? "";
  const beforeScript = after.split(/<script\b/i)[0] ?? "";
  const parts = [];
  const onboard = beforeScript.match(
    /<div class="dash-onboard-backdrop"[\s\S]*?<\/div>\s*<\/div>/,
  );
  if (onboard) parts.push(onboard[0]);
  const toast = beforeScript.match(/<div class="geo-toast"[^>]*>[\s\S]*?<\/div>/);
  if (toast) parts.push(toast[0]);
  return parts.join("\n");
}

function addVPre(openTagHtml) {
  return openTagHtml.replace(/^<([a-zA-Z][\w-]*)(\s|>)/, "<$1 v-pre$2");
}

function sanitize(fragment) {
  return fragment
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/<template[\s\S]*?<\/template>/gi, "");
}

function readme(title, page, htmlFile, nav, js) {
  const jsRow = js
    ? `| 壳 \`useMarketingPageScripts\` | 迁入后 onMounted 执行 \`marketing/js/${js}\` |`
    : "";
  return `# ${title}（原型）

## 1. 一句话

由 \`marketing/console/${htmlFile}\` 的 \`<main>\` 迁入 Vue，顶栏走控制台壳。

## 2. 本页规则（需求）

与 HTML 原型同屏能力；口径见手册 \`apps/trinity-product/docs/geo/product-design-analysis.md\` §0.6。
迁完后以本文 + 页面模板为准。对应 \`${htmlFile}\` 旁解读 \`.md\` 仍可对照，不在本目录再写一份需求长文。

## 3. 工程对齐

- 路由：\`/console/…\`（门户 \`/trinity-geo/console/…\`）· \`meta.nav\` = \`${nav}\`
- 入口：\`${page}.vue\`
- 对照：\`marketing/console/${htmlFile}\`
- 样式：壳层 \`src/views/shell/shell.css\` \`@import\` 营销 CSS，本页无独立 css

## 4. 五件套

本页为 HTML 整页迁入。无独立 mock / Interactions（避免空文件）。简单页允许合并。

| 文件 | 职责 |
|------|------|
| \`${page}.vue\` | 整页模板（\`v-pre\`，不拆子组件） |
| \`README.md\` | 本文 |
${jsRow}

## 5. 接 API 时

先把表格/KPI 抽到 \`mock.ts\`，再补 \`*Interactions.ts\`，去掉 \`v-pre\` 与 raw JS。

## 6. 已知缺口

- 主按钮多为 disabled。
- 页内 \`./xxx.md\` 产品解读链未接到文档站。

## 7. 参考

- \`marketing/console/${htmlFile.replace(".html", ".md")}\`
- 产品线：\`apps/trinity-product/docs/geo/index.md\`
`;
}

for (const spec of pages) {
  const raw = fs.readFileSync(path.join(consoleDir, spec.html), "utf8");
  let main = addVPre(extractMainOuter(raw));
  const extras = extractExtras(raw);
  let body = sanitize(main);
  if (extras) {
    body += `\n<div v-pre class="geo-page-extras">\n${sanitize(extras)}\n</div>`;
  }

  const dir = path.join(viewsRoot, spec.dir);
  fs.mkdirSync(dir, { recursive: true });

  let script = `<script setup lang="ts">\n</script>`;
  if (spec.js) {
    script = `<script setup lang="ts">
import { useMarketingPageScripts } from "../shell/shellInteractions";
import pageJs from "../../../marketing/js/${spec.js}?raw";

useMarketingPageScripts([pageJs]);
</script>`;
  }

  const vue = `${script}

<template>
${body}
</template>
`;
  fs.writeFileSync(path.join(dir, `${spec.page}.vue`), vue);
  if (spec.dir !== "dashboard") {
    fs.writeFileSync(path.join(dir, "README.md"), readme(spec.title, spec.page, spec.html, spec.nav, spec.js));
  }
  console.log("wrote", spec.dir);
}
