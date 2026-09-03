<script setup lang="ts">
</script>

<template>
<main v-pre class="geo-console-main">
      <div class="geo-settings-content geo-report-preview-wrap">
        <div class="dash-toolbar geo-settings-toolbar">
          <div>
            <p class="dash-section-label"><a href="./reports.html">← 报告列表</a></p>
            <h1>GEO 周报 · 2026-W24</h1>
            <p class="dash-toolbar-meta">Trinity AI · 6/9 – 6/15 · 10 平台 · 10 启用问题</p>
          </div>
          <div class="geo-settings-toolbar-actions">
            <button type="button" class="geo-btn ghost" disabled>发送邮件</button>
            <button type="button" class="geo-btn primary" disabled>下载 PDF</button>
          </div>
        </div>

        <article class="geo-report-preview-sheet" aria-label="报告正文预览">
          <header class="geo-report-preview-head">
            <div>
              <h2>Trinity AI · AI 可见性周报</h2>
              <p>生成于 2026-06-16 09:00 · 专业版</p>
            </div>
            <div class="geo-report-preview-soa">
              <div><span>全球 SOA</span><strong>42%</strong><em class="up">↑ 6%</em></div>
              <div><span>中国 SOA</span><strong>28%</strong><em class="down">↓ 3%</em></div>
            </div>
          </header>

          <section>
            <h3>1. 执行摘要</h3>
            <p>
              本周全球 SOA 回升，主要受益于 ChatGPT / Claude 品类词提及；中国侧豆包仍缺席 Q00。
              已完成 doc 文档树首轮发布，<strong>信源盘 0/16 → 1/17</strong>，正文 SOA 尚未变化。
            </p>
          </section>

          <section>
            <h3>2. 平台分布</h3>
            <div class="geo-report-preview-platforms">
              <span class="p-overseas">ChatGPT 48%</span>
              <span class="p-overseas">Claude 44%</span>
              <span class="p-overseas">Gemini 38%</span>
              <span class="p-domestic">豆包 0%</span>
              <span class="p-domestic">DeepSeek 22%</span>
            </div>
          </section>

          <section>
            <h3>3. P0 诊断与优化</h3>
            <ul class="geo-report-preview-list">
              <li><a href="./diagnosis.html#diag-q00">Q00 品类失声 · D1+S1+S2+S3</a></li>
              <li><a href="./optimize.html#opt-s1s2">进行中：doc 文档树对标 OpenRouter</a></li>
              <li><a href="./verify.html#verify-q00">验证：信源盘已改善，SOA 待观察</a></li>
            </ul>
          </section>

          <section>
            <h3>4. 竞品快照</h3>
            <p>同题 SOA：OpenRouter 68% · TokenHub 52% · 我方 0%（Q00·豆包）</p>
          </section>

          <footer class="geo-report-preview-foot">
            由 Trinity GEO 自动生成 · 数据截止 6/15 日采
          </footer>
        </article>
      </div>
    </main>
</template>
