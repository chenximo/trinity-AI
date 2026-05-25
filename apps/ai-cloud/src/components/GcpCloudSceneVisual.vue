<script setup lang="ts">
defineOptions({ name: "GcpCloudSceneVisual" });
</script>

<template>
  <div class="gcp-global" aria-hidden="true">
    <div class="gcp-global__plate">
      <div class="gcp-global__stars" aria-hidden="true" />

      <header class="gcp-global__head">
        <span class="gcp-global__brand-dot" />
        <span class="gcp-global__head-title">Global Data Plane</span>
        <span class="gcp-global__badge">38 Regions</span>
        <span class="gcp-global__badge gcp-global__badge--aa">Active-Active</span>
      </header>

      <div class="gcp-global__viz">
        <!-- 地球弧线 + 数据流 -->
        <svg class="gcp-global__map" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <linearGradient id="gcp-arc-a" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0" />
              <stop offset="50%" stop-color="#22d3ee" stop-opacity="1" />
              <stop offset="100%" stop-color="#818cf8" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="gcp-arc-b" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#fbbf24" stop-opacity="0" />
              <stop offset="50%" stop-color="#4285f4" stop-opacity="1" />
              <stop offset="100%" stop-color="#a78bfa" stop-opacity="0" />
            </linearGradient>
            <filter id="gcp-glow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <!-- 经纬网格 -->
          <ellipse cx="200" cy="108" rx="148" ry="62" fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="1" />
          <ellipse cx="200" cy="108" rx="118" ry="48" fill="none" stroke="rgba(148,163,184,0.08)" stroke-width="1" />
          <path d="M52 108 Q200 28 348 108" fill="none" stroke="rgba(99,102,241,0.2)" stroke-width="1" stroke-dasharray="3 5" />
          <path d="M52 108 Q200 188 348 108" fill="none" stroke="rgba(99,102,241,0.15)" stroke-width="1" stroke-dasharray="3 5" />
          <!-- 主数据弧 -->
          <path
            class="gcp-global__flow gcp-global__flow--a"
            d="M72 118 Q140 52 200 78 Q260 104 328 92"
            fill="none"
            stroke="url(#gcp-arc-a)"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            class="gcp-global__flow gcp-global__flow--b"
            d="M88 132 Q168 148 200 118 Q232 88 312 108"
            fill="none"
            stroke="url(#gcp-arc-b)"
            stroke-width="2"
            stroke-linecap="round"
            opacity="0.85"
          />
        </svg>

        <!-- 区域节点 -->
        <div class="gcp-global__node gcp-global__node--cn">
          <span class="gcp-global__node-ring" />
          <strong>亚太</strong>
          <span>业务起源</span>
        </div>
        <div class="gcp-global__node gcp-global__node--hub">
          <span class="gcp-global__node-ring gcp-global__node-ring--hub" />
          <strong>Global</strong>
          <span>VPC Spoke</span>
        </div>
        <div class="gcp-global__node gcp-global__node--eu">
          <span class="gcp-global__node-ring" />
          <strong>欧洲</strong>
          <span>europe-west1</span>
        </div>
        <div class="gcp-global__node gcp-global__node--us">
          <span class="gcp-global__node-ring" />
          <strong>北美</strong>
          <span>us-central1</span>
        </div>

        <!-- 数据驻留浮标 -->
        <div class="gcp-global__residency">
          <span>数据驻留</span>
          <em>GDPR · APAC</em>
        </div>
      </div>

      <!-- 产品能力条 -->
      <div class="gcp-global__stack">
        <div class="gcp-global__svc">
          <span class="gcp-global__svc-icon gcp-global__svc-icon--bq" />
          <span>BigQuery</span>
        </div>
        <div class="gcp-global__svc">
          <span class="gcp-global__svc-icon gcp-global__svc-icon--vertex" />
          <span>Vertex AI</span>
        </div>
        <div class="gcp-global__svc">
          <span class="gcp-global__svc-icon gcp-global__svc-icon--spanner" />
          <span>Spanner</span>
        </div>
        <div class="gcp-global__svc">
          <span class="gcp-global__svc-icon gcp-global__svc-icon--gke" />
          <span>GKE</span>
        </div>
      </div>

      <footer class="gcp-global__metrics">
        <div class="gcp-global__metric">
          <span class="gcp-global__metric-k">跨洲延迟</span>
          <span class="gcp-global__metric-v">128 ms</span>
        </div>
        <div class="gcp-global__metric">
          <span class="gcp-global__metric-k">骨干吞吐</span>
          <span class="gcp-global__metric-v">48 Gbps</span>
        </div>
        <div class="gcp-global__metric">
          <span class="gcp-global__metric-k">可用区</span>
          <span class="gcp-global__metric-v">115 AZ</span>
        </div>
        <div class="gcp-global__metric gcp-global__metric--hi">
          <span class="gcp-global__metric-k">Replication</span>
          <span class="gcp-global__metric-v">99.999%</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.gcp-global {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.gcp-global__plate {
  position: relative;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
}

.gcp-global__stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 12% 18%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 78% 22%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 45% 8%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1.5px 1.5px at 88% 65%, rgba(199, 210, 254, 0.4), transparent),
    radial-gradient(1px 1px at 22% 72%, rgba(255, 255, 255, 0.25), transparent),
    radial-gradient(1px 1px at 62% 85%, rgba(255, 255, 255, 0.3), transparent);
  pointer-events: none;
  opacity: 0.7;
}

.gcp-global__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.45rem 0.55rem;
  background: rgba(15, 23, 42, 0.65);
  border-bottom: 1px solid rgba(99, 102, 241, 0.25);
  backdrop-filter: blur(8px);
}

.gcp-global__brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: conic-gradient(#ea4335, #fbbc04, #34a853, #4285f4, #ea4335);
  box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
}

.gcp-global__head-title {
  flex: 1;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #e0e7ff;
  text-transform: uppercase;
}

.gcp-global__badge {
  font-size: 0.4375rem;
  font-weight: 700;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  color: #c7d2fe;
  background: rgba(49, 46, 129, 0.6);
  border: 1px solid rgba(129, 140, 248, 0.4);
}

.gcp-global__badge--aa {
  color: #a7f3d0;
  background: rgba(6, 78, 59, 0.45);
  border-color: rgba(52, 211, 153, 0.45);
}

.gcp-global__viz {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  margin: 0.35rem 0.45rem 0.25rem;
}

.gcp-global__map {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: block;
}

.gcp-global__flow {
  stroke-dasharray: 12 8;
  animation: gcp-flow 3s linear infinite;
}

.gcp-global__flow--b {
  animation-duration: 3.8s;
  animation-direction: reverse;
}

@keyframes gcp-flow {
  to {
    stroke-dashoffset: -40;
  }
}

/* 区域节点 */
.gcp-global__node {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  text-align: center;
  padding: 0.28rem 0.35rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.gcp-global__node strong {
  font-size: 0.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.gcp-global__node > span:not([class]) {
  font-size: 0.3125rem;
  color: #94a3b8;
  font-weight: 500;
}

.gcp-global__node-ring {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.8);
  margin-bottom: 0.1rem;
  animation: gcp-pulse 2s ease-in-out infinite;
}

.gcp-global__node-ring--hub {
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #4285f4, #a78bfa);
  box-shadow: 0 0 18px rgba(66, 133, 244, 0.75);
}

@keyframes gcp-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.75;
  }
}

.gcp-global__node--cn {
  left: 4%;
  top: 38%;
  border-color: rgba(251, 191, 36, 0.35);
}

.gcp-global__node--cn .gcp-global__node-ring {
  background: #fbbf24;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.7);
}

.gcp-global__node--hub {
  left: 50%;
  top: 22%;
  transform: translateX(-50%);
  border-color: rgba(129, 140, 248, 0.5);
  padding: 0.35rem 0.5rem;
}

.gcp-global__node--eu {
  right: 6%;
  top: 28%;
}

.gcp-global__node--eu .gcp-global__node-ring {
  background: #818cf8;
  box-shadow: 0 0 12px rgba(129, 140, 248, 0.7);
}

.gcp-global__node--us {
  right: 12%;
  bottom: 18%;
}

.gcp-global__node--us .gcp-global__node-ring {
  background: #34d399;
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.7);
}

.gcp-global__residency {
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: rgba(30, 27, 75, 0.85);
  border: 1px solid rgba(167, 139, 250, 0.35);
  backdrop-filter: blur(4px);
}

.gcp-global__residency span {
  font-size: 0.3125rem;
  font-weight: 600;
  color: #c4b5fd;
  letter-spacing: 0.06em;
}

.gcp-global__residency em {
  font-style: normal;
  font-size: 0.4375rem;
  font-weight: 700;
  color: #e9d5ff;
}

/* 产品条 */
.gcp-global__stack {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0 0.45rem 0.3rem;
}

.gcp-global__svc {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.45rem;
  border-radius: 999px;
  font-size: 0.4375rem;
  font-weight: 600;
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(71, 85, 105, 0.8);
  backdrop-filter: blur(4px);
}

.gcp-global__svc-icon {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.gcp-global__svc-icon--bq {
  background: linear-gradient(135deg, #4285f4, #1a73e8);
}

.gcp-global__svc-icon--vertex {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
}

.gcp-global__svc-icon--spanner {
  background: linear-gradient(135deg, #34d399, #059669);
}

.gcp-global__svc-icon--gke {
  background: linear-gradient(135deg, #22d3ee, #0891b2);
}

/* 指标 */
.gcp-global__metrics {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;
  padding: 0.4rem 0.5rem 0.45rem;
  background: rgba(2, 6, 23, 0.75);
  border-top: 1px solid rgba(99, 102, 241, 0.2);
}

.gcp-global__metric {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  padding: 0.28rem 0.3rem;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.6);
}

.gcp-global__metric--hi {
  background: rgba(49, 46, 129, 0.45);
  border-color: rgba(129, 140, 248, 0.4);
}

.gcp-global__metric--hi .gcp-global__metric-v {
  color: #a5f3fc;
}

.gcp-global__metric-k {
  font-size: 0.3125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.gcp-global__metric-v {
  font-size: 0.5625rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

@media (min-width: 900px) {

  .gcp-global__head-title {
    font-size: 0.6875rem;
  }
}

@media (max-width: 420px) {
  .gcp-global__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
