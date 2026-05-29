/** 浏览器端验收 runs 缓存（24h TTL），不含 API Key */

export const RUNS_CACHE_STORAGE = "trinity-api-acceptance-runs-cache";
export const RUNS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type SerializableRunRecord = {
  pass: boolean | null;
  httpStatus: number | null;
  durationMs: number | null;
  tokenUsage: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
  } | null;
  responsePreview: string;
  responseRaw: string;
  isGatewayHtml?: boolean;
  apiErrorMessage?: string | null;
  requestMethod: string | null;
  requestUrl: string | null;
  requestHeaders: Record<string, string> | null;
  requestBody: Record<string, unknown> | null;
  error?: string;
  assertionErrors: string[];
};

export type ModelRunsCacheEntry = {
  runs: Record<string, SerializableRunRecord>;
  fingerprint: string;
  savedAt: string;
  exportedAt?: string;
  exportedFingerprint?: string;
};

export type RunsCacheFile = {
  version: 1;
  expiresAt: string;
  models: Record<string, ModelRunsCacheEntry>;
};

export function rowCacheKey(caseId: string, model: string): string {
  return `${caseId}::${model}`;
}

export function computeRunFingerprint(
  model: string,
  caseIds: string[],
  runs: Record<string, { pass: boolean | null; httpStatus: number | null }>,
): string {
  return caseIds
    .map((caseId) => {
      const r = runs[rowCacheKey(caseId, model)];
      if (!r || r.pass == null) return `${caseId}:pending`;
      return `${caseId}:${r.pass ? 1 : 0}:${r.httpStatus ?? "-"}`;
    })
    .join("|");
}

function emptyCache(): RunsCacheFile {
  return {
    version: 1,
    expiresAt: new Date(Date.now() + RUNS_CACHE_TTL_MS).toISOString(),
    models: {},
  };
}

export function readRunsCache(): RunsCacheFile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RUNS_CACHE_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunsCacheFile;
    if (parsed.version !== 1 || !parsed.models) return null;
    if (Date.parse(parsed.expiresAt) < Date.now()) {
      localStorage.removeItem(RUNS_CACHE_STORAGE);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeRunsCache(file: RunsCacheFile): void {
  if (typeof window === "undefined") return;
  const next: RunsCacheFile = {
    ...file,
    expiresAt: new Date(Date.now() + RUNS_CACHE_TTL_MS).toISOString(),
  };
  localStorage.setItem(RUNS_CACHE_STORAGE, JSON.stringify(next));
}

export function getModelCacheEntry(model: string): ModelRunsCacheEntry | null {
  const cache = readRunsCache();
  return cache?.models[model] ?? null;
}

export function saveModelCacheEntry(
  model: string,
  entry: Omit<ModelRunsCacheEntry, "savedAt"> & { savedAt?: string },
): void {
  const cache = readRunsCache() ?? emptyCache();
  const prev = cache.models[model];
  cache.models[model] = {
    runs: entry.runs,
    fingerprint: entry.fingerprint,
    savedAt: entry.savedAt ?? new Date().toISOString(),
    exportedAt: entry.exportedAt,
    exportedFingerprint: entry.exportedFingerprint,
  };
  writeRunsCache(cache);
}

export function markModelExported(model: string, fingerprint: string): void {
  const cache = readRunsCache() ?? emptyCache();
  const entry = cache.models[model];
  if (!entry) return;
  cache.models[model] = {
    ...entry,
    exportedAt: new Date().toISOString(),
    exportedFingerprint: fingerprint,
  };
  writeRunsCache(cache);
}

export function pickModelRuns(
  model: string,
  caseIds: string[],
  runs: Record<string, SerializableRunRecord>,
): Record<string, SerializableRunRecord> {
  const out: Record<string, SerializableRunRecord> = {};
  for (const caseId of caseIds) {
    const key = rowCacheKey(caseId, model);
    if (runs[key]) out[key] = runs[key];
  }
  return out;
}
