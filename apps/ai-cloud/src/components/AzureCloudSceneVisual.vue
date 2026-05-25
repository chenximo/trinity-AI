<script setup lang="ts">
defineOptions({ name: "AzureCloudSceneVisual" });
</script>

<template>
  <div class="az-hybrid" aria-hidden="true">
    <div class="az-hybrid__inner">
      <header class="az-hybrid__head">
        <span class="az-hybrid__mark" />
        <span class="az-hybrid__head-title">Hybrid + AI Workloads</span>
        <span class="az-hybrid__badge">Azure Arc</span>
        <span class="az-hybrid__badge az-hybrid__badge--ai">OpenAI</span>
      </header>

      <div class="az-hybrid__canvas">
        <svg class="az-hybrid__links" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true">
          <path class="az-hybrid__link" d="M88 60 L148 60" />
          <path class="az-hybrid__link az-hybrid__link--main" d="M148 60 L212 48" />
          <path class="az-hybrid__link" d="M212 48 L272 42" />
          <path class="az-hybrid__link az-hybrid__link--ai" d="M212 72 L272 78" stroke-dasharray="4 3" />
        </svg>

        <!-- 本地 / 混合 -->
        <section class="az-hybrid__zone az-hybrid__zone--edge">
          <span class="az-hybrid__zone-kicker">On-Premises</span>
          <div class="az-hybrid__rack">
            <span class="az-hybrid__rack-unit" />
            <span class="az-hybrid__rack-unit" />
            <span class="az-hybrid__rack-unit az-hybrid__rack-unit--on" />
          </div>
          <div class="az-hybrid__chip-row">
            <span class="az-hybrid__mini">Windows</span>
            <span class="az-hybrid__mini">SQL</span>
          </div>
          <span class="az-hybrid__arc">Arc 已接入</span>
        </section>

        <!-- 互联中枢 -->
        <div class="az-hybrid__bridge">
          <span class="az-hybrid__bridge-icon" />
          <strong>ExpressRoute</strong>
          <span>混合互联</span>
        </div>

        <!-- Azure 云 -->
        <section class="az-hybrid__zone az-hybrid__zone--cloud">
          <span class="az-hybrid__zone-kicker">Microsoft Azure</span>
          <div class="az-hybrid__cloud-mark" aria-hidden="true" />
          <div class="az-hybrid__workloads">
            <div class="az-hybrid__wl az-hybrid__wl--ai">
              <span class="az-hybrid__wl-icon az-hybrid__wl-icon--ai" />
              <div>
                <strong>Azure OpenAI</strong>
                <span>GPT-4o · GPU</span>
              </div>
            </div>
            <div class="az-hybrid__wl">
              <span class="az-hybrid__wl-icon az-hybrid__wl-icon--aks" />
              <div>
                <strong>AKS / .NET</strong>
                <span>微服务集群</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="az-hybrid__metrics">
        <div class="az-hybrid__metric">
          <span class="az-hybrid__metric-k">订阅 / RG</span>
          <span class="az-hybrid__metric-v">18 / 64</span>
        </div>
        <div class="az-hybrid__metric">
          <span class="az-hybrid__metric-k">Arc 节点</span>
          <span class="az-hybrid__metric-v">126</span>
        </div>
        <div class="az-hybrid__metric">
          <span class="az-hybrid__metric-k">GPU 算力</span>
          <span class="az-hybrid__metric-v">A100 × 8</span>
        </div>
        <div class="az-hybrid__metric az-hybrid__metric--hi">
          <span class="az-hybrid__metric-k">合规</span>
          <span class="az-hybrid__metric-v">SOC2 ✓</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.az-hybrid {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.az-hybrid__inner {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
}

.az-hybrid__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(0, 120, 212, 0.12);
  backdrop-filter: blur(6px);
}

.az-hybrid__mark {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: linear-gradient(135deg, #0078d4 50%, #50e6ff 50%);
}

.az-hybrid__head-title {
  flex: 1;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #0f172a;
  text-transform: uppercase;
}

.az-hybrid__badge {
  font-size: 0.4375rem;
  font-weight: 700;
  padding: 0.12rem 0.38rem;
  border-radius: 999px;
  color: #0369a1;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
}

.az-hybrid__badge--ai {
  color: #5b21b6;
  background: #ede9fe;
  border-color: #ddd6fe;
}

.az-hybrid__canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 0.35rem;
  padding: 0.45rem 0.4rem 0.35rem;
}

.az-hybrid__links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.az-hybrid__link {
  fill: none;
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.az-hybrid__link--main {
  stroke: #0078d4;
  stroke-width: 2.2;
  stroke-dasharray: 10 6;
  animation: az-flow 2.2s linear infinite;
}

.az-hybrid__link--ai {
  stroke: #7c3aed;
  opacity: 0.75;
  animation: az-flow 2.8s linear infinite reverse;
}

@keyframes az-flow {
  to {
    stroke-dashoffset: -32;
  }
}

.az-hybrid__zone {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.4rem 0.45rem;
  border-radius: 10px;
  min-width: 0;
}

.az-hybrid__zone--edge {
  flex: 0 0 30%;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.az-hybrid__zone--cloud {
  flex: 0 0 38%;
  background: linear-gradient(165deg, #eff6ff 0%, #dbeafe 55%, #e0f2fe 100%);
  border: 1px solid rgba(0, 120, 212, 0.22);
  box-shadow: 0 6px 20px rgba(0, 120, 212, 0.12);
}

.az-hybrid__zone-kicker {
  font-size: 0.375rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}

.az-hybrid__zone--cloud .az-hybrid__zone-kicker {
  color: #0369a1;
}

.az-hybrid__rack {
  display: flex;
  gap: 0.2rem;
  margin: 0.15rem 0;
}

.az-hybrid__rack-unit {
  flex: 1;
  height: 28px;
  border-radius: 4px;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
}

.az-hybrid__rack-unit--on {
  background: linear-gradient(180deg, #bae6fd, #7dd3fc);
  border-color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.35);
}

.az-hybrid__chip-row {
  display: flex;
  gap: 0.2rem;
  flex-wrap: wrap;
}

.az-hybrid__mini {
  font-size: 0.3125rem;
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.az-hybrid__arc {
  font-size: 0.375rem;
  font-weight: 700;
  color: #0078d4;
}

.az-hybrid__bridge {
  position: relative;
  z-index: 1;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem;
  padding: 0.35rem 0.3rem;
  text-align: center;
  flex: 0 0 auto;
}

.az-hybrid__bridge-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0078d4, #50e6ff);
  box-shadow: 0 0 14px rgba(0, 120, 212, 0.45);
  animation: az-pulse 2s ease-in-out infinite;
}

@keyframes az-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.az-hybrid__bridge strong {
  font-size: 0.4375rem;
  font-weight: 700;
  color: #0f172a;
}

.az-hybrid__bridge > span:not([class]) {
  font-size: 0.3125rem;
  color: #64748b;
}

.az-hybrid__cloud-mark {
  width: 36px;
  height: 22px;
  margin: 0.1rem auto;
  background: linear-gradient(135deg, #0078d4 0%, #50e6ff 100%);
  clip-path: polygon(50% 0%, 92% 25%, 92% 75%, 50% 100%, 8% 75%, 8% 25%);
  opacity: 0.9;
}

.az-hybrid__workloads {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
}

.az-hybrid__wl {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.32rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(0, 120, 212, 0.12);
}

.az-hybrid__wl--ai {
  border-color: rgba(124, 58, 237, 0.25);
  background: linear-gradient(90deg, rgba(237, 233, 254, 0.95), rgba(255, 255, 255, 0.9));
}

.az-hybrid__wl-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 4px;
}

.az-hybrid__wl-icon--ai {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.az-hybrid__wl-icon--aks {
  background: linear-gradient(135deg, #0078d4, #005a9e);
}

.az-hybrid__wl strong {
  display: block;
  font-size: 0.4375rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.az-hybrid__wl span {
  display: block;
  font-size: 0.3125rem;
  color: #64748b;
}

.az-hybrid__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;
  padding: 0.38rem 0.45rem 0.42rem;
  background: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 120, 212, 0.1);
}

.az-hybrid__metric {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  padding: 0.25rem 0.28rem;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.az-hybrid__metric--hi {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.az-hybrid__metric--hi .az-hybrid__metric-v {
  color: #0078d4;
}

.az-hybrid__metric-k {
  font-size: 0.3125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.az-hybrid__metric-v {
  font-size: 0.5rem;
  font-weight: 700;
  color: #1e293b;
}

@media (max-width: 420px) {
  .az-hybrid__metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .az-hybrid__canvas {
    flex-wrap: wrap;
    justify-content: center;
  }

  .az-hybrid__zone--edge,
  .az-hybrid__zone--cloud {
    flex: 1 1 42%;
  }

  .az-hybrid__bridge {
    flex: 1 1 100%;
    flex-direction: row;
    justify-content: center;
    gap: 0.35rem;
  }
}
</style>
