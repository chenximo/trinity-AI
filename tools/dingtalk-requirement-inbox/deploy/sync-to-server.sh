#!/usr/bin/env bash
# Sync dingtalk-requirement-inbox to a remote server and (re)install systemd.
#
#   SERVER=ubuntu@1.2.3.4 bash deploy/sync-to-server.sh
#   SERVER=ubuntu@1.2.3.4 COPY_ENV=1 bash deploy/sync-to-server.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${APP_DIR}/../.." && pwd)"

SERVER="${SERVER:?Set SERVER=user@host}"
REMOTE_DIR="${REMOTE_DIR:-/opt/trinity-AI}"
REMOTE_APP="${REMOTE_DIR}/tools/dingtalk-requirement-inbox"
SERVICE_USER="${SERVICE_USER:-trinity}"
COPY_ENV="${COPY_ENV:-0}"

echo "→ Sync repo to ${SERVER}:${REMOTE_DIR}"
ssh "${SERVER}" "mkdir -p '${REMOTE_DIR}/tools'"

rsync -az --delete \
  --exclude '.venv/' \
  --exclude '__pycache__/' \
  --exclude '.pytest_cache/' \
  --exclude 'data/' \
  --exclude '.env' \
  "${REPO_ROOT}/" "${SERVER}:${REMOTE_DIR}/"

if [[ "${COPY_ENV}" == "1" ]]; then
  if [[ ! -f "${APP_DIR}/.env" ]]; then
    echo "COPY_ENV=1 but missing ${APP_DIR}/.env" >&2
    exit 1
  fi
  echo "→ Copy .env"
  scp "${APP_DIR}/.env" "${SERVER}:${REMOTE_APP}/.env"
fi

echo "→ Install systemd on remote"
ssh "${SERVER}" "sudo APP_DIR='${REMOTE_APP}' SERVICE_USER='${SERVICE_USER}' bash '${REMOTE_APP}/deploy/install-systemd.sh'"

echo "Done. Logs: ssh ${SERVER} 'sudo journalctl -u trinity-requirement-inbox -f'"
