/**
 * 合并各 validate 报告 → trinity.pricing.alert/v1 → webhook
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { OUT_VALIDATE_DIR } from "./paths.mjs";

const PEER_DECISION_ACTION =
  "先查种子/抓取是否有误；确认无误后需人工决策是否找商务确认";

const VALIDATE_FILES = [
  {
    file: "official-aigc-cross.json",
    phase: "L1_vs_L2",
  },
  {
    file: "official-vs-suppliers-alerts.json",
    phase: "L1_vs_L3",
    alertsKey: "alerts",
  },
  {
    file: "listing-compare.json",
    phase: "L1_vs_L4",
    alertsKey: "alerts",
  },
];

function alertFromTokenhubRow(row, phase) {
  const alerts = [];
  const base = {
    schema: "trinity.pricing.alert/v1",
    phase,
    trinityId: row.trinityId,
    vendorModelId: row.vendorModelId,
    refs: {
      official: "suppliers/official/output/text/vendor-pricing.json",
      tokenhub: "suppliers/tokenhub/output/pricing-console-api.json",
    },
  };

  for (const issue of row.issues ?? []) {
    if (issue.kind === "tier_count" || issue.kind === "missing_tier") {
      alerts.push({
        ...base,
        severity: "error",
        type: "peer_tier_mismatch",
        title: `官方↔TokenHub 档位不一致`,
        detail: `${issue.kind} ${issue.tierKey ?? ""}`,
        suggestedAction: `查种子 / tierKey；${PEER_DECISION_ACTION}`,
        blocking: true,
      });
    }
    if (issue.kind === "price_mismatch") {
      const parts = Object.entries(issue.deltas ?? {})
        .filter(([, d]) => d.status !== "ok")
        .map(([f, d]) => `${f} ${d.pct ?? "missing"}%`);
      alerts.push({
        ...base,
        severity: "warn",
        type: "peer_price_mismatch",
        title: `官方↔TokenHub 价格不一致`,
        detail: `${issue.tierLabel}: ${parts.join(", ")}`,
        suggestedAction: `查种子或 TokenHub 价；${PEER_DECISION_ACTION}`,
        blocking: true,
      });
    }
  }
  return alerts;
}

function alertFromOfficialAigcRow(row, phase) {
  const alerts = [];
  const base = {
    schema: "trinity.pricing.alert/v1",
    phase,
    trinityId: row.trinityId,
    vendorModelId: row.vendorModelId,
    refs: {
      official: "suppliers/official/output/text/vendor-pricing.json",
      aigc: "suppliers/aigc/data/pricing-sheet.mjs",
    },
  };

  for (const issue of row.issues ?? []) {
    if (issue.kind === "tier_count" || issue.kind === "missing_tier") {
      alerts.push({
        ...base,
        severity: "error",
        type: "peer_tier_mismatch",
        title: `官方↔AIGC 档位不一致`,
        detail: `${row.aigcKey}: ${issue.kind} ${issue.tierKey ?? ""}`,
        suggestedAction: `查种子 / tierKey / AIGC sheet；${PEER_DECISION_ACTION}`,
        blocking: true,
      });
    }
    if (issue.kind === "price_mismatch") {
      const parts = Object.entries(issue.deltas ?? {})
        .filter(([, d]) => d.status !== "ok")
        .map(([f, d]) => `${f} ${d.pct ?? "missing"}%`);
      alerts.push({
        ...base,
        severity: "warn",
        type: "peer_price_mismatch",
        title: `官方↔AIGC 价格不一致`,
        detail: `${row.aigcKey} · ${issue.tierLabel}: ${parts.join(", ")}`,
        suggestedAction: `查种子或 AIGC 商务价；${PEER_DECISION_ACTION}`,
        blocking: true,
      });
    }
  }
  return alerts;
}

/**
 * @param {string} validateDir
 */
export async function collectPricingAlerts(validateDir = OUT_VALIDATE_DIR) {
  const all = [];

  for (const spec of VALIDATE_FILES) {
    const p = path.join(validateDir, spec.file);
    let raw;
    try {
      raw = JSON.parse(await readFile(p, "utf8"));
    } catch {
      continue;
    }

    if (spec.alertsKey) {
      for (const a of raw[spec.alertsKey] ?? []) {
        all.push({ ...a, phase: a.phase ?? spec.phase, source: spec.file });
      }
      continue;
    }

    for (const row of raw.officialVsAigcSheet ?? []) {
      all.push(
        ...alertFromOfficialAigcRow(row, spec.phase).map((a) => ({
          ...a,
          source: spec.file,
        })),
      );
    }
    for (const row of raw.officialVsAigcDomestic ?? []) {
      all.push(
        ...alertFromOfficialAigcRow(row, spec.phase).map((a) => ({
          ...a,
          type: "peer_tier_mismatch",
          source: spec.file,
        })),
      );
    }
    for (const row of raw.officialVsTokenhub ?? []) {
      all.push(
        ...alertFromTokenhubRow(row, spec.phase).map((a) => ({
          ...a,
          source: spec.file,
        })),
      );
    }
    for (const row of raw.aigcMissing ?? []) {
      if (row.reason === "not_in_pricing_sheet") {
        all.push({
          schema: "trinity.pricing.alert/v1",
          severity: "error",
          type: "seed_suspect",
          phase: spec.phase,
          trinityId: row.trinityId,
          title: "AIGC sheet 缺失映射模型",
          detail: `${row.trinityId} → ${row.aigcKey} (${row.reason})`,
          suggestedAction: "查 aigc trinity-map 与 pricing-sheet",
          blocking: true,
          source: spec.file,
        });
      }
    }
  }

  const seen = new Set();
  return all.filter((a) => {
    const key = `${a.type}|${a.trinityId}|${a.supplier ?? ""}|${a.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @param {object[]} alerts
 */
export function alertsToMarkdown(alerts) {
  if (!alerts.length) {
    return "# 价目告警\n\n无待处理告警。\n";
  }
  const lines = [
    "# 价目告警汇总",
    "",
    `共 ${alerts.length} 条`,
    "",
  ];
  const blocking = alerts.filter((a) => a.blocking !== false);
  const info = alerts.filter((a) => a.blocking === false);
  if (blocking.length) {
    lines.push("## 待人工决策", "");
    for (const a of blocking) {
      lines.push(
        `### [${a.severity}] ${a.type} · \`${a.trinityId ?? "—"}\``,
        "",
        `- **阶段**: ${a.phase}`,
        `- **标题**: ${a.title}`,
        `- **说明**: ${a.detail}`,
        `- **建议**: ${a.suggestedAction ?? "—"}`,
        "",
      );
    }
  }
  if (info.length) {
    lines.push("## 已登记例外", "");
    for (const a of info) {
      lines.push(`- \`${a.trinityId}\` · ${a.title}`);
    }
  }
  return lines.join("\n");
}

/** @param {string} [webhookUrl] */
export function isDingTalkWebhook(webhookUrl) {
  return /oapi\.dingtalk\.com/i.test(webhookUrl ?? "");
}

/** 群机器人「自定义关键词」须与 PRICING_ALERT_DINGTALK_KEYWORD 完全一致 */
export function resolveDingTalkKeyword() {
  return process.env.PRICING_ALERT_DINGTALK_KEYWORD?.trim() || "";
}

/**
 * 钉钉 webhook 发送前校验：未配置关键词时直接失败，避免 errcode 310000
 * @param {string} webhookUrl
 */
export function assertDingTalkKeywordConfigured(webhookUrl) {
  if (!isDingTalkWebhook(webhookUrl)) return;
  const kw = resolveDingTalkKeyword();
  if (kw) return;
  throw new Error(
    [
      "钉钉机器人已开启「自定义关键词」，但 PRICING_ALERT_DINGTALK_KEYWORD 未设置。",
      "请在 trinity-AI/.env 填写与群机器人安全设置一致的关键词，例如：",
      "  PRICING_ALERT_DINGTALK_KEYWORD=价目",
      "查看路径：钉钉群 → 机器人设置 → 安全设置 → 自定义关键词",
    ].join("\n"),
  );
}

/**
 * 钉钉自定义关键词机器人：正文须含关键词（见 PRICING_ALERT_DINGTALK_KEYWORD）
 * @param {string} markdown
 * @param {string} [keyword]
 */
export function applyDingTalkKeyword(markdown, keyword) {
  const kw = (keyword ?? resolveDingTalkKeyword()).trim();
  if (!kw || markdown.includes(kw)) return markdown;
  return `${kw}\n\n${markdown}`;
}

/**
 * @param {string} webhookUrl
 * @param {string} markdown
 * @param {{ title?: string, alerts?: object[] }} [opts]
 */
export function buildWebhookPayload(webhookUrl, markdown, opts = {}) {
  const { title = "价目告警", alerts = [] } = opts;
  if (isDingTalkWebhook(webhookUrl)) {
    const kw = resolveDingTalkKeyword();
    const text = applyDingTalkKeyword(markdown, kw);
    return {
      msgtype: "markdown",
      markdown: {
        title: applyDingTalkKeyword(title, kw),
        text,
      },
    };
  }
  return {
    msgtype: "markdown",
    markdown: { content: markdown },
    trinity_pricing_alerts: alerts,
    alertCount: alerts.length,
    blockingCount: alerts.filter((a) => a.blocking !== false).length,
  };
}

/**
 * @param {string} webhookUrl
 * @param {object} payload
 */
export async function postPricingAlertWebhook(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Webhook HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const body = await res.json().catch(() => ({}));
  if (body.errcode != null && body.errcode !== 0) {
    const hint =
      body.errcode === 310000
        ? [
            "",
            "钉钉「关键词不匹配」：请在 .env 设置 PRICING_ALERT_DINGTALK_KEYWORD，",
            "值须与群机器人 → 安全设置 → 自定义关键词 完全一致。",
            `当前配置：${resolveDingTalkKeyword() || "（空）"}`,
          ].join("\n")
        : "";
    throw new Error(
      `Webhook errcode ${body.errcode}: ${body.errmsg ?? "unknown"}${hint}`,
    );
  }
  return body;
}

/** 企业微信 / 飞书 / 钉钉 */
export function webhookPayloadForAlerts(alerts, markdown) {
  const url = process.env.PRICING_ALERT_WEBHOOK_URL ?? "";
  return buildWebhookPayload(url, markdown, {
    title: "价目告警",
    alerts,
  });
}

/**
 * @param {string} webhookUrl
 * @param {string} title
 * @param {string} markdown
 */
export async function postPricingWebhookMarkdown(webhookUrl, title, markdown) {
  assertDingTalkKeywordConfigured(webhookUrl);
  const payload = buildWebhookPayload(webhookUrl, markdown, { title });
  return postPricingAlertWebhook(webhookUrl, payload);
}
