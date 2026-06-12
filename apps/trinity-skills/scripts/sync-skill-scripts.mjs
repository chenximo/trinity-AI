#!/usr/bin/env node
/**
 * Copy scripts from skills/trinity/scripts → skills/trinity-zh/scripts
 * Run after changing *.cjs scripts in skills/trinity/scripts/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcSkill = path.join(root, "skills/trinity");
const srcScripts = path.join(srcSkill, "scripts");
const destSkill = path.join(root, "skills/trinity-zh");
const destScripts = path.join(destSkill, "scripts");

fs.mkdirSync(destScripts, { recursive: true });
for (const name of fs.readdirSync(srcScripts)) {
  if (!name.endsWith(".cjs")) continue;
  fs.copyFileSync(path.join(srcScripts, name), path.join(destScripts, name));
}
for (const name of fs.readdirSync(destScripts)) {
  if (name.endsWith(".js")) fs.unlinkSync(path.join(destScripts, name));
}

fs.copyFileSync(
  path.join(srcSkill, "env.template"),
  path.join(destSkill, "env.template")
);

console.log(
  `Synced ${fs.readdirSync(destScripts).filter((f) => f.endsWith(".cjs")).length} scripts + env.template → skills/trinity-zh`
);
