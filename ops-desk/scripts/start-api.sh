#!/usr/bin/env bash
# 独立拉起 Ops Desk API（与 Cursor/IDE 终端脱钩，避免被杀）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/api"
LOG="${OPS_DESK_API_LOG:-/tmp/ops-desk-api.log}"
PORT="${OPS_DESK_API_PORT:-8787}"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "API already on :$PORT"
  curl -sf "http://127.0.0.1:$PORT/api/health" && echo
  exit 0
fi

cd "$API"
# shellcheck disable=SC1091
source .venv/bin/activate
# 不用 --reload：单进程更稳；改代码后手动重启本脚本即可
nohup uvicorn app.main:app --host 127.0.0.1 --port "$PORT" >>"$LOG" 2>&1 &
disown || true
sleep 1
if curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null; then
  echo "Ops Desk API up → http://127.0.0.1:$PORT  (log: $LOG)"
else
  echo "start failed; see $LOG" >&2
  tail -30 "$LOG" >&2 || true
  exit 1
fi
