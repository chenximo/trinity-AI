/** Admin → Worker 出包 URL POST 契约（对齐现网 PriceReviewService） */

export type ReviewModality = "text" | "image" | "video";

export type ReviewTriggerBody = {
  /** 现网 Admin 字段；与 reviewId 二选一即可 */
  taskId?: number | string;
  taskCode?: string;
  /** 兼容旧 Worker / 方案 C 草案 */
  reviewId?: number | string;
  runId?: string;
  modality: ReviewModality | "all";
  scenario?: string;
  note?: string;
  batchId?: string | null;
  /** 跑完后回调；优先指向 internal 挂包封装 URL */
  callbackUrl?: string;
  callbackToken?: string;
  modelIds?: string[] | null;
};

/** 规范化后的任务身份（内部使用） */
export type NormalizedTrigger = ReviewTriggerBody & {
  reviewId: number | string;
};

export type JobResult = {
  ok: boolean;
  reviewId: number | string;
  taskCode?: string;
  modality: ReviewModality;
  packageJson?: Record<string, unknown>;
  packagePath?: string;
  errorMessage?: string;
  steps: string[];
  durationMs: number;
};

export function normalizeTrigger(body: ReviewTriggerBody): NormalizedTrigger {
  const reviewId = body.taskId ?? body.reviewId;
  if (reviewId == null || reviewId === "") {
    throw new Error("taskId or reviewId required");
  }
  return { ...body, reviewId };
}
