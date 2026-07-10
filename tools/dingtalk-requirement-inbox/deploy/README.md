# 需求助手 · 服务器部署

钉钉 **Stream 模式**常驻进程：只需**出站**访问钉钉与 Trinity API，**不需要公网入站**（不必配 nginx 回调）。

## 前置条件

| 项 | 说明 |
|----|------|
| 服务器 | Linux（Ubuntu 22.04+ / Debian 12+），可访问公网 |
| Python | 3.9+（推荐 3.11） |
| 配置 | 本机已填好 `tools/dingtalk-requirement-inbox/.env`（**勿提交 git**） |
| 钉钉 | 应用已发布；机器人已加入试点群（审批通过后再测 `@整理`） |

---

## 方式 A：systemd（推荐）

### 1. 在服务器上克隆代码

```bash
sudo mkdir -p /opt/trinity-AI
sudo chown "$USER":"$USER" /opt/trinity-AI
git clone git@github.com:chenximo/trinity-AI.git /opt/trinity-AI
cd /opt/trinity-AI
git pull   # 后续更新
```

### 2. 复制 `.env`（在本机 Mac 执行）

```bash
scp /Users/linda/Documents/Trinity_AICoding/trinity-AI/tools/dingtalk-requirement-inbox/.env \
  YOUR_USER@YOUR_HOST:/opt/trinity-AI/tools/dingtalk-requirement-inbox/.env
```

### 3. 安装并启动服务（在服务器上）

```bash
cd /opt/trinity-AI/tools/dingtalk-requirement-inbox
sudo bash deploy/install-systemd.sh
```

### 4. 查看状态

```bash
sudo systemctl status trinity-requirement-inbox
sudo journalctl -u trinity-requirement-inbox -f
```

日志里出现 Stream 连接成功即表示常驻正常。

---

## 方式 B：本机一键同步 + 远程安装

在本机已配置 SSH 免密登录时：

```bash
cd trinity-AI/tools/dingtalk-requirement-inbox
SERVER=ubuntu@YOUR_HOST REMOTE_DIR=/opt/trinity-AI COPY_ENV=1 bash deploy/sync-to-server.sh
```

| 变量 | 默认 | 说明 |
|------|------|------|
| `SERVER` | （必填） | `user@host` |
| `REMOTE_DIR` | `/opt/trinity-AI` | 服务器上的仓库根目录 |
| `COPY_ENV` | `0` | 设为 `1` 时用 scp 同步本机 `.env` |
| `SERVICE_USER` | `trinity` | systemd 运行用户 |

---

## 方式 C：Docker

```bash
cd trinity-AI/tools/dingtalk-requirement-inbox
cp .env.example .env   # 或复制已填好的 .env
docker compose up -d --build
docker compose logs -f
```

数据目录 `data/`（去重 SQLite）会挂载到宿主机。

---

## 运行模式

| 模式 | 命令 | 说明 |
|------|------|------|
| **stream**（生产默认） | `python -m src.main stream` | 仅钉钉 Stream，无入站端口 |
| **all** | `python -m src.main all` | Stream + dry-run API（8788） |
| **api** | `python -m src.main api` | 仅本地 dry-run |

生产 systemd 默认 **stream**。若需内网 dry-run，改 unit 中 `ExecStart` 为 `all`，并限制 8788 仅内网访问。

---

## 更新部署

**git 方式：**

```bash
cd /opt/trinity-AI && git pull
cd tools/dingtalk-requirement-inbox
sudo -u trinity .venv/bin/pip install -r requirements.txt -q
sudo systemctl restart trinity-requirement-inbox
```

**sync 脚本方式：** 在本机重跑 `deploy/sync-to-server.sh`。

---

## 验收清单

- [ ] `systemctl is-active trinity-requirement-inbox` → `active`
- [ ] 日志无反复 crash / 鉴权失败
- [ ] 钉钉应用后台 Stream 连接数 ≥ 1
- [ ] （审批通过后）群内 `@Trinity需求助手 整理` 有回复
- [ ] （Notable 开通后）收件箱有新行

---

## 故障排查

| 现象 | 处理 |
|------|------|
| `Missing .env` | scp 本机 `.env` 到服务器对应路径 |
| `401` / 鉴权失败 | 检查 `DINGTALK_CLIENT_ID/SECRET` |
| Stream 连上无消息 | 应用未发布 / 机器人未进群 / `DINGTALK_ALLOWED_CONVERSATION_IDS` 过滤 |
| 写表失败 | `NOTABLE_WRITE_ENABLED=true` 且 Notable 权限已批 |
| 去重 DB 权限 | 确认 `data/` 目录属主为 `trinity` |

---

*产品文档：`apps/trinity-product/docs/assistant-tools/requirement-inbox/route-a.md`*
