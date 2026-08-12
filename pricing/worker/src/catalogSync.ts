/**
 * C-01 方案 C：价审成功后异步生成刊例总册 Excel，并尽量登记到价目预览。
 * 失败只打日志，不推翻价审 ready。
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { WorkerConfig } from "./config.js";
import { runNpmScript } from "./runPipeline.js";
import type { ReviewModality } from "./types.js";

const UPSTREAM_SCRIPT: Record<ReviewModality, string> = {
  text: "pricing:upstream",
  image: "pricing:upstream:image",
  video: "pricing:upstream:video",
};

const XLSX_NAME: Record<ReviewModality, string> = {
  text: "trinity-pricing-text.xlsx",
  image: "trinity-pricing-image.xlsx",
  video: "trinity-pricing-video.xlsx",
};

function xlsxPath(cfg: WorkerConfig, modality: ReviewModality): string {
  return path.join(cfg.trinityAiRoot, "pricing/output", XLSX_NAME[modality]);
}

/** 复制到 PACKAGE_OUT_DIR，保证 Worker 侧「始终有文件」可取 */
async function copyToPackageOut(
  cfg: WorkerConfig,
  modality: ReviewModality,
  src: string,
): Promise<string | undefined> {
  if (!cfg.packageOutDir) return undefined;
  await fs.mkdir(cfg.packageOutDir, { recursive: true });
  const dest = path.join(cfg.packageOutDir, XLSX_NAME[modality]);
  await fs.copyFile(src, dest);
  return dest;
}

/**
 * PUT multipart → `/v1/admin/pricing/catalog/excel`
 * 需 Backend C-01 + ADMIN_API_TOKEN（Admin JWT）。缺配置或失败仅告警。
 */
async function uploadCatalogExcel(
  cfg: WorkerConfig,
  modality: ReviewModality,
  src: string,
): Promise<{ ok: boolean; detail: string }> {
  if (!cfg.adminApiBase) {
    return { ok: false, detail: "skip upload: ADMIN_API_BASE unset" };
  }
  if (!cfg.adminApiToken) {
    return {
      ok: false,
      detail: "skip upload: ADMIN_API_TOKEN unset（catalog/excel 需 Admin JWT；Ops Token 不够）",
    };
  }

  const buf = await fs.readFile(src);
  const blob = new Blob([new Uint8Array(buf)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fd = new FormData();
  fd.append("modality", modality);
  fd.append("source", "worker-post-review");
  fd.append("file", blob, XLSX_NAME[modality]);

  const url = `${cfg.adminApiBase}/v1/admin/pricing/catalog/excel`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${cfg.adminApiToken}` },
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      detail: `upload failed ${res.status}: ${text.slice(0, 400)}`,
    };
  }
  return { ok: true, detail: `PUT ${res.status} ${url}` };
}

/**
 * 异步入口：勿 await 进价审主路径的成功判定。
 */
export async function syncCatalogExcelAfterReview(
  cfg: WorkerConfig,
  modality: ReviewModality,
): Promise<void> {
  if (!cfg.catalogSyncEnabled) {
    console.log(`[catalog-sync] skipped (PRICING_WORKER_CATALOG_SYNC off) modality=${modality}`);
    return;
  }
  if (cfg.dryRun) {
    console.log(`[catalog-sync] skipped (dryRun) modality=${modality}`);
    return;
  }

  const script = UPSTREAM_SCRIPT[modality];
  console.log(`[catalog-sync] start modality=${modality} script=${script}`);

  const run = await runNpmScript(cfg, script);
  if (run.code !== 0) {
    console.error(
      `[catalog-sync] ${script} failed exit=${run.code} modality=${modality}（价审包已交付，仅总册同步失败）`,
    );
    return;
  }

  const src = xlsxPath(cfg, modality);
  try {
    await fs.access(src);
  } catch {
    console.error(`[catalog-sync] missing xlsx after upstream: ${src}`);
    return;
  }

  try {
    const copied = await copyToPackageOut(cfg, modality, src);
    if (copied) console.log(`[catalog-sync] copied ${copied}`);
  } catch (e) {
    console.error(`[catalog-sync] copy to PACKAGE_OUT_DIR failed:`, e);
  }

  try {
    const up = await uploadCatalogExcel(cfg, modality, src);
    if (up.ok) console.log(`[catalog-sync] ${up.detail}`);
    else console.warn(`[catalog-sync] ${up.detail}`);
  } catch (e) {
    console.error(`[catalog-sync] upload error:`, e);
  }
}
