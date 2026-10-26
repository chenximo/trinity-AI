#!/usr/bin/env bash
# 在工具机上执行（sudo）
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/trinity-tool/ops-desk/api}"
SERVICE_NAME="trinity-ops-desk"
SERVICE_USER="${SERVICE_USER:-ubuntu}"

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "Missing ${APP_DIR}/.env" >&2
  exit 1
fi

mkdir -p "${APP_DIR}/data"
chown -R "${SERVICE_USER}:${SERVICE_USER}" "$(dirname "${APP_DIR}")"

if [[ ! -x "${APP_DIR}/.venv/bin/python" ]]; then
  echo "Creating venv..."
  python3 -m venv "${APP_DIR}/.venv"
fi

echo "Installing dependencies..."
"${APP_DIR}/.venv/bin/pip" install -q -U pip
"${APP_DIR}/.venv/bin/pip" install -q -r "${APP_DIR}/requirements.txt"

UNIT_SRC="$(dirname "${APP_DIR}")/deploy/${SERVICE_NAME}.service"
UNIT_DST="/etc/systemd/system/${SERVICE_NAME}.service"
sed \
  -e "s|/opt/trinity-tool/ops-desk/api|${APP_DIR}|g" \
  -e "s|User=ubuntu|User=${SERVICE_USER}|g" \
  -e "s|Group=ubuntu|Group=${SERVICE_USER}|g" \
  "${UNIT_SRC}" > "${UNIT_DST}"
chmod 644 "${UNIT_DST}"

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"
systemctl --no-pager status "${SERVICE_NAME}" || true

echo ""
echo "Health: curl -s http://127.0.0.1:8788/api/health"
echo "Logs:   journalctl -u ${SERVICE_NAME} -f"
echo "本机访问: ssh -L 8787:127.0.0.1:8788 ubuntu@43.156.31.5   # 然后照常 npm run dev"
