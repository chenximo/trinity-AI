---
title: 生文 API · gpt-5.5
---

# 生文 API · GPT-5.5（gpt-5.5）

::: info 样例
**结果**列为浅色 **Tag 标签**；鼠标悬停 Tag 可查看原始响应摘要（气泡）。
:::

`POST /v1/chat/completions` · 模型 `gpt-5.5`

## 验证概览

**8 项已测 · 7 项通过 · 1 项未通过**

## 验证结果

> **结果**列为浅色 **Tag 标签**；鼠标悬停 Tag 可查看原始响应摘要。

<div class="api-val-report">
<table>
<thead>
<tr><th>场景</th><th>关键参数</th><th>结果</th></tr>
</thead>
<tbody>
<tr>
<td>文档完整参数 · 生文</td>
<td><code>stream</code>, <code>temperature</code>, <code>top_p</code>, <code>max_tokens</code>, <code>modalities</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">星瀚是 Trinity 旗下 AI 平台。</span></span></td>
</tr>
<tr>
<td>stream 流式</td>
<td><code>stream</code>, <code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">网关负责路由与鉴权。</span></span></td>
</tr>
<tr>
<td>messages 多轮</td>
<td><code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">AI 平台，Trinity 提供。</span></span></td>
</tr>
<tr>
<td>messages 省略 role</td>
<td><code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">好</span></span></td>
</tr>
<tr>
<td>max_tokens</td>
<td><code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">云指云计算资源。</span></span></td>
</tr>
<tr>
<td>temperature · top_p</td>
<td><code>temperature</code>, <code>top_p</code>, <code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">路由将请求分发上游。</span></span></td>
</tr>
<tr>
<td>省略 modalities</td>
<td><code>max_tokens</code>, <code>modalities</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">多云即多供应商接入。</span></span></td>
</tr>
<tr>
<td>thinking_enabled 深度思考</td>
<td><code>max_tokens</code>, <code>thinking_enabled</code>, <code>reasoning_effort</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-fail">reasoning_effort 不支持取值 minimal</span><span class="api-val-tip-bubble" role="tooltip">[400] Unsupported value: 'reasoning_effort' does not support 'minimal' with this model. Supported values are: 'none', 'low', 'medium', 'high', and 'xhigh'.</span></span></td>
</tr>
</tbody>
</table>
</div>
