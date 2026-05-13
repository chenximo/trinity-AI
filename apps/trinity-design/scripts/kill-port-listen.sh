#!/usr/bin/env sh
# Best-effort: SIGKILL any process listening on port $1 (macOS / Linux).
port="${1:?port required}"
i=0
while [ "$i" -lt 10 ]; do
  pids="$(lsof -nP -i :"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -z "$pids" ]; then
    exit 0
  fi
  echo "$pids" | xargs kill -9 2>/dev/null || true
  echo "freed port $port (killed: $pids)" >&2
  i=$((i + 1))
  sleep 0.2
done
echo "warning: port $port may still be in use after ${i} attempts" >&2
