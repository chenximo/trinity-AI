#!/usr/bin/env node
/**
 * GEO MVP — 通过 Trinity API 调用豆包模型，批量采集回答。
 *
 * 用法（在 trinity-AI 根目录或 apps/trinity-geo/mvp）：
 *   node apps/trinity-geo/mvp/scripts/collect.mjs
 *   node apps/trinity-geo/mvp/scripts/collect.mjs --round R1 --ids Q00,Q03
 *   node apps/trinity-geo/mvp/scripts/collect.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MVP_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(MVP_ROOT, '../../..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(REPO_ROOT, '.env'));
loadEnvFile(path.join(MVP_ROOT, '.env'));

const BASE_URL = (process.env.TRINITY_BASE_URL || 'https://api.trinitydesk.ai/v1').replace(/\/$/, '');
const API_KEY = process.env.TRINITY_API_KEY || '';
const MODEL = process.env.GEO_DOUBAO_MODEL || 'doubao-seed-1-8';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const round = args.find((a, i) => args[i - 1] === '--round') || 'R1';
const idsArg = args.find((a, i) => args[i - 1] === '--ids');
const filterIds = idsArg ? new Set(idsArg.split(',').map((s) => s.trim())) : null;

const brand = JSON.parse(fs.readFileSync(path.join(MVP_ROOT, 'config/brand.json'), 'utf8'));
const { questions } = JSON.parse(fs.readFileSync(path.join(MVP_ROOT, 'config/questions.json'), 'utf8'));

const selected = questions.filter((q) => !filterIds || filterIds.has(q.id));
if (selected.length === 0) {
  console.error('No questions matched.');
  process.exit(1);
}

const outDir = path.join(MVP_ROOT, 'data', round.toLowerCase());
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'records.json');

let existing = [];
if (fs.existsSync(outFile)) {
  existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
}

async function chat(questionText) {
  const url = `${BASE_URL}/chat/completions`;
  const body = {
    model: MODEL,
    messages: [{ role: 'user', content: questionText }],
    temperature: 0.7,
  };

  if (dryRun) {
    return { dry_run: true, model: MODEL, question: questionText };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  const answer = data.choices?.[0]?.message?.content ?? '';
  return {
    model: data.model || MODEL,
    answer_full: answer,
    usage: data.usage,
    raw_id: data.id,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!dryRun && !API_KEY) {
    console.error('Missing TRINITY_API_KEY. Set in trinity-AI/.env or mvp/.env');
    process.exit(1);
  }

  console.log(`Round: ${round} | Model: ${MODEL} | Questions: ${selected.length}`);
  const records = [...existing.filter((r) => r.collection_channel === 'trinity-api-doubao')];
  const byKey = new Map(records.map((r) => [`${r.question_id}:${r.round}`, r]));

  for (const q of selected) {
    const key = `${q.id}:${round}`;
    console.log(`→ ${q.id} ${q.text.slice(0, 40)}…`);

    if (dryRun) {
      console.log('  (dry-run, skip API)');
      continue;
    }

    try {
      const result = await chat(q.text);
      const record = {
        question_id: q.id,
        question_type: q.type,
        question_text: q.text,
        platform: 'doubao',
        collection_channel: 'trinity-api-doubao',
        model: result.model,
        round,
        collected_at: new Date().toISOString(),
        answer_full: result.answer_full,
        usage: result.usage,
        brand_id: brand.brand_id,
      };
      byKey.set(key, record);
      await sleep(800);
    } catch (err) {
      console.error(`  ✗ ${q.id}: ${err.message}`);
    }
  }

  if (!dryRun) {
    const merged = [...byKey.values()].sort((a, b) => a.question_id.localeCompare(b.question_id));
    fs.writeFileSync(outFile, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`\nWrote ${merged.length} records → ${outFile}`);
    console.log('Next: node apps/trinity-geo/mvp/scripts/analyze.mjs --round', round);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
