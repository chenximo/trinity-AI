/**
 * 一次性/历史迁移：将 views/chat 收敛为五件套（合并 CSS、内嵌 raw 到 mock、合并 TS 到 chatInteractions）。
 * 若源文件已不存在（已跑过），各步会跳过并打印说明。
 * 运行：node scripts/bundle-chat-fivepiece.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chatDir = path.join(__dirname, "../src/views/chat");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function exists(p) {
  return fs.existsSync(p);
}

// 1) CSS 合一
const cssOpen = path.join(chatDir, "chat-openrouter.css");
const cssShell = path.join(chatDir, "chat-vue-shell.css");
if (exists(cssOpen) && exists(cssShell)) {
  const openR = read(cssOpen);
  const shell = read(cssShell);
  write(
    path.join(chatDir, "chat.css"),
    `/**\n * Chat 模块唯一样式表（五件套）：chat-openrouter + chat-vue-shell 合并。\n */\n${openR}\n\n${shell}\n`
  );
  fs.unlinkSync(cssOpen);
  fs.unlinkSync(cssShell);
  console.log("bundle-chat-fivepiece: merged CSS.");
} else {
  console.log("bundle-chat-fivepiece: skip CSS merge (sources already removed).");
}

// 2) mock.ts 内嵌 raw HTML
const rawDir = path.join(chatDir, "raw");
const rawMainP = path.join(rawDir, "orc-main-scroll.html");
if (exists(rawMainP)) {
  const mockPath = path.join(chatDir, "mock.ts");
  let mock = read(mockPath);
  const rawMain = read(rawMainP);
  const rawComp = read(path.join(rawDir, "orc-composer.html"));
  const rawFloat = read(path.join(rawDir, "orc-floating-tail.html"));
  const rawBlock = `
/** 静态 HTML 片段（仅历史迁移：当前工程已改为主列/浮层写在 ChatPage.vue；勿再依赖此块） */
export const ORC_RAW_MAIN_SCROLL_HTML = ${JSON.stringify(rawMain)};
export const ORC_RAW_COMPOSER_HTML = ${JSON.stringify(rawComp)};
export const ORC_RAW_FLOATING_TAIL_HTML = ${JSON.stringify(rawFloat)};
`;
  const anchor = "/** 与旧 `chat-openrouter.js` 一致，仅演示用 */";
  const idx = mock.indexOf(anchor);
  if (idx === -1) throw new Error("mock.ts anchor not found");
  mock = mock.slice(0, idx) + rawBlock + "\n" + mock.slice(idx);
  write(mockPath, mock);
  fs.rmSync(rawDir, { recursive: true });
  console.log("bundle-chat-fivepiece: embedded raw HTML into mock.ts.");
} else {
  console.log("bundle-chat-fivepiece: skip mock raw embed (no raw/; 主列与浮层 HTML 已迁到 ChatPage.vue 模板).");
}

// 3) chatInteractions：合并 patch / help / shell
const patchPath = path.join(chatDir, "patchTaiChatAnchors.ts");
if (exists(patchPath)) {
  const ciPath = path.join(chatDir, "chatInteractions.ts");
  const ci = read(ciPath);
  const bindStart = ci.indexOf("export function bindOrcPrototypeChatInteractions");
  if (bindStart === -1) throw new Error("bindOrcPrototypeChatInteractions not found");
  const bindBody = ci.slice(bindStart);

  const patchFull = read(patchPath).replace(/^import type \{ Router \} from "vue-router";\s*\n+/, "");
  const helpFull = read(path.join(chatDir, "useOrcHelpTips.ts"));
  const shellFull = read(path.join(chatDir, "useChatShellLayout.ts")).replace(/^import \{[^}]+\} from "vue";\s*\n+/, "");

  const header = ci.slice(0, ci.indexOf("*/") + 2).trimEnd();

  const merged =
    `${header}\n\n` +
    `import type { Router } from "vue-router";\n` +
    `import { ref, computed, onMounted, onUnmounted } from "vue";\n` +
    `import { paintMockPickerList, paintMockRolePickerList } from "./mock";\n\n` +
    `${patchFull}\n\n${helpFull}\n\n${shellFull}\n\n${bindBody}`;

  write(ciPath, merged);
  fs.unlinkSync(patchPath);
  fs.unlinkSync(path.join(chatDir, "useOrcHelpTips.ts"));
  fs.unlinkSync(path.join(chatDir, "useChatShellLayout.ts"));
  console.log("bundle-chat-fivepiece: merged patch/help/shell into chatInteractions.ts.");
} else {
  console.log("bundle-chat-fivepiece: skip chatInteractions merge (patchTaiChatAnchors.ts already gone).");
}

console.log("bundle-chat-fivepiece: done.");
