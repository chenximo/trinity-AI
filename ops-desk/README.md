# Ops Desk · 对账 / AI 云运营台（独立工具）

本地自用：把 **AI 云客户结算** 与 **API 账单对账** 收成一套可浏览、可记状态的工作台。  
**不接** Trinity Admin / 管理后台实付。

技术栈：**Vue 3 + TypeScript（Vite）+ Element Plus** · **FastAPI（Python）** · **SQLite**（本机状态；部署可换 Postgres + COS 存导出文件）。

```text
ops-desk/
├── api/          FastAPI
├── web/          Vue 3 + TS
└── README.md
```

## 快速启动

### 1. 后端

```bash
cd ops-desk/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8787
```

健康检查：<http://127.0.0.1:8787/api/health>  
API 文档：<http://127.0.0.1:8787/docs>

默认扫描仓内 `AI云业务/客户结算/*.xlsx`（相对 `trinity-AI` 根）。可用环境变量覆盖：

| 变量 | 含义 | 默认 |
|------|------|------|
| `OPS_DESK_REPO_ROOT` | trinity-AI 仓库根 | 自动推算（`ops-desk/../`） |
| `OPS_DESK_SETTLEMENT_DIR` | 客户结算目录 | `{REPO}/AI云业务/客户结算` |
| `OPS_DESK_DB` | SQLite 路径 | `api/data/ops-desk.db` |

### 2. 前端

```bash
cd ops-desk/web
npm install
npm run dev
```

或在 `ops-desk/` 下：`npm run dev`（会进 `web/`，**端口 5177**）。

浏览器：<http://127.0.0.1:5177>（已代理 `/api` → `8787`）

> **注意**：不要在 `trinity-AI/` 根目录跑 `npm run dev`——那是门户 `@trinity/app-portal`，默认 **5173**，不是 Ops Desk。

## 当前主功能：出付款申请单

路径：前端 **「出付款申请」** → `/payments`

1. 选公司 + 上游云，填打款金额（可改用途月 / 申请日）  
2. **出单并预览** → 页面预览可打印；下载 Excel（套 `星瀚付款单+报销单.xlsx` 的「付款申请单」）  
3. 记录按申请月保存在 SQLite，文件落在 `AI云业务/发票/付款申请/YYYY-MM/`

> 消耗结算不在本模块管；「消耗台账 / 对账」仅为附属入口。

## 不做

- 不接 Admin API、不代填上游实付  
- 不替代 `pricing/` 刊例流水线  
- 不做员工报销单 sheet（打款只用付款申请单）
