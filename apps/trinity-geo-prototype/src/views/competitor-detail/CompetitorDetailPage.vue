<script setup lang="ts">
</script>

<template>
<main v-pre class="geo-console-main">
      <nav class="geo-breadcrumb" aria-label="面包屑">
        <a href="./competitors.html">竞品</a> / <span>OpenRouter</span>
      </nav>

      <div class="dash-toolbar geo-settings-toolbar">
        <div>
          <p class="dash-section-label">③ 竞品下钻</p>
          <h1>OpenRouter</h1>
          <p class="dash-toolbar-meta">
            <span class="geo-market-pill overseas">海外</span>
            <code class="geo-comp-id">openrouter</code>
            · 监测中 · 对标样本
          </p>
        </div>
        <div class="geo-settings-toolbar-actions">
          <a href="./competitors.html" class="geo-btn ghost">返回概览</a>
          <a href="./competitors-manage.html" class="geo-btn ghost">编辑别名</a>
        </div>
      </div>

      <div class="geo-settings-callout warn" role="alert">
        <strong>品类词 Q00 强势占位：</strong>「推荐两款 API 聚合平台」SOA 68%，我方 0%。
        <a href="./answer-detail.html">看豆包回答 →</a> · <a href="./competitor-detail.md">单页 PRD →</a>
      </div>

      <div class="dash-kpi-row">
        <div class="geo-metric-card primary">
          <div class="geo-metric-label">竞品 SOA 7d</div>
          <div class="geo-metric-value">52%</div>
          <div class="geo-metric-delta up">↑ 4pt</div>
        </div>
        <div class="geo-metric-card neutral">
          <div class="geo-metric-label">超越我方题数</div>
          <div class="geo-metric-value">4</div>
          <div class="geo-metric-delta">共 10 启用题</div>
        </div>
        <div class="geo-metric-card neutral">
          <div class="geo-metric-label">首推率</div>
          <div class="geo-metric-value">38%</div>
          <div class="geo-metric-delta">进正文且前列</div>
        </div>
        <div class="geo-metric-card ccr">
          <div class="geo-metric-label">CCR</div>
          <div class="geo-metric-value">12%</div>
          <div class="geo-metric-delta">被引为信源</div>
        </div>
      </div>

      <div class="dash-split">
        <section class="geo-settings-card" aria-labelledby="cd-win-heading">
          <h2 id="cd-win-heading">领先我方的问题</h2>
          <table class="geo-kw-table">
            <thead>
              <tr><th>问题</th><th>我方</th><th>OpenRouter</th><th>差值</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="./keyword-detail.html">Q00 推荐两款 API…</a></td>
                <td class="num bad">0%</td>
                <td class="num">68%</td>
                <td class="num bad">-68</td>
              </tr>
              <tr>
                <td><a href="./keyword-detail.html">Q06 Trinity vs OpenRouter…</a></td>
                <td class="num mid">28%</td>
                <td class="num">55%</td>
                <td class="num bad">-27</td>
              </tr>
              <tr>
                <td><a href="./keyword-detail.html">Q03 国内 OpenAI 兼容…</a></td>
                <td class="num mid">22%</td>
                <td class="num">41%</td>
                <td class="num bad">-19</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section class="geo-settings-card" aria-labelledby="cd-platform-heading">
          <h2 id="cd-platform-heading">分平台 SOA 7d</h2>
          <table class="geo-kw-table">
            <thead>
              <tr><th>平台</th><th>OpenRouter</th><th>我方</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>豆包</td>
                <td class="num">72%</td>
                <td class="num bad">0%</td>
              </tr>
              <tr>
                <td>ChatGPT</td>
                <td class="num">58%</td>
                <td class="num mid">15%</td>
              </tr>
              <tr>
                <td>DeepSeek</td>
                <td class="num mid">35%</td>
                <td class="num mid">20%</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <section class="dash-card" aria-labelledby="cd-answers-heading">
        <div class="dash-card-head"><h2 id="cd-answers-heading">含该竞品的最新回答</h2></div>
        <div class="dash-card-body">
          <div class="dash-answer-list">
            <article class="dash-answer-item">
              <div class="dash-answer-main">
                <a href="./answer-detail.html" class="dash-answer-kw">Q00 · 豆包 · 首推 OpenRouter</a>
                <p class="dash-answer-snippet">海外通用聚合首选…</p>
              </div>
              <div class="dash-answer-meta"><span class="dash-badge ok">进答案</span></div>
            </article>
          </div>
        </div>
      </section>
    </main>
</template>
