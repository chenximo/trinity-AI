<script setup lang="ts">
</script>

<template>
<main v-pre class="geo-console-main geo-cite-page">
      <div class="dash-toolbar geo-settings-toolbar">
        <div>
          <p class="dash-section-label">② 引用 · ③ 信源</p>
          <div class="geo-page-title-row">
            <h1>引用与信源</h1>
            <button
              type="button"
              class="geo-help-tip-btn geo-help-tip-btn--inline"
              data-geo-prototype-annotation
              data-geo-help-tpl="geo-help-tpl-citations-mock"
              data-geo-help-title="原型 · Mock 数据来源"
              aria-label="原型 Mock 数据来源"
              aria-expanded="false"
              aria-controls="geo-help-tip-popover"
              title="说明"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
                <path d="M12 16v-4M12 8h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <p class="geo-cite-lead">
            <strong>CCR</strong> = 有品牌提及时的引用角色 ·
            <strong>信源 M/N</strong> = 参考链我方域占比 ·
            进答案正文见 <a href="./dashboard.html">可见性（SOA）</a>
          </p>
        </div>
        <div class="geo-settings-toolbar-actions">
          <a href="./dashboard.html" class="geo-btn ghost">返回总览</a>
        </div>
      </div>

      <div class="geo-cite-scope-bar">
        <p class="geo-form-hint geo-cite-scope-note">
          采集粒度 <code>question × platform × round</code> 一条回答 → 解析 <code>cited_urls[]</code>（仅 <code>citation_extractable=true</code>）。
          <strong>上方 KPI / 来源结构</strong>默认<strong>全平台 rollup</strong>（可筛平台）；<strong>下方按问题表</strong>每行含平台，不跨平台合并。
        </p>
        <div class="geo-cite-filters" aria-label="引用页汇总筛选（原型）">
          <div class="dash-tabs" role="tablist" aria-label="平台筛选">
            <button type="button" class="on" role="tab" aria-selected="true">全部平台</button>
            <button type="button" role="tab">豆包</button>
            <button type="button" role="tab">ChatGPT</button>
            <button type="button" role="tab">DeepSeek</button>
            <button type="button" role="tab">更多…</button>
          </div>
          <div class="dash-period" role="tablist" aria-label="时间窗">
            <button type="button" class="on" role="tab" aria-selected="true">近 7 日</button>
            <button type="button" role="tab">近 30 日</button>
            <button type="button" role="tab">R1</button>
            <button type="button" role="tab">R2</button>
          </div>
        </div>
      </div>

      <p class="dash-section-label">引用与信源 · 总览 <span class="geo-cite-filter-badge">全部平台 · 近 7 日</span></p>
      <div class="dash-kpi-row geo-cite-kpi">
        <div class="geo-metric-card ccr primary">
          <div class="geo-metric-label">CCR · 7d</div>
          <div class="geo-metric-value">8%</div>
          <div class="geo-metric-delta">分母 = 有提及 · <a href="./answer-detail-brand.html">Q01 样本</a></div>
        </div>
        <div class="geo-metric-card warn">
          <div class="geo-metric-label">信源盘命中率</div>
          <div class="geo-metric-value">12%</div>
          <div class="geo-metric-delta">可提取样本中 M&gt;0</div>
        </div>
        <div class="geo-metric-card neutral">
          <div class="geo-metric-label">可提取样本</div>
          <div class="geo-metric-value">34</div>
          <div class="geo-metric-delta">可提取渠道 · 10 平台配置</div>
        </div>
        <div class="geo-metric-card neutral">
          <div class="geo-metric-label">竞品官方链占比</div>
          <div class="geo-metric-value">58%</div>
          <div class="geo-metric-delta">全部 cited_urls</div>
        </div>
      </div>

      <p class="dash-section-label">按问题 · 来源结构</p>
      <div class="geo-cite-board">
        <section class="geo-cite-col" aria-labelledby="cite-by-q-heading">
          <h2 id="cite-by-q-heading" class="geo-cite-col-title">按问题 · 信源概况</h2>
          <p class="geo-cite-col-desc">CCR 与 M/N 分列 · 每行 = 一题 × 一平台</p>
          <div class="geo-kw-table-wrap geo-cite-table-wrap">
            <table class="geo-kw-table geo-cite-q-table">
              <thead>
                <tr>
                  <th>问题</th>
                  <th>平台</th>
                  <th>CCR</th>
                  <th>信源 M/N</th>
                  <th>缺口</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr class="geo-cite-q-row warn">
                  <td><a href="./keyword-detail.html"><strong>Q00</strong> · 推荐两款 API 聚合平台</a></td>
                  <td>豆包</td>
                  <td><span class="geo-cite-pill no">否</span></td>
                  <td class="num bad"><strong>0</strong>/16</td>
                  <td><span class="geo-diag-sub">S1+S2+S3</span></td>
                  <td><a href="./answer-detail.html#cite-heading">信源盘 →</a></td>
                </tr>
                <tr class="geo-cite-q-row ok">
                  <td><a href="./answer-detail-brand.html"><strong>Q01</strong> · Trinity AI 好用吗？</a></td>
                  <td>ChatGPT</td>
                  <td><span class="geo-cite-pill yes">是</span></td>
                  <td class="num good"><strong>1</strong>/3</td>
                  <td>—</td>
                  <td><a href="./answer-detail-brand.html">CCR 样本 →</a></td>
                </tr>
                <tr>
                  <td><strong>Q06</strong> · vs OpenRouter 国内</td>
                  <td>DeepSeek</td>
                  <td><span class="geo-cite-pill no">否</span></td>
                  <td class="num mid">0/8</td>
                  <td><span class="geo-diag-sub">S2</span></td>
                  <td><a href="./diagnosis.html">诊断 →</a></td>
                </tr>
                <tr>
                  <td><strong>Q03</strong> · 国内 OpenAI 兼容聚合</td>
                  <td>豆包</td>
                  <td><span class="geo-cite-pill no">否</span></td>
                  <td class="num bad">0/12</td>
                  <td><span class="geo-diag-sub">S1</span></td>
                  <td><a href="./answer-detail.html#cite-heading">—</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="geo-cite-col" aria-labelledby="cite-structure-heading">
          <h2 id="cite-structure-heading" class="geo-cite-col-title">来源结构 · 近 7 日</h2>
          <p class="geo-cite-col-desc">与上方筛选一致 · 默认可提取样本全平台汇总</p>
          <ul class="geo-cite-structure-bars">
            <li>
              <span class="label"><span class="geo-cite-tag competitor">竞品官方</span></span>
              <div class="bar-wrap"><div class="bar competitor" style="width: 58%"></div></div>
              <span class="pct">58%</span>
            </li>
            <li>
              <span class="label"><span class="geo-cite-tag third">第三方评测</span></span>
              <div class="bar-wrap"><div class="bar third" style="width: 32%"></div></div>
              <span class="pct">32%</span>
            </li>
            <li>
              <span class="label"><span class="geo-cite-tag us">我方官方</span></span>
              <div class="bar-wrap"><div class="bar us" style="width: 6%"></div></div>
              <span class="pct">6%</span>
            </li>
            <li>
              <span class="label"><span class="geo-cite-tag neutral">中立文档</span></span>
              <div class="bar-wrap"><div class="bar neutral" style="width: 4%"></div></div>
              <span class="pct">4%</span>
            </li>
          </ul>
          <p class="geo-cite-insight">Q00 样本：竞品官方 11 + 评测 5 + 我方 0 — 叙事由 OpenRouter / TokenHub docs 定型</p>
          <a href="./optimize.html#opt-s1s2" class="geo-btn ghost sm">对标 docs 优化 →</a>
        </section>
      </div>

      <p class="dash-section-label">焦点样本 · Q00 信源盘 <span class="geo-cite-filter-badge muted">固定下钻 · 不受上方筛选</span></p>
      <section class="geo-cite-spotlight" aria-labelledby="cite-spotlight-heading">
        <header class="geo-cite-spotlight-head">
          <div>
            <h2 id="cite-spotlight-heading">Q00 × 豆包 × R1 · 16 条参考链</h2>
            <p class="geo-cite-col-desc">
              单条采集记录信源盘（非平台汇总）· 真源
              <code>mvp/data/r1/cited_sources.json</code> · 品类失声典型
            </p>
          </div>
          <span class="geo-cite-badge danger">M/N = 0/16</span>
        </header>
        <div class="geo-cite-spotlight-grid">
          <article class="geo-cite-spotlight-cell competitor">
            <h3 class="geo-cite-section-title">竞品官方 · 11</h3>
            <p>OpenRouter 6 链 · TokenHub 5 链 — 含 /docs、模型列表、API 指南</p>
          </article>
          <article class="geo-cite-spotlight-cell third">
            <h3 class="geo-cite-section-title">第三方评测 · 5</h3>
            <p>SegmentFault、凤凰网、CSDN 等横向文定型品类叙事</p>
          </article>
          <article class="geo-cite-spotlight-cell missing">
            <h3 class="geo-cite-section-title">我方官方 · 0</h3>
            <p>doc.trinitydesk.ai 未进入参考盘 — R2 目标 0→1/17</p>
          </article>
        </div>
        <div class="geo-cite-spotlight-actions">
          <a href="./answer-detail.html#cite-heading" class="geo-btn primary">查看完整 16 链</a>
          <a href="./verify.html#verify-q00" class="geo-btn ghost">R1 vs R2 信源 Δ</a>
          <a href="./diagnosis.html#diag-q00" class="geo-btn ghost">诊断 S1+S2+S3</a>
        </div>
      </section>

      <p class="dash-section-label">平台可提取性</p>
      <section class="geo-cite-platform" aria-labelledby="cite-platform-heading">
        <h2 id="cite-platform-heading" class="visually-hidden">平台可提取性</h2>
        <div class="geo-kw-table-wrap geo-cite-table-wrap">
          <table class="geo-kw-table geo-cite-platform-table">
            <thead>
              <tr>
                <th>平台</th>
                <th>citation_extractable</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>豆包 App</td><td><span class="geo-cite-pill yes">是</span></td><td>显式列出参考链 · Q00 信源盘样本</td></tr>
              <tr><td>ChatGPT</td><td><span class="geo-cite-pill partial">部分</span></td><td>正文内链 · Q01 CCR 样本</td></tr>
              <tr><td>Claude / Gemini</td><td><span class="geo-cite-pill partial">部分</span></td><td>视消费端是否返回链接</td></tr>
              <tr><td>API 直连</td><td><span class="geo-cite-pill no">否</span></td><td>仅正文 · CCR 标「不可观测」</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="dash-proto-link">
        引用页原型 v0.2 ·
        <a href="./citations.md">产品解读</a>
      </p>
    </main>
</template>
