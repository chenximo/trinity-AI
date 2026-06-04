# API 对外接口支持参数

> 说明：本文按当前对外已支持能力拆分为三块：生文、生图、生视频。  
> 目标：给出可直接调用的完整请求示例 + 参数逐条说明（用途、类型、是否必填、可选值/约束）。

---

## 0. 请求/响应头（追踪 ID 与结算键）

适用于 **`POST /v1/chat/completions`**（对外 API Key）与 **`POST /v1/app/chat/completions`**（站内 JWT）。生图亦走同一路径，请求头语义一致。

### 0.1 概念区分（必读）

| 概念 | HTTP 头 / 响应头 | 是否可重复 | 作用 |
|---|---|---|---|
| **追踪 ID** | 请求 `X-Request-Id`；响应回写 `X-Request-Id` | 可重复 | 排障、日志关联；同一用户会话内多次调用可共用同一追踪 ID |
| **结算键** | 请求 `X-Idempotency-Key`；响应回写 `X-Settlement-Key` | 同 workspace 内应唯一 | **计费幂等**：相同结算键仅产生一笔扣费 |
| **会话 ID** | 请求 `X-Conversation-Id`；有值时响应回写 | 可重复 | 会话分组、后台筛选 |

> **注意**：`request_id`（落库字段）与追踪 ID、结算键不是同一概念。后台联查单次计费请用 **结算键**；按追踪 ID 可看到同 trace 下多条结算记录。

### 0.2 请求头

| 请求头 | 必填 | 说明 | 格式与约束 |
|---|---|---|---|
| `X-Request-Id` | 否 | 追踪 ID | 建议 UUID 或业务 trace 字符串；**最长 128 字符**；未传时服务端用网关/MDC 中的请求 ID，仍无则生成 UUID |
| `X-Idempotency-Key` | 否 | 结算幂等键 | 建议 UUID；**最长 128 字符**；**同一次业务重试（网络超时、客户端重放）须保持不变**；未传时服务端每次调用生成新 UUID → **每次调用独立计费** |
| `X-Conversation-Id` | 否 | 会话分组 | 建议业务会话 ID；**最长 128 字符** |

### 0.3 响应头

成功或失败响应（含 **SSE 流式**）均建议回写：

| 响应头 | 说明 |
|---|---|
| `X-Request-Id` | 本次调用最终采用的追踪 ID |
| `X-Settlement-Key` | 本次调用最终采用的结算键（与计费、扣费流水关联） |
| `X-Conversation-Id` | 仅当请求传入 `X-Conversation-Id` 时回写 |

### 0.4 计费行为摘要

1. **不传 `X-Idempotency-Key`**：每次 HTTP 调用使用新的结算键 → **逐次计费**（符合「同一追踪 ID 多次调用可分别扣费」）。
2. **传入相同 `X-Idempotency-Key` 重试**：同一 workspace 内仅 **第一笔成功结算** 扣费；后续命中幂等则 **不再重复扣费**（服务端日志关键字：`billing_settlement_idempotent_skip`）。
3. **追踪 ID 与结算键独立**：可 `X-Request-Id` 相同、`X-Idempotency-Key` 不同 → 多次计费；也可追踪 ID 不同、结算键相同 → 仅计费一次。

### 0.5 curl 示例（带请求头）

```bash
TRACE_ID="trace-$(uuidgen)"
SETTLE_KEY="settle-$(uuidgen)"
CONV_ID="conv-demo-001"

curl -sS -N "${BASE}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "Authorization: Bearer xh-REPLACE_WITH_REAL_KEY" \
  -H "X-Request-Id: ${TRACE_ID}" \
  -H "X-Idempotency-Key: ${SETTLE_KEY}" \
  -H "X-Conversation-Id: ${CONV_ID}" \
  -D - \
  -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"hi"}],"stream":true}'
```

重试同一笔业务时：**保持 `X-Idempotency-Key` 不变**，可更换或复用 `X-Request-Id`。

---

## 一、生文接口（文本生成）

### 1) 接口与完整请求示例

- 方法：`POST`
- 路径：`/v1/chat/completions`
- 鉴权：`Authorization: Bearer xh-...`
- 追踪/结算头：见 **§0**（`X-Request-Id`、`X-Idempotency-Key`、`X-Conversation-Id`）

```json
{
  "model": "doubao-seed-1-6-thinking-agent-preview",
  "messages": [
    { "role": "system", "content": "你是一个专业助手。" },
    { "role": "user", "content": "请用 120 字介绍星瀚平台。"}
  ],
  "stream": true,
  "stream_options": {
    "include_usage": true,
    "chunk_include_usage": false
  },
  "temperature": 0.7,
  "top_p": 1,
  "max_tokens": 1024,
  "thinking_enabled": true,
  "reasoning_effort": "medium",
  "response_format": { "type": "text" },
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "查询城市天气",
        "parameters": {
          "type": "object",
          "properties": {
            "city": { "type": "string" }
          },
          "required": ["city"]
        }
      }
    }
  ],
  "parallel_tool_calls": true,
  "tool_choice": "auto"
}
```

### 2) 参数说明表

| 参数 | 类型 | 必填 | 作用 | 支持值/约束 |
|---|---|---|---|---|
| `model` | string | 是 | 指定逻辑模型编码 | 需是已上架且可用的文本模型（如 `gpt-5.5`） |
| `messages` | array | 是 | 对话上下文输入 | 至少 1 条消息；元素为 `{role, content}` |
| `messages[].role` | string | 否 | 消息角色 | 可传 `system` / `user` / `assistant` / `tool`；不传时服务端默认按 `user` 处理 |
| `messages[].content` | string or array | 是 | 消息内容 | 纯文本为 string；图文/音视频为 Part 数组，见 **§2.1** |
| `messages[].tool_calls` | array | 否 | assistant 工具调用列表 | 仅 `role=assistant` 时可传，元素结构同 OpenAI `tool_calls` |
| `messages[].tool_call_id` | string | 否 | 工具消息关联 ID | 仅 `role=tool` 时必传 |
| `stream` | boolean | 否 | 是否流式返回 | `true`/`false`，默认 `false` |
| `stream_options` | object | 否 | 流式附加选项 | 仅 `stream=true` 时建议传入 |
| `stream_options.include_usage` | boolean | 否 | 是否在末尾追加 usage chunk | `true/false` |
| `stream_options.chunk_include_usage` | boolean | 否 | 每个 chunk 是否带累计 usage | `true/false` |
| `temperature` | number | 否 | 控制随机性 | 常用 `0~2` |
| `top_p` | number | 否 | nucleus 采样参数 | 常用 `0~1` |
| `max_tokens` | integer | 否 | 最大输出 token 数 | 正整数 |
| `max_completion_tokens` | integer | 否 | 最大输出 token（回答+思维） | `1~65536`；与 `max_tokens` 互斥 |
| `thinking_enabled` | boolean | 否 | 是否开启深度思考模式 | `true/false`；按模型能力约束（见下方“模型差异”） |
| `reasoning_effort` | string | 否 | 思考强度等级 | `none/minimal/low/medium/high/xhigh/max`（按模型能力裁剪） |
| `service_tier` | string | 否 | 上游推理服务档位 | 常见 `fast/auto/default`（按模型能力） |
| `stop` | string or string[] | 否 | 命中停止词即结束生成 | 最多 4 个字符串（按模型能力） |
| `response_format` | object/string | 否 | 结构化输出格式 | `text/json_object/json_schema`（按模型能力） |
| `frequency_penalty` | number | 否 | 频率惩罚 | 常见 `-2.0~2.0`（按模型能力） |
| `presence_penalty` | number | 否 | 存在惩罚 | 常见 `-2.0~2.0`（按模型能力） |
| `logprobs` | boolean | 否 | 返回输出 token 对数概率 | `true/false`（按模型能力） |
| `top_logprobs` | integer | 否 | 返回 top 候选 token 数 | 常见 `0~20`，需配合 `logprobs=true` |
| `logit_bias` | object | 否 | token 偏置映射 | `{token_id: bias}`，bias 常见 `-100~100` |
| `tools` | array | 否 | 可调用工具列表 | 元素需为 `type=function` 且含 `function.name` |
| `parallel_tool_calls` | boolean | 否 | 是否允许并行工具调用 | 默认 `true` |
| `tool_choice` | string/object | 否 | 工具调用策略 | `none/auto/required` 或指定 function 对象 |
| `modalities` | array | 否 | 指定输出模态 | 生文场景建议省略或 `["text"]` |

### 2.1) Part 传值规范（`messages[].content` 为数组）

当 `messages[].content` 为 **数组** 时，每个元素为一个 **Part** 对象（兼容 OpenAI Chat Completions 多模态结构）。用于生文场景下的**看图理解、多图对比、音频/文件输入**等；与 **§二 生图** 的 `image_config.reference_images`（文生图参考图）不是同一套字段。

#### 何时用 string / 何时用 Part 数组

| `content` 形态 | 适用场景 |
|---|---|
| `string` | 仅文本对话 |
| `array<Part>` | 需附带图片、音频、文件/视频 URL 等多模态输入 |

约束摘要：

- `content` 为 **string** 或 **array** 时，网关**不校验**是否为空或 Part 结构（与 OpenAI 兼容客户端行为对齐，如 CodeBuddy 多轮历史）。
- **`model`** 须为支持多模态的生文模型时，仍可能因 `supports_multimodal=false` 在路由层拒绝带图请求（见 `ChatUpstreamVisionPolicy`）。

#### Part 公共字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `type` | string | 是 | Part 类型：`text` / `image_url` / `input_audio` / `file` |

#### `type = text`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `text` | string | 否 | 文本内容（网关不校验是否空白） |

```json
{ "type": "text", "text": "请描述图片中的主要物体与场景。" }
```

#### `type = image_url`（生文传图）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `image_url` | string **或** object | 是 | 图片地址；见下方两种写法 |

**写法一（简写，推荐 URL）：**

```json
{ "type": "image_url", "image_url": "https://example.com/sample.png" }
```

**写法二（对象，与 OpenAI 一致）：**

```json
{
  "type": "image_url",
  "image_url": { "url": "https://example.com/sample.png" }
}
```

**地址要求：**

- 支持 `http://` / `https://` 公网可访问 URL；
- 支持 **Base64 Data URL**：`data:image/png;base64,...`（或 `jpeg` / `webp` 等）；
- 单图大小上限以平台校验为准（契约层按 **70MB 以内** 校验，与 OpenAI 口径对齐）。

**多图 + 文本示例：**

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "对比这两张图的区别" },
    { "type": "image_url", "image_url": "https://example.com/a.png" },
    { "type": "image_url", "image_url": { "url": "https://example.com/b.png" } }
  ]
}
```

#### `type = input_audio`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `input_audio` | object | 是 | 音频载荷 |
| `input_audio.data` | string | 是 | 音频 Base64 编码 |
| `input_audio.format` | string | 是 | 仅支持 `mp3` / `wav` |

```json
{
  "type": "input_audio",
  "input_audio": {
    "data": "<base64-encoded-audio>",
    "format": "mp3"
  }
}
```

#### `type = file`（文件 / 视频 URL）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file_url` | string | 是 | 文件或视频 URL（支持 data URL）；**70MB 以内** |
| `file_name` | string | 否 | 展示用文件名 |
| `extra_content` | object | 否 | 仅当模型协议声明支持 `extra_content.google` 时可传 |

```json
{
  "type": "file",
  "file_name": "demo.mp4",
  "file_url": "https://example.com/demo.mp4"
}
```

#### `extra_content.google`（Gemini 媒体分析，可选）

| 字段 | 类型 | 说明 |
|---|---|---|
| `google.fps` | number | 视频理解帧率（请求侧） |
| `google.media_resolution` | string | 输入媒体分辨率策略（按模型 `syntax.enum`） |
| `google.thought_signature` | string | **仅响应字段**；请求传入返回 `invalid_parameter_value` |

#### 生文多模态完整请求示例

- 方法：`POST`
- 路径：`/v1/chat/completions`
- 说明：与纯文本相同接口；**不要**为看图场景设置 `modalities: ["image"]` 或 `image_config`（那是生图语义）。

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "请描述图片中的主要物体与场景。" },
        { "type": "image_url", "image_url": "https://example.com/sample.png" }
      ]
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

Base64 图片示例：

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

#### 与生图传图的区别（易混）

| 能力 | 接口路径 | 传图方式 |
|---|---|---|
| **生文看图**（理解/问答） | `POST /v1/chat/completions` | `messages[].content[]` 中 `type: image_url` |
| **生图**（文生图/参考图） | `POST /v1/chat/completions` | `modalities` 含 `image` + `image_config.reference_images[]` 等（见 §二） |

### 3) 生文模型差异（思考参数）

- `thinking_enabled` / `reasoning_effort` 已接入统一参数链路，并映射到上游生文模板。
- OpenAI 与腾讯云生文路由共用统一请求模板，行为一致按模型能力矩阵控制。
- 典型约束（以模型能力配置为准）：
  - `gpt-5.1`、`gpt-5.2`、`gpt-4o`：不支持 `thinking_enabled` / `reasoning_effort`。
  - `gemini-3-pro-preview`：不允许 `thinking_enabled=false`；`reasoning_effort` 仅支持 `low/medium/high`。
  - `gemini-3-flash-preview`：默认开启思考；`reasoning_effort` 支持 `minimal/low/medium/high`。

---

## 二、生图接口（图片生成）

### 1) 接口与完整请求示例

- 方法：`POST`
- 路径：`/v1/chat/completions`
- 鉴权：`Authorization: Bearer xh-...`
- 追踪/结算头：见 **§0**（与纯生文相同）

```json
{
  "model": "hunyuan-image",
  "messages": [
    { "role": "user", "content": "生成一张未来城市夜景，赛博朋克风格。" }
  ],
  "modalities": ["image", "text"],
  "image_config": {
    "image_size": "1K",
    "aspect_ratio": "1:1",
    "output_format": "url",
    "person_generation": "allow",
    "input_compliance_check": true,
    "output_compliance_check": true,
    "output_image_format": "png",
    "custom_size": "1024x1024",
    "sequential_image_generation": false,
    "reference_images": [
      {
        "type": "url",
        "url": "https://example.com/ref.png",
        "text": "保持主建筑轮廓，不改变几何结构"
      }
    ]
  }
}
```

### 2) 参数说明表

| 参数 | 类型 | 必填 | 作用 | 支持值/约束 |
|---|---|---|---|---|
| `model` | string | 是 | 指定生图模型编码 | 需是已上架可用生图模型（如 `hunyuan-image`） |
| `messages` | array | 是 | 输入提示词来源 | 通常从 `user` 文本提取 prompt |
| `modalities` | array | 建议 | 声明输出模态 | 建议包含 `image`（可包含 `text`） |
| `stream` | boolean | 否 | 是否流式 | 生图当前不支持 `true`，只能同步返回 |
| `image_config` | object | 否 | 生图专用参数容器 | 见下方子字段 |
| `image_config.image_size` | string | 否 | 图片尺寸档位 | 由具体模型能力决定（如 `1K`） |
| `image_config.aspect_ratio` | string | 否 | 宽高比 | 如 `1:1` / `16:9` / `9:16` |
| `image_config.output_format` | string | 否 | 对外返回格式偏好 | `url` / `base64` |
| `image_config.person_generation` | string | 否 | 人物生成人脸相关策略 | 由模型与上游能力约束 |
| `image_config.input_compliance_check` | boolean | 否 | 输入合规检查开关 | `true` / `false` |
| `image_config.output_compliance_check` | boolean | 否 | 输出合规检查开关 | `true` / `false` |
| `image_config.output_image_format` | string | 否 | 输出文件格式 | `png` / `jpeg` |
| `image_config.custom_size` | string | 否 | 自定义尺寸透传参数 | 仅部分模型生效 |
| `image_config.sequential_image_generation` | boolean | 否 | 顺序生成策略 | 仅部分模型生效 |
| `image_config.reference_images` | array | 否 | 参考图列表 | 当前仅支持 URL 参考图 |
| `image_config.reference_images[].type` | string | 是（项内） | 参考图来源类型 | 当前仅支持 `url` |
| `image_config.reference_images[].url` | string | 是（项内） | URL 参考图地址 | 需为可访问 URL |
| `image_config.reference_images[].text` | string | 否 | 参考图语义描述 | 可选 |
| `trinity_async.mode` | string | 否 | 异步模式参数 | 生图当前不支持，传入会报 `invalid_request` |
| `trinity_async.poll_interval_sec` | integer | 否 | 轮询间隔参数 | 生图当前不支持，传入会报 `invalid_request` |

---

## 三、生视频接口（视频生成）

### 1) 接口与完整请求示例（创建任务）

- 方法：`POST`
- 路径：`/v1/video/generations`
- 鉴权：`Authorization: Bearer xh-...`

```json
{
  "model": "tencent/kling-2.6",
  "prompt": "黄昏海边，镜头跟随人物慢跑，电影感光影。",
  "duration_sec": 5,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "generate_audio": false,
  "frame_images": [
    {
      "type": "image_url",
      "frame_type": "first_frame",
      "image_url": { "url": "https://example.com/first.png" }
    },
    {
      "type": "image_url",
      "frame_type": "last_frame",
      "image_url": { "url": "https://example.com/last.png" }
    }
  ],
  "input_references": [],
  "model_specific_config": {
    "scene_type": "text_to_video",
    "enhance_prompt": "Enabled"
  },
  "provider": {
    "raw_passthrough": false
  }
}
```

### 2) 生视频查询接口示例（查任务）

- 方法：`GET`
- 路径：`/v1/video/tasks/{taskId}`

```bash
curl -X GET "http://43.159.57.43/v1/video/tasks/vidtsk_xxx" \
  -H "Authorization: Bearer xh-你的APIKey"
```

### 3) 参数说明表（创建任务）

| 参数 | 类型 | 必填 | 作用 | 支持值/约束 |
|---|---|---|---|---|
| `model` | string | 是 | 指定视频模型编码 | 如 `tencent/kling-2.6` |
| `prompt` | string | 条件 | 视频主提示词 | 无素材输入时必填 |
| `duration_sec` | integer | 否 | 视频时长（秒） | 默认 `5`，按模型能力限制 |
| `resolution` | string | 否 | 输出分辨率 | 常见 `480p/720p/1080p` |
| `aspect_ratio` | string | 否 | 输出宽高比 | 如 `16:9/9:16/1:1` |
| `generate_audio` | boolean | 否 | 是否生成音频 | 默认 `false` |
| `frame_images` | array | 否 | 首帧/尾帧图像输入 | 见子字段 |
| `frame_images[].type` | string | 是（项内） | 帧图输入类型 | 固定 `image_url` |
| `frame_images[].frame_type` | string | 是（项内） | 帧类型 | `first_frame` / `last_frame` |
| `frame_images[].image_url.url` | string | 是（项内） | 帧图 URL | 可访问 URL |
| `input_references` | array | 否 | 参考素材集合 | 可图/视频混合 |
| `input_references[].type` | string | 是（项内） | 参考类型 | `image_url` / `video_url` |
| `input_references[].image_url.url` | string | 条件 | 参考图 URL | 当 type=`image_url` 必填 |
| `input_references[].video_url` | string | 条件 | 参考视频 URL | 当 type=`video_url` 必填 |
| `input_references[].object_id` | string | 否 | 参考图主体 ID（Vidu 等多图参考） | 见 §3.1 |
| `input_references[].reference_type` | string | 否 | 参考语义类型（GV/Kling/PixVerse 等） | 见 §3.1 |
| `model_specific_config` | object | 否 | 模型专属参数区 | 仅白名单键生效；`logo_add` 不支持 |
| `provider` | object | 否 | 厂商扩展参数容器 | `raw_passthrough` 不参与创建映射 |

### 4) 参数说明表（查询任务）

| 参数 | 类型 | 必填 | 作用 | 支持值/约束 |
|---|---|---|---|---|
| `taskId`（路径参数） | string | 是 | 查询视频任务状态 | 必须是创建返回的 `trinity_task.task_id` |

### 3.1 `input_references[]` 进阶字段：`object_id` 与 `reference_type`

二者均为**可选**字段，平台原样映射到腾讯 `FileInfos[].ObjectId` / `FileInfos[].ReferenceType`，**不做枚举校验**；传错或当前模型不支持时，上游可能忽略或报错。

**适用范围**

- 主要作用于 `input_references[]` 且 `type=image_url` 的项。
- `type=video_url` 时，`reference_type` 在 Kling 等模型上用于区分参考视频类型（见下表 `feature` / `base`）。
- 简单文生视频、仅首帧/尾帧生视频（用 `frame_images`）时，通常**不必**传这两个字段。

**与 `model_specific_config.usage` 的区别**

| 字段 | 映射目标 | 含义 |
|---|---|---|
| `input_references[].reference_type` | `FileInfos[].ReferenceType` | 该参考素材的**参考方式**（素材/风格/主体/背景等） |
| `model_specific_config.usage` | `FileInfos[].Usage` | 该文件在任务中的**用途**（`FirstFrame` / `Reference` / `LastFrame` 等） |

首帧、尾帧请用 `frame_images[]`；不要把 `Reference` 当作 `reference_type` 传入——`Reference` 是腾讯 `Usage` 的取值，不是 `ReferenceType`。

#### `object_id`（主体 ID）

**作用**：为多张参考图指定同一「主体」，便于模型在生成时绑定语义；可在 `prompt` 中通过 `@object_id` 引用（例如 `object_id="hero_a"` 时写 `@hero_a 在雨中奔跑`）。

**主要适用**：Vidu q2 等多图/主体参考生视频。

**用法要点**

- 属于同一主体的多张图，传**相同**的 `object_id`。
- 单张参考图、无主体绑定需求时可省略。
- 与 `reference_type` 独立；Vidu 场景通常只需 `object_id`，不必同时传 `reference_type`。

**示例（Vidu 多图同一主体）**

```json
{
  "model": "tencent/vidu-q2",
  "prompt": "@hero_a 在海边漫步，电影感光影",
  "duration_sec": 5,
  "input_references": [
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/face.png" },
      "object_id": "hero_a"
    },
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/outfit.png" },
      "object_id": "hero_a"
    }
  ],
  "model_specific_config": {
    "usage": "Reference"
  }
}
```

#### `reference_type`（参考语义）

**作用**：告诉上游模型「这张（或这段）参考素材按什么语义参与生成」，映射到腾讯 `FileInfos[].ReferenceType`（视频参考时映射到对应视频参考字段）。

**平台已知取值**（以腾讯 VOD `CreateAigcVideoTask` 为准；未列出的值可能被上游拒绝或忽略）：

| `reference_type` | 适用模型 / 场景 | 含义 |
|---|---|---|
| `asset` | GV | 按**素材**参考该图片 |
| `style` | GV | 按**风格**参考该图片 |
| `subject` | PixVerse 多图参考 | 该图为**主体**参考；可配合 `model_specific_config` 中的命名与 prompt `@名称` 做精准描述 |
| `background` | PixVerse 多图参考 | 该图为**背景**参考 |
| `feature` | Kling + `type=video_url` | **特征**参考视频 |
| `base` | Kling + `type=video_url` | **待编辑**参考视频（非特征参考） |

**何时需要传**

- **GV** 多图参考：建议为每张图指定 `asset` 或 `style`。
- **PixVerse** 多主体/多背景：用 `subject` / `background` 区分。
- **Kling** 视频参考：用 `feature` / `base` 区分参考视频类型。
- **Vidu** 等多图主体参考：优先用 `object_id`；一般**不需要** `reference_type`。
- 单张参考图、纯文生视频：通常省略。

**示例（GV 多图，区分素材与风格）**

```json
{
  "model": "tencent/gv-3.1",
  "prompt": "产品发布会，镜头在舞台与观众间切换",
  "duration_sec": 8,
  "input_references": [
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/product.png" },
      "reference_type": "asset"
    },
    {
      "type": "image_url",
      "image_url": { "url": "https://example.com/style-ref.png" },
      "reference_type": "style"
    }
  ]
}
```

---

## 文档维护强约束

1. 任何“对外可传参数”的新增、修改、删除（生文/生图/生视频）都必须同步更新本文。  
2. 追踪/结算相关请求头、响应头变更须同步更新本文 **§0**，并检查 `大模型文本接口.md`、`大模型生图接口.md`、`接口说明文档V1.md`。  
3. 更新本文时，必须同时检查：`大模型文本接口.md`、`大模型生图接口.md`、`大模型视频接口.md`。  
4. 若实际实现与文档不一致，以“先修实现或先修文档”二选一当次收敛，不允许长期漂移。

