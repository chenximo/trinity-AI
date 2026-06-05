import fs from "node:fs";
import path from "node:path";

/** 开发机本地配置（不提交 Git）；后加载文件不覆盖已有 process.env */
export function loadTrinityDocsDevEnv(appRoot: string): void {
  for (const name of [".env.local", ".env"]) {
    const filePath = path.join(appRoot, name);
    if (!fs.existsSync(filePath)) continue;
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
}
