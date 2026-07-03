#!/usr/bin/env node
/**
 * 原厂直连渠道构建（通用入口）
 *
 *   node pricing/suppliers/official-direct/build-pricing.mjs --channel=relay-cust
 *   node pricing/suppliers/official-direct/build-pricing.mjs --all
 */

import { buildOfficialDirectChannel } from "./lib/build-channel.mjs";
import { OFFICIAL_DIRECT_CHANNELS } from "./channels/index.mjs";

function parseArgs(argv) {
  const all = argv.includes("--all");
  const channel =
    argv.find((a) => a.startsWith("--channel="))?.split("=")[1] ?? "";
  return { all, channel };
}

async function main() {
  const { all, channel } = parseArgs(process.argv.slice(2));

  if (all) {
    for (const meta of OFFICIAL_DIRECT_CHANNELS) {
      const result = await buildOfficialDirectChannel(meta.supplierId);
      console.log(JSON.stringify({ supplierId: meta.supplierId, ...result }, null, 2));
    }
    return;
  }

  if (!channel) {
    console.error(
      "用法: build-pricing.mjs --channel=<supplierId> | --all\n" +
        "渠道: " +
        OFFICIAL_DIRECT_CHANNELS.map((c) => c.supplierId).join(", "),
    );
    process.exit(1);
  }

  const result = await buildOfficialDirectChannel(channel);
  const { meta, models, outFile, mapFile, modelCount, trinityMappedCount } =
    result;

  const summary = {
    supplierId: meta.supplierId,
    modelCount,
    trinityMappedCount,
    outFile,
    mapFile,
  };
  if (Array.isArray(meta.vendors)) {
    for (const v of meta.vendors) {
      summary[v] = models.filter((m) => m.vendor === v).length;
    }
  }
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
