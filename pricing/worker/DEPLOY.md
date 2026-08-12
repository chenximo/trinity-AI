# 价审 Worker · 方案 C 部署与联调（2026-08-11）

> **方案 C 目标**：Admin 点「触发价审」→ POST Worker → 自动出包挂回**同一任务** → 人点「确认写价」。  
> **后台侧已齐**（出包 URL 优先 POST + internal 挂包 + confirm + 只上浮）。本文件管 **Worker 部署 + 配置对接**。

---

## 0. 还缺什么（对照）

| 项 | 状态 | 谁做 |
|----|------|------|
| Admin/Backend 触发·挂包·确认 | ✅ 已提交 | — |
| Worker 认 `taskId` / internal 挂包 | ✅ 代码已对齐（本仓 `pricing/worker`） | 定价 |
| Worker **部署并常驻** | ⚠️ 示例机可能有旧进程；须拉新代码 | 运维/定价 |
| Admin「出包 URL」填 Worker | ❌ 运行时配置 | 产品/运维 |
| `ADMIN_API_BASE` + `ADMIN_OPS_TOKEN` | ❌ 须配 | 运维（向后台要 Ops Token） |
| 关 dry-run + 真 CLI 仓 | P1 | 定价（先 dry-run 打通链路） |
| 完整 diff / V1·V2 列 | P1（C-P2） | 定价 |

---

## 1. 服务器布局

```text
/home/ubuntu/trinity-pricing/          # 或 /opt/trinity-AI
├── worker/          # 本服务（从 trinity-AI/pricing/worker 同步）
├── packages/        # 可选：PACKAGE_OUT_DIR
└── .env             # 勿提交仓库
```

推荐：整仓 clone `trinity-AI`，Worker 用 `TRINITY_AI_ROOT` 指仓根。

---

## 2. .env（方案 C 最小）

```bash
PORT=8787
HOST=0.0.0.0
# Admin 出包 URL POST 不带 Bearer → 内网留空
WORKER_TOKEN=

PRICING_WORKER_DRY_RUN=1
TRINITY_AI_ROOT=/path/to/trinity-AI

# 挂回原任务（必配才能异步闭环）
ADMIN_API_BASE=https://<admin-api-host>
ADMIN_OPS_TOKEN=<向后台要的 X-Trinity-Ops-Token>

# 可选兜底文件
# PACKAGE_OUT_DIR=/home/ubuntu/trinity-pricing/packages
```

systemd 示例：`ExecStart=/usr/bin/npm --prefix …/pricing/worker start`

---

## 3. Admin 配置（对接开关）

运营后台 → 模型刊例和定价 → 出包与抓价配置：

| 字段 | 填法 |
|------|------|
| 生文出包 URL | `http://<worker-内网或反代>/v1/pricing-review/trigger` |
| 图/视频 | 同左，或模板 `http://…/v1/pricing-review/trigger`（后台已按模态拆任务） |

**不要**指望独立字段 `reviewGenerateWebhookUrl`（未做、也不需要）。

网络：Admin **出站**能打到该 URL；Worker **出站**能打到 `ADMIN_API_BASE` 的 `/internal/pricing/ops/review-tasks`。

---

## 4. 联调剧本（产品签字）

### A. 只验 Worker（SSH 本机）

```bash
curl -sS http://127.0.0.1:8787/healthz
# → {"ok":true,"dryRun":true,…}

curl -sS -X POST 'http://127.0.0.1:8787/v1/pricing-review/trigger?async=0' \
  -H 'Content-Type: application/json' \
  -d '{"taskId":1,"taskCode":"pr-smoke","modality":"text","scenario":"巡检跟进"}'
# → 价审包 JSON（含 draftPrices / buckets）
```

### B. Admin → Worker → 挂回

1. 配好出包 URL + Worker `.env` 的 `ADMIN_*`。  
2. Admin 触发「生文」价审。  
3. 期望：任务同一 `taskId` → `ready`（异步：先 ACK 再 internal 挂包；同步 `?async=0` 则响应体即包）。  
4. **不点确认** → `/v1/prices` 不变。  
5. 确认写价（只上浮）→ 刊例变。

### C. 本仓冒烟（开发机）

```bash
cd pricing/worker && npm install && npm run smoke
```

---

## 5. 公网 / 安全组

`8787` 建议 **仅内网** 或 Admin 出口 IP。勿对 `0.0.0.0/0` 长期敞开。  
临时：`ssh -L 8787:127.0.0.1:8787 ubuntu@<host>`。

---

## 6. 关 dry-run（真 CLI）前置

推荐服务器布局（**勿**在小机上对整仓 `npm ci` workspaces）：

```text
/home/ubuntu/trinity-AI/          # TRINITY_AI_ROOT
  package.json                    # 用 pricing/server-cli-package.json 覆盖（仅 xlsx 依赖）
  pricing/                        # 同步 pipeline + suppliers + output 缓存
/home/ubuntu/trinity-pricing/worker/
```

同步示例（本机）：

```bash
# 从 trinity-AI 仓根
rsync -az --delete \
  --exclude node_modules --exclude '.git' --exclude 'pricing/worker/node_modules' \
  pricing/ ubuntu@HOST:/home/ubuntu/trinity-AI/pricing/
scp pricing/server-cli-package.json ubuntu@HOST:/home/ubuntu/trinity-AI/package.json
ssh ubuntu@HOST 'cd /home/ubuntu/trinity-AI && npm install --omit=dev'
```

然后：

- [ ] `PRICING_WORKER_DRY_RUN=0`
- [ ] 默认 text 步骤会跑：`fetch → listing:v1v2 → gen-listing-v2 → diff:listing-v2 → emit`
- [ ] Admin 出包 URL 用**同步**（无 `?async=1`）；CLI 可能数分钟，注意 Admin HTTP 超时
- [ ] 有 `ADMIN_OPS_TOKEN` 时可用 `?async=1` 先 ACK 再挂包

冒烟：

```bash
cd /home/ubuntu/trinity-AI && npm run pricing:review-text
curl -sS -X POST 'http://127.0.0.1:8787/v1/pricing-review/trigger?async=0' \
  -H 'Content-Type: application/json' \
  -d '{"taskId":1,"modality":"text","scenario":"官方上游变价"}' | head -c 400
```

---

## 7. 安全

- Ops Token / SSH 勿进仓库  
- 更换示例环境中的旧 token
