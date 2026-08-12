#!/usr/bin/env bash
# 打包 pricing/ + server-cli-package.json 供 sync-remote.py 上传
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT_DIR="${DEPLOY_BUNDLE_DIR:-/tmp/trinity-pricing-sync}"
OUT="$OUT_DIR/bundle.tgz"
mkdir -p "$OUT_DIR"
rm -f "$OUT"
cd "$ROOT"
tar czf "$OUT" \
  --exclude 'pricing/worker/node_modules' \
  --exclude 'pricing/output/.~*' \
  --exclude 'pricing/worker/.smoke-out' \
  pricing/ \
  pricing/server-cli-package.json
# sync-remote 解压后期望 pricing/ 在 bundle 根
echo "bundle: $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
