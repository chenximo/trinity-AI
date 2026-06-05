import type { Connect, Plugin } from "vite";

/** 与 VitePress `base` 一致（无尾斜杠），如 `/docs` */
const SITE_BASE = (process.env.VITEPRESS_BASE ?? "/docs/").replace(/\/+$/, "") || "/docs";

function redirect(res: Connect.ServerResponse, location: string): void {
  res.statusCode = 301;
  res.setHeader("Location", location);
  res.end();
}

/** 开发/预览：根路径直达快速入门（无营销首页） */
export function docsBaseRedirect(): Plugin {
  return {
    name: "trinity-docs-base-redirect",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? "";
        const q = raw.indexOf("?");
        const pathname = q === -1 ? raw : raw.slice(0, q);
        const search = q === -1 ? "" : raw.slice(q);

        if (pathname === SITE_BASE || pathname === `${SITE_BASE}/`) {
          redirect(res, `${SITE_BASE}/quickstart${search}`);
          return;
        }
        if (pathname === `${SITE_BASE}/en` || pathname === `${SITE_BASE}/en/`) {
          redirect(res, `${SITE_BASE}/en/quickstart${search}`);
          return;
        }
        next();
      });
    },
  };
}
