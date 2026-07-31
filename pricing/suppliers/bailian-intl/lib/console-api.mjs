/**
 * 百炼国际控制台价目 API（无需登录也可匿名调用）
 * POST bailian-singapore-cs …/listModelPrices
 */

import { randomUUID } from "node:crypto";
import { CONSOLE_DOC_URL } from "./pricing-api.mjs";

const API_URL =
  "https://bailian-singapore-cs.alibabacloud.com/data/api.json?action=IntlBroadScopeAspnGateway&product=sfm_bailian&api=zeldaHttp.dashscopeModel./zelda/api/v1/modelCenter/listModelPrices&_v=undefined";
const CATEGORIES_URL =
  "https://bailian-singapore-cs.alibabacloud.com/data/api.json?action=IntlBroadScopeAspnGateway&product=sfm_bailian&api=zeldaHttp.dashscopeModel./zelda/api/v1/modelCenter/listModelPriceCategories&_v=undefined";

const LIST_API = "zeldaHttp.dashscopeModel./zelda/api/v1/modelCenter/listModelPrices";
const CAT_API =
  "zeldaHttp.dashscopeModel./zelda/api/v1/modelCenter/listModelPriceCategories";

function cornerstoneParam(anonymousId) {
  return {
    feTraceId: randomUUID(),
    feURL: CONSOLE_DOC_URL,
    protocol: "V2",
    console: "ONE_CONSOLE",
    productCode: "p_efm",
    switchUserType: 3,
    domain: "modelstudio.console.alibabacloud.com",
    consoleSite: "MODELSTUDIO_ALBABACLOUD",
    xsp_lang: "en-US",
    "X-Anonymous-Id": anonymousId,
  };
}

function encodeParams(api, input, anonymousId) {
  const payload = {
    Api: api,
    V: "1.0",
    Data: {
      input,
      cornerstoneParam: cornerstoneParam(anonymousId),
    },
  };
  return `params=${encodeURIComponent(JSON.stringify(payload))}&region=ap-southeast-1`;
}

function unwrapData(json) {
  return (
    json?.data?.DataV2?.data?.data ??
    json?.data?.DataV2?.data ??
    json?.data?.data ??
    json?.data ??
    null
  );
}

/**
 * @param {import('playwright').APIRequestContext} request
 * @param {string} anonymousId
 */
async function postGateway(request, api, input, anonymousId) {
  const url = api.includes("listModelPriceCategories")
    ? CATEGORIES_URL
    : API_URL;
  const res = await request.post(url, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      referer: "https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc",
      origin: "https://modelstudio.console.alibabacloud.com",
    },
    data: encodeParams(api, input, anonymousId),
    timeout: 60_000,
  });
  if (!res.ok()) {
    throw new Error(`console API HTTP ${res.status()} ${api}`);
  }
  return unwrapData(await res.json());
}

function pickPrice(prices, type) {
  const hit = (prices ?? []).find((p) => p.type === type);
  return hit?.price != null && hit.price !== "" ? String(hit.price) : null;
}

/** API list item → 与帮助中心表头对齐的 row（供 parsePricingTables） */
export function consolePriceItemToRow(item, categoryLevel1, categoryLevel2) {
  const prices = item.prices ?? [];
  const input = pickPrice(prices, "input_token");
  const output = pickPrice(prices, "output_token");
  const cacheImplicit = pickPrice(prices, "input_token_cache");
  const cacheExplicitCreate = pickPrice(
    prices,
    "input_token_cache_creation_5m",
  );
  const cacheExplicitHit = pickPrice(prices, "input_token_cache_read");
  const range = item.rangeName || "No tiered pricing";
  const mode = item.mode || item.thinkingMode || "-";

  const fmt = (v) => (v != null ? `$${v}` : "");
  return {
    "Model ID": item.itemCode ?? "",
    Model: item.itemCode ?? "",
    "Deployment scope": "International",
    Mode: mode,
    "Input tokens per request": range,
    "Input Token Range": range,
    "Input price (per 1 million tokens)": fmt(input),
    "Input Price": fmt(input),
    "Output price (per 1 million tokens)": fmt(output),
    "Output Price": fmt(output),
    "Input Price (Implicit Cache Hit)": fmt(cacheImplicit),
    "Input Price (Explicit Cache Creation)": fmt(cacheExplicitCreate),
    "Input Price (Explicit Cache Hit)": fmt(cacheExplicitHit),
    "Free quota": "",
    _categoryLevel1: categoryLevel1,
    _categoryLevel2: categoryLevel2,
    _raw: item,
  };
}

/**
 * 打开控制台页拿匿名会话，再分页拉全量 Text-Generation 价目
 * @param {import('playwright').Page} page
 */
export async function fetchConsolePricingViaApi(page) {
  await page.goto(CONSOLE_DOC_URL, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForTimeout(5000);

  let anonymousId = `anon-${randomUUID()}`;
  try {
    const cookies = await page.context().cookies();
    const c =
      cookies.find((x) => /anonymous|cna|isg/i.test(x.name)) ?? cookies[0];
    if (c?.value) anonymousId = c.value.slice(0, 64);
  } catch {
    /* keep generated */
  }

  const request = page.context().request;
  const catPayload = await postGateway(
    request,
    CAT_API,
    { region: "ap-southeast-1" },
    anonymousId,
  );
  const categories = Array.isArray(catPayload?.data)
    ? catPayload.data
    : Array.isArray(catPayload)
      ? catPayload
      : [];

  const textCat = categories.find(
    (c) => c.categoryLevel1 === "Text-Generation" || /Text/i.test(c.name),
  );
  const level2List =
    textCat?.items?.length > 0
      ? textCat.items.map((i) => i.categoryLevel2).filter(Boolean)
      : ["Qwen", "Other"];

  const allItems = [];
  const pageSize = 100;

  for (const categoryLevel2 of level2List) {
    let pageNo = 1;
    let total = Infinity;
    while ((pageNo - 1) * pageSize < total) {
      const payload = await postGateway(
        request,
        LIST_API,
        {
          region: "ap-southeast-1",
          categoryLevel1: "Text-Generation",
          batch: false,
          itemCode: "",
          pageNo,
          pageSize,
          categoryLevel2,
        },
        anonymousId,
      );
      const block = payload?.data ?? payload;
      const list = block?.list ?? [];
      total = Number(block?.total ?? list.length);
      for (const item of list) {
        allItems.push({
          ...item,
          _categoryLevel1: "Text-Generation",
          _categoryLevel2: categoryLevel2,
        });
      }
      if (!list.length) break;
      pageNo += 1;
      if (pageNo > 50) break;
    }
  }

  const rows = allItems.map((item) =>
    consolePriceItemToRow(
      item,
      item._categoryLevel1,
      item._categoryLevel2,
    ),
  );

  const headers = [
    "Model ID",
    "Deployment scope",
    "Mode",
    "Input tokens per request",
    "Input price (per 1 million tokens)",
    "Output price (per 1 million tokens)",
    "Input Price (Implicit Cache Hit)",
    "Input Price (Explicit Cache Creation)",
    "Input Price (Explicit Cache Hit)",
    "Free quota",
  ];

  return {
    source: "alibaba_bailian_intl_console_api",
    docUrl: CONSOLE_DOC_URL,
    scrapedAt: new Date().toISOString(),
    anonymousIdUsed: Boolean(anonymousId),
    categoryLevel2: level2List,
    itemCount: allItems.length,
    tables: [
      {
        section: "Text Generation (console API)",
        headers,
        rows: rows.map((r) => {
          const out = {};
          for (const h of headers) out[h] = r[h] ?? "";
          return out;
        }),
      },
    ],
    tableCount: 1,
    rowCount: rows.length,
    rawItems: allItems,
  };
}
