#!/usr/bin/env node
/**
 * 合并 validate 报告 → 告警 Markdown / Webhook
 *
 *   npm run pricing:alert
 *   npm run pricing:alert -- --dry-run
 *
 * 环境变量：PRICING_ALERT_WEBHOOK_URL
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  collectPricingAlerts,
  alertsToMarkdown,
  postPricingAlertWebhook,
  webhookPayloadForAlerts,
} from "./lib/pricing-alerts-lib.mjs";
import { OUT_VALIDATE_DIR } from "./lib/paths.mjs";

const OUT_MD = path.join(OUT_VALIDATE_DIR, "pricing-alerts.md");
const OUT_JSON = path.join(OUT_VALIDATE_DIR, "pricing-alerts.json");

function parseArgs() {
  return { dryRun: process.argv.includes("--dry-run") };
}

async function main() {
  const { dryRun } = parseArgs();
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

  const webhook = process.env.PRICING_ALERT_WEBHOOK_URL;
  if (dryRun) {
    console.log("\n(dry-run: 未推送 webhook)");
    process.exit(0);
  }

  if (webhook && blocking.length) {
    const payload = webhookPayloadForAlerts(blocking, alertsToMarkdown(blocking));
    await postPricingAlertWebhook(webhook, payload);
    console.log(`\nPushed ${blocking.length} blocking alert(s) to webhook`);
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
