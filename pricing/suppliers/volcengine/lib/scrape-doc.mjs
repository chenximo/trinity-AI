import { DOC_URL } from "./constants.mjs";

/**
 * @param {string} s
 */
export function cleanCell(s) {
  return String(s ?? "")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {Element} el
 */
export function billingContext(el) {
  /** @type {string[]} */
  const parts = [];
  let node = el;
  for (let d = 0; d < 15 && node; d++) {
    const p = node.parentElement;
    if (!p) break;
    for (const c of p.children) {
      if (c === node) break;
      const t = cleanCell(c.textContent);
      if (!t || t.length > 120) continue;
      if (
        /在线推理（常规）|在线推理（低延迟）|批量推理|图片生成模型|按token单价|输入不含视频|输入包含视频|doubao-seedance-1\.5-pro|3D生成|向量模型|精调|模型单元|联网|豆包助手|知识库|Coding Plan|Agent Plan/.test(
          t,
        )
      ) {
        parts.push(t);
      }
    }
    node = p;
  }
  return parts[parts.length - 1] ?? "";
}

/**
 * @param {import('playwright').Page} page
 */
export async function scrapeVolcengineDoc(page) {
  await page.goto(DOC_URL, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(3000);

  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(600);
  }

  const payload = await page.evaluate(() => {
    function clean(s) {
      return String(s ?? "")
        .replace(/\u200b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function billingContext(el) {
      const parts = [];
      let node = el;
      for (let d = 0; d < 15 && node; d++) {
        const p = node.parentElement;
        if (!p) break;
        for (const c of p.children) {
          if (c === node) break;
          const t = clean(c.textContent);
          if (!t || t.length > 120) continue;
          if (
            /在线推理（常规）|在线推理（低延迟）|批量推理|图片生成模型|按token单价|输入不含视频|输入包含视频|doubao-seedance-1\.5-pro|3D生成|向量模型|精调|模型单元|联网|豆包助手|知识库|Coding Plan|Agent Plan/.test(
              t,
            )
          ) {
            parts.push(t);
          }
        }
        node = p;
      }
      return parts[parts.length - 1] ?? "";
    }

    /** @type {{ billingContext: string, headers: string[], rows: string[][] }[]} */
    const tables = [];
    for (const table of document.querySelectorAll("table")) {
      const trs = Array.from(table.querySelectorAll("tr"));
      if (trs.length < 2) continue;
      const headers = Array.from(trs[0].querySelectorAll("th,td")).map((c) =>
        clean(c.textContent),
      );
      const rows = trs.slice(1).map((tr) =>
        Array.from(tr.querySelectorAll("th,td")).map((c) => clean(c.textContent)),
      );
      tables.push({
        billingContext: billingContext(table),
        headers,
        rows,
      });
    }

    return {
      url: location.href,
      title: document.title,
      scrapedAt: new Date().toISOString(),
      tables,
      tableCount: tables.length,
      rowCount: tables.reduce((n, t) => n + t.rows.length, 0),
    };
  });

  return {
    source: "volcengine_ark_pricing_doc",
    docUrl: DOC_URL,
    ...payload,
  };
}
