# Trinity 工具机

> **主机**：`ubuntu@43.156.31.5`  
> **工具根目录**：`/opt/trinity-tool/`  
> **约定**：后续工具类服务统一落这台机，**一工具一子目录**，勿再散落多台。

## 目录

| 路径 | 用途 |
|------|------|
| `/opt/trinity-tool/dingtalk-requirement-inbox/` | 钉钉需求分析助手 |
| `/opt/trinity-tool/ops-desk/` | Ops Desk 运营台（合同 / 开票 / 台账） |
| `/opt/trinity-tool/pricing-worker/` | 价审 Worker（可迁入；当前生产仍在 `~/trinity-pricing/worker`） |

机上另有历史目录（暂保留）：

- `~/trinity-pricing/` · `~/trinity-AI/`（价审联调期布局）

## SSH

```bash
ssh ubuntu@43.156.31.5
# 推荐改用密钥；勿把密码写进仓库或脚本
```

本机 `~/.ssh/config` 可加：

```
Host trinity-tool
  HostName 43.156.31.5
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
```

## 部署示例

钉钉需求助手（默认同步到本机 `/opt/trinity-tool`）：

```bash
cd tools/dingtalk-requirement-inbox
SERVER=ubuntu@43.156.31.5 COPY_ENV=1 bash deploy/sync-to-server.sh
```

Ops Desk API（已可部署）：

```bash
cd ops-desk
SERVER=ubuntu@43.156.31.5 bash deploy/sync-to-server.sh
# 本机只跑前端：
ssh -N -L 8787:127.0.0.1:8788 ubuntu@43.156.31.5   # 隧道
cd ops-desk && npm run dev
```

服务：`trinity-ops-desk` · 机内端口 `127.0.0.1:8788`（详见 `ops-desk/deploy/README.md`）。

## 安全

- 密钥 / `.env` **不进 git**
- SSH 密码勿出现在对话或文档；优先密钥登录 + 禁用密码
