<script setup lang="ts">
</script>

<template>
<main v-pre class="geo-console-main">
      <div class="geo-settings-layout">
        <aside class="geo-settings-sidebar" aria-label="优化子导航">
          <p class="geo-settings-sidebar-title">优化</p>
          <nav class="geo-settings-nav">
            <a href="./optimize.html" class="is-active">待办清单</a>
            <a href="./verify.html">效果验证</a>
          </nav>
        </aside>

        <div class="geo-settings-content">
          <div class="dash-toolbar geo-settings-toolbar">
            <div>
              <p class="dash-section-label">
                <a href="./optimize.html">← 优化待办</a>
                · <span class="geo-opt-id">opt-s1s2</span>
              </p>
              <h1>doc 建「API 聚合选型」官方文档树</h1>
              <p class="dash-toolbar-meta">
                D1 · S1+S2 · 目标 <a href="./keyword-detail.html">Q00</a> · 负责人：内容 · 截止 6/18
              </p>
            </div>
            <div class="geo-settings-toolbar-actions">
              <span class="geo-opt-badge doing">进行中</span>
              <button type="button" class="geo-btn ghost" disabled>标记完成</button>
            </div>
          </div>

          <div class="geo-settings-callout" role="note">
            样本主线任务 · 与 <a href="./diagnosis.html#diag-q00">诊断 D1+S1+S2</a>、
            <a href="./verify.html#verify-q00">R2 验证</a> 联动。
            <a href="./optimize-detail.md">单页 PRD →</a>
          </div>

          <div class="dash-kpi-row geo-mon-kpi">
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">关联诊断</div>
              <div class="geo-metric-value" style="font-size: 1rem">D1+S1+S2</div>
              <div class="geo-metric-delta"><a href="./diagnosis.html#diag-q00">查看 →</a></div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">信源盘（R1→R2）</div>
              <div class="geo-metric-value" style="font-size: 1rem">0/16 → 1/17</div>
              <div class="geo-metric-delta"><a href="./verify.html#verify-q00">验证 →</a></div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">SOA（豆包·Q00）</div>
              <div class="geo-metric-value" style="font-size: 1rem">0%</div>
              <div class="geo-metric-delta">待下一轮日采</div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">对标</div>
              <div class="geo-metric-value" style="font-size: 1rem">OpenRouter docs</div>
              <div class="geo-metric-delta"><a href="https://openrouter.ai/docs/" rel="noopener" target="_blank">打开 →</a></div>
            </div>
          </div>

          <section class="geo-settings-card" aria-labelledby="opt-desc-heading">
            <h2 id="opt-desc-heading">任务说明</h2>
            <p class="geo-settings-card-desc">
              在 doc.trinitydesk.ai 建立与竞品对标的官方文档树：首段定义品类、模型列表、OpenAI 兼容说明、计费事实。
              解决 Q00 答案中信源盘仅第三方评测、无官方文档被引用的问题。
            </p>
            <p class="geo-opt-links">
              依据：<a href="./answer-detail.html#cite-heading">Q00 信源盘 0/16</a>
              · 对标 <a href="https://openrouter.ai/docs/" rel="noopener" target="_blank">openrouter.ai/docs</a>、
              <a href="https://cloud.tencent.cn/document/product/1823" rel="noopener" target="_blank">TokenHub 文档中心</a>
            </p>
          </section>

          <section class="geo-settings-card" aria-labelledby="opt-check-heading">
            <h2 id="opt-check-heading">执行清单</h2>
            <ul class="geo-opt-checklist">
              <li class="done"><span aria-hidden="true">✓</span> 确定文档 IA：入门 / 模型 / 计费 / 兼容 API</li>
              <li class="done"><span aria-hidden="true">✓</span> 发布首篇「什么是 API 聚合平台」定义文</li>
              <li class="doing"><span aria-hidden="true">○</span> 模型列表页 + OpenAI 兼容端点说明</li>
              <li><span aria-hidden="true">○</span> 计费事实表（与官网 pricing 一致）</li>
              <li><span aria-hidden="true">○</span> 提交 sitemap / 站内互链至产品页</li>
            </ul>
          </section>

          <section class="geo-settings-card compact muted" aria-labelledby="opt-verify-heading">
            <h2 id="opt-verify-heading">验收标准</h2>
            <ul class="geo-report-preview-list">
              <li>信源盘：至少 1 条官方 doc 域名被 AI 答案引用</li>
              <li>SOA：豆包 Q00 出现品牌名（中长期）</li>
              <li>记录：<a href="./verify.html#verify-q00">R1 vs R2 对比截图</a></li>
            </ul>
          </section>
        </div>
      </div>
    </main>
</template>
