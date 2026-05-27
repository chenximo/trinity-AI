#!/usr/bin/env sh
# 包装：在 trinity-AI 仓库根执行 Node 同步脚本
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec node "$ROOT/scripts/sync-to-trinityai-web.mjs" "$@"
