/** 与 Postman 一致：尽量格式化 JSON，否则原样返回 */
export function formatResponseBody(text: string, maxLen = 8000): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  try {
    const formatted = JSON.stringify(JSON.parse(trimmed), null, 2);
    return formatted.length > maxLen ? `${formatted.slice(0, maxLen)}…` : formatted;
  } catch {
    return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}…` : trimmed;
  }
}
