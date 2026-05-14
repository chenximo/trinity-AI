<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { TButton } from "@trinity/ui";
import "../styles/marketing-home.css";

const router = useRouter();

function goConsole() {
  void router.push({ name: "tai-account-console" });
}

function goDocs() {
  void router.push({ name: "tai-docs" });
}

function openDemoAuth() {
  window.TrinityOR?.openSignIn?.("signin");
}
</script>

<template>
  <div class="marketing-root">
      <section class="hero wrap">
        <div class="hero-pill"><span class="hero-pill-dot" aria-hidden="true"></span>一个API，接入百余款大模型</div>
        <h1>主流大模型，一站接入<span class="line2">统一路由 · 按需计费</span></h1>
        <p class="sub">
          纳管全球头部模型与算力资源；就近调度、透明账单，以最小改造成本接入现有应用与数据链路。
        </p>
        <div class="hero-cta">
          <TButton variant="gradient" type="button" class="btn btn-gradient" @click="goConsole">立即接入&nbsp;→</TButton>
          <TButton variant="outline" type="button" class="btn btn-outline-hero" @click="goDocs">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8M8 11h6" />
            </svg>
            查看文档
          </TButton>
        </div>
        <div class="hero-trust" aria-label="产品亮点">
          <span class="hero-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            企业级安全
          </span>
          <span class="hero-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            SLA 99.9% 可用性
          </span>
          <span class="hero-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            SOC 2 合规就绪
          </span>
        </div>
        <div class="providers" id="providers" aria-label="部分接入供应商">
          <span class="provider-pill">Anthropic</span>
          <span class="provider-pill">OpenAI</span>
          <span class="provider-pill">Microsoft</span>
          <span class="provider-pill">NVIDIA</span>
          <span class="provider-pill">Meta</span>
          <span class="provider-pill">Google</span>
          <span class="provider-pill">Amazon</span>
          <span class="provider-pill">DeepSeek</span>
          <span class="provider-pill">Qwen</span>
          <span class="provider-pill">Moonshot</span>
          <span class="provider-pill">MiniMax</span>
          <span class="provider-pill">Mistral</span>
          <span class="provider-pill">Cohere</span>
          <span class="provider-pill">xAI</span>
          <span class="provider-pill">Hugging Face</span>
          <span class="provider-pill">Together</span>
          <span class="provider-pill muted">更多厂商持续接入</span>
        </div>
      </section>

      <section class="stats-section wrap" aria-label="平台数据概览">
        <div class="stats">
          <div class="stat">
            <div class="stat-num">30T+</div>
            <div class="stat-label">月 Token 调用量</div>
          </div>
          <div class="stat">
            <div class="stat-num">3M+</div>
            <div class="stat-label">全球开发者</div>
          </div>
          <div class="stat">
            <div class="stat-num">25+</div>
            <div class="stat-label">合作云厂商</div>
          </div>
          <div class="stat">
            <div class="stat-num">100+</div>
            <div class="stat-label">可调模型</div>
          </div>
        </div>
      </section>

      <section class="section-band">
        <div class="wrap-wide feature-hero">
          <div>
            <h2>统一接口，任意模型</h2>
            <p>
              经 Trinity 网关统一鉴权、计量与路由；兼容 OpenAI API 规范，业务侧 SDK 与网关地址即可切换，改造成本可控。
            </p>
            <RouterLink class="browse-all" :to="{ name: 'tai-models' }">查看全部模型 →</RouterLink>
          </div>
          <div class="mock-api">
            <div class="mock-api-top">
              <div class="mock-dots" aria-hidden="true"><span></span><span></span><span></span></div>
              <span class="mock-api-title">POST · api.trinity.ai/v1/chat/completions</span>
            </div>
            <div class="mock-api-body" aria-hidden="true">
              <span class="k">"model"</span>: <span class="s">"anthropic/claude-opus-4.7"</span>,<br />
              <span class="k">"messages"</span>: [{ <span class="k">"role"</span>: <span class="s">"user"</span>, … }]
            </div>
            <div class="mock-caption">
              <a href="#capabilities">路由流量可视化</a> — 多云链路 · 时延优先 · 成本优化
            </div>
          </div>
        </div>
      </section>

      <section class="features-grid wrap-wide" id="capabilities">
        <div class="grid-2">
          <article class="fcard">
            <div class="fcard-visual" aria-hidden="true">
              <svg class="viz-svg" viewBox="0 0 320 148" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="trinity-arrow-ha" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                    <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--muted-2)" />
                  </marker>
                </defs>
                <text x="14" y="20" fill="var(--muted)" font-size="10" font-family="Inter,Noto Sans SC,sans-serif">trinity/claude-opus</text>
                <rect x="10" y="30" rx="6" width="58" height="28" fill="var(--bg)" stroke="var(--border)" />
                <text x="39" y="48" fill="var(--muted)" font-size="9" font-weight="600" text-anchor="middle" font-family="Inter,Noto Sans SC,sans-serif">客户端</text>
                <line x1="68" y1="44" x2="90" y2="44" stroke="var(--border-strong)" stroke-width="1.5" marker-end="url(#trinity-arrow-ha)" />
                <rect x="94" y="28" rx="10" width="76" height="34" fill="var(--blue-soft)" stroke="var(--blue-ring)" />
                <text x="132" y="49" fill="var(--blue)" font-size="10" font-weight="700" text-anchor="middle" font-family="Inter,Noto Sans SC,sans-serif">Trinity</text>
                <line x1="170" y1="38" x2="198" y2="26" stroke="var(--border-strong)" stroke-width="1.5" marker-end="url(#trinity-arrow-ha)" />
                <line x1="170" y1="52" x2="198" y2="70" stroke="var(--border-strong)" stroke-width="1.5" marker-end="url(#trinity-arrow-ha)" />
                <rect x="200" y="12" rx="6" width="54" height="26" fill="var(--bg)" stroke="var(--border)" />
                <text x="227" y="29" fill="var(--muted)" font-size="8" font-weight="600" text-anchor="middle" font-family="Inter,Noto Sans SC,sans-serif">区域 A</text>
                <rect x="200" y="64" rx="6" width="54" height="26" fill="var(--bg)" stroke="var(--border)" />
                <text x="227" y="81" fill="var(--muted)" font-size="8" font-weight="600" text-anchor="middle" font-family="Inter,Noto Sans SC,sans-serif">区域 B</text>
                <path d="M 227 90 Q 198 108 148 98" fill="none" stroke="var(--muted-2)" stroke-width="1.5" stroke-dasharray="4 3" />
                <rect x="86" y="94" rx="6" width="68" height="26" fill="var(--warning-soft)" stroke="var(--warning-ring)" />
                <text x="120" y="111" fill="var(--warning-ink)" font-size="8" font-weight="700" text-anchor="middle" font-family="Inter,Noto Sans SC,sans-serif">降级</text>
                <text x="262" y="44" fill="var(--muted-2)" font-size="8" font-family="Inter,Noto Sans SC,sans-serif">链路探测</text>
              </svg>
            </div>
            <h3>高可用保障</h3>
            <p>
              多活推理与自动降级：单链路异常时秒级切换备用线路，兼顾业务连续与时延上限。
            </p>
            <RouterLink class="more" :to="{ name: 'tai-docs' }">了解更多 →</RouterLink>
          </article>
          <article class="fcard">
            <div class="fcard-visual" aria-hidden="true">
              <svg class="viz-svg" viewBox="0 0 320 148" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="trinity-perf-band-a" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="var(--blue-soft)" />
                    <stop offset="55%" stop-color="var(--purple-soft)" />
                    <stop offset="100%" stop-color="var(--surface)" />
                  </linearGradient>
                  <linearGradient id="trinity-perf-band-b" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="var(--blue-soft)" />
                    <stop offset="50%" stop-color="var(--blue-soft)" />
                    <stop offset="100%" stop-color="var(--purple-soft)" />
                  </linearGradient>
                </defs>
                <rect x="10" y="10" width="300" height="58" rx="8" fill="url(#trinity-perf-band-a)" opacity="0.9" />
                <line x1="24" y1="52" x2="296" y2="52" stroke="var(--bg)" stroke-opacity="0.65" stroke-width="1" />
                <polyline
                  points="28,44 52,38 88,42 120,28 160,32 200,22 240,26 288,18"
                  fill="none"
                  stroke="var(--success)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <text x="18" y="24" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">延迟（毫秒）</text>
                <text x="230" y="24" fill="var(--muted-2)" font-size="8" font-family="var(--font),sans-serif">P50 时延 ↓12%</text>
                <rect x="10" y="78" width="300" height="58" rx="8" fill="url(#trinity-perf-band-b)" opacity="0.95" />
                <line x1="24" y1="120" x2="296" y2="120" stroke="var(--bg)" stroke-opacity="0.65" stroke-width="1" />
                <polyline
                  points="28,108 60,112 100,98 140,102 180,88 220,94 260,84 292,90"
                  fill="none"
                  stroke="var(--purple)"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <text x="18" y="92" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">成本（$/百万 Token）</text>
                <text x="218" y="92" fill="var(--muted-2)" font-size="8" font-family="var(--font),sans-serif">策略驱动选路</text>
              </svg>
            </div>
            <h3>价格与性能</h3>
            <p>
              边缘就近接入与动态选路，成本与时延策略可配；控制台按项目、模型与供应商拆分用量与账单。
            </p>
            <RouterLink class="more" :to="{ name: 'tai-docs' }">了解更多 →</RouterLink>
          </article>
          <article class="fcard">
            <div class="fcard-visual" aria-hidden="true">
              <svg class="viz-svg" viewBox="0 0 320 148" xmlns="http://www.w3.org/2000/svg">
                <text x="14" y="18" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">延迟</text>
                <text x="118" y="18" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">价格</text>
                <text x="228" y="18" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">配额</text>
                <g transform="translate(14,28)">
                  <rect x="0" y="0" width="12" height="10" rx="2" fill="var(--blue)" opacity="0.15" />
                  <rect x="16" y="0" width="12" height="10" rx="2" fill="var(--blue)" opacity="0.35" />
                  <rect x="32" y="0" width="12" height="10" rx="2" fill="var(--blue)" opacity="0.55" />
                  <rect x="48" y="0" width="12" height="10" rx="2" fill="var(--blue)" opacity="0.75" />
                  <rect x="64" y="0" width="12" height="10" rx="2" fill="var(--indigo-500)" opacity="0.85" />
                  <rect x="80" y="0" width="12" height="10" rx="2" fill="var(--purple)" opacity="0.7" />
                  <rect x="96" y="0" width="12" height="10" rx="2" fill="var(--purple)" opacity="0.45" />
                  <rect x="112" y="0" width="12" height="10" rx="2" fill="var(--viz-violet-400)" opacity="0.35" />
                  <rect x="128" y="0" width="12" height="10" rx="2" fill="var(--violet-400)" opacity="0.25" />
                  <rect x="144" y="0" width="12" height="10" rx="2" fill="var(--pink-400)" opacity="0.2" />
                  <rect x="160" y="0" width="12" height="10" rx="2" fill="var(--pink-400)" opacity="0.18" />
                  <rect x="176" y="0" width="12" height="10" rx="2" fill="var(--pink-400)" opacity="0.22" />
                  <rect x="192" y="0" width="12" height="10" rx="2" fill="var(--danger-hot)" opacity="0.3" />
                  <rect x="208" y="0" width="12" height="10" rx="2" fill="var(--rose-600)" opacity="0.4" />
                  <rect x="224" y="0" width="12" height="10" rx="2" fill="var(--rose-600)" opacity="0.35" />
                  <rect x="240" y="0" width="12" height="10" rx="2" fill="var(--danger-ink)" opacity="0.25" />
                  <rect x="256" y="0" width="12" height="10" rx="2" fill="var(--danger-dark)" opacity="0.15" />
                </g>
                <g transform="translate(14,44)">
                  <rect x="0" y="0" width="12" height="10" rx="2" fill="var(--blue)" opacity="0.2" />
                  <rect x="16" y="0" width="12" height="10" rx="2" fill="var(--blue)" opacity="0.4" />
                  <rect x="32" y="0" width="12" height="10" rx="2" fill="var(--indigo-500)" opacity="0.65" />
                  <rect x="48" y="0" width="12" height="10" rx="2" fill="var(--purple)" opacity="0.9" />
                  <rect x="64" y="0" width="12" height="10" rx="2" fill="var(--purple)" opacity="0.95" />
                  <rect x="80" y="0" width="12" height="10" rx="2" fill="var(--indigo-400)" opacity="0.8" />
                  <rect x="96" y="0" width="12" height="10" rx="2" fill="var(--indigo-400)" opacity="0.5" />
                  <rect x="112" y="0" width="12" height="10" rx="2" fill="var(--blue-ring)" opacity="0.35" />
                  <rect x="128" y="0" width="12" height="10" rx="2" fill="var(--blue-ring)" opacity="0.25" />
                  <rect x="144" y="0" width="12" height="10" rx="2" fill="var(--blue-soft)" opacity="0.22" />
                  <rect x="160" y="0" width="12" height="10" rx="2" fill="var(--violet-200)" opacity="0.28" />
                  <rect x="176" y="0" width="12" height="10" rx="2" fill="var(--purple-soft)" opacity="0.4" />
                  <rect x="192" y="0" width="12" height="10" rx="2" fill="var(--purple-soft)" opacity="0.45" />
                  <rect x="208" y="0" width="12" height="10" rx="2" fill="var(--surface)" opacity="0.38" />
                  <rect x="224" y="0" width="12" height="10" rx="2" fill="var(--danger-border)" opacity="0.28" />
                  <rect x="240" y="0" width="12" height="10" rx="2" fill="var(--danger-border)" opacity="0.2" />
                  <rect x="256" y="0" width="12" height="10" rx="2" fill="var(--danger-soft)" opacity="0.15" />
                </g>
                <g transform="translate(14,60)">
                  <rect x="0" y="0" width="12" height="10" rx="2" fill="var(--sky-500)" opacity="0.25" />
                  <rect x="16" y="0" width="12" height="10" rx="2" fill="var(--sky-400)" opacity="0.4" />
                  <rect x="32" y="0" width="12" height="10" rx="2" fill="var(--blue-ring)" opacity="0.35" />
                  <rect x="48" y="0" width="12" height="10" rx="2" fill="var(--blue-ring)" opacity="0.22" />
                  <rect x="64" y="0" width="12" height="10" rx="2" fill="var(--blue-soft)" opacity="0.18" />
                  <rect x="80" y="0" width="12" height="10" rx="2" fill="var(--blue-soft)" opacity="0.35" />
                  <rect x="96" y="0" width="12" height="10" rx="2" fill="var(--blue-ring)" opacity="0.55" />
                  <rect x="112" y="0" width="12" height="10" rx="2" fill="var(--blue-ring)" opacity="0.7" />
                  <rect x="128" y="0" width="12" height="10" rx="2" fill="var(--indigo-400)" opacity="0.85" />
                  <rect x="144" y="0" width="12" height="10" rx="2" fill="var(--indigo-400)" opacity="0.75" />
                  <rect x="160" y="0" width="12" height="10" rx="2" fill="var(--indigo-500)" opacity="0.55" />
                  <rect x="176" y="0" width="12" height="10" rx="2" fill="var(--purple)" opacity="0.45" />
                  <rect x="192" y="0" width="12" height="10" rx="2" fill="var(--viz-violet-400)" opacity="0.35" />
                  <rect x="208" y="0" width="12" height="10" rx="2" fill="var(--viz-fuchsia-500)" opacity="0.28" />
                  <rect x="224" y="0" width="12" height="10" rx="2" fill="var(--pink-400)" opacity="0.22" />
                  <rect x="240" y="0" width="12" height="10" rx="2" fill="var(--pink-400)" opacity="0.18" />
                  <rect x="256" y="0" width="12" height="10" rx="2" fill="var(--surface)" opacity="0.15" />
                </g>
                <g transform="translate(14,76)">
                  <rect x="0" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.12" />
                  <rect x="16" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.18" />
                  <rect x="32" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.22" />
                  <rect x="48" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.28" />
                  <rect x="64" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.32" />
                  <rect x="80" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.26" />
                  <rect x="96" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.2" />
                  <rect x="112" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.16" />
                  <rect x="128" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.14" />
                  <rect x="144" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.12" />
                  <rect x="160" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                  <rect x="176" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                  <rect x="192" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                  <rect x="208" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                  <rect x="224" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                  <rect x="240" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                  <rect x="256" y="0" width="12" height="10" rx="2" fill="var(--muted)" opacity="0.1" />
                </g>
                <text x="14" y="132" fill="var(--muted-2)" font-size="8" font-family="var(--font),sans-serif">租户 / 项目 / 模型 · 多维度热力</text>
              </svg>
            </div>
            <h3>模型路由可视化</h3>
            <p>
              流量、占比与时延一图呈现；支持按租户、项目、模型下钻，排障与容量评估更高效。
            </p>
            <RouterLink class="more" :to="{ name: 'tai-models' }">查看全部模型 →</RouterLink>
          </article>
          <article class="fcard">
            <div class="fcard-visual" aria-hidden="true">
              <svg class="viz-svg" viewBox="0 0 320 148" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(14,22)">
                  <text x="0" y="10" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">模型白名单</text>
                  <rect x="220" y="0" width="36" height="18" rx="9" fill="var(--success-bright)" />
                  <circle cx="244" cy="9" r="7" fill="var(--bg)" />
                </g>
                <g transform="translate(14,54)">
                  <text x="0" y="10" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">仅欧盟流量</text>
                  <rect x="220" y="0" width="36" height="18" rx="9" fill="var(--success-bright)" />
                  <circle cx="244" cy="9" r="7" fill="var(--bg)" />
                </g>
                <g transform="translate(14,86)">
                  <text x="0" y="10" fill="var(--muted)" font-size="9" font-weight="600" font-family="var(--font),sans-serif">提示词日志</text>
                  <rect x="220" y="0" width="36" height="18" rx="9" fill="var(--border)" />
                  <circle cx="232" cy="9" r="7" fill="var(--bg)" />
                </g>
                <rect x="14" y="114" width="180" height="4" rx="2" fill="var(--border)" />
                <rect x="14" y="114" width="110" height="4" rx="2" fill="var(--blue-ring)" />
                <text x="14" y="136" fill="var(--muted-2)" font-size="8" font-family="var(--font),sans-serif">区域 · 留存 · 模型范围 · 控制台统一配置</text>
              </svg>
            </div>
            <h3>数据策略与合规</h3>
            <p>
              细粒度控制可调模型、数据区域与日志留存；满足企业内控与审计要求，降低数据出境风险。
            </p>
            <RouterLink class="more" :to="{ name: 'tai-docs' }">查看文档 →</RouterLink>
          </article>
        </div>
      </section>

      <section class="wrap" id="featured-models" style="padding-bottom: 2rem">
        <div class="block-title">
          <h2>精选模型</h2>
        </div>
        <p class="block-sub">25+ 云厂商 · 100+ 模型 · 统一路由与计费</p>
        <div class="model-cards">
          <article class="mcard">
            <div class="prov">anthropic</div>
            <h3>Claude Opus 4.7</h3>
            <div class="by">提供商 Anthropic</div>
            <div class="meta">本周 Token 1.0T · 周环比</div>
            <div class="trend trend-down">−20.4%</div>
          </article>
          <article class="mcard">
            <div class="prov">openai</div>
            <h3>GPT-5.5 <span class="badge-new">新</span></h3>
            <div class="by">提供商 OpenAI</div>
            <div class="meta">本周 Token 302B · 周环比</div>
            <div class="trend trend-up">+52.3%</div>
          </article>
          <article class="mcard">
            <div class="prov">google</div>
            <h3>Gemini 3.1 Pro Preview</h3>
            <div class="by">提供商 Google</div>
            <div class="meta">本周 Token 307B · 周环比</div>
            <div class="trend trend-down">−23.5%</div>
          </article>
        </div>
        <div class="view-all-row"><RouterLink class="view-all" :to="{ name: 'tai-models' }">查看全部 →</RouterLink></div>
      </section>

      <section class="agents-band" id="apps">
        <div class="wrap-wide">
          <div class="block-title">
            <h2>精选应用与 Agent</h2>
          </div>
          <p class="block-sub">基于 Trinity 网关构建的应用与智能体能力</p>
          <div class="agents-grid">
            <a class="acard" href="#apps">
              <div class="acard-preview" aria-hidden="true">
                <svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="284" height="94" rx="10" fill="var(--bg)" stroke="var(--border)" />
                  <rect x="8" y="8" width="284" height="16" rx="10" fill="var(--surface)" />
                  <circle cx="22" cy="16" r="3" fill="var(--danger-hot)" />
                  <circle cx="34" cy="16" r="3" fill="var(--warning-ring)" />
                  <circle cx="46" cy="16" r="3" fill="var(--success-bright)" />
                  <rect x="22" y="36" width="52" height="30" rx="5" fill="var(--blue-soft)" stroke="var(--blue-ring)" />
                  <text x="48" y="54" text-anchor="middle" fill="var(--blue)" font-size="8" font-weight="700" font-family="Inter,sans-serif">提示词</text>
                  <line x1="74" y1="51" x2="92" y2="51" stroke="var(--border-strong)" stroke-width="1.5" />
                  <polygon points="92,51 98,48 98,54" fill="var(--muted-2)" />
                  <rect x="100" y="34" width="72" height="34" rx="5" fill="var(--purple-soft)" stroke="var(--violet-200)" />
                  <text x="136" y="54" text-anchor="middle" fill="var(--purple-deep)" font-size="8" font-weight="700" font-family="Inter,sans-serif">编排</text>
                  <line x1="172" y1="51" x2="188" y2="51" stroke="var(--border-strong)" stroke-width="1.5" />
                  <polygon points="188,51 194,48 194,54" fill="var(--muted-2)" />
                  <rect x="196" y="36" width="52" height="30" rx="5" fill="var(--success-soft)" stroke="var(--success-bright)" />
                  <text x="222" y="54" text-anchor="middle" fill="var(--success-800)" font-size="8" font-weight="700" font-family="Inter,sans-serif">评测</text>
                  <line x1="248" y1="51" x2="262" y2="51" stroke="var(--border-strong)" stroke-width="1.5" />
                  <polygon points="262,51 268,48 268,54" fill="var(--muted-2)" />
                  <rect x="268" y="38" width="22" height="26" rx="4" fill="var(--blue-soft)" stroke="var(--blue-ring)" />
                  <path d="M274 48 L280 54 L286 48" fill="none" stroke="var(--sky-600)" stroke-width="1.5" />
                  <text x="24" y="88" fill="var(--muted-2)" font-size="7" font-family="Inter,sans-serif">画布编排 · 节点连线</text>
                </svg>
              </div>
              <div class="acard-body">
                <h3>Trinity 工作室</h3>
                <p>从提示词到发布的编排与评测流水线，降低上线门槛</p>
              </div>
            </a>
            <a class="acard" href="#apps">
              <div class="acard-preview" aria-hidden="true">
                <svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="18" width="280" height="74" rx="10" fill="var(--bg)" stroke="var(--border)" />
                  <text x="24" y="38" fill="var(--muted)" font-size="8" font-weight="600" font-family="Inter,sans-serif">入站</text>
                  <circle cx="52" cy="54" r="10" fill="var(--blue-soft)" stroke="var(--blue-ring)" stroke-width="1.5" />
                  <text x="52" y="57" text-anchor="middle" fill="var(--blue)" font-size="8" font-weight="700" font-family="Inter,sans-serif">1</text>
                  <line x1="62" y1="54" x2="118" y2="40" stroke="var(--border-strong)" stroke-width="1.5" />
                  <line x1="62" y1="54" x2="118" y2="68" stroke="var(--border-strong)" stroke-width="1.5" />
                  <rect x="120" y="26" width="72" height="28" rx="5" fill="var(--warning-soft)" stroke="var(--warning-ring)" />
                  <text x="156" y="44" text-anchor="middle" fill="var(--warning-ink)" font-size="8" font-weight="700" font-family="Inter,sans-serif">模型 A</text>
                  <rect x="120" y="58" width="72" height="28" rx="5" fill="var(--violet-100)" stroke="var(--violet-300)" />
                  <text x="156" y="76" text-anchor="middle" fill="var(--purple-800)" font-size="8" font-weight="700" font-family="Inter,sans-serif">模型 B</text>
                  <line x1="192" y1="40" x2="238" y2="52" stroke="var(--border-strong)" stroke-width="1.5" />
                  <line x1="192" y1="72" x2="238" y2="60" stroke="var(--border-strong)" stroke-width="1.5" />
                  <rect x="240" y="42" width="48" height="28" rx="5" fill="var(--success-soft)" stroke="var(--success-bright)" />
                  <text x="264" y="60" text-anchor="middle" fill="var(--success-800)" font-size="7" font-weight="700" font-family="Inter,sans-serif">汇聚</text>
                  <text x="24" y="104" fill="var(--muted-2)" font-size="7" font-family="Inter,sans-serif">A/B 分流与权重 · 成本 / 时延择优</text>
                </svg>
              </div>
              <div class="acard-body">
                <h3>Hermes 路由</h3>
                <p>多模型对比与 A/B 分流，自动沉淀成本与时延指标</p>
              </div>
            </a>
            <a class="acard" href="#apps">
              <div class="acard-preview" aria-hidden="true">
                <svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="14" width="276" height="78" rx="8" fill="var(--text)" />
                  <rect x="12" y="14" width="276" height="14" rx="8" fill="var(--text)" />
                  <circle cx="24" cy="21" r="3" fill="var(--muted)" />
                  <circle cx="36" cy="21" r="3" fill="var(--muted)" />
                  <text x="22" y="38" fill="var(--viz-mint)" font-size="8" font-family="ui-monospace,monospace">$ trinity keys 列表</text>
                  <text x="22" y="54" fill="var(--muted-2)" font-size="8" font-family="ui-monospace,monospace">生产 · 预发 · 只读</text>
                  <rect x="200" y="62" width="76" height="20" rx="4" fill="var(--text)" stroke="var(--text)" />
                  <text x="238" y="75" text-anchor="middle" fill="var(--blue-ring)" font-size="7" font-family="Inter,sans-serif">权限</text>
                  <rect x="22" y="66" width="14" height="14" rx="3" fill="var(--text)" stroke="var(--muted)" />
                  <path d="M26 73 L32 73" stroke="var(--muted-2)" stroke-width="1" />
                  <circle cx="29" cy="70" r="2" fill="var(--muted)" />
                  <text x="22" y="102" fill="var(--muted-2)" font-size="7" font-family="Inter,sans-serif">命令行 · 密钥轮换 · 团队协作</text>
                </svg>
              </div>
              <div class="acard-body">
                <h3>Kilo 开发者套件</h3>
                <p>团队级智能体研发与密钥全生命周期管理</p>
              </div>
            </a>
          </div>
          <div class="view-all-row"><a href="#apps" class="view-all">查看全部 →</a></div>
        </div>
      </section>

      <section class="steps wrap-wide" id="api-key">
        <div class="steps-grid">
          <div class="step">
            <div class="step-num">1</div>
            <h3>创建账号</h3>
            <p>完成注册即可使用；支持创建组织、邀请成员并配置基于角色的访问控制。</p>
            <div class="step-oauth">
              <button type="button" class="oauth-btn" @click="openDemoAuth">Google</button>
              <button type="button" class="oauth-btn" @click="openDemoAuth">GitHub</button>
              <button type="button" class="oauth-btn" title="Web3 钱包" @click="openDemoAuth">◇</button>
            </div>
          </div>
          <div class="step" id="pricing">
            <div class="step-num">2</div>
            <h3>充值</h3>
            <p>充值额度适用于已开通的全部模型与厂商，按实际调用结算。</p>
            <div class="credit-mock">
              <div class="credit-line">本月<strong>¥699</strong></div>
              <div class="credit-line">上月<strong>¥99</strong></div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <h3>获取 API 密钥</h3>
            <p>创建密钥即可调用接口；<RouterLink class="text-link" :to="{ name: 'tai-docs' }">兼容 OpenAI 生态</RouterLink>，现有 SDK 可平滑迁移。</p>
            <div class="key-mock">
              TRINITY_AI_API_KEY<br />
              <span class="key-dots">••••••••••••••••</span>
            </div>
          </div>
        </div>
      </section>

      <section class="why-trinity wrap" id="why-trinity" aria-labelledby="why-trinity-heading">
        <header class="why-trinity-head">
          <h2 id="why-trinity-heading">为什么选择 Trinity AI？</h2>
          <p class="why-trinity-sub">我们不仅是 API 聚合网关，更是您构建下一代 AI 应用的坚实底座。</p>
        </header>
        <div class="why-trinity-grid">
          <article class="why-card">
            <div class="why-card-icon why-card-icon--blue" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3>统一接口</h3>
            <p>通过单个、标准化的接口访问所有主流模型。无论是推理、文本生成还是视觉处理。</p>
          </article>
          <article class="why-card">
            <div class="why-card-icon why-card-icon--purple" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <h3>分布式基础设施</h3>
            <p>依靠我们的分布式网络确保极高的可用性，当主提供商不可用时，自动切换至备选方案。</p>
          </article>
          <article class="why-card">
            <div class="why-card-icon why-card-icon--green" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <h3>成本优化</h3>
            <p>在不牺牲速度的前提下，自动为您寻找最具成本效益的模型路由，显著降低您的运营开支。</p>
          </article>
          <article class="why-card">
            <div class="why-card-icon why-card-icon--rose" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>企业级安全</h3>
            <p>细粒度的数据政策保护您的组织隐私。我们严格遵守合规性要求，不保留任何敏感对话数据。</p>
          </article>
        </div>
      </section>
    <footer>
      <div class="wrap-wide footer-top">
        <div class="footer-brand">
          <strong>
            <span class="brand-mark" style="width: 28px; height: 28px">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2l1.2 4.5L18 8l-4.8 1.5L12 14l-1.2-4.5L6 8l4.8-1.5L12 2zM19 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L19 14zM5 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L5 14z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Trinity AI
          </strong>
          企业级大模型聚合与智能路由平台
        </div>
        <div class="footer-col">
          <h4>产品</h4>
          <ul>
            <li><a href="#apps">应用</a></li>
            <li><RouterLink :to="{ name: 'tai-models' }">模型</RouterLink></li>
            <li><a href="#providers">供应商</a></li>
            <li><a href="#pricing">定价与额度</a></li>
            <li><a href="#">企业版</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>公司</h4>
          <ul>
            <li><a href="#">关于我们</a></li>
            <li><a href="#why-trinity">为什么选择</a></li>
            <li><a href="#">加入我们</a><span class="hiring">热招</span></li>
            <li><a href="#">隐私政策</a></li>
            <li><a href="#">服务条款</a></li>
            <li><a href="#">支持</a></li>
            <li><a href="#">AI 态势</a></li>
            <li><a href="#">与 Trinity 集成</a></li>
            <li><a href="#">数据合规</a></li>
          </ul>
        </div>
        <div class="footer-col" id="docs">
          <h4>开发者</h4>
          <ul>
            <li><RouterLink :to="{ name: 'tai-docs' }">文档中心</RouterLink></li>
            <li><RouterLink :to="{ name: 'tai-docs' }">API 参考</RouterLink></li>
            <li><RouterLink :to="{ name: 'tai-docs' }">SDK</RouterLink></li>
            <li><RouterLink :to="{ name: 'tai-docs' }">服务状态</RouterLink></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>社区</h4>
          <ul>
            <li><a href="#">Discord</a></li>
            <li><a href="#">GitHub</a></li>
            <li><a href="#">领英</a></li>
            <li><a href="#">X</a></li>
            <li><a href="#">YouTube</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">© 2026 Trinity AI. 保留所有权利。</div>
    </footer>
  </div>
</template>
