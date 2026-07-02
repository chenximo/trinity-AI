/** @param {string} s */
export const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");

/** Excel 友好：纯文本，无 markdown 加粗 */
export function cell(v) {
  if (v == null || v === "") return "";
  return esc(String(v));
}

export function cellDash(v) {
  if (v == null || v === "") return "—";
  return esc(String(v));
}

export function joinLines(lines) {
  return `${lines.join("\n")}\n`;
}
