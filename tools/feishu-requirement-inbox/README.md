# Trinity 需求分析助手 · 路线 A

飞书群 `@需求助手 整理` → LLM 摘录 → 写入飞书「需求收件箱」多维表格。

**产品落地文档**：[路线 A 落地文档](../../apps/trinity-product/docs/assistant-tools/requirement-inbox/route-a.md)

## 快速开始

```bash
cd tools/feishu-requirement-inbox
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 填写飞书与 Trinity 密钥
uvicorn src.main:app --reload --host 0.0.0.0 --port 8787
```

健康检查：`GET http://127.0.0.1:8787/health`

飞书事件回调：`POST http://<公网域名>/webhooks/feishu`

## 本地调试摘录（不写表）

```bash
curl -s -X POST http://127.0.0.1:8787/internal/dry-run \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: $INTERNAL_DRY_RUN_TOKEN" \
  -d @tests/fixtures/codex-sample-messages.json
```

## 目录

| 路径 | 说明 |
|------|------|
| `prompt.md` | 系统 Prompt 真源 |
| `schema.json` | LLM 输出结构 |
| `src/main.py` | FastAPI 入口 |
| `src/pipeline.py` | 整理主流程 |

## 测试

```bash
pytest tests/ -q
```
