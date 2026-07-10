# Trinity 需求分析助手 · 钉钉路线

飞书版脚手架见 `../feishu-requirement-inbox/`（搁置，作备选）。

**文档真源**：`apps/trinity-product/docs/assistant-tools/requirement-inbox/`  
**待办清单**：[todo.md](../../apps/trinity-product/docs/assistant-tools/requirement-inbox/todo.md)

---

## 当前状态（2026-07-08）

| 项 | 状态 |
|----|------|
| 钉钉应用 **Trinity需求助手** | ✅ 已创建，Stream 模式 |
| 应用版本发布 | ⏳ 组织审批中 |
| Stream 长连接 | ✅ 本地可连 |
| LLM dry-run | ✅ Codex 样本 4 条；`LLM_MODEL=gpt-4o` |
| 配置路径 | `tools/dingtalk-requirement-inbox/.env`（非仓库根） |
| 群内 `@整理` | ⏳ 等发布 + 进群 |
| Notable 写表 | ⏳ 权限审批中 |
| 群历史 `Chat.Message.Read` | ⏳ 灰度申请 + `messages.py` 待实现 |

---

## 快速开始

```bash
cd tools/dingtalk-requirement-inbox
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 填写 DINGTALK_* / TRINITY_*
```

### 权限开通前

**LLM 摘录验收**（不依赖钉钉）：

```bash
python -m src.main api

curl -s -X POST http://127.0.0.1:8788/internal/dry-run \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: dev-only-change-me" \
  -d @tests/fixtures/codex-sample-messages.json
```

**Stream 收 @**（需应用发布且机器人进群后才有消息）：

```bash
python -m src.main stream
```

预览模式（`NOTABLE_WRITE_ENABLED=false`）：仅回复摘录，不写表。

### 权限开通后

```env
NOTABLE_WRITE_ENABLED=true
CHAT_MESSAGE_READ_ENABLED=true   # 待 messages.py 对接
NOTABLE_BASE_ID=...
NOTABLE_SHEET_NAME=...
NOTABLE_OPERATOR_UNION_ID=...
DINGTALK_ALLOWED_CONVERSATION_IDS=...
```

---

## 运行模式

| 命令 | 作用 |
|------|------|
| `python -m src.main stream` | 仅钉钉 Stream 机器人 |
| `python -m src.main api` | 仅 dry-run HTTP（8788） |
| `python -m src.main all` | 两者同时 |

---

## 测试

```bash
pytest tests/ -q
```

---

## 明日验收（审批通过后）

1. 机器人加入固定需求群  
2. `@Trinity需求助手 整理` → 群内收到回复  
3. 若 Notable 已开通 → 收件箱有「待确认」行  

详见 [待办清单](../../apps/trinity-product/docs/assistant-tools/requirement-inbox/todo.md)。

---

## 服务器部署

钉钉 Stream **只需出站网络**，不必暴露公网回调。

| 方式 | 文档 |
|------|------|
| **systemd（推荐）** | [deploy/README.md](./deploy/README.md) |
| 本机一键同步 | `SERVER=user@host COPY_ENV=1 bash deploy/sync-to-server.sh` |
| Docker | `docker compose up -d --build` |

```bash
# 服务器上（首次）
git clone git@github.com:chenximo/trinity-AI.git /opt/trinity-AI
scp .env user@host:/opt/trinity-AI/tools/dingtalk-requirement-inbox/.env
sudo bash deploy/install-systemd.sh

# 日志
sudo journalctl -u trinity-requirement-inbox -f
```
