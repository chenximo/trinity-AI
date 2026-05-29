export type AcceptanceSignoff = "pending" | "accepted" | "rejected";

export type ReportCaseRow = {
  caseId: string;
  title: string;
  category: string;
  paramKeys: string[];
  httpStatus: number | null;
  machinePass: boolean | null;
  acceptance: AcceptanceSignoff;
  responsePreview?: string;
  apiErrorMessage?: string | null;
  assertionErrors?: string[];
  note?: string;
};

export type AcceptanceReportInput = {
  model: string;
  modelLabel?: string;
  endpoint?: string;
  rows: ReportCaseRow[];
};

const SUMMARY_MAX_LEN = 120;
const DETAIL_MAX_LEN = 500;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatParamKeysHtml(keys: string[]): string {
  if (!keys.length) return "—";
  return keys.map((k) => `<code>${escapeHtml(k)}</code>`).join(", ");
}

/** 原始响应摘要（与验收台「响应摘要」一致） */
export function responseSummaryForRow(row: ReportCaseRow): string {
  const preview = row.responsePreview?.trim();
  if (preview) return preview.slice(0, DETAIL_MAX_LEN);

  if (row.apiErrorMessage?.trim()) {
    const status = row.httpStatus != null ? `[${row.httpStatus}] ` : "";
    return `${status}${row.apiErrorMessage.trim()}`.slice(0, DETAIL_MAX_LEN);
  }

  if (row.assertionErrors?.length) {
    return row.assertionErrors.join("；").slice(0, DETAIL_MAX_LEN);
  }

  return "—";
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(.+?)(?:\.\s+Supported values are:|\.(?:\s|$)|。\s*)/);
  if (match?.[1]) return match[1].trim();
  return trimmed;
}

function truncate(text: string, max = SUMMARY_MAX_LEN): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/** 根据响应摘要归纳失败原因（Tag 内文案） */
export function summarizeFailureFromResponse(row: ReportCaseRow): string {
  const raw = responseSummaryForRow(row);
  if (raw === "—") {
    return row.httpStatus != null ? `HTTP ${row.httpStatus}` : "未通过";
  }

  const text = raw.replace(/^\[\d+\]\s*/, "").trim();

  const unsupportedValue = text.match(
    /Unsupported value:\s*'([^']+)'\s*does not support\s*'([^']+)'/i,
  );
  if (unsupportedValue) {
    const [, param, value] = unsupportedValue;
    return truncate(`${param} 不支持取值 ${value}`);
  }

  const gatewayMatch = raw.match(/网关\s*(\d+)\s*：\s*([^（]+)/);
  if (gatewayMatch) {
    return truncate(`网关 ${gatewayMatch[1]} ${gatewayMatch[2].trim()}`);
  }

  if (/Supported values are:/i.test(text)) {
    const head = firstSentence(text);
    const supported = text.match(/Supported values are:\s*([^.]+)/i)?.[1]?.trim();
    if (head && supported) {
      return truncate(`${head}（可选：${supported}）`);
    }
  }

  const assertionOnly =
    row.assertionErrors?.length &&
    !row.responsePreview?.trim() &&
    !row.apiErrorMessage?.trim();
  if (assertionOnly) {
    return truncate(row.assertionErrors!.join("；"));
  }

  const sentence = firstSentence(text) || text;
  return truncate(sentence);
}

/** 结果列纯文本（无 HTML） */
export function resultTextForRow(row: ReportCaseRow): string {
  if (row.machinePass === null) return "—";
  if (row.machinePass === true) return "通过";
  return summarizeFailureFromResponse(row);
}

/**
 * 结果列 HTML：Tag + 悬停气泡（原始响应摘要）
 * 须配合 HTML 表格使用（Markdown 表格内 HTML 不会被 VitePress 渲染）
 */
export function formatResultCellHtml(row: ReportCaseRow): string {
  if (row.machinePass === null) return "—";

  const tipRaw = responseSummaryForRow(row);
  const tagClass = row.machinePass ? "is-pass" : "is-fail";
  const label =
    row.machinePass === true
      ? "通过"
      : escapeHtml(summarizeFailureFromResponse(row) || "未通过");

  if (tipRaw === "—") {
    return `<span class="api-val-tag ${tagClass}">${label}</span>`;
  }

  return (
    `<span class="api-val-tip-wrap" tabindex="0">` +
    `<span class="api-val-tag ${tagClass}">${label}</span>` +
    `<span class="api-val-tip-bubble" role="tooltip">${escapeHtml(tipRaw)}</span>` +
    `</span>`
  );
}

function summarizeRows(rows: ReportCaseRow[]) {
  const verified = rows.filter((r) => r.machinePass != null);
  const passed = rows.filter((r) => r.machinePass === true).length;
  const failed = rows.filter((r) => r.machinePass === false).length;

  return {
    total: rows.length,
    verified: verified.length,
    passed,
    failed,
  };
}

export function acceptanceReportFilename(model: string, runAt = new Date()): string {
  const stamp = runAt.toISOString().slice(0, 10);
  const safeModel = model.replace(/[^\w.-]+/g, "-");
  return `${safeModel}-api-validation-${stamp}.md`;
}

export function formatAcceptanceReportMarkdown(input: AcceptanceReportInput): string {
  const summary = summarizeRows(input.rows);
  const modelTitle = input.modelLabel ? `${input.modelLabel}（${input.model}）` : input.model;
  const endpoint = input.endpoint ?? "/v1/chat/completions";

  const overviewParts = [`${summary.verified} 项已测`, `${summary.passed} 项通过`];
  if (summary.failed) overviewParts.push(`${summary.failed} 项未通过`);

  const tableRows = input.rows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.title)}</td><td>${formatParamKeysHtml(row.paramKeys)}</td><td>${formatResultCellHtml(row)}</td></tr>`,
    )
    .join("\n");

  return [
    "---",
    `title: 生文 API · ${input.model}`,
    "---",
    "",
    `# 生文 API · ${modelTitle}`,
    "",
    `\`POST ${endpoint}\` · 模型 \`${input.model}\``,
    "",
    "## 验证概览",
    "",
    `**${overviewParts.join(" · ")}**`,
    "",
    "## 验证结果",
    "",
    "> **结果**列为浅色 **Tag 标签**；鼠标悬停 Tag 可查看原始响应摘要。",
    "",
    '<div class="api-val-report">',
    "<table>",
    "<thead><tr><th>场景</th><th>关键参数</th><th>结果</th></tr></thead>",
    "<tbody>",
    tableRows,
    "</tbody>",
    "</table>",
    "</div>",
    "",
  ].join("\n");
}
