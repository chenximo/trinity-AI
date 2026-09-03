<script setup lang="ts">
import { useMarketingPageScripts } from "../shell/shellInteractions";
import pageJs from "../../../marketing/js/competitors.js?raw";

useMarketingPageScripts([pageJs]);
</script>

<template>
<main v-pre class="geo-console-main">
      <div class="geo-settings-layout">
        <aside class="geo-settings-sidebar" aria-label="竞品子导航">
          <p class="geo-settings-sidebar-title">竞品</p>
          <nav class="geo-settings-nav">
            <a href="./competitors.html" class="is-active" aria-current="page">竞品概览</a>
            <a href="./competitors-manage.html">竞品管理</a>
          </nav>
        </aside>

        <div class="geo-settings-content">
          <div class="dash-toolbar geo-settings-toolbar">
            <div>
              <p class="dash-section-label">③ 测量 · 竞品对比</p>
              <h1>竞品概览</h1>
              <p class="dash-toolbar-meta">同一监测问题集下 · 品牌 vs 竞品 SOA（进答案正文）</p>
            </div>
            <div class="geo-settings-toolbar-actions">
              <a href="./competitors-manage.html" class="geo-btn ghost">管理竞品</a>
              <div class="dash-tabs" role="tablist">
                <button type="button" class="on" data-comp-market="all">全部</button>
                <button type="button" data-comp-market="overseas">海外</button>
                <button type="button" data-comp-market="domestic">国内</button>
              </div>
            </div>
          </div>

          <div class="geo-settings-callout" role="note">
            <strong>同题对比：</strong>每行是一道监测问法，列是各方近 7 日 SOA。数据来自启用竞品 + 问题集分母。
            <a href="./competitors.md">单页 PRD →</a>
          </div>

          <div class="dash-kpi-row">
            <div class="geo-metric-card primary">
              <div class="geo-metric-label">我方 SOA 7d</div>
              <div class="geo-metric-value">18%</div>
              <div class="geo-metric-delta down">↓ 2pt</div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">监测竞品</div>
              <div class="geo-metric-value">6</div>
              <div class="geo-metric-delta"><a href="./competitors-manage.html">管理 →</a></div>
            </div>
            <div class="geo-metric-card warn">
              <div class="geo-metric-label">落后题数</div>
              <div class="geo-metric-value">4</div>
              <div class="geo-metric-delta">竞品 SOA 更高</div>
            </div>
            <div class="geo-metric-card neutral">
              <div class="geo-metric-label">领先题数</div>
              <div class="geo-metric-value">2</div>
              <div class="geo-metric-delta up">品牌词为主</div>
            </div>
          </div>

          <section class="geo-settings-card" aria-labelledby="comp-rank-heading">
            <h2 id="comp-rank-heading">竞品 SOA 排名 · 全问题集均值</h2>
            <ul class="geo-comp-rank-list">
              <li>
                <a href="./competitor-detail.html" class="geo-comp-rank-name">OpenRouter</a>
                <div class="geo-comp-rank-bar"><span style="width: 52%"></span></div>
                <span class="geo-comp-rank-val">52%</span>
              </li>
              <li>
                <a href="./competitor-detail.html?id=tokenhub" class="geo-comp-rank-name">TokenHub</a>
                <div class="geo-comp-rank-bar"><span style="width: 46%"></span></div>
                <span class="geo-comp-rank-val">46%</span>
              </li>
              <li class="is-us">
                <span class="geo-comp-rank-name">Trinity AI（我方）</span>
                <div class="geo-comp-rank-bar us"><span style="width: 18%"></span></div>
                <span class="geo-comp-rank-val">18%</span>
              </li>
              <li>
                <a href="./competitor-detail.html?id=litellm" class="geo-comp-rank-name">LiteLLM</a>
                <div class="geo-comp-rank-bar"><span style="width: 14%"></span></div>
                <span class="geo-comp-rank-val">14%</span>
              </li>
              <li>
                <a href="./competitor-detail.html?id=siliconflow" class="geo-comp-rank-name">硅基流动</a>
                <div class="geo-comp-rank-bar"><span style="width: 11%"></span></div>
                <span class="geo-comp-rank-val">11%</span>
              </li>
            </ul>
          </section>

          <section class="geo-settings-card" aria-labelledby="comp-matrix-heading">
            <div class="geo-settings-card-head">
              <h2 id="comp-matrix-heading">同题 SOA 矩阵</h2>
              <a href="./keyword-detail.html" style="font-size:0.8125rem;color:var(--indigo-500)">Q00 详情 →</a>
            </div>
            <div class="geo-kw-table-wrap">
              <table class="geo-kw-table geo-comp-matrix">
                <thead>
                  <tr>
                    <th>监测问题</th>
                    <th>我方</th>
                    <th><a href="./competitor-detail.html">OpenRouter</a></th>
                    <th><a href="./competitor-detail.html?id=tokenhub">TokenHub</a></th>
                    <th>LiteLLM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><a href="./keyword-detail.html">Q00 推荐两款 API 聚合平台</a></td>
                    <td class="num bad">0%</td>
                    <td class="num">68%</td>
                    <td class="num">52%</td>
                    <td class="num mid">12%</td>
                  </tr>
                  <tr>
                    <td><a href="./keyword-detail.html">Q03 国内 OpenAI 兼容…</a></td>
                    <td class="num mid">22%</td>
                    <td class="num">41%</td>
                    <td class="num">58%</td>
                    <td class="num mid">18%</td>
                  </tr>
                  <tr>
                    <td><a href="./keyword-detail.html">Q01 Trinity AI 好用吗？</a></td>
                    <td class="num">62%</td>
                    <td class="num mid">8%</td>
                    <td class="num mid">5%</td>
                    <td class="num mid">3%</td>
                  </tr>
                  <tr>
                    <td><a href="./keyword-detail.html">Q06 Trinity 和 OpenRouter…</a></td>
                    <td class="num mid">28%</td>
                    <td class="num">55%</td>
                    <td class="num mid">20%</td>
                    <td class="num mid">8%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="dash-card" aria-labelledby="comp-gap-heading">
            <div class="dash-card-head"><h2 id="comp-gap-heading">最大差距 · 需关注</h2></div>
            <div class="dash-card-body">
              <div class="dash-answer-list">
                <article class="dash-answer-item">
                  <div class="dash-answer-main">
                    <a href="./keyword-detail.html" class="dash-answer-kw">推荐两款 API 聚合平台</a>
                    <p class="dash-answer-snippet">我方 0% · OpenRouter 68% · <span class="geo-kw-flag warn">D1</span></p>
                  </div>
                  <div class="dash-answer-meta">
                    <a href="./answer-detail.html" class="geo-btn ghost sm">看回答</a>
                  </div>
                </article>
                <article class="dash-answer-item">
                  <div class="dash-answer-main">
                    <a href="./keyword-detail.html" class="dash-answer-kw">Trinity 和 OpenRouter 哪个更适合国内开发者？</a>
                    <p class="dash-answer-snippet">我方 28% · OpenRouter 55% · 对比词落后</p>
                  </div>
                  <div class="dash-answer-meta">
                    <a href="./competitor-detail.html" class="geo-btn ghost sm">看竞品</a>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
</template>
