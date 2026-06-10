import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHARED_DIR = fileURLToPath(new URL(".", import.meta.url));
const PRODUCT_ROOT = path.resolve(SHARED_DIR, "../..");
const DOCS_ROOT = path.resolve(PRODUCT_ROOT, "../trinity-docs");
const REPO_ROOT = path.resolve(PRODUCT_ROOT, "../..");

/** 开发机本地配置（不提交 Git）；后加载文件不覆盖已有 process.env */
function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf-8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/** 产品手册 dev：依次尝试 product / docs / 仓库根的 .env.local */
export function loadTrinityProductDevEnv(_appRoot?: string): void {
  for (const dir of [PRODUCT_ROOT, DOCS_ROOT, REPO_ROOT]) {
    for (const name of [".env.local", ".env"]) {
      loadEnvFile(path.join(dir, name));
    }
  }
}
