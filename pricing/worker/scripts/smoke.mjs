/**
 * 本地冒烟：dry-run → healthz → Admin 形态 taskId 触发
 * + 模拟 Admin internal 挂包回调（方案 C）
 * 用法：npm run smoke（在 pricing/worker）
 */
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const workerDir = path.resolve(root, "..");
const port = "8799";
const mockAdminPort = "8798";

/** @type {{ hits: Array<{ token?: string, body: Record<string, unknown> }> }} */
const mockHits = { hits: [] };

const mockAdmin = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/internal/pricing/ops/review-tasks") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      let body = {};
      try {
        body = JSON.parse(raw);
      } catch {
        /* ignore */
      }
      mockHits.hits.push({
        token: req.headers["x-trinity-ops-token"],
        body,
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, status: "ready" }));
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

await new Promise((resolve) => mockAdmin.listen(mockAdminPort, "127.0.0.1", resolve));

const child = spawn("npx", ["tsx", "src/index.ts"], {
  cwd: workerDir,
  env: {
    ...process.env,
    PORT: port,
    WORKER_TOKEN: "",
    PRICING_WORKER_DRY_RUN: "1",
    PACKAGE_OUT_DIR: path.join(workerDir, ".smoke-out"),
    ADMIN_API_BASE: `http://127.0.0.1:${mockAdminPort}`,
    ADMIN_OPS_TOKEN: "ops-smoke-token",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

child.stdout.on("data", (d) => process.stdout.write(d));
child.stderr.on("data", (d) => process.stderr.write(d));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let exitCode = 1;
try {
  await sleep(2000);

  const health = await fetch(`http://127.0.0.1:${port}/healthz`);
  const healthBody = await health.json();
  console.log("health", health.status, healthBody);
  if (!health.ok || !healthBody.ok) throw new Error("healthz failed");

  const trigger = await fetch(
    `http://127.0.0.1:${port}/v1/pricing-review/trigger?async=0`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: 42,
        taskCode: "pr-smoke-42",
        runId: "run-smoke",
        modality: "text",
        scenario: "上新跟价",
        note: "admin pricing/review trigger · onboard=auto",
      }),
    },
  );
  const text = await trigger.text();
  console.log("trigger", trigger.status, text.slice(0, 400));
  if (!trigger.ok) throw new Error(`trigger HTTP ${trigger.status}`);

  const pkg = JSON.parse(text);
  if (!pkg.draftPrices && !pkg.buckets && !pkg.lines) {
    throw new Error("response is not a price-review package shape");
  }

  await sleep(300);
  if (mockHits.hits.length < 1) {
    throw new Error("expected internal attach callback after sync trigger");
  }
  const hit = mockHits.hits[0];
  if (hit.token !== "ops-smoke-token") throw new Error("ops token mismatch");
  if (String(hit.body.taskId) !== "42") throw new Error("taskId mismatch on attach");
  if (!hit.body.packageJson) throw new Error("packageJson missing on attach");
  console.log("internal-attach ok", {
    taskId: hit.body.taskId,
    taskCode: hit.body.taskCode,
  });

  // 默认已改为同步；显式 ?async=1 才 ACK
  const ack = await fetch(
    `http://127.0.0.1:${port}/v1/pricing-review/trigger?async=1`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: 43, modality: "text" }),
    },
  );
  const ackBody = await ack.json();
  console.log("async-ack", ack.status, ackBody);
  if (ack.status !== 202 || !ackBody.accepted) {
    throw new Error("async ACK expected 202 + accepted");
  }
  await sleep(1000);
  if (mockHits.hits.length < 2) {
    throw new Error("expected second internal attach after async");
  }

  exitCode = 0;
  console.log("smoke ok · scheme C worker path");
} catch (e) {
  console.error("smoke failed", e);
  exitCode = 1;
} finally {
  child.kill("SIGTERM");
  mockAdmin.close();
  process.exit(exitCode);
}
