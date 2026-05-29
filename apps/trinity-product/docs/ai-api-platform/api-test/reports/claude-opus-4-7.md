---
title: 生文 API · claude-opus-4-7
---

# 生文 API · Claude Opus 4.7（claude-opus-4-7）

::: info 样例
**结果**列为浅色 **Tag 标签**；鼠标悬停 Tag 可查看原始响应摘要（气泡）。
:::

`POST /v1/chat/completions` · 模型 `claude-opus-4-7`

## 验证概览

**8 项已测 · 8 项通过**

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
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">Trinity 星瀚 AI 聚合平台。</span></span></td>
</tr>
<tr>
<td>stream 流式</td>
<td><code>stream</code>, <code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">网关统一鉴权与路由。</span></span></td>
</tr>
<tr>
<td>messages 多轮</td>
<td><code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">Trinity 是 AI 平台。</span></span></td>
</tr>
<tr>
<td>messages 省略 role</td>
<td><code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">好</span></span></td>
</tr>
<tr>
<td>max_tokens</td>
<td><code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">云即云计算服务。</span></span></td>
</tr>
<tr>
<td>temperature · top_p</td>
<td><code>temperature</code>, <code>top_p</code>, <code>max_tokens</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">路由分发到上游模型。</span></span></td>
</tr>
<tr>
<td>省略 modalities</td>
<td><code>max_tokens</code>, <code>modalities</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">多云接入多家供应商。</span></span></td>
</tr>
<tr>
<td>thinking_enabled 深度思考</td>
<td><code>max_tokens</code>, <code>thinking_enabled</code>, <code>reasoning_effort</code></td>
<td><span class="api-val-tip-wrap" tabindex="0"><span class="api-val-tag is-pass">通过</span><span class="api-val-tip-bubble" role="tooltip">9.11 大于 9.9（小数位比较）。</span></span></td>
</tr>
</tbody>
</table>
</div>
