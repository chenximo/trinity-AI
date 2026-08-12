/**
 * 把价审包交回 Admin（优先 internal 挂原任务）。
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { WorkerConfig } from "./config.js";
import type { ReviewModality, NormalizedTrigger } from "./types.js";

export async function writePackageFile(
  cfg: WorkerConfig,
  modality: ReviewModality,
  packageJson: Record<string, unknown>,
): Promise<string | undefined> {
  if (!cfg.packageOutDir) return undefined;
  await fs.mkdir(cfg.packageOutDir, { recursive: true });
  const file = path.join(cfg.packageOutDir, `review-package-${modality}.json`);
  await fs.writeFile(file, JSON.stringify(packageJson, null, 2), "utf8");
  return file;
}

export async function deliverPackage(
  cfg: WorkerConfig,
  body: NormalizedTrigger,
  modality: ReviewModality,
  packageJson: Record<string, unknown>,
): Promise<{ mode: string; detail: string }> {
  const file = await writePackageFile(cfg, modality, packageJson);
  if (file) {
    console.log(`[worker] wrote package file ${file}`);
  }

  if (body.callbackUrl) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = body.callbackToken || cfg.adminOpsToken || cfg.adminApiToken;
    if (token) {
      if (cfg.adminOpsToken && token === cfg.adminOpsToken) {
        headers["X-Trinity-Ops-Token"] = token;
      } else {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    // 现网 internal 用 POST；兼容旧设想的 PUT
    const method = body.callbackUrl.includes("/internal/pricing/ops/") ? "POST" : "PUT";
    const payload =
      method === "POST"
        ? {
            taskId: body.reviewId,
            taskCode: body.taskCode,
            packageJson,
            note: body.note ?? `worker taskId=${body.reviewId}`,
          }
        : {
            reviewId: body.reviewId,
            modality,
            packageJson,
          };
    const res = await fetch(body.callbackUrl, {
      method,
      headers,
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`callbackUrl failed ${res.status}: ${text.slice(0, 500)}`);
    }
    return { mode: "callbackUrl", detail: `${method} ${res.status} ${body.callbackUrl}` };
  }

  // 推荐：挂回原任务（不另开单）
  if (cfg.adminApiBase && cfg.adminOpsToken) {
    const url = `${cfg.adminApiBase}/internal/pricing/ops/review-tasks`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Trinity-Ops-Token": cfg.adminOpsToken,
      },
      body: JSON.stringify({
        taskId: body.reviewId,
        taskCode: body.taskCode,
        packageJson,
        note: body.note ?? `worker taskId=${body.reviewId}`,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`internal attach failed ${res.status}: ${text.slice(0, 500)}`);
    }
    return { mode: "internal-attach", detail: `${res.status} ${url}` };
  }

  // 兜底：会新建任务，仅应急
  if (cfg.adminApiBase && cfg.adminApiToken) {
    const url = `${cfg.adminApiBase}/v1/admin/pricing/reviews/from-upload`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.adminApiToken}`,
      },
      body: JSON.stringify({
        modality,
        scenario: body.scenario,
        note: body.note ?? `worker reviewId=${body.reviewId} (from-upload fallback)`,
        packageJson,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`from-upload failed ${res.status}: ${text.slice(0, 500)}`);
    }
    return { mode: "from-upload", detail: `${res.status} ${url}` };
  }

  if (file) {
    return {
      mode: "file-only",
      detail: `已写 ${file}；未配置 callbackUrl / ADMIN_OPS_TOKEN，请用出包 URL GET 或稍后接回调`,
    };
  }

  throw new Error("no delivery path: set ADMIN_OPS_TOKEN(+ADMIN_API_BASE), callbackUrl, or PACKAGE_OUT_DIR");
}
