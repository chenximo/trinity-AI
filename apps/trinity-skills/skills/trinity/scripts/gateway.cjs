/**
 * Trinity gateway API caller (OpenAI-compatible /v1/*)
 * Usage: <runtime> gateway.cjs <METHOD> <PATH> [JSON_BODY]
 *
 * Runs on: node (>=18), bun, deno
 * Zero dependencies — native fetch only
 */

const { BASE_URL, API_KEY } = require("./env.cjs");
const { sanitize } = require("./sanitize.cjs");

const args = process.argv.slice(2);
const method = args[0];
const urlPath = args[1];
const body = args[2] || null;

if (!method || !urlPath) {
  console.error("Usage: gateway.cjs <METHOD> <PATH> [JSON_BODY>");
  process.exit(1);
}

if (!urlPath.startsWith("/")) {
  console.error("PATH must start with / (e.g. /models)");
  process.exit(1);
}

async function main() {
  const fetchOptions = {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  if (body) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = body;
  }

  const res = await fetch(`${BASE_URL}${urlPath}`, fetchOptions);
  const text = await res.text();

  if (res.status >= 400) {
    console.error(`HTTP ${res.status} Error:`);
    console.error(sanitize(text));
    process.exit(1);
  }

  console.log(sanitize(text));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
