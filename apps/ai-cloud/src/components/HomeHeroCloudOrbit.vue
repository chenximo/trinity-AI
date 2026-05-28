<script setup lang="ts">
import CloudVendorLogo from "./CloudVendorLogo.vue";
import TrinityHubMark from "./TrinityHubMark.vue";

defineOptions({ name: "HomeHeroCloudOrbit" });

/** 固定方位 6 枚：从外缘 → 中心汇聚，错峰循环 */
type VendorId = "aliyun" | "tencent" | "huawei" | "aws" | "gcp" | "azure";

const orbitVendors: VendorId[] = ["tencent", "huawei", "aws", "gcp", "azure", "aliyun"];

const convergeDuration = 4.2;
const stepDeg = 360 / orbitVendors.length;
const stagger = convergeDuration / orbitVendors.length;
</script>

<template>
  <div
    class="home-hero-orbit"
    :style="{
      '--converge-dur': `${convergeDuration}s`,
      '--orbit-step': `${stepDeg}deg`,
      '--converge-stagger': `${stagger}s`,
    }"
    aria-hidden="true"
  >
    <div class="home-hero-orbit__plate" aria-hidden="true">
      <div class="home-hero-orbit__glow home-hero-orbit__glow--outer" />
      <div class="home-hero-orbit__glow home-hero-orbit__glow--inner" />
    </div>

    <div class="home-hero-orbit__rings" aria-hidden="true">
      <div class="home-hero-orbit__ring home-hero-orbit__ring--outer" />
      <div class="home-hero-orbit__ring-band" />
      <div class="home-hero-orbit__ring home-hero-orbit__ring--inner" />
    </div>

    <div class="home-hero-orbit__orbit-layer">
      <div
        v-for="(vendor, index) in orbitVendors"
        :key="vendor"
        class="home-hero-orbit__spinner"
        :style="{
          '--orbit-phase': `${index * stepDeg}deg`,
          '--converge-delay': `${index * stagger}s`,
        }"
      >
        <div class="home-hero-orbit__arm">
          <div class="home-hero-orbit__node">
            <span class="home-hero-orbit__trail" aria-hidden="true" />
            <span class="home-hero-orbit__icon">
              <CloudVendorLogo :vendor="vendor" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="home-hero-orbit__hub-wrap">
      <div class="home-hero-orbit__hub-glow" aria-hidden="true" />
      <div class="home-hero-orbit__hub">
        <span class="home-hero-orbit__hub-mark" aria-hidden="true">
          <TrinityHubMark />
        </span>
        <strong class="home-hero-orbit__hub-title">Trinity 云</strong>
        <span class="home-hero-orbit__hub-sub">多云集采中枢</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-hero-orbit {
  --orbit-size: min(92vw, 300px);
  --orbit-r-edge: 128px;
  --orbit-r-core: 52px;
  --hub-size: 7.25rem;
  --icon-size: 2.5rem;
  --ring-outer-inset: 2.5%;
  --ring-inner-inset: 26%;
  --ring-band-inner-hole: 25%;
  --ring-band-outer-edge: 90.5%;
  position: relative;
  width: var(--orbit-size);
  height: var(--orbit-size);
  max-width: 100%;
  margin-inline: auto;
  flex-shrink: 0;
  isolation: isolate;
  border-radius: 50%;
  overflow: visible;
}

@media (min-width: 960px) {
  .home-hero-orbit {
    --orbit-size: 520px;
    --orbit-r-edge: 220px;
    --orbit-r-core: 82px;
    --hub-size: 10.75rem;
    --icon-size: 3.75rem;
  }
}

.home-hero-orbit__plate {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
}

.home-hero-orbit__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.home-hero-orbit__glow--outer {
  width: 108%;
  height: 108%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.28) 0%,
    rgba(79, 70, 229, 0.16) 38%,
    rgba(147, 197, 253, 0.08) 58%,
    transparent 76%
  );
  filter: blur(4px);
  animation: orbit-glow-breathe 6s ease-in-out infinite;
}

.home-hero-orbit__glow--inner {
  width: 78%;
  height: 78%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(241, 245, 255, 0.92) 36%,
    rgba(224, 231, 255, 0.45) 62%,
    transparent 100%
  );
  box-shadow:
    0 0 48px rgba(147, 197, 253, 0.42),
    0 0 96px rgba(99, 102, 241, 0.12);
}

.home-hero-orbit__rings {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.home-hero-orbit__ring {
  position: absolute;
  border-radius: 50%;
  background: transparent;
}

.home-hero-orbit__ring--outer {
  inset: var(--ring-outer-inset);
  border: 2px solid rgba(255, 255, 255, 0.98);
  box-shadow:
    0 0 0 1px rgba(191, 219, 254, 0.55),
    0 0 48px rgba(96, 165, 250, 0.38),
    0 0 80px rgba(99, 102, 241, 0.14),
    0 14px 36px rgba(99, 102, 241, 0.12),
    inset 0 0 40px rgba(255, 255, 255, 0.62);
  animation: orbit-ring-pulse 6s ease-in-out infinite;
}

.home-hero-orbit__ring--inner {
  inset: var(--ring-inner-inset);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 0 32px rgba(147, 197, 253, 0.28),
    inset 0 0 28px rgba(255, 255, 255, 0.55);
  animation: orbit-ring-pulse 6s ease-in-out infinite 0.8s;
}

.home-hero-orbit__ring-band {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 96%;
  height: 96%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow:
    inset 0 32px 72px rgba(15, 23, 42, 0.09),
    inset 0 -22px 52px rgba(59, 130, 246, 0.1),
    inset 0 0 24px rgba(147, 197, 253, 0.08);
  mask: radial-gradient(
    circle,
    transparent var(--ring-band-inner-hole),
    #000 calc(var(--ring-band-inner-hole) + 0.8%),
    #000 var(--ring-band-outer-edge),
    transparent calc(var(--ring-band-outer-edge) + 0.8%)
  );
  -webkit-mask: radial-gradient(
    circle,
    transparent var(--ring-band-inner-hole),
    #000 calc(var(--ring-band-inner-hole) + 0.8%),
    #000 var(--ring-band-outer-edge),
    transparent calc(var(--ring-band-outer-edge) + 0.8%)
  );
}

.home-hero-orbit__orbit-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* 固定方位，不公转，突出径向汇聚 */
.home-hero-orbit__spinner {
  position: absolute;
  inset: 0;
  transform: rotate(var(--orbit-phase, 0deg));
}

.home-hero-orbit__arm {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  animation: orbit-inward var(--converge-dur, 4.2s) cubic-bezier(0.45, 0, 0.75, 0.2) infinite;
  animation-delay: var(--converge-delay, 0s);
  will-change: transform;
}

.home-hero-orbit__node {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
}

.home-hero-orbit__trail {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--icon-size);
  height: var(--icon-size);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  opacity: 0;
  filter: blur(6px);
  pointer-events: none;
  animation: orbit-trail var(--converge-dur, 4.2s) cubic-bezier(0.45, 0, 0.75, 0.2) infinite;
  animation-delay: var(--converge-delay, 0s);
}

.home-hero-orbit__icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: var(--icon-size);
  height: var(--icon-size);
  padding: 0.7rem;
  border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.98);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 10px 28px rgba(99, 102, 241, 0.14);
  animation: orbit-icon-scale var(--converge-dur, 4.2s) cubic-bezier(0.45, 0, 0.75, 0.2) infinite;
  animation-delay: var(--converge-delay, 0s);
  -webkit-font-smoothing: antialiased;
  backface-visibility: hidden;
}

.home-hero-orbit__hub-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
}

.home-hero-orbit__hub-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--hub-size) + 3.5rem);
  height: calc(var(--hub-size) + 3.5rem);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.42) 0%, rgba(96, 165, 250, 0.18) 42%, transparent 70%);
  filter: blur(8px);
  animation: orbit-hub-glow 4s ease-in-out infinite;
  pointer-events: none;
}

.home-hero-orbit__hub {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  width: var(--hub-size);
  height: var(--hub-size);
  padding: 0.35rem 0.5rem 0.4rem;
  border-radius: 50%;
  text-align: center;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 1);
  box-shadow:
    0 2px 8px rgba(15, 23, 42, 0.05),
    0 0 0 1px rgba(191, 219, 254, 0.5),
    0 16px 48px rgba(59, 130, 246, 0.2);
}

.home-hero-orbit__hub-mark {
  display: grid;
  place-items: center;
  width: 2.85rem;
  height: 2.85rem;
  flex-shrink: 0;
}

.home-hero-orbit__hub-title {
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text);
}

.home-hero-orbit__hub-sub {
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--muted-2);
}

/* 外缘出现 → 加速滑向中心 → 贴中枢短暂停留 → 淡出回外缘 */
@keyframes orbit-inward {
  0% {
    transform: translate(-50%, calc(-50% - var(--orbit-r-edge)));
    opacity: 0.25;
  }
  8% {
    transform: translate(-50%, calc(-50% - var(--orbit-r-edge)));
    opacity: 0.92;
  }
  68% {
    transform: translate(-50%, calc(-50% - var(--orbit-r-core)));
    opacity: 1;
  }
  78% {
    transform: translate(-50%, calc(-50% - var(--orbit-r-core)));
    opacity: 0.95;
  }
  86% {
    transform: translate(-50%, calc(-50% - var(--orbit-r-core)));
    opacity: 0.35;
  }
  100% {
    transform: translate(-50%, calc(-50% - var(--orbit-r-edge)));
    opacity: 0;
  }
}

@keyframes orbit-icon-scale {
  0%,
  8% {
    transform: scale(0.92);
    opacity: 0.85;
  }
  18%,
  62% {
    transform: scale(1);
    opacity: 1;
  }
  68%,
  78% {
    transform: scale(1.03);
    opacity: 1;
  }
  86%,
  100% {
    transform: scale(0.9);
    opacity: 0.5;
  }
}

@keyframes orbit-trail {
  0%,
  10%,
  80%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.85);
  }
  22%,
  58% {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(1.15);
  }
  40% {
    opacity: 0.35;
    transform: translate(-50%, -50%) scale(1.35);
  }
}

@keyframes orbit-glow-breathe {
  0%,
  100% {
    opacity: 0.88;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.04);
  }
}

@keyframes orbit-ring-pulse {
  0%,
  100% {
    opacity: 0.82;
  }
  50% {
    opacity: 1;
  }
}

@keyframes orbit-hub-glow {
  0%,
  100% {
    opacity: 0.75;
    transform: translate(-50%, -50%) scale(0.96);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.06);
  }
}

@media (max-width: 959px) {
  .home-hero-orbit {
    --orbit-size: 360px;
    --orbit-r-edge: 150px;
    --orbit-r-core: 56px;
    --hub-size: 8.75rem;
    --icon-size: 3.125rem;
    --ring-outer-inset: 3%;
    --ring-inner-inset: 28%;
    --ring-band-inner-hole: 27%;
    --ring-band-outer-edge: 90%;
  }

  .home-hero-orbit__hub-mark {
    width: 2.35rem;
    height: 2.35rem;
  }

  .home-hero-orbit__hub-title {
    font-size: 0.94rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero-orbit__arm,
  .home-hero-orbit__icon,
  .home-hero-orbit__trail,
  .home-hero-orbit__glow--outer,
  .home-hero-orbit__ring--outer,
  .home-hero-orbit__ring--inner,
  .home-hero-orbit__hub-glow {
    animation: none !important;
  }

  .home-hero-orbit__arm {
    transform: translate(-50%, calc(-50% - var(--orbit-r-edge))) !important;
    opacity: 1 !important;
  }

  .home-hero-orbit__icon {
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
