import type { ReportCaseRow } from "./formatAcceptanceReport";

export type ChatApiTestReportRow = {
  caseId: string;
  title: string;
  category: string;
  paramKeys: string[];
  httpStatus: number | null;
  machinePass: boolean | null;
  responsePreview?: string;
  apiErrorMessage?: string | null;
};

export type ChatApiTestModelSection = {
  modelLabel: string;
  testedAt: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  rows: ChatApiTestReportRow[];
};

export type ChatApiTestReportFile = {
  version: number;
  title: string;
  endpoint: string;
  updatedAt: string;
  models: Record<string, ChatApiTestModelSection>;
};

export const CHAT_API_TEST_REPORT_REL =
  "docs/ai-api-platform/api-test/reports/chat-api-test.data.json";

export function summarizeReportRows(rows: ChatApiTestReportRow[]) {
  return {
    total: rows.length,
    passed: rows.filter((r) => r.machinePass === true).length,
    failed: rows.filter((r) => r.machinePass === false).length,
  };
}

export function toReportRows(rows: ReportCaseRow[]): ChatApiTestReportRow[] {
  return rows.map((row) => ({
    caseId: row.caseId,
    title: row.title,
    category: row.category,
    paramKeys: row.paramKeys,
    httpStatus: row.httpStatus,
    machinePass: row.machinePass,
    responsePreview: row.responsePreview,
    apiErrorMessage: row.apiErrorMessage ?? null,
  }));
}

export function emptyReportFile(): ChatApiTestReportFile {
  const now = new Date().toISOString();
  return {
    version: 1,
    title: "Chat API Test",
    endpoint: "POST /v1/chat/completions",
    updatedAt: now,
    models: {},
  };
}

export function mergeModelSection(
  file: ChatApiTestReportFile,
  input: {
    model: string;
    modelLabel?: string;
    endpoint?: string;
    rows: ChatApiTestReportRow[];
    testedAt?: string;
  },
): ChatApiTestReportFile {
  const testedAt = input.testedAt ?? new Date().toISOString();
  const summary = summarizeReportRows(input.rows);
  return {
    ...file,
    endpoint: input.endpoint ?? file.endpoint,
    updatedAt: testedAt,
    models: {
      ...file.models,
      [input.model]: {
        modelLabel: input.modelLabel?.trim() || input.model,
        testedAt,
        summary: {
          total: summary.total,
          passed: summary.passed,
          failed: summary.failed,
        },
        rows: input.rows,
      },
    },
  };
}

export function orderedModelIds(file: ChatApiTestReportFile): string[] {
  return Object.keys(file.models).sort((a, b) => {
    const ta = file.models[a]?.testedAt ?? "";
    const tb = file.models[b]?.testedAt ?? "";
    return tb.localeCompare(ta) || a.localeCompare(b);
  });
}
