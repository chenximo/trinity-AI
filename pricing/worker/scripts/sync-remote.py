#!/usr/bin/env python3
"""Sync local pricing/ + worker to the pricing review host and restart systemd."""
from __future__ import annotations

import os
import sys
import time


def main() -> int:
    try:
        import paramiko
    except ImportError:
        print("need paramiko: pip install paramiko", file=sys.stderr)
        return 1

    host = os.environ.get("DEPLOY_HOST", "43.156.31.5")
    user = os.environ.get("DEPLOY_USER", "ubuntu")
    password = os.environ.get("DEPLOY_PASS")
    if not password:
        print("DEPLOY_PASS required", file=sys.stderr)
        return 1

    local = os.environ.get("DEPLOY_BUNDLE", "/tmp/trinity-pricing-sync/bundle.tgz")
    if not os.path.isfile(local):
        print(f"missing bundle: {local}", file=sys.stderr)
        return 1

    remote_tar = "/tmp/trinity-pricing-bundle.tgz"
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"connecting {user}@{host} ...")
    client.connect(
        host,
        username=user,
        password=password,
        timeout=45,
        allow_agent=False,
        look_for_keys=False,
    )

    def run(cmd: str, check: bool = True, timeout: int = 600) -> tuple[int, str]:
        print(f"$ {cmd[:140]}")
        _, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
        out = stdout.read().decode(errors="replace")
        err = stderr.read().decode(errors="replace")
        code = stdout.channel.recv_exit_status()
        if out.strip():
            print(out[-10000:])
        if err.strip() and err.strip() not in out:
            print("STDERR:", err[-2000:])
        if check and code != 0:
            raise SystemExit(f"fail {code}: {cmd}")
        return code, out

    sftp = client.open_sftp()
    print("uploading", os.path.getsize(local), "bytes")
    sftp.put(local, remote_tar)
    sftp.close()
    print("uploaded")

    run(
        """
set -e
cd /tmp
rm -rf pricing_sync_unpack
mkdir pricing_sync_unpack
tar xzf trinity-pricing-bundle.tgz -C pricing_sync_unpack
mkdir -p /home/ubuntu/trinity-AI
rm -rf /home/ubuntu/trinity-AI/pricing
cp -a /tmp/pricing_sync_unpack/pricing /home/ubuntu/trinity-AI/
cp -f /home/ubuntu/trinity-AI/pricing/server-cli-package.json /home/ubuntu/trinity-AI/package.json
mkdir -p /home/ubuntu/trinity-pricing/worker
cp -a /home/ubuntu/trinity-AI/pricing/worker/src /home/ubuntu/trinity-pricing/worker/
cp -f /home/ubuntu/trinity-AI/pricing/worker/package.json /home/ubuntu/trinity-pricing/worker/
cp -f /home/ubuntu/trinity-AI/pricing/worker/package-lock.json /home/ubuntu/trinity-pricing/worker/ 2>/dev/null || true
cp -f /home/ubuntu/trinity-AI/pricing/worker/tsconfig.json /home/ubuntu/trinity-pricing/worker/ 2>/dev/null || true
cp -f /home/ubuntu/trinity-AI/pricing/worker/README.md /home/ubuntu/trinity-pricing/worker/ 2>/dev/null || true
cp -f /home/ubuntu/trinity-AI/pricing/worker/DEPLOY.md /home/ubuntu/trinity-pricing/worker/ 2>/dev/null || true
mkdir -p /home/ubuntu/trinity-pricing/worker/scripts
cp -a /home/ubuntu/trinity-AI/pricing/worker/scripts/. /home/ubuntu/trinity-pricing/worker/scripts/ || true
if [ -f /home/ubuntu/trinity-pricing/worker/.env ]; then
  grep -q '^TRINITY_AI_ROOT=' /home/ubuntu/trinity-pricing/worker/.env \\
    && sed -i 's|^TRINITY_AI_ROOT=.*|TRINITY_AI_ROOT=/home/ubuntu/trinity-AI|' /home/ubuntu/trinity-pricing/worker/.env \\
    || echo 'TRINITY_AI_ROOT=/home/ubuntu/trinity-AI' >> /home/ubuntu/trinity-pricing/worker/.env
  grep -q '^PRICING_WORKER_DRY_RUN=' /home/ubuntu/trinity-pricing/worker/.env \\
    && sed -i 's|^PRICING_WORKER_DRY_RUN=.*|PRICING_WORKER_DRY_RUN=0|' /home/ubuntu/trinity-pricing/worker/.env \\
    || echo 'PRICING_WORKER_DRY_RUN=0' >> /home/ubuntu/trinity-pricing/worker/.env
fi
grep -E '^(TRINITY_AI_ROOT|PRICING_WORKER_DRY_RUN|PORT|HOST)=' /home/ubuntu/trinity-pricing/worker/.env || true
test -f /home/ubuntu/trinity-AI/pricing/pipeline/gen-listing-v2-prices-api.mjs
test -f /home/ubuntu/trinity-pricing/worker/src/catalogSync.ts
grep -n 'gen-listing-v2\\|listing:v1v2\\|diff:listing-v2' /home/ubuntu/trinity-AI/package.json
echo SYNC_FILES_OK
"""
    )

    run("cd /home/ubuntu/trinity-AI && npm install --omit=dev", timeout=300)
    run("cd /home/ubuntu/trinity-pricing/worker && npm install --omit=dev", timeout=180)
    run("sudo systemctl restart trinity-pricing-worker")
    time.sleep(3)
    run("systemctl is-active trinity-pricing-worker", check=False)
    run("curl -sS http://127.0.0.1:8787/healthz")
    run("cd /home/ubuntu/trinity-AI && npm run pricing:gen-listing-v2", timeout=120)
    run("cd /home/ubuntu/trinity-AI && npm run pricing:diff:listing-v2", timeout=180)
    run("cd /home/ubuntu/trinity-AI && npm run pricing:emit-review-package", timeout=60)
    run(
        """python3 - <<'P'
import json
p='/home/ubuntu/trinity-AI/pricing/output/review-packages/review-package-text.json'
d=json.load(open(p))
print('policy', d.get('pricingPolicy'))
print('models', len((d.get('draftPrices') or {}).get('data') or []))
print('diffRows', len((d.get('diff') or {}).get('rows') or []))
print('summary', (d.get('diff') or {}).get('summary'))
P"""
    )
    run(
        """curl -sS -X POST 'http://127.0.0.1:8787/v1/pricing-review/trigger?async=0' """
        """-H 'Content-Type: application/json' """
        """-d '{"taskId":9011,"taskCode":"sync-listing-v2","modality":"text","scenario":"官方锚跟刊例"}' """
        """| python3 -c "import sys,json; d=json.load(sys.stdin); """
        """print('trigger_policy', d.get('pricingPolicy')); """
        """print('summary', (d.get('diff') or {}).get('summary')); """
        """print('rows', len((d.get('diff') or {}).get('rows') or []))" """
    )

    client.close()
    print("DEPLOY_SYNC_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
