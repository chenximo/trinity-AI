import fs from "node:fs/promises";
import path from "node:path";
import type { ChangelogRelease, DevChangelog } from "./changelogTypes";

const EMPTY: DevChangelog = { schemaVersion: 1, releases: [] };

export function changelogFilePath(appRoot: string): string {
  return path.join(appRoot, "docs-meta/dev-changelog.json");
}

export async function readDevChangelog(appRoot: string): Promise<DevChangelog> {
  const filePath = changelogFilePath(appRoot);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as DevChangelog;
    if (data?.schemaVersion !== 1 || !Array.isArray(data.releases)) return { ...EMPTY };
    return data;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { ...EMPTY };
    throw err;
  }
}

export async function appendRelease(appRoot: string, release: ChangelogRelease): Promise<DevChangelog> {
  const filePath = changelogFilePath(appRoot);
  const data = await readDevChangelog(appRoot);
  data.releases.unshift(release);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  return data;
}

export async function deleteRelease(appRoot: string, id: string): Promise<DevChangelog> {
  const filePath = changelogFilePath(appRoot);
  const data = await readDevChangelog(appRoot);
  const before = data.releases.length;
  data.releases = data.releases.filter((r) => r.id !== id);
  if (data.releases.length === before) {
    throw new Error("发布记录不存在或已删除");
  }
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  return data;
}
