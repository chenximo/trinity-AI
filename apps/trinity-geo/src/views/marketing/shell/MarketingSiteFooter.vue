<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="geo-footer">
    <div class="geo-container">
      <div class="geo-footer-grid">
        <div class="geo-footer-brand">
          <strong>
            <span class="geo-logo-mark" style="width: 28px; height: 28px; display: inline-grid">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </span>
            Trinity GEO
          </strong>
          <p style="margin: 0; max-width: 260px">全球化产品 AI 答案可见性监测 · SOA · 竞品对比</p>
        </div>
        <div class="geo-footer-col">
          <h4>产品</h4>
          <ul>
            <li><a href="#soa">SOA 指标</a></li>
            <li><a href="#platforms">平台覆盖</a></li>
            <li><a href="#features">能力</a></li>
            <li><a href="#compare">为何选我们</a></li>
            <li><a href="#pricing">定价</a></li>
          </ul>
        </div>
        <div class="geo-footer-col">
          <h4>资源</h4>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#proof">客户案例</a></li>
            <li><a href="/product/geo/">产品手册</a></li>
            <li><a href="/__geo_marketing/prototypes/v1/index.html">v1 原型归档</a></li>
          </ul>
        </div>
        <div class="geo-footer-col">
          <h4>联系</h4>
          <ul>
            <li><a href="mailto:sales@trinitydesk.com">sales@trinitydesk.com</a></li>
            <li><a href="#">隐私政策</a></li>
            <li><a href="#">服务条款</a></li>
          </ul>
        </div>
      </div>
      <div class="geo-footer-bottom">
        <span>© 2026 Trinity GEO</span>
        <div class="geo-suite-links">
          <a href="/trinity-ai">Trinity AI · 模型 API</a>
          <a href="/ai-cloud">Trinity AI 云 · 算力</a>
        </div>
      </div>
    </div>
  </footer>
</template>
