#!/usr/bin/env node
/**
 * 为每个中文 md（docs/ 下，不含 docs/en/）确保存在 docs/en/ 镜像。
 * 已存在且非自动占位头的文件不覆盖（便于保留人工翻译）。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(fileURLToPath(new URL("..", import.meta.url)), "docs");
const EN_DIR = path.join(ROOT, "en");
const STUB_MARKER = "<!-- tdocs-en-stub -->";

function zhPagePath(rel) {
  if (/\/index\.md$/i.test(rel)) {
    const dir = rel.replace(/\/index\.md$/i, "").replace(/\\/g, "/");
    return dir ? `/${dir}/` : "/";
  }
  const slug = rel.replace(/\.md$/i, "");
  return `/${slug}`;
}

function stubBody(title, zhPath) {
  return `${STUB_MARKER}
# ${title}

::: warning English in progress
This page is not yet available in English. [Read the Chinese version](${zhPath}).
:::
`;
}

async function walk(dir, base = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const rel = base ? `${base}/${ent.name}` : ent.name;
    if (ent.isDirectory()) {
      if (rel === "en") continue;
      files.push(...(await walk(path.join(dir, ent.name), rel)));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      files.push(rel);
    }
  }
  return files;
}

function titleFromMd(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

async function main() {
  const zhFiles = await walk(ROOT);
  let created = 0;
  let skipped = 0;

  await fs.mkdir(EN_DIR, { recursive: true });

  for (const rel of zhFiles) {
    const enRel = path.join("en", rel);
    const enFull = path.join(ROOT, enRel);
    const zhFull = path.join(ROOT, rel);
    const zhContent = await fs.readFile(zhFull, "utf-8");

    try {
      const existing = await fs.readFile(enFull, "utf-8");
      if (!existing.includes(STUB_MARKER)) {
        skipped++;
        continue;
      }
    } catch {
      /* create */
    }

    const title = titleFromMd(zhContent, path.basename(rel, ".md"));
    const zhPath = zhPagePath(rel);
    await fs.mkdir(path.dirname(enFull), { recursive: true });
    await fs.writeFile(enFull, stubBody(title, zhPath), "utf-8");
    created++;
  }

  console.log(`ensure-en-mirror: ${created} stub(s) written, ${skipped} existing translation(s) kept.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
