/** 与静态 `chat-openrouter.js` 中说明气泡行为对齐的轻量版（无 legacy 脚本时使用） */
export function bindOrcHelpTipsLite(): () => void {
  let orcHelpTipAnchor: HTMLElement | null = null;

  function $(sel: string) {
    return document.querySelector(sel) as HTMLElement | null;
  }

  function closeOrcHelpTip() {
    const pop = $("#orc-help-tip-popover");
    if (pop) pop.hidden = true;
    document.querySelectorAll(".orc-help-tip-btn[aria-expanded='true']").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
    });
    orcHelpTipAnchor = null;
  }

  function positionOrcHelpTip() {
    const btn = orcHelpTipAnchor;
    const pop = $("#orc-help-tip-popover");
    if (!btn || !pop || pop.hidden) return;
    const r = btn.getBoundingClientRect();
    const w = Math.min(360, window.innerWidth - 16);
    pop.style.width = `${w}px`;
    const ph = pop.offsetHeight || 160;
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const placeBelow = spaceBelow >= ph + 8 || spaceBelow >= r.top - 12;
    let top = placeBelow ? r.bottom + 8 : r.top - ph - 8;
    if (top < 8) top = 8;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);
    const left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  function openOrcHelpTip(btn: HTMLElement) {
    const tplId = btn.getAttribute("data-orc-help-tpl");
    const tpl = tplId ? document.getElementById(tplId) : null;
    const pop = $("#orc-help-tip-popover");
    const titleEl = $("#orc-help-tip-title");
    const bodyEl = $("#orc-help-tip-body");
    if (!tpl || !pop || !titleEl || !bodyEl || !(tpl instanceof HTMLTemplateElement)) return;
    closeOrcHelpTip();
    const title = btn.getAttribute("data-orc-help-title") || "说明";
    titleEl.textContent = title;
    bodyEl.innerHTML = "";
    bodyEl.appendChild(tpl.content.cloneNode(true));
    orcHelpTipAnchor = btn;
    pop.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      positionOrcHelpTip();
      window.requestAnimationFrame(positionOrcHelpTip);
    });
  }

  function onDocClick(e: MouseEvent) {
    const btn = (e.target as HTMLElement | null)?.closest?.(".orc-help-tip-btn[data-orc-help-tpl]");
    if (!btn || !(btn instanceof HTMLElement)) return;
    e.stopPropagation();
    const pop = $("#orc-help-tip-popover");
    if (!pop) return;
    if (!pop.hidden && orcHelpTipAnchor === btn) {
      closeOrcHelpTip();
      return;
    }
    openOrcHelpTip(btn);
  }

  function onResize() {
    const pop = $("#orc-help-tip-popover");
    if (pop && !pop.hidden) positionOrcHelpTip();
  }

  function onMouseDown(e: MouseEvent) {
    const pop = $("#orc-help-tip-popover");
    if (!pop || pop.hidden) return;
    const t = e.target as Node;
    if (pop.contains(t) || (t as HTMLElement).closest?.(".orc-help-tip-btn")) return;
    closeOrcHelpTip();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closeOrcHelpTip();
  }

  document.addEventListener("click", onDocClick);
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("keydown", onKeydown);

  return () => {
    document.removeEventListener("click", onDocClick);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("keydown", onKeydown);
    closeOrcHelpTip();
  };
}
