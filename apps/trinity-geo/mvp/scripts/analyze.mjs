#!/usr/bin/env node
/**
 * GEO MVP — 标注、SOA、规则诊断、建议动作、Markdown 报告。
 *
 *   node apps/trinity-geo/mvp/scripts/analyze.mjs --round R1
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MVP_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const round = args.find((a, i) => args[i - 1] === '--round') || 'R1';
const roundKey = round.toLowerCase();

const brand = JSON.parse(fs.readFileSync(path.join(MVP_ROOT, 'config/brand.json'), 'utf8'));
const recordsPath = path.join(MVP_ROOT, 'data', roundKey, 'records.json');

if (!fs.existsSync(recordsPath)) {
  console.error(`No records at ${recordsPath}. Run collect or import-manual first.`);
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMentions(text, names) {
  const lower = text.toLowerCase();
  const found = [];
  for (const name of names) {
    const re = new RegExp(escapeRe(name), 'gi');
    if (re.test(text) || lower.includes(name.toLowerCase())) {
      found.push(name);
    }
  }
  return [...new Set(found)];
}

function firstIndex(text, names) {
  let min = -1;
  for (const name of names) {
    const idx = text.toLowerCase().indexOf(name.toLowerCase());
    if (idx !== -1 && (min === -1 || idx < min)) min = idx;
  }
  return min;
}

function mentionPosition(text, names) {
  const idx = firstIndex(text, names);
  if (idx === -1) return '—';
  const len = text.length || 1;
  const ratio = idx / len;
  if (ratio < 0.15) return '首推';
  if (ratio < 0.35) return '前列';
  if (ratio < 0.7) return '中段';
  return '末段';
}

function inAnswerBody(text, brandNames, competitorHits) {
  const brandIdx = firstIndex(text, brandNames);
  if (brandIdx === -1) return false;
  const snippet = text.slice(Math.max(0, brandIdx - 80), brandIdx + 120);
  const promo = /(推荐|首选|适合|优势|核心|定位|一款|两家|三款|排名|第一|第二)/;
  if (promo.test(snippet)) return true;
  if (competitorHits.length > 0 && brandIdx < firstIndex(text, competitorHits.flatMap((c) => c.names)) + 200) {
    return true;
  }
  return brandIdx < text.length * 0.85;
}

function detectCompetitors(text, competitors) {
  return competitors
    .map((c) => ({ id: c.id, names: findMentions(text, c.names) }))
    .filter((c) => c.names.length > 0);
}

const brandNames = [brand.primary_name, ...brand.aliases];
const annotations = records.map((r) => {
  const text = r.answer_full || '';
  const brandHits = findMentions(text, brandNames);
  const compHits = detectCompetitors(text, brand.competitors);
  const mentioned = brandHits.length > 0;
  const inBody = mentioned && inAnswerBody(text, brandNames, compHits);
  let compLabel = '无';
  if (compHits.length === 1) compLabel = compHits[0].id;
  else if (compHits.length > 1) compLabel = compHits.map((c) => c.id).join('+');

  return {
    ...r,
    brand_mentioned: mentioned ? 'Y' : 'N',
    brand_hits: brandHits,
    mention_position: mentioned ? mentionPosition(text, brandHits) : '—',
    in_answer_body: inBody ? 'Y' : 'N',
    competitor_mentioned: compLabel,
    competitors_detail: compHits,
    sentiment: mentioned ? '中' : '—',
  };
});

const total = annotations.length;
const inBodyCount = annotations.filter((a) => a.in_answer_body === 'Y').length;
const soa = total ? (inBodyCount / total) * 100 : 0;

const byType = {};
for (const a of annotations) {
  const t = a.question_type || '未知';
  if (!byType[t]) byType[t] = { total: 0, in: 0 };
  byType[t].total += 1;
  if (a.in_answer_body === 'Y') byType[t].in += 1;
}

const diagnoses = [];
for (const a of annotations) {
  const comps = a.competitors_detail || [];
  const compY = comps.length > 0;
  const rules = [];

  if (a.brand_mentioned === 'N' && compY) rules.push('D1');
  if (a.brand_mentioned === 'N' && /品牌|trinity|Trinity/i.test(a.question_text)) rules.push('D2');
  if (a.brand_mentioned === 'Y' && a.in_answer_body === 'N') rules.push('D3');
  if (a.mention_position === '末段' && comps.some((c) => c.names.length)) rules.push('D4');

  if (rules.length === 0) continue;

  let priority = 'P2';
  if (rules.includes('D1') && ['品类词', '对比词', '场景词'].includes(a.question_type)) priority = 'P0';
  else if (rules.includes('D2')) priority = 'P1';

  const evidenceComp = comps[0]?.names[0] || '竞品';
  const evidence =
    a.brand_mentioned === 'N'
      ? `未提及 Trinity；回答主推 ${evidenceComp} 等`
      : `提及 ${a.brand_hits.join('、')}，位置 ${a.mention_position}`;

  diagnoses.push({
    question_id: a.question_id,
    question_text: a.question_text,
    question_type: a.question_type,
    platform: a.platform,
    collection_channel: a.collection_channel,
    diagnosis_ids: rules,
    priority,
    evidence,
    brand_mentioned: a.brand_mentioned,
    in_answer_body: a.in_answer_body,
    competitors: comps.map((c) => c.id),
  });
}

const actionTemplates = {
  D1: {
    title: '品类失声：补充选型/对比证据页',
    detail:
      '在 doc.trinitydesk.ai 增加「API 聚合平台选型」FAQ：首段定义 + 3 条可验证事实 + 与 OpenRouter / 企业级方案对比表，明确 Trinity 适用场景。',
  },
  D2: {
    title: '品牌词未进入答案：统一品牌实体与别名',
    detail:
      '官网与文档统一 Trinity AI / Trinity Desk 全称；About 与 meta 中写入别名；确保 trinitydesk.ai 可被爬虫读到正文（非纯 SPA 壳）。',
  },
  D3: {
    title: '弱提及：证据前置',
    detail: '将核心事实（模型数、协议兼容、计费方式）移到页面首段与 H1 下第一段。',
  },
  D4: {
    title: '叙事位置落后：加强对比块',
    detail: '增加 Trinity vs OpenRouter 对比表（国内线路、价格、模型覆盖、企业能力）。',
  },
};

const actions = [];
const seen = new Set();
for (const d of diagnoses.sort((a, b) => a.priority.localeCompare(b.priority))) {
  for (const rid of d.diagnosis_ids) {
    const key = rid;
    if (seen.has(key)) continue;
    seen.add(key);
    const t = actionTemplates[rid];
    if (!t) continue;
    actions.push({
      action_id: `A-${rid}`,
      diagnosis_id: rid,
      title: t.title,
      detail: t.detail,
      status: '待办',
      linked_questions: diagnoses.filter((x) => x.diagnosis_ids.includes(rid)).map((x) => x.question_id),
    });
  }
}

const outDataDir = path.join(MVP_ROOT, 'data', roundKey);
fs.writeFileSync(path.join(outDataDir, 'annotations.json'), JSON.stringify(annotations, null, 2));
fs.writeFileSync(path.join(outDataDir, 'diagnosis.json'), JSON.stringify(diagnoses, null, 2));
fs.writeFileSync(path.join(outDataDir, 'actions.json'), JSON.stringify(actions, null, 2));

const reportLines = [
  `# GEO R1 测量报告 · ${brand.primary_name} × 豆包`,
  '',
  `> 生成时间：${new Date().toISOString()}`,
  `> 轮次：${round} | 样本数：${total}`,
  '',
  '## SOA 总览',
  '',
  `| 指标 | 值 |`,
  `|------|-----|`,
  `| **SOA（进答案正文占比）** | **${soa.toFixed(1)}%**（${inBodyCount}/${total}） |`,
  `| 品牌提及率 | ${((annotations.filter((a) => a.brand_mentioned === 'Y').length / total) * 100).toFixed(1)}% |`,
  '',
  '### 分问题类型',
  '',
  '| 类型 | 采样 | 进答案 | SOA |',
  '|------|:----:|:------:|:---:|',
];

for (const [t, v] of Object.entries(byType)) {
  const pct = v.total ? ((v.in / v.total) * 100).toFixed(1) : '0';
  reportLines.push(`| ${t} | ${v.total} | ${v.in} | ${pct}% |`);
}

reportLines.push('', '## 逐题结果', '', '| ID | 类型 | 进答案 | 位置 | 竞品 | 渠道 |', '|----|------|:------:|------|------|------|');

for (const a of annotations) {
  reportLines.push(
    `| ${a.question_id} | ${a.question_type} | ${a.in_answer_body} | ${a.mention_position} | ${a.competitor_mentioned} | ${a.collection_channel} |`,
  );
}

reportLines.push('', '## 诊断（Top）', '');
for (const d of diagnoses.slice(0, 10)) {
  reportLines.push(`- **${d.priority} · ${d.question_id}** [${d.diagnosis_ids.join(',')}] ${d.evidence}`);
}

reportLines.push('', '## 建议动作', '');
for (const act of actions) {
  reportLines.push(`### ${act.action_id} ${act.title}`, '', act.detail, '', `关联问题：${act.linked_questions.join(', ')}`, '');
}

reportLines.push(
  '',
  '## 下一步（R2 验证）',
  '',
  '1. 完成 actions 中 P0 项（文档 FAQ + 对比表 + 官网 SEO）',
  '2. 等待 24–72h',
  '3. `node scripts/collect.mjs --round R2` 或重新在豆包 App 提问 Q00',
  '4. `node scripts/analyze.mjs --round R2` 对比 SOA 变化',
  '',
);

const reportPath = path.join(MVP_ROOT, 'reports', `${roundKey}-summary.md`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');

console.log(`SOA: ${soa.toFixed(1)}% (${inBodyCount}/${total})`);
console.log(`Diagnoses: ${diagnoses.length} | Actions: ${actions.length}`);
console.log(`Report → ${reportPath}`);
