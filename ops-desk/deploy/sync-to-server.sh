#!/usr/bin/env bash
# 同步 Ops Desk API + 工作区数据到工具机并安装 systemd
#
#   SERVER=ubuntu@43.156.31.5 bash ops-desk/deploy/sync-to-server.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS_DESK="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${OPS_DESK}/.." && pwd)"

SERVER="${SERVER:?Set SERVER=user@host (e.g. ubuntu@43.156.31.5)}"
REMOTE_ROOT="${REMOTE_ROOT:-/opt/trinity-tool/ops-desk}"
COPY_ENV="${COPY_ENV:-1}"
SYNC_DATA="${SYNC_DATA:-1}"

echo "→ Ensure remote dirs"
ssh "${SERVER}" "sudo mkdir -p '${REMOTE_ROOT}' && sudo chown \"\$(whoami):\$(whoami)\" /opt/trinity-tool '${REMOTE_ROOT}'"

echo "→ Sync API code"
rsync -az --delete \
  --exclude '.venv/' \
  --exclude '__pycache__/' \
  --exclude '.pytest_cache/' \
  --exclude 'data/*.db-journal' \
  "${OPS_DESK}/api/" "${SERVER}:${REMOTE_ROOT}/api/"

echo "→ Sync deploy + templates"
rsync -az --delete "${OPS_DESK}/deploy/" "${SERVER}:${REMOTE_ROOT}/deploy/"
if [[ -d "${OPS_DESK}/templates" ]]; then
  rsync -az --delete "${OPS_DESK}/templates/" "${SERVER}:${REMOTE_ROOT}/templates/"
fi

if [[ "${SYNC_DATA}" == "1" ]]; then
  echo "→ Sync workspace data (结算 / 合同 / 样板)"
  ssh "${SERVER}" "mkdir -p \
    '${REMOTE_ROOT}/workspace/AI云业务/客户结算' \
    '${REMOTE_ROOT}/workspace/AI云业务/合同' \
    '${REMOTE_ROOT}/workspace/marketing/销售真源/合同模板' \
    '${REMOTE_ROOT}/workspace/pricing/账单对账'"
  rsync -az --delete \
    "${REPO_ROOT}/AI云业务/客户结算/" \
    "${SERVER}:${REMOTE_ROOT}/workspace/AI云业务/客户结算/"
  rsync -az \
    "${REPO_ROOT}/AI云业务/合同/" \
    "${SERVER}:${REMOTE_ROOT}/workspace/AI云业务/合同/"
  rsync -az \
    "${REPO_ROOT}/marketing/销售真源/合同模板/" \
    "${SERVER}:${REMOTE_ROOT}/workspace/marketing/销售真源/合同模板/"
  if [[ -f "${OPS_DESK}/api/data/ops-desk.db" ]]; then
    ssh "${SERVER}" "mkdir -p '${REMOTE_ROOT}/api/data'"
    rsync -az "${OPS_DESK}/api/data/ops-desk.db" "${SERVER}:${REMOTE_ROOT}/api/data/ops-desk.db"
  fi
fi

if [[ "${COPY_ENV}" == "1" ]]; then
  echo "→ Write remote .env"
  TMP_ENV="$(mktemp)"
  {
    if [[ -f "${OPS_DESK}/api/.env" ]]; then
      # 保留 COS / 额度等，去掉本机路径
      grep -E '^(OPS_DESK_STORAGE|OPS_DESK_COS_|OPS_DESK_INVOICE_|OPS_DESK_PAYER|OPS_DESK_DEPARTMENT|OPS_DESK_APPLICANT)' \
        "${OPS_DESK}/api/.env" || true
    fi
    echo "OPS_DESK_REPO_ROOT=${REMOTE_ROOT}/workspace"
    echo "OPS_DESK_DB=${REMOTE_ROOT}/api/data/ops-desk.db"
    echo "OPS_DESK_CONTRACT_TEMPLATE_DIR=${REMOTE_ROOT}/workspace/marketing/销售真源/合同模板"
    echo "OPS_DESK_CONTRACT_ARCHIVE_DIR=${REMOTE_ROOT}/workspace/AI云业务/合同"
    echo "OPS_DESK_SETTLEMENT_CONFIRM_TEMPLATE=${REMOTE_ROOT}/templates/结算确认单.doc"
  } > "${TMP_ENV}"
  scp "${TMP_ENV}" "${SERVER}:${REMOTE_ROOT}/api/.env"
  rm -f "${TMP_ENV}"
  ssh "${SERVER}" "chmod 600 '${REMOTE_ROOT}/api/.env'"
fi

echo "→ Install / restart systemd"
ssh "${SERVER}" "sudo APP_DIR='${REMOTE_ROOT}/api' SERVICE_USER=\"\$(whoami)\" bash '${REMOTE_ROOT}/deploy/install-systemd.sh'"

echo ""
echo "Done."
echo "  机内: curl -s http://127.0.0.1:8788/api/health"
echo "  本机: ssh -N -L 8787:127.0.0.1:8788 ${SERVER}"
echo "        然后 cd ops-desk && npm run dev"
