import type { Router } from "vue-router";

const PRESET = "__TAI_CONSOLE_PRESET__";
const CREATE_PRESET = "__TAI_CONSOLE_CREATE_PRESET__";

/** 将静态 HTML 占位 href 换成当前 history base 下的路由地址 */
export function patchTaiChatAnchors(root: ParentNode, router: Router) {
  root.querySelectorAll<HTMLAnchorElement>(`a[href="${PRESET}"]`).forEach((a) => {
    a.setAttribute("href", router.resolve({ name: "tai-account-console", hash: "#preset" }).href);
  });
  root.querySelectorAll<HTMLAnchorElement>(`a[href="${CREATE_PRESET}"]`).forEach((a) => {
    a.setAttribute(
      "href",
      router.resolve({
        name: "tai-account-console",
        query: { create: "1" },
        hash: "#preset",
      }).href
    );
  });
}
