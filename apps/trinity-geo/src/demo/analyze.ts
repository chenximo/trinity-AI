import type {
  Action,
  AnalysisResult,
  Annotation,
  BrandConfig,
  Diagnosis,
  Record,
} from "./types";

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMentions(text: string, names: string[]) {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const name of names) {
    const re = new RegExp(escapeRe(name), "gi");
    if (re.test(text) || lower.includes(name.toLowerCase())) {
      found.push(name);
    }
  }
  return [...new Set(found)];
}

function firstIndex(text: string, names: string[]) {
  let min = -1;
  for (const name of names) {
    const idx = text.toLowerCase().indexOf(name.toLowerCase());
    if (idx !== -1 && (min === -1 || idx < min)) min = idx;
  }
  return min;
}

function mentionPosition(text: string, names: string[]) {
  const idx = firstIndex(text, names);
  if (idx === -1) return "—";
  const ratio = idx / (text.length || 1);
  if (ratio < 0.15) return "首推";
  if (ratio < 0.35) return "前列";
  if (ratio < 0.7) return "中段";
  return "末段";
}

function inAnswerBody(
  text: string,
  brandNames: string[],
  competitorHits: { id: string; names: string[] }[],
) {
  const brandIdx = firstIndex(text, brandNames);
  if (brandIdx === -1) return false;
  const snippet = text.slice(Math.max(0, brandIdx - 80), brandIdx + 120);
  const promo = /(推荐|首选|适合|优势|核心|定位|一款|两家|三款|排名|第一|第二)/;
  if (promo.test(snippet)) return true;
  const compNames = competitorHits.flatMap((c) => c.names);
  const compIdx = firstIndex(text, compNames);
  if (compNames.length > 0 && brandIdx < compIdx + 200) return true;
  return brandIdx < text.length * 0.85;
}

function detectCompetitors(
  text: string,
  competitors: BrandConfig["competitors"],
) {
  return competitors
    .map((c) => ({ id: c.id, names: findMentions(text, c.names) }))
    .filter((c) => c.names.length > 0);
}

const actionTemplates: Record<string, { title: string; detail: string }> = {
  D1: {
    title: "品类失声：补充选型/对比证据页",
    detail:
      "在 doc.trinitydesk.ai 增加「API 聚合平台选型」FAQ：首段定义 + 3 条可验证事实 + 与 OpenRouter / 企业级方案对比表。",
  },
  D2: {
    title: "品牌词未进入答案：统一品牌实体与别名",
    detail:
      "官网与文档统一 Trinity AI / Trinity Desk 全称；补 meta 与可抓取正文，减少纯 SPA 壳。",
  },
  D3: {
    title: "弱提及：证据前置",
    detail: "将核心事实（模型数、协议、计费）移到页面首段。",
  },
  D4: {
    title: "叙事位置落后：加强对比块",
    detail: "增加 Trinity vs OpenRouter 对比表（国内线路、价格、模型覆盖）。",
  },
};

export function analyzeRecords(
  records: Record[],
  brand: BrandConfig,
  round: string,
  existingActions: Action[] = [],
): AnalysisResult {
  const filtered = records.filter((r) => r.round === round);
  const brandNames = [brand.primary_name, ...brand.aliases];

  const annotations: Annotation[] = filtered.map((r) => {
    const text = r.answer_full || "";
    const brandHits = findMentions(text, brandNames);
    const compHits = detectCompetitors(text, brand.competitors);
    const mentioned = brandHits.length > 0;
    const inBody = mentioned && inAnswerBody(text, brandNames, compHits);
    let compLabel = "无";
    if (compHits.length === 1) compLabel = compHits[0].id;
    else if (compHits.length > 1)
      compLabel = compHits.map((c) => c.id).join("+");

    return {
      ...r,
      brand_mentioned: mentioned ? "Y" : "N",
      brand_hits: brandHits,
      mention_position: mentioned ? mentionPosition(text, brandHits) : "—",
      in_answer_body: inBody ? "Y" : "N",
      competitor_mentioned: compLabel,
      competitors_detail: compHits,
      sentiment: mentioned ? "中" : "—",
    };
  });

  const total = annotations.length;
  const inBodyCount = annotations.filter((a) => a.in_answer_body === "Y").length;
  const soa = total ? (inBodyCount / total) * 100 : 0;

  const byType: Record<string, { total: number; in: number }> = {};
  for (const a of annotations) {
    const t = a.question_type || "未知";
    if (!byType[t]) byType[t] = { total: 0, in: 0 };
    byType[t].total += 1;
    if (a.in_answer_body === "Y") byType[t].in += 1;
  }

  const diagnoses: Diagnosis[] = [];
  for (const a of annotations) {
    const comps = a.competitors_detail || [];
    const compY = comps.length > 0;
    const rules: string[] = [];

    if (a.brand_mentioned === "N" && compY) rules.push("D1");
    if (a.brand_mentioned === "N" && /trinity/i.test(a.question_text))
      rules.push("D2");
    if (a.brand_mentioned === "Y" && a.in_answer_body === "N") rules.push("D3");
    if (a.mention_position === "末段" && comps.length) rules.push("D4");

    if (!rules.length) continue;

    let priority = "P2";
    if (
      rules.includes("D1") &&
      ["品类词", "对比词", "场景词"].includes(a.question_type)
    )
      priority = "P0";
    else if (rules.includes("D2")) priority = "P1";

    const evidenceComp = comps[0]?.names[0] || "竞品";
    const evidence =
      a.brand_mentioned === "N"
        ? `未提及 Trinity；回答主推 ${evidenceComp} 等`
        : `提及 ${a.brand_hits.join("、")}，位置 ${a.mention_position}`;

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

  const statusMap = new Map(
    existingActions.map((a) => [a.action_id, a.status]),
  );
  const actions: Action[] = [];
  const seen = new Set<string>();

  for (const d of diagnoses.sort((a, b) => a.priority.localeCompare(b.priority))) {
    for (const rid of d.diagnosis_ids) {
      if (seen.has(rid)) continue;
      seen.add(rid);
      const t = actionTemplates[rid];
      if (!t) continue;
      const actionId = `A-${rid}`;
      actions.push({
        action_id: actionId,
        diagnosis_id: rid,
        title: t.title,
        detail: t.detail,
        status: statusMap.get(actionId) || "待办",
        linked_questions: diagnoses
          .filter((x) => x.diagnosis_ids.includes(rid))
          .map((x) => x.question_id),
      });
    }
  }

  return {
    annotations,
    diagnoses,
    actions,
    soa,
    inBodyCount,
    total,
    byType,
  };
}
