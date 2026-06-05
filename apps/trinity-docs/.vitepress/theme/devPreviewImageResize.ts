export type ImageRef = {
  index: number;
  start: number;
  end: number;
  url: string;
  alt: string;
  width?: number;
  kind: "md" | "html";
};

/** 按在正文中的出现顺序收集图片引用 */
export function collectImageRefs(md: string): ImageRef[] {
  const matches: { start: number; end: number; ref: Omit<ImageRef, "index"> }[] = [];

  const mdRe = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(md)) !== null) {
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      ref: { url: m[2], alt: m[1] ?? "", kind: "md" },
    });
  }

  const htmlRe = /<img\b([^>]*)\/?>/gi;
  while ((m = htmlRe.exec(md)) !== null) {
    const attrs = m[1];
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    const widthMatch = attrs.match(/\bwidth=["']?(\d+)/i);
    const alt = attrs.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      ref: {
        url: src,
        alt,
        width: widthMatch ? Number(widthMatch[1]) : undefined,
        kind: "html",
      },
    });
  }

  matches.sort((a, b) => a.start - b.start);
  return matches.map((item, index) => ({ index, start: item.start, end: item.end, ...item.ref }));
}

export function replaceImageWidth(md: string, imageIndex: number, widthPx: number): string {
  const refs = collectImageRefs(md);
  const ref = refs[imageIndex];
  if (!ref) return md;

  const width = Math.max(80, Math.round(widthPx));
  const replacement = `<img src="${ref.url}" alt="${ref.alt}" width="${width}" />`;
  return md.slice(0, ref.start) + replacement + md.slice(ref.end);
}

type BindOptions = {
  getMarkdown: () => string;
  setMarkdown: (value: string) => void;
  onResize?: (width: number, imageIndex: number) => void;
};

function wrapImage(img: HTMLImageElement, index: number): HTMLElement {
  const existing = img.closest(".tdocs-dev-img-wrap");
  if (existing) return existing as HTMLElement;

  const wrap = document.createElement("span");
  wrap.className = "tdocs-dev-img-wrap";
  wrap.dataset.tdocsImgI = String(index);
  img.dataset.tdocsResizeBound = "1";

  const handle = document.createElement("span");
  handle.className = "tdocs-dev-img-resize";
  handle.title = "拖动调整宽度";
  handle.setAttribute("aria-hidden", "true");

  img.parentNode?.insertBefore(wrap, img);
  wrap.append(img, handle);
  return wrap;
}

function startResize(
  img: HTMLImageElement,
  imageIndex: number,
  opts: BindOptions,
  wrap: HTMLElement,
  downEvent: MouseEvent,
): void {
  const startPointerX = downEvent.clientX;
  const startWidth = img.offsetWidth;
  const ratio =
    img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 1;

  const onMove = (e: MouseEvent) => {
    const dx = e.clientX - startPointerX;
    const maxW = wrap.parentElement?.clientWidth ?? 960;
    const next = Math.max(80, Math.min(maxW, startWidth + dx));
    img.style.width = `${next}px`;
    img.style.height = ratio ? `${Math.round(next * ratio)}px` : "auto";
  };

  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    wrap.classList.remove("is-resizing");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    const width = Math.round(img.offsetWidth);
    const md = opts.getMarkdown();
    const next = replaceImageWidth(md, imageIndex, width);
    if (next !== md) {
      opts.setMarkdown(next);
      opts.onResize?.(width, imageIndex);
    }
  };

  wrap.classList.add("is-resizing");
  document.body.style.cursor = "nwse-resize";
  document.body.style.userSelect = "none";
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

/** 为预览区图片绑定拖拽改宽（仅开发编辑预览） */
export function bindPreviewImageResize(
  root: HTMLElement | null | undefined,
  opts: BindOptions,
): () => void {
  if (!root) return () => {};

  const refs = collectImageRefs(opts.getMarkdown());
  const imgs = [...root.querySelectorAll<HTMLImageElement>("img")];
  const cleanups: Array<() => void> = [];

  imgs.forEach((img, i) => {
    if (i >= refs.length) return;
    const ref = refs[i];
    if (ref.width) {
      img.style.width = `${ref.width}px`;
      img.style.height = "auto";
    }
    const wrap = wrapImage(img, i);
    const handle = wrap.querySelector<HTMLElement>(".tdocs-dev-img-resize");
    if (!handle) return;

    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startResize(img, i, opts, wrap, e);
    };
    handle.addEventListener("mousedown", onDown);
    cleanups.push(() => handle.removeEventListener("mousedown", onDown));
  });

  return () => {
    for (const fn of cleanups) fn();
  };
}
