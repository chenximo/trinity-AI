## 指令：`models` [模态]

列出当前 API 密钥可见的模型 ID，按 **模态**（生文 / 生图 / 生视频）筛选。

### 模态对照

| 用户说法 / 指令 | `modality` | 网关调用 |
|-----------------|------------|----------|
| `models`、`models text`、生文 | `text`（默认） | `GET /models` 或 `GET /models?modality=text` |
| `models image`、生图 | `image` | `GET /models?modality=image` |
| `models video`、生视频 | `video` | `GET /models?modality=video` |
| `models all`、全部模态 | `all` | `GET /models?modality=all` |

API **省略** `modality` 时等价于 **生文**；查生图/生视频必须带查询参数，不要只用默认列表推断。

文档：[获取模型 · modality](https://doc.trinitydesk.ai/api/models) · [高级参数](https://doc.trinitydesk.ai/api/models-parameters)

```bash
# 生文（默认）
$RUNTIME "$GATEWAY_SCRIPT" GET /models

# 生图
$RUNTIME "$GATEWAY_SCRIPT" GET '/models?modality=image'

# 生视频
$RUNTIME "$GATEWAY_SCRIPT" GET '/models?modality=video'

# 全部模态
$RUNTIME "$GATEWAY_SCRIPT" GET '/models?modality=all'
```

路径含 `?` 时用单引号包裹。

### 解析响应

OpenAI 兼容 JSON：

- 数据路径：`data[]`
- 表格列（P0）：**模型 ID**（`id`）、**提供方**（`owned_by`，无则 `-`）
- 若有则加列：**模态**（`metadata.modality_type`）
- 按 `id` 字母排序

`metadata` 可能含展示价（如生图 `min_user_unit_price_usd`）。**P0 不要**按价格排序或筛选——专用筛选/比价 API 在 P1 补充。用户问「最便宜」「按价筛选」时说明现状，只列 ID，或引导 [模型广场](https://trinity.ai/models)。

若 `data` 为空，告知该密钥下此模态无可见模型。

若 HTTP 401/403，提示到 [API 密钥](https://trinitydesk.ai/account/keys) 检查 `TRINITY_API_KEY`。

**展示语言**：表头与说明用简体中文。

---

## 规划中（P1 起，P0 不可用）

| 需求 | 接口 | 阶段 |
|------|------|------|
| 按价格/标签等筛选、比价 | 模型筛选 API（与广场同源） | P1 |
| `model <id>` 详情 | 列表过滤 + 定价/筛选 API | P1 |

---

## 规划中（P2 起，P0 不可用）

| 指令 | 接口 | 阶段 |
|------|------|------|
| `groups` | 管理 API | P2 |
| `balance` | 管理 API | P2 |

P0 只使用网关接口，不要调管理 API。
