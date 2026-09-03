#!/usr/bin/env node
/**
 * 导入豆包 App 等人工采集的回答（路径 B）。
 *
 *   node apps/trinity-geo/mvp/scripts/import-manual.mjs --id Q00 --round R1 --file data/r1/Q00-doubao-app.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MVP_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const id = args.find((a, i) => args[i - 1] === '--id');
const round = args.find((a, i) => args[i - 1] === '--round') || 'R1';
const fileArg = args.find((a, i) => args[i - 1] === '--file');

if (!id || !fileArg) {
  console.error('Usage: import-manual.mjs --id Q00 --round R1 --file path/to/answer.md');
  process.exit(1);
}

const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(MVP_ROOT, fileArg);
const answer = fs.readFileSync(filePath, 'utf8').trim();
const { questions } = JSON.parse(fs.readFileSync(path.join(MVP_ROOT, 'config/questions.json'), 'utf8'));
const q = questions.find((x) => x.id === id);
if (!q) {
  console.error(`Unknown question id: ${id}`);
  process.exit(1);
}

const outDir = path.join(MVP_ROOT, 'data', round.toLowerCase());
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'records.json');

let records = [];
if (fs.existsSync(outFile)) {
  records = JSON.parse(fs.readFileSync(outFile, 'utf8'));
}

records = records.filter((r) => !(r.question_id === id && r.round === round && r.collection_channel === 'doubao-app-manual'));

records.push({
  question_id: id,
  question_type: q.type,
  question_text: q.text,
  platform: 'doubao',
  collection_channel: 'doubao-app-manual',
  model: 'doubao-app',
  round,
  collected_at: new Date().toISOString(),
  answer_full: answer,
  brand_id: 'trinity',
  source_note: '用户豆包 App 实测',
});

records.sort((a, b) => a.question_id.localeCompare(b.question_id));
fs.writeFileSync(outFile, JSON.stringify(records, null, 2), 'utf8');
console.log(`Imported ${id} → ${outFile} (${records.length} records)`);
