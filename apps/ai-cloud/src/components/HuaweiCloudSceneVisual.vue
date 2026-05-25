<script setup lang="ts">
defineOptions({ name: "HuaweiCloudSceneVisual" });
</script>

<template>
  <div class="hw-net" aria-hidden="true">
    <div class="hw-net__plate">
      <header class="hw-net__head">
        <span class="hw-net__head-title">专线入云拓扑</span>
        <span class="hw-net__badge hw-net__badge--sec">等保三级</span>
        <span class="hw-net__badge hw-net__badge--line">10G 独享</span>
      </header>

      <div class="hw-net__canvas">
        <!-- 拓扑连线（底层） -->
        <svg class="hw-net__links" viewBox="0 0 360 160" preserveAspectRatio="none" aria-hidden="true">
          <path class="hw-net__link" d="M52 118 L118 88 L200 72" />
          <path class="hw-net__link hw-net__link--main" d="M118 88 L200 72 L288 56" />
          <path class="hw-net__link" d="M52 118 L52 72 L118 88" stroke-dasharray="4 3" />
          <path class="hw-net__link hw-net__link--edge" d="M288 56 L288 108 L200 120" stroke-dasharray="5 4" />
        </svg>

        <!-- 政务机房 -->
        <div class="hw-net__node hw-net__node--gov">
          <span class="hw-net__node-icon hw-net__node-icon--building" />
          <strong>政务机房</strong>
          <span>本地数据中心</span>
        </div>

        <!-- 运营商骨干 -->
        <div class="hw-net__node hw-net__node--carrier">
          <span class="hw-net__node-icon hw-net__node-icon--carrier" />
          <strong>运营商骨干</strong>
          <span>BGP · 多线接入</span>
          <ul class="hw-net__carriers">
            <li>电信</li>
            <li>移动</li>
            <li>联通</li>
          </ul>
        </div>

        <!-- 华为云 -->
        <div class="hw-net__node hw-net__node--cloud">
          <span class="hw-net__node-icon hw-net__node-icon--cloud" />
          <strong>华为云 Region</strong>
          <span>Stack 混合云</span>
        </div>

        <!-- 边缘 / 昇腾 -->
        <div class="hw-net__node hw-net__node--edge">
          <span class="hw-net__node-icon hw-net__node-icon--chip" />
          <strong>昇腾节点</strong>
          <span>训推一体</span>
        </div>

        <!-- 专线标注 -->
        <div class="hw-net__label hw-net__label--dedicated">
          <span>政企专线</span>
          <em>3.2ms</em>
        </div>
      </div>

      <footer class="hw-net__metrics">
        <div class="hw-net__metric">
          <span class="hw-net__metric-k">链路时延</span>
          <span class="hw-net__metric-v">3.2 ms</span>
        </div>
        <div class="hw-net__metric">
          <span class="hw-net__metric-k">专线带宽</span>
          <span class="hw-net__metric-v">10 Gbps</span>
        </div>
        <div class="hw-net__metric">
          <span class="hw-net__metric-k">可用性 SLA</span>
          <span class="hw-net__metric-v">99.95%</span>
        </div>
        <div class="hw-net__metric hw-net__metric--ok">
          <span class="hw-net__metric-k">合规状态</span>
          <span class="hw-net__metric-v">政务专网隔离</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.hw-net {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.hw-net__plate {
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

.hw-net__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.4rem 0.55rem;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e2e8f0;
}

.hw-net__head-title {
  flex: 1;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #334155;
  text-transform: uppercase;
}

.hw-net__badge {
  font-size: 0.4375rem;
  font-weight: 700;
  padding: 0.12rem 0.38rem;
  border-radius: 4px;
}

.hw-net__badge--sec {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.hw-net__badge--line {
  color: #9f1239;
  background: #fff1f2;
  border: 1px solid #fecdd3;
}

.hw-net__canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 0.35rem 0.4rem 0.25rem;
}

.hw-net__links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hw-net__link {
  fill: none;
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.75;
}

.hw-net__link--main {
  stroke: #cf0a2c;
  stroke-width: 2.2;
  opacity: 1;
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: hw-flow 2.4s linear infinite;
}

.hw-net__link--edge {
  stroke: #0ea5e9;
  opacity: 0.65;
}

@keyframes hw-flow {
  to {
    stroke-dashoffset: 0;
  }
}

/* 节点 */
.hw-net__node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem;
  padding: 0.35rem 0.4rem;
  border-radius: 10px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  text-align: center;
  z-index: 1;
}

.hw-net__node strong {
  font-size: 0.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.hw-net__node > span:not([class]) {
  font-size: 0.375rem;
  color: #64748b;
  line-height: 1.25;
}

.hw-net__node--gov {
  left: 2%;
  bottom: 8%;
  width: 26%;
  border-color: #cbd5e1;
}

.hw-net__node--carrier {
  left: 28%;
  top: 18%;
  width: 30%;
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff 0%, #fff5f5 100%);
}

.hw-net__node--cloud {
  right: 4%;
  top: 6%;
  width: 28%;
  border-color: #cf0a2c;
  box-shadow: 0 6px 18px rgba(207, 10, 44, 0.15);
}

.hw-net__node--edge {
  right: 8%;
  bottom: 10%;
  width: 24%;
  border-color: #7dd3fc;
  background: linear-gradient(180deg, #fff 0%, #f0f9ff 100%);
}

.hw-net__node-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  margin-bottom: 0.1rem;
}

.hw-net__node-icon--building {
  background: linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%);
  clip-path: polygon(20% 100%, 20% 35%, 50% 10%, 80% 35%, 80% 100%);
}

.hw-net__node-icon--carrier {
  background: linear-gradient(135deg, #f87171, #cf0a2c);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(207, 10, 44, 0.15);
}

.hw-net__node-icon--cloud {
  background: linear-gradient(145deg, #cf0a2c, #9f1239);
  border-radius: 50% 50% 45% 45%;
}

.hw-net__node-icon--chip {
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  clip-path: polygon(10% 25%, 50% 5%, 90% 25%, 90% 75%, 50% 95%, 10% 75%);
}

.hw-net__carriers {
  list-style: none;
  margin: 0.2rem 0 0;
  padding: 0;
  display: flex;
  gap: 0.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hw-net__carriers li {
  font-size: 0.3125rem;
  font-weight: 700;
  padding: 0.08rem 0.28rem;
  border-radius: 3px;
  color: #9f1239;
  background: #ffe4e6;
  border: 1px solid #fecdd3;
}

.hw-net__label {
  position: absolute;
  z-index: 2;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.375rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #fecaca;
  box-shadow: 0 2px 8px rgba(207, 10, 44, 0.12);
}

.hw-net__label span {
  display: block;
  color: #9f1239;
}

.hw-net__label em {
  font-style: normal;
  font-size: 0.4375rem;
  color: #cf0a2c;
  font-weight: 800;
}

.hw-net__label--dedicated {
  left: 38%;
  top: 42%;
  transform: rotate(-8deg);
}

/* 底部指标 */
.hw-net__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;
  padding: 0.4rem 0.5rem 0.45rem;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e2e8f0;
}

.hw-net__metric {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  padding: 0.25rem 0.3rem;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.hw-net__metric--ok {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.hw-net__metric-k {
  font-size: 0.3125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.hw-net__metric-v {
  font-size: 0.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.hw-net__metric--ok .hw-net__metric-v {
  color: #15803d;
}

@media (min-width: 900px) {

  .hw-net__node strong {
    font-size: 0.5625rem;
  }

  .hw-net__metric-v {
    font-size: 0.5625rem;
  }
}

@media (max-width: 420px) {
  .hw-net__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
