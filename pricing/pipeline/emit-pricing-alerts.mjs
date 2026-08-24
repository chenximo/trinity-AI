#!/usr/bin/env node
/**
 * 合并 validate 报告 → 告警 Markdown / Webhook
 *
 *   npm run pricing:alert
 *   npm run pricing:alert -- --dry-run
 *   npm run pricing:alert -- --test-ping
 *   npm run pricing:alert -- --heartbeat
 *   npm run pricing:alert -- --full-webhook   # 钉钉推全量 blocking 列表（默认摘要）
 *
 * 环境变量：PRICING_ALERT_WEBHOOK_URL
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertDingTalkKeywordConfigured,
  collectPricingAlerts,
  alertsToMarkdown,
  alertsToDigestMarkdown,
  alertsDigestTitle,
  postPricingAlertWebhook,
  postPricingWebhookMarkdown,
  resolveDingTalkKeyword,
  webhookPayloadForAlerts,
} from "./lib/pricing-alerts-lib.mjs";
import { OUT_VALIDATE_DIR } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const OUT_MD = path.join(OUT_VALIDATE_DIR, "pricing-alerts.md");
const OUT_JSON = path.join(OUT_VALIDATE_DIR, "pricing-alerts.json");
const LISTING_COMPARE = path.join(OUT_VALIDATE_DIR, "listing-compare.json");
const MODALITIES = new Set(["text", "image", "video"]);

async function loadListingCompareSummary() {
  try {
    const raw = JSON.parse(await readFile(LISTING_COMPARE, "utf8"));
    return raw.summary ?? null;
  } catch {
    return null;
  }
}

async function loadDotEnv() {
  try {
    const raw = await readFile(path.join(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") {
        process.env[key] = val;
      }
    }
  } catch {
    // no .env
  }
}

function parseArgs() {
  const modalityArg = process.argv.find((a) => a.startsWith("--modality="));
  const modality = modalityArg?.split("=")[1];
  if (modality && !MODALITIES.has(modality)) {
    throw new Error(`Unsupported modality: ${modality}`);
  }
  return {
    dryRun: process.argv.includes("--dry-run"),
    testPing: process.argv.includes("--test-ping"),
    heartbeat: process.argv.includes("--heartbeat"),
    fullWebhook: process.argv.includes("--full-webhook"),
    modality,
  };
}

async function main() {
  await loadDotEnv();
  const { dryRun, testPing, heartbeat, fullWebhook, modality } = parseArgs();
  const webhook = process.env.PRICING_ALERT_WEBHOOK_URL;

  if (testPing) {
    if (!webhook) {
      console.error("PRICING_ALERT_WEBHOOK_URL 未设置");
      process.exit(1);
    }
    try {
      assertDingTalkKeywordConfigured(webhook);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    console.log(`Using DingTalk keyword: ${resolveDingTalkKeyword()}`);
    await postPricingWebhookMarkdown(
      webhook,
      "价目告警测试",
      "价目巡检钉钉通道测试 · 可忽略\n\n若收到本条，说明 webhook 已接通。",
    );
    console.log("Test ping sent to webhook");
    process.exit(0);
  }

  const alerts = await collectPricingAlerts(OUT_VALIDATE_DIR, { modality });
  const blocking = alerts.filter((a) => a.blocking !== false);
  const generatedAt = new Date().toISOString();
  const listingSummary = await loadListingCompareSummary();
  const webhookMarkdown = fullWebhook
    ? alertsToMarkdown(blocking)
    : alertsToDigestMarkdown(alerts, { generatedAt, listingSummary, modality });

  const markdown = alertsToMarkdown(alerts);
  const outJson = modality
    ? path.join(OUT_VALIDATE_DIR, `pricing-alerts-${modality}.json`)
    : OUT_JSON;
  const outMd = modality
    ? path.join(OUT_VALIDATE_DIR, `pricing-alerts-${modality}.md`)
    : OUT_MD;

  const bundle = {
    schema: "trinity.pricing.alert-bundle/v1",
    generatedAt,
    modality: modality ?? "all",
    alertCount: alerts.length,
    blockingCount: blocking.length,
    alerts,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  await writeFile(outJson, JSON.stringify(bundle, null, 2), "utf8");
  await writeFile(outMd, markdown, "utf8");

  console.log(markdown);
  console.log(`\nWrote ${outJson}`);
  console.log(`Wrote ${outMd}`);

  if (dryRun) {
    console.log("\n--- webhook digest preview ---\n");
    console.log(webhookMarkdown);
    console.log("\n(dry-run: 未推送 webhook)");
    process.exit(0);
  }

  if (webhook && blocking.length) {
    assertDingTalkKeywordConfigured(webhook);
    const payload = webhookPayloadForAlerts(
      blocking,
      webhookMarkdown,
      alertsDigestTitle(blocking, { modality }),
    );
    await postPricingAlertWebhook(webhook, payload);
    console.log(
      `\nPushed digest (${blocking.length} blocking) to webhook` +
        (fullWebhook ? " [full-webhook]" : ""),
    );
  } else if (webhook && heartbeat && blocking.length === 0) {
    assertDingTalkKeywordConfigured(webhook);
    const md = alertsToDigestMarkdown(alerts, { generatedAt, listingSummary, modality });
    await postPricingWebhookMarkdown(webhook, alertsDigestTitle(blocking, { modality }), md);
    console.log("\nPushed heartbeat (0 blocking alerts) to webhook");
  } else if (!webhook && blocking.length) {
    console.warn(
      "\nPRICING_ALERT_WEBHOOK_URL 未设置，仅写入本地告警文件",
    );
  }

  process.exit(blocking.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
