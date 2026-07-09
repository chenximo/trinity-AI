#!/usr/bin/env bash
# Run on the target Linux server (as root or with sudo).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/trinity-AI/tools/dingtalk-requirement-inbox}"
SERVICE_NAME="trinity-requirement-inbox"

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "Missing ${APP_DIR}/.env — copy from your Mac first." >&2
  exit 1
fi

if [[ ! -x "${APP_DIR}/.venv/bin/python" ]]; then
  echo "Creating venv in ${APP_DIR}..."
  python3 -m venv "${APP_DIR}/.venv"
  "${APP_DIR}/.venv/bin/pip" install -r "${APP_DIR}/requirements.txt"
fi

install -m 644 "${APP_DIR}/deploy/${SERVICE_NAME}.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"
systemctl --no-pager status "${SERVICE_NAME}"

echo "Logs: journalctl -u ${SERVICE_NAME} -f"
