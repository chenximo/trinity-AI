#!/usr/bin/env node
/**
 * 合并 validate 报告 → 告警 Markdown / Webhook
 *
 *   npm run pricing:alert
 *   npm run pricing:alert -- --dry-run
 *   npm run pricing:alert -- --test-ping
 *   npm run pricing:alert -- --heartbeat
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
  return {
    dryRun: process.argv.includes("--dry-run"),
    testPing: process.argv.includes("--test-ping"),
    heartbeat: process.argv.includes("--heartbeat"),
  };
}

async function main() {
  await loadDotEnv();
  const { dryRun, testPing, heartbeat } = parseArgs();
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

  const alerts = await collectPricingAlerts();
  const blocking = alerts.filter((a) => a.blocking !== false);
  const markdown = alertsToMarkdown(alerts);

  const bundle = {
    schema: "trinity.pricing.alert-bundle/v1",
    generatedAt: new Date().toISOString(),
    alertCount: alerts.length,
    blockingCount: blocking.length,
    alerts,
  };

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(bundle, null, 2), "utf8");
  await writeFile(OUT_MD, markdown, "utf8");

  console.log(markdown);
  console.log(`\nWrote ${OUT_JSON}`);
  console.log(`Wrote ${OUT_MD}`);

  if (dryRun) {
    console.log("\n(dry-run: 未推送 webhook)");
    process.exit(0);
  }

  if (webhook && blocking.length) {
    assertDingTalkKeywordConfigured(webhook);
    const payload = webhookPayloadForAlerts(blocking, alertsToMarkdown(blocking));
    await postPricingAlertWebhook(webhook, payload);
    console.log(`\nPushed ${blocking.length} blocking alert(s) to webhook`);
  } else if (webhook && heartbeat && blocking.length === 0) {
    assertDingTalkKeywordConfigured(webhook);
    const md =
      alerts.length === 0
        ? "# 价目巡检完成\n\n本周 **0** 条待人工决策告警。"
        : alertsToMarkdown(alerts);
    await postPricingWebhookMarkdown(webhook, "价目巡检完成", md);
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
