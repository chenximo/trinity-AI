#!/usr/bin/env bash
# Run on the target Linux server (as root or with sudo).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/trinity-AI/tools/dingtalk-requirement-inbox}"
SERVICE_NAME="trinity-requirement-inbox"
SERVICE_USER="${SERVICE_USER:-trinity}"

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "Missing ${APP_DIR}/.env — copy from your Mac first." >&2
  echo "  scp tools/dingtalk-requirement-inbox/.env ${USER}@HOST:${APP_DIR}/.env" >&2
  exit 1
fi

if ! id "${SERVICE_USER}" &>/dev/null; then
  echo "Creating system user ${SERVICE_USER}..."
  useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${SERVICE_USER}" || true
fi

mkdir -p "${APP_DIR}/data"
chown -R "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}/data"
chown "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"

if [[ ! -x "${APP_DIR}/.venv/bin/python" ]]; then
  echo "Creating venv in ${APP_DIR}..."
  python3 -m venv "${APP_DIR}/.venv"
fi

echo "Installing Python dependencies..."
"${APP_DIR}/.venv/bin/pip" install -q -r "${APP_DIR}/requirements.txt"

chown -R "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}/.venv"

# Substitute paths in unit file for non-default APP_DIR
UNIT_SRC="${APP_DIR}/deploy/${SERVICE_NAME}.service"
UNIT_DST="/etc/systemd/system/${SERVICE_NAME}.service"
sed \
  -e "s|/opt/trinity-AI/tools/dingtalk-requirement-inbox|${APP_DIR}|g" \
  -e "s|User=trinity|User=${SERVICE_USER}|g" \
  -e "s|Group=trinity|Group=${SERVICE_USER}|g" \
  "${UNIT_SRC}" > "${UNIT_DST}"
chmod 644 "${UNIT_DST}"

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"
systemctl --no-pager status "${SERVICE_NAME}"

echo ""
echo "Logs: journalctl -u ${SERVICE_NAME} -f"
