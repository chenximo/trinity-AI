# Ops Desk · 部署到工具机

**工具机**：`ubuntu@43.156.31.5`（见 [`../../tools/SERVER.md`](../../tools/SERVER.md)）  
**目录**：`/opt/trinity-tool/ops-desk/`  
**端口**：`127.0.0.1:8788`（价审已占 8787；Desk **不对外网裸开**，经 SSH 隧道用）

## 本机一键同步 + 启服务

```bash
cd trinity-AI/ops-desk
SERVER=ubuntu@43.156.31.5 COPY_ENV=1 bash deploy/sync-to-server.sh
```

会同步：API 代码、templates、客户结算表、合同、样板、SQLite，并装 `trinity-ops-desk` systemd。

## 日常使用（本机只跑前端）

```bash
# 终端 1：隧道（把远端 8788 接到本机 8787）
ssh -N -L 8787:127.0.0.1:8788 ubuntu@43.156.31.5

# 终端 2：只开前端
cd ops-desk && npm run dev
```

浏览器仍打开 http://localhost:5177 。

## 常用命令

```bash
ssh ubuntu@43.156.31.5 'sudo systemctl status trinity-ops-desk'
ssh ubuntu@43.156.31.5 'sudo journalctl -u trinity-ops-desk -f'
ssh ubuntu@43.156.31.5 'curl -s http://127.0.0.1:8788/api/health'
```

结算表有更新时再跑一遍 `sync-to-server.sh`（或只 `SYNC_DATA=1`）。
