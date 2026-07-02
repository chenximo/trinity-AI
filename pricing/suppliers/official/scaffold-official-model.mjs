#!/usr/bin/env node
/**
 * 输出新增官方价模型的 catalog / seed / trinity-map 代码片段
 *
 *   node pricing/suppliers/official/scaffold-official-model.mjs \
 *     --modality=text --vendor=openai --vendor-label=GPT \
 *     --vendor-model-id=gpt-5.6 --trinity-id=gpt-5.6 \
 *     --doc-url=https://developers.openai.com/api/docs/models/gpt-5.6
 */

function parseArgs(argv) {
  /** @type {Record<string, string>} */
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const eq = key.indexOf("=");
      if (eq >= 0) o[key.slice(0, eq)] = key.slice(eq + 1);
      else o[key] = argv[++i] ?? "";
    }
  }
  return o;
}

const a = parseArgs(process.argv.slice(2));
const modality = a.modality ?? "text";
const vendor = a.vendor ?? "openai";
const vendorLabel = a["vendor-label"] ?? vendor;
const vendorModelId = a["vendor-model-id"];
const trinityId = a["trinity-id"] ?? vendorModelId;
const docUrl = a["doc-url"] ?? "";
const pricingUrl = a["pricing-url"] ?? "";
const trinityNote = a["trinity-note"] ?? "";

if (!vendorModelId || !docUrl) {
  console.error(`用法:
  node scaffold-official-model.mjs \\
    --modality=text|image|video \\
    --vendor=openai \\
    --vendor-label=GPT \\
    --vendor-model-id=gpt-5.6 \\
    --trinity-id=gpt-5.6 \\
    --doc-url=https://... \\
    [--pricing-url=https://...] \\
    [--trinity-note=目录名说明]

生文 seed 另需在 data/seeds/text.mjs 手写 input/output/cache（USD/M）。
生图/生视频 seed 在 data/seeds/{image,video}.mjs 写 tiers。`);
  process.exit(1);
}

const catalogFile = `pricing/suppliers/official/data/catalog/${modality}.mjs`;
const seedFile = `pricing/suppliers/official/data/seeds/${modality}.mjs`;

console.log(`# 官方价模型脚手架 · ${modality} · ${vendorModelId}

将下列片段粘贴到对应文件，核对后执行：
  npm run pricing:supplier:official:${modality} -- ${vendorModelId}

---

## 1. ${catalogFile}

\`\`\`javascript
  {
    vendor: "${vendor}",
    vendorLabel: "${vendorLabel}",
    vendorModelId: "${vendorModelId}",
    docUrl: "${docUrl}",${pricingUrl ? `\n    pricingUrl: "${pricingUrl}",` : ""}
    trinityNote: ${trinityNote ? `"${trinityNote}"` : "null"},
    region: "${modality === "text" && ["openai", "google", "xai", "anthropic"].includes(vendor) ? "global" : "domestic"}",
    status: "active",
  },
\`\`\`

---

## 2. ${seedFile}

${modality === "text" ? `\`\`\`javascript
  "${vendorModelId}": {
    currency: "CNY",  // 国内生文；国际用 "USD"
    tiers: [
      { tierLabel: "输入≤16k", input: 0, output: 0, cache: 0 },
      { tierLabel: "输入>16k", input: 0, output: 0 },
    ],
    note: "对照官网填写；单档可只写 input/output/cache",
  },
\`\`\`

单档简写仍支持：

\`\`\`javascript
  "${vendorModelId}": { currency: "USD", input: 0, output: 0, cache: 0 },
\`\`\`` : `\`\`\`javascript
  "${vendorModelId}": {
    tiers: [{ tierLabel: "统一价", price: 0, unit: "${modality === "image" ? "元/张" : "积分/次"}" }],
    note: "对照官网填写",
  },
\`\`\``}

---

## 3. pricing/suppliers/official/trinity-map.json

\`\`\`json
  "${trinityId}": {
    "modality": "${modality}",
    "vendor": "${vendor}",
    "vendorModelId": "${vendorModelId}"
  }
\`\`\`

---

## 4. 验证

\`\`\`bash
cd trinity-AI
npm run pricing:supplier:official:${modality} -- ${vendorModelId}
npm run pricing:compare:official -- ${trinityId}
\`\`\`
`);
