import type { CaseExpect } from "./executeCase";

export type CaseExpectSource = {
  expect: CaseExpect;
  expectByModel?: Record<string, CaseExpect>;
};

export function resolveCaseExpect(caseDef: CaseExpectSource, model: string): CaseExpect {
  const modelKey = model.trim();
  if (modelKey && caseDef.expectByModel?.[modelKey]) {
    return caseDef.expectByModel[modelKey]!;
  }
  return caseDef.expect;
}

export function formatExpectedHttpStatus(expect: CaseExpect): string {
  if (expect.httpStatus != null) return String(expect.httpStatus);
  const min = expect.httpStatusMin ?? 200;
  const max = expect.httpStatusMax ?? 299;
  return `${min}-${max}`;
}
