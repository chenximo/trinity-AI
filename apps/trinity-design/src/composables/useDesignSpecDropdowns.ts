import { nextTick, onMounted, onUnmounted, type Ref } from "vue";

type Anchor = {
  wrap: HTMLElement;
  btn: HTMLElement;
  panel: HTMLElement;
  itemSelector: string;
  onPick: ((item: HTMLElement) => void) | null;
};

export function useDesignSpecDropdowns(root: Ref<HTMLElement | null>) {
  let anchors: Anchor[] = [];
  let closeAll: () => void = () => {};
  let onDocClick: (e: MouseEvent) => void = () => {};
  let onKeydown: (e: KeyboardEvent) => void = () => {};

  onMounted(() => {
    void nextTick(() => {
      const r = root.value;
      if (!r) return;

      anchors = [
        {
          wrap: r.querySelector("#ds-app-filter-more-wrap") as HTMLElement,
          btn: r.querySelector("#ds-app-filter-more-btn") as HTMLElement,
          panel: r.querySelector("#ds-app-filter-more-panel") as HTMLElement,
          itemSelector: "button.or-app-filter-menu-item",
          onPick: null,
        },
        {
          wrap: r.querySelector("#ds-app-model-dd-wrap") as HTMLElement,
          btn: r.querySelector("#ds-app-model-dd-btn") as HTMLElement,
          panel: r.querySelector("#ds-app-model-dd-panel") as HTMLElement,
          itemSelector: "button.or-app-filter-dd-item",
          onPick(item: HTMLElement) {
            const label = document.getElementById("ds-app-model-dd-label");
            const rowLabel = item.querySelector(".or-app-filter-dd-label");
            const v =
              item.getAttribute("data-ds-model-opt") ||
              (rowLabel ? rowLabel.textContent?.trim() ?? "" : "");
            if (label) label.textContent = v;
            const panel = document.getElementById("ds-app-model-dd-panel");
            if (panel) {
              panel.querySelectorAll(".or-app-filter-dd-item").forEach((b) => {
                const on = b === item;
                b.classList.toggle("is-checked", on);
                const mk = b.querySelector(".or-app-filter-dd-mark");
                if (mk) mk.textContent = on ? "✓" : "";
              });
            }
          },
        },
        {
          wrap: r.querySelector("#ds-spec-modal-dd-wrap") as HTMLElement,
          btn: r.querySelector("#ds-spec-modal-dd-btn") as HTMLElement,
          panel: r.querySelector("#ds-spec-modal-dd-panel") as HTMLElement,
          itemSelector: "button.or-app-filter-dd-item",
          onPick(item: HTMLElement) {
            const label = document.getElementById("ds-spec-modal-dd-label");
            const rowLabel = item.querySelector(".or-app-filter-dd-label");
            const v =
              item.getAttribute("data-ds-spec-modal-opt") ||
              (rowLabel ? rowLabel.textContent?.trim() ?? "" : "");
            if (label) label.textContent = v;
            const panel = document.getElementById("ds-spec-modal-dd-panel");
            if (panel) {
              panel.querySelectorAll(".or-app-filter-dd-item").forEach((b) => {
                const on = b === item;
                b.classList.toggle("is-checked", on);
                const mk = b.querySelector(".or-app-filter-dd-mark");
                if (mk) mk.textContent = on ? "✓" : "";
              });
            }
          },
        },
      ].filter((a) => a.wrap && a.btn && a.panel) as Anchor[];

      closeAll = () => {
        anchors.forEach((a) => {
          a.panel.hidden = true;
          a.btn.setAttribute("aria-expanded", "false");
        });
      };

      anchors.forEach((a) => {
        a.btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const wasOpen = !a.panel.hidden;
          closeAll();
          if (!wasOpen) {
            a.panel.hidden = false;
            a.btn.setAttribute("aria-expanded", "true");
          }
        });

        a.panel.addEventListener("click", (e) => {
          const item = (e.target as HTMLElement).closest(a.itemSelector);
          if (!item || (item as HTMLButtonElement).disabled) return;
          if (a.onPick) a.onPick(item as HTMLElement);
          closeAll();
        });
      });

      onDocClick = (e: MouseEvent) => {
        if (anchors.some((a) => a.wrap.contains(e.target as Node))) return;
        closeAll();
      };

      onKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeAll();
      };

      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKeydown);
    });
  });

  onUnmounted(() => {
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKeydown);
  });
}
