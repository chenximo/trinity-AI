<script setup lang="ts">
defineOptions({ name: "TencentCloudSceneVisual" });
</script>

<template>
  <div class="tc-live" aria-hidden="true">
    <div class="tc-live__deck">
      <!-- 导播 HUD -->
      <header class="tc-live__hud">
        <span class="tc-live__badge"><i /> LIVE</span>
        <span class="tc-live__title">带货直播 · TRTC 超低延迟</span>
        <span class="tc-live__hud-metrics">
          <span>延迟 <b>186</b>ms</span>
          <span>在线 <b>12.8</b>万</span>
        </span>
      </header>

      <div class="tc-live__body">
        <!-- 主监视器：节目输出 -->
        <div class="tc-live__program">
          <div class="tc-live__monitor">
            <div class="tc-live__monitor-scan" />
            <div class="tc-live__safe-grid" />
            <span class="tc-live__monitor-label">PGM 主输出</span>
            <span class="tc-live__monitor-res">1080P · 60fps</span>
            <div class="tc-live__waveform" aria-hidden="true">
              <span v-for="n in 28" :key="n" class="tc-live__wave-bar" :style="{ '--i': n }" />
            </div>
          </div>

          <!-- 连麦小窗 -->
          <div class="tc-live__pips">
            <div class="tc-live__pip">
              <span class="tc-live__pip-feed" />
              <span class="tc-live__pip-tag">嘉宾 1</span>
              <span class="tc-live__pip-mic" />
            </div>
            <div class="tc-live__pip">
              <span class="tc-live__pip-feed tc-live__pip-feed--b" />
              <span class="tc-live__pip-tag">嘉宾 2</span>
              <span class="tc-live__pip-mic" />
            </div>
            <div class="tc-live__pip tc-live__pip--more">
              <span>+4 连麦</span>
            </div>
          </div>
        </div>

        <!-- 推流链路 -->
        <div class="tc-live__pipeline">
          <div class="tc-live__node">
            <span class="tc-live__node-icon tc-live__node-icon--cam" />
            <span>采集</span>
          </div>
          <span class="tc-live__arrow" />
          <div class="tc-live__node tc-live__node--accent">
            <span class="tc-live__node-icon tc-live__node-icon--trtc" />
            <span>TRTC</span>
          </div>
          <span class="tc-live__arrow" />
          <div class="tc-live__node">
            <span class="tc-live__node-icon tc-live__node-icon--trans" />
            <span>转码</span>
          </div>
          <span class="tc-live__arrow" />
          <div class="tc-live__node">
            <span class="tc-live__node-icon tc-live__node-icon--cdn" />
            <span>CDN</span>
          </div>
          <span class="tc-live__arrow tc-live__arrow--dash" />
          <div class="tc-live__node tc-live__node--audience">
            <span class="tc-live__node-icon tc-live__node-icon--users" />
            <span>观众端</span>
          </div>
        </div>

        <!-- 混音台 / 电平表 -->
        <footer class="tc-live__mixer">
          <span class="tc-live__mixer-label">AUDIO</span>
          <div class="tc-live__vu">
            <span v-for="n in 16" :key="n" class="tc-live__vu-seg" :class="{ 'is-hot': n > 12 }" :style="{ '--n': n }" />
          </div>
          <span class="tc-live__mixer-stat">4.2 Mbps</span>
          <span class="tc-live__mixer-stat tc-live__mixer-stat--ok">丢包 0.03%</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tc-live {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.tc-live__deck {
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

/* HUD */
.tc-live__hud {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  padding: 0.4rem 0.55rem;
  background: rgba(2, 6, 23, 0.85);
  border-bottom: 1px solid rgba(51, 65, 85, 0.9);
}

.tc-live__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fecaca;
  background: #7f1d1d;
  border: 1px solid rgba(248, 113, 113, 0.5);
}

.tc-live__badge i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ef4444;
  animation: tc-blink 1s step-end infinite;
}

@keyframes tc-blink {
  50% {
    opacity: 0.3;
  }
}

.tc-live__title {
  flex: 1;
  min-width: 0;
  font-size: 0.5625rem;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-live__hud-metrics {
  display: flex;
  gap: 0.5rem;
  font-size: 0.4375rem;
  color: #94a3b8;
}

.tc-live__hud-metrics b {
  color: #67e8f9;
  font-weight: 700;
}

.tc-live__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.45rem 0.5rem 0.4rem;
  gap: 0.4rem;
  min-height: 0;
}

/* 主画面 + 连麦 */
.tc-live__program {
  display: flex;
  gap: 0.4rem;
  flex: 1;
  min-height: 0;
}

.tc-live__monitor {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  border-radius: 8px;
  border: 2px solid #475569;
  background: linear-gradient(145deg, #0c4a6e 0%, #042f2e 40%, #0f172a 100%);
  overflow: hidden;
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.5);
}

.tc-live__monitor-scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
  opacity: 0.6;
}

.tc-live__safe-grid {
  position: absolute;
  inset: 12% 10%;
  border: 1px dashed rgba(34, 211, 238, 0.25);
  pointer-events: none;
}

.tc-live__monitor-label {
  position: absolute;
  top: 0.3rem;
  left: 0.4rem;
  font-size: 0.4375rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #67e8f9;
  text-transform: uppercase;
}

.tc-live__monitor-res {
  position: absolute;
  top: 0.3rem;
  right: 0.4rem;
  font-size: 0.375rem;
  font-weight: 600;
  color: #94a3b8;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  background: rgba(15, 23, 42, 0.75);
}

.tc-live__waveform {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 18%;
  height: 36%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1px;
}

.tc-live__wave-bar {
  flex: 1;
  max-width: 6px;
  height: 42%;
  min-height: 6px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(180deg, #5eead4, #0891b2);
  opacity: 0.85;
  transform-origin: bottom center;
  animation: tc-wave 0.9s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.04s);
}

@keyframes tc-wave {
  0%,
  100% {
    transform: scaleY(0.65);
    opacity: 0.55;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* 连麦 PiP */
.tc-live__pips {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 28%;
  min-width: 52px;
  max-width: 72px;
}

.tc-live__pip {
  position: relative;
  flex: 1;
  min-height: 28px;
  border-radius: 6px;
  border: 1.5px solid rgba(34, 211, 238, 0.45);
  background: #0f172a;
  overflow: hidden;
}

.tc-live__pip-feed {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #1d4ed8 0%, #312e81 100%);
}

.tc-live__pip-feed--b {
  background: linear-gradient(160deg, #be185d 0%, #581c87 100%);
}

.tc-live__pip-tag {
  position: absolute;
  left: 0.2rem;
  bottom: 0.15rem;
  font-size: 0.375rem;
  font-weight: 700;
  color: #f8fafc;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.tc-live__pip-mic {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.8);
}

.tc-live__pip--more {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  min-height: 22px;
  border-style: dashed;
  background: rgba(8, 47, 73, 0.5);
}

.tc-live__pip--more span {
  font-size: 0.375rem;
  font-weight: 700;
  color: #67e8f9;
}

/* 推流链路 */
.tc-live__pipeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.15rem;
  padding: 0.35rem 0.4rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.8);
}

.tc-live__node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.375rem;
  font-weight: 600;
  color: #94a3b8;
  min-width: 0;
}

.tc-live__node--accent {
  color: #a5f3fc;
}

.tc-live__node--accent .tc-live__node-icon {
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.45);
}

.tc-live__node--audience {
  color: #cbd5e1;
}

.tc-live__node-icon {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: #334155;
  border: 1px solid #475569;
}

.tc-live__node-icon--cam {
  background: linear-gradient(135deg, #475569, #1e293b);
}

.tc-live__node-icon--trtc {
  background: linear-gradient(135deg, #22d3ee, #006eff);
  border-color: #67e8f9;
}

.tc-live__node-icon--trans {
  background: linear-gradient(135deg, #6366f1, #4338ca);
}

.tc-live__node-icon--cdn {
  background: linear-gradient(135deg, #38bdf8, #0284c7);
}

.tc-live__node-icon--users {
  background: linear-gradient(135deg, #4ade80, #15803d);
}

.tc-live__arrow {
  flex: 1;
  min-width: 8px;
  max-width: 18px;
  height: 2px;
  background: linear-gradient(90deg, #334155, #22d3ee, #334155);
  position: relative;
}

.tc-live__arrow::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: 3px solid transparent;
  border-left-color: #22d3ee;
}

.tc-live__arrow--dash {
  background: repeating-linear-gradient(90deg, #475569 0, #475569 4px, transparent 4px, transparent 7px);
}

/* 混音台 */
.tc-live__mixer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.45rem;
  border-radius: 6px;
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid #334155;
}

.tc-live__mixer-label {
  font-size: 0.375rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #64748b;
}

.tc-live__vu {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.tc-live__vu-seg {
  flex: 1;
  height: calc(35% + var(--n) * 4%);
  max-height: 100%;
  border-radius: 1px;
  background: #164e63;
  animation: tc-vu 0.6s ease-in-out infinite;
  animation-delay: calc(var(--n) * 0.05s);
}

.tc-live__vu-seg.is-hot {
  background: linear-gradient(180deg, #fbbf24, #ea580c);
}

@keyframes tc-vu {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.tc-live__mixer-stat {
  font-size: 0.4375rem;
  font-weight: 600;
  color: #67e8f9;
  white-space: nowrap;
}

.tc-live__mixer-stat--ok {
  color: #86efac;
}

@media (min-width: 900px) {
  .tc-live__title {
    font-size: 0.625rem;
  }
}
</style>
