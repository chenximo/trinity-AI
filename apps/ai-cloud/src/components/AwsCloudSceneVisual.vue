<script setup lang="ts">
defineOptions({ name: "AwsCloudSceneVisual" });
</script>

<template>
  <div class="aws-lz" aria-hidden="true">
    <div class="aws-lz__plate">
      <header class="aws-lz__head">
        <span class="aws-lz__head-title">Landing Zone 组织蓝图</span>
        <span class="aws-lz__badge aws-lz__badge--tower">Control Tower</span>
        <span class="aws-lz__badge aws-lz__badge--scp">SCP 护栏</span>
      </header>

      <div class="aws-lz__canvas">
        <svg class="aws-lz__tree-lines" viewBox="0 0 320 140" preserveAspectRatio="none" aria-hidden="true">
          <path class="aws-lz__line" d="M160 28 L160 48" />
          <path class="aws-lz__line" d="M160 48 L56 48 L56 68" />
          <path class="aws-lz__line" d="M160 48 L160 68" />
          <path class="aws-lz__line" d="M160 48 L264 48 L264 68" />
          <path class="aws-lz__line aws-lz__line--work" d="M264 68 L264 82" />
          <path class="aws-lz__line" d="M264 82 L200 82 L200 96" />
          <path class="aws-lz__line" d="M264 82 L264 96" />
          <path class="aws-lz__line" d="M264 82 L328 82 L328 96" />
        </svg>

        <!-- 管理账号 -->
        <div class="aws-lz__node aws-lz__node--mgmt">
          <span class="aws-lz__node-icon aws-lz__node-icon--mgmt" />
          <strong>Management</strong>
          <span>组织根账号</span>
        </div>

        <!-- 三大 OU -->
        <div class="aws-lz__ou-row">
          <div class="aws-lz__node aws-lz__node--ou">
            <strong>Security OU</strong>
            <span>日志 · 审计</span>
          </div>
          <div class="aws-lz__node aws-lz__node--ou">
            <strong>Infrastructure</strong>
            <span>网络 · 共享</span>
          </div>
          <div class="aws-lz__node aws-lz__node--ou aws-lz__node--ou-work">
            <strong>Workloads</strong>
            <span>业务账号池</span>
          </div>
        </div>

        <!-- Workloads 下成员账号 -->
        <div class="aws-lz__accounts">
          <div class="aws-lz__acct aws-lz__acct--prod">
            <span class="aws-lz__acct-dot" />
            <strong>Production</strong>
            <span>12 账户</span>
          </div>
          <div class="aws-lz__acct aws-lz__acct--stg">
            <span class="aws-lz__acct-dot" />
            <strong>Staging</strong>
            <span>6 账户</span>
          </div>
          <div class="aws-lz__acct aws-lz__acct--dev">
            <span class="aws-lz__acct-dot" />
            <strong>Sandbox</strong>
            <span>6 账户</span>
          </div>
        </div>

        <!-- 护栏说明 -->
        <div class="aws-lz__guard">
          <span class="aws-lz__guard-item">CloudTrail 集中</span>
          <span class="aws-lz__guard-item">Config 合规</span>
          <span class="aws-lz__guard-item">跨账号 CUR</span>
        </div>
      </div>

      <footer class="aws-lz__metrics">
        <div class="aws-lz__metric">
          <span class="aws-lz__metric-k">成员账户</span>
          <span class="aws-lz__metric-v">24</span>
        </div>
        <div class="aws-lz__metric">
          <span class="aws-lz__metric-k">SCP 策略</span>
          <span class="aws-lz__metric-v">12 条</span>
        </div>
        <div class="aws-lz__metric">
          <span class="aws-lz__metric-k">合规评分</span>
          <span class="aws-lz__metric-v">98%</span>
        </div>
        <div class="aws-lz__metric aws-lz__metric--accent">
          <span class="aws-lz__metric-k">SP 覆盖率</span>
          <span class="aws-lz__metric-v">76%</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.aws-lz {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.aws-lz__plate {
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

.aws-lz__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.4rem 0.55rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e2e8f0;
}

.aws-lz__head-title {
  flex: 1;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #232f3e;
  text-transform: uppercase;
}

.aws-lz__badge {
  font-size: 0.4375rem;
  font-weight: 700;
  padding: 0.12rem 0.38rem;
  border-radius: 4px;
}

.aws-lz__badge--tower {
  color: #9a3412;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.aws-lz__badge--scp {
  color: #1e3a5f;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.aws-lz__canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 0.35rem 0.4rem 0.2rem;
  padding-top: 0.15rem;
}

.aws-lz__tree-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.aws-lz__line {
  fill: none;
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.aws-lz__line--work {
  stroke: #ff9900;
  stroke-width: 2;
}

/* Management */
.aws-lz__node {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  text-align: center;
  padding: 0.3rem 0.45rem;
  border-radius: 8px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.08);
}

.aws-lz__node strong {
  font-size: 0.5rem;
  font-weight: 700;
  color: #232f3e;
}

.aws-lz__node > span:not([class]) {
  font-size: 0.375rem;
  color: #64748b;
}

.aws-lz__node--mgmt {
  width: 34%;
  margin: 0 auto 0.55rem;
  border-color: #ff9900;
  background: linear-gradient(180deg, #fff 0%, #fff7ed 100%);
  box-shadow: 0 4px 16px rgba(255, 153, 0, 0.18);
}

.aws-lz__node-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-bottom: 0.08rem;
}

.aws-lz__node-icon--mgmt {
  background: linear-gradient(135deg, #232f3e 0%, #37475a 100%);
  border: 2px solid #ff9900;
}

/* OU row */
.aws-lz__ou-row {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.aws-lz__node--ou {
  flex: 1;
  min-width: 0;
  padding: 0.28rem 0.25rem;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.aws-lz__node--ou-work {
  border-color: #fdba74;
  background: linear-gradient(180deg, #fff 0%, #fff7ed 100%);
}

/* Member accounts */
.aws-lz__accounts {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  gap: 0.28rem;
  padding-right: 2%;
  margin-bottom: 0.35rem;
}

.aws-lz__acct {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  padding: 0.28rem 0.32rem;
  min-width: 52px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.aws-lz__acct strong {
  font-size: 0.4375rem;
  font-weight: 700;
  color: #232f3e;
}

.aws-lz__acct > span:not(.aws-lz__acct-dot) {
  font-size: 0.3125rem;
  color: #64748b;
}

.aws-lz__acct-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-bottom: 0.05rem;
}

.aws-lz__acct--prod .aws-lz__acct-dot {
  background: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.aws-lz__acct--stg .aws-lz__acct-dot {
  background: #f59e0b;
}

.aws-lz__acct--dev .aws-lz__acct-dot {
  background: #22c55e;
}

.aws-lz__acct--prod {
  border-color: #fecaca;
}

.aws-lz__acct--stg {
  border-color: #fde68a;
}

.aws-lz__acct--dev {
  border-color: #bbf7d0;
}

/* Guardrails strip */
.aws-lz__guard {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  padding: 0.25rem 0;
}

.aws-lz__guard-item {
  font-size: 0.375rem;
  font-weight: 600;
  padding: 0.12rem 0.38rem;
  border-radius: 999px;
  color: #37475a;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #cbd5e1;
}

/* Metrics */
.aws-lz__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;
  padding: 0.4rem 0.5rem 0.45rem;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #e2e8f0;
}

.aws-lz__metric {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  padding: 0.25rem 0.3rem;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.aws-lz__metric--accent {
  background: #fff7ed;
  border-color: #fed7aa;
}

.aws-lz__metric--accent .aws-lz__metric-v {
  color: #c2410c;
}

.aws-lz__metric-k {
  font-size: 0.3125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.aws-lz__metric-v {
  font-size: 0.5rem;
  font-weight: 700;
  color: #232f3e;
}

@media (min-width: 900px) {

  .aws-lz__node strong {
    font-size: 0.5625rem;
  }

  .aws-lz__metric-v {
    font-size: 0.5625rem;
  }
}

@media (max-width: 420px) {
  .aws-lz__metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .aws-lz__accounts {
    flex-wrap: wrap;
    justify-content: center;
    padding-right: 0;
  }
}
</style>
