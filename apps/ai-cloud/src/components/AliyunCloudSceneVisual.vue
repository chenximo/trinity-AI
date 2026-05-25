<script setup lang="ts">
defineOptions({ name: "AliyunCloudSceneVisual" });
</script>

<template>
  <div class="aliyun-scene" aria-hidden="true">
    <div class="aliyun-scene__stage">
      <!-- 左侧：云资源 / 协作联系人 -->
      <aside class="aliyun-scene__card aliyun-scene__sidebar">
        <div class="aliyun-scene__sidebar-head">
          <span class="aliyun-scene__dot aliyun-scene__dot--live" />
          <span>资源协作</span>
        </div>
        <ul class="aliyun-scene__contact-list">
          <li class="aliyun-scene__contact is-active">
            <span class="aliyun-scene__avatar aliyun-scene__avatar--ops" />
            <span class="aliyun-scene__contact-meta">
              <strong>运维值班组</strong>
              <span class="aliyun-scene__line aliyun-scene__line--md" />
            </span>
          </li>
          <li class="aliyun-scene__contact">
            <span class="aliyun-scene__avatar aliyun-scene__avatar--ecs" />
            <span class="aliyun-scene__contact-meta">
              <strong>ECS 华东集群</strong>
              <span class="aliyun-scene__badge">12 台扩容中</span>
            </span>
          </li>
          <li class="aliyun-scene__contact">
            <span class="aliyun-scene__avatar aliyun-scene__avatar--rds" />
            <span class="aliyun-scene__contact-meta">
              <strong>PolarDB 主库</strong>
              <span class="aliyun-scene__line aliyun-scene__line--sm" />
            </span>
          </li>
          <li class="aliyun-scene__contact">
            <span class="aliyun-scene__avatar aliyun-scene__avatar--fin" />
            <span class="aliyun-scene__contact-meta">
              <strong>费用中心</strong>
              <span class="aliyun-scene__line aliyun-scene__line--lg" />
            </span>
          </li>
        </ul>
      </aside>

      <!-- 顶部浮层：大促备战成员 -->
      <div class="aliyun-scene__card aliyun-scene__invite">
        <span class="aliyun-scene__invite-label">双 11 备战</span>
        <div class="aliyun-scene__invite-avatars">
          <span class="aliyun-scene__avatar aliyun-scene__avatar--a" />
          <span class="aliyun-scene__avatar aliyun-scene__avatar--b" />
          <span class="aliyun-scene__avatar aliyun-scene__avatar--c" />
          <span class="aliyun-scene__avatar aliyun-scene__avatar--more">+4</span>
        </div>
      </div>

      <!-- 主区：控制台协同对话 -->
      <section class="aliyun-scene__card aliyun-scene__chat">
        <header class="aliyun-scene__chat-head">
          <span class="aliyun-scene__avatar aliyun-scene__avatar--arch" />
          <div class="aliyun-scene__chat-head-text">
            <strong>云架构师 · 李明</strong>
            <span class="aliyun-scene__status">在线 · 阿里云控制台</span>
          </div>
          <span class="aliyun-scene__pill">双 11</span>
        </header>
        <div class="aliyun-scene__chat-body">
          <div class="aliyun-scene__bubble aliyun-scene__bubble--in">
            <span class="aliyun-scene__line aliyun-scene__line--full" />
            <span class="aliyun-scene__line aliyun-scene__line--md" />
          </div>
          <div class="aliyun-scene__bubble aliyun-scene__bubble--out">
            <span class="aliyun-scene__line aliyun-scene__line--lg" />
            <span class="aliyun-scene__line aliyun-scene__line--sm" />
          </div>
          <div class="aliyun-scene__alert-card">
            <span class="aliyun-scene__alert-icon" />
            <div class="aliyun-scene__alert-text">
              <strong>弹性预算预警</strong>
              <span>华东 1 区 ECS 峰值 82%，建议开启自动扩容</span>
            </div>
          </div>
          <div class="aliyun-scene__typing">
            <span /><span /><span />
            <em>正在输入…</em>
          </div>
        </div>
        <footer class="aliyun-scene__chat-foot">
          <span class="aliyun-scene__input">@费用中心 今晚预算池还够吗？</span>
          <button type="button" class="aliyun-scene__send" tabindex="-1" aria-hidden="true">↑</button>
        </footer>
      </section>

      <!-- 右侧：经营看板浮卡 -->
      <aside class="aliyun-scene__card aliyun-scene__dash">
        <div class="aliyun-scene__dash-head">
          <span>成本归因看板</span>
          <span class="aliyun-scene__dash-live">实时</span>
        </div>
        <div class="aliyun-scene__bars">
          <span class="aliyun-scene__bar" style="--h: 42%" />
          <span class="aliyun-scene__bar" style="--h: 68%" />
          <span class="aliyun-scene__bar aliyun-scene__bar--peak" style="--h: 88%" />
          <span class="aliyun-scene__bar" style="--h: 55%" />
          <span class="aliyun-scene__bar" style="--h: 72%" />
        </div>
        <div class="aliyun-scene__dash-foot">
          <span class="aliyun-scene__dash-val">¥ 128.6万</span>
          <span class="aliyun-scene__dash-delta">↓ 12% 同比</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.aliyun-scene {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.aliyun-scene__stage {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0.5rem 0.35rem 0.45rem;
  box-sizing: border-box;
}

.aliyun-scene__card {
  position: absolute;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 106, 0, 0.12);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(255, 106, 0, 0.1),
    0 24px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(8px);
}

/* 左侧联系人 */
.aliyun-scene__sidebar {
  left: 0;
  top: 12%;
  width: 28%;
  min-width: 88px;
  max-width: 118px;
  padding: 0.55rem 0.5rem;
  z-index: 1;
}

.aliyun-scene__sidebar-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.45rem;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #9a3412;
  text-transform: uppercase;
}

.aliyun-scene__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff6a00;
  box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.22);
}

.aliyun-scene__contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.aliyun-scene__contact {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.aliyun-scene__contact.is-active {
  padding: 0.25rem 0.2rem;
  margin: 0 -0.2rem;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 106, 0, 0.12), transparent);
}

.aliyun-scene__contact-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.aliyun-scene__contact-meta strong {
  font-size: 0.5625rem;
  font-weight: 600;
  color: #1c1917;
  line-height: 1.2;
}

.aliyun-scene__badge {
  font-size: 0.5rem;
  font-weight: 600;
  color: #c2410c;
  background: #ffedd5;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  width: fit-content;
}

/* 头像 */
.aliyun-scene__avatar {
  flex-shrink: 0;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
}

.aliyun-scene__avatar--ops {
  width: 26px;
  height: 26px;
  background-image: linear-gradient(135deg, #fdba74 0%, #ea580c 100%);
}

.aliyun-scene__avatar--ecs {
  width: 22px;
  height: 22px;
  background: linear-gradient(145deg, #fed7aa, #f97316);
}

.aliyun-scene__avatar--rds {
  width: 22px;
  height: 22px;
  background: linear-gradient(145deg, #fde68a, #d97706);
}

.aliyun-scene__avatar--fin {
  width: 22px;
  height: 22px;
  background: linear-gradient(145deg, #fecaca, #dc2626);
}

.aliyun-scene__avatar--arch {
  width: 28px;
  height: 28px;
  background-image: linear-gradient(160deg, #78716c 0%, #44403c 100%);
}

.aliyun-scene__avatar--a {
  width: 22px;
  height: 22px;
  margin-left: -6px;
  background: linear-gradient(135deg, #fcd34d, #f59e0b);
}

.aliyun-scene__avatar--b {
  width: 22px;
  height: 22px;
  margin-left: -8px;
  background: linear-gradient(135deg, #fdba74, #ea580c);
}

.aliyun-scene__avatar--c {
  width: 22px;
  height: 22px;
  margin-left: -8px;
  background: linear-gradient(135deg, #a8a29e, #57534e);
}

.aliyun-scene__avatar--more {
  width: 22px;
  height: 22px;
  margin-left: -8px;
  display: grid;
  place-items: center;
  font-size: 0.5rem;
  font-weight: 700;
  color: #9a3412;
  background: #fff7ed;
  border: 1px dashed rgba(255, 106, 0, 0.45);
}

/* 邀请浮层 */
.aliyun-scene__invite {
  left: 22%;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.55rem;
  border-radius: 999px;
}

.aliyun-scene__invite-label {
  font-size: 0.5625rem;
  font-weight: 700;
  color: #c2410c;
  white-space: nowrap;
}

.aliyun-scene__invite-avatars {
  display: flex;
  align-items: center;
}

/* 主聊天区 */
.aliyun-scene__chat {
  left: 24%;
  top: 14%;
  width: 52%;
  min-width: 140px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.aliyun-scene__chat-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.55rem;
  border-bottom: 1px solid rgba(255, 106, 0, 0.1);
  background: linear-gradient(180deg, #fffbf5 0%, #fff 100%);
}

.aliyun-scene__chat-head-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.aliyun-scene__chat-head-text strong {
  font-size: 0.625rem;
  font-weight: 700;
  color: #1c1917;
}

.aliyun-scene__status {
  font-size: 0.5rem;
  color: #78716c;
}

.aliyun-scene__pill {
  font-size: 0.5rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #ff8a1f, #ff6a00);
}

.aliyun-scene__chat-body {
  padding: 0.45rem 0.5rem 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 88px;
}

.aliyun-scene__bubble {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.35rem 0.45rem;
  border-radius: 10px;
  max-width: 88%;
}

.aliyun-scene__bubble--in {
  align-self: flex-start;
  background: #f5f5f4;
}

.aliyun-scene__bubble--out {
  align-self: flex-end;
  background: linear-gradient(135deg, rgba(255, 106, 0, 0.14), rgba(255, 237, 213, 0.9));
  border: 1px solid rgba(255, 106, 0, 0.15);
}

.aliyun-scene__line {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: #d6d3d1;
}

.aliyun-scene__bubble--out .aliyun-scene__line {
  background: rgba(234, 88, 12, 0.25);
}

.aliyun-scene__line--full {
  width: 100%;
}

.aliyun-scene__line--lg {
  width: 82%;
}

.aliyun-scene__line--md {
  width: 68%;
}

.aliyun-scene__line--sm {
  width: 48%;
}

.aliyun-scene__alert-card {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.35rem 0.4rem;
  border-radius: 8px;
  background: #fff7ed;
  border: 1px solid rgba(255, 106, 0, 0.22);
}

.aliyun-scene__alert-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff6a00, #ea580c);
  margin-top: 1px;
}

.aliyun-scene__alert-text {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.aliyun-scene__alert-text strong {
  font-size: 0.5rem;
  font-weight: 700;
  color: #9a3412;
}

.aliyun-scene__alert-text span {
  font-size: 0.4375rem;
  line-height: 1.35;
  color: #78716c;
}

.aliyun-scene__typing {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding-left: 0.15rem;
}

.aliyun-scene__typing span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ff6a00;
  opacity: 0.5;
  animation: aliyun-typing 1.2s ease-in-out infinite;
}

.aliyun-scene__typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.aliyun-scene__typing span:nth-child(3) {
  animation-delay: 0.3s;
}

.aliyun-scene__typing em {
  font-size: 0.4375rem;
  font-style: normal;
  color: #a8a29e;
  margin-left: 0.15rem;
}

@keyframes aliyun-typing {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.aliyun-scene__chat-foot {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.5rem 0.45rem;
  border-top: 1px solid #f5f5f4;
  background: #fafaf9;
}

.aliyun-scene__input {
  flex: 1;
  font-size: 0.5rem;
  color: #57534e;
  padding: 0.3rem 0.45rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e7e5e4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.aliyun-scene__send {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff8a1f, #ff6a00);
  cursor: default;
  flex-shrink: 0;
}

/* 右侧看板 */
.aliyun-scene__dash {
  right: 0;
  top: 18%;
  width: 26%;
  min-width: 72px;
  max-width: 100px;
  padding: 0.45rem 0.4rem;
  z-index: 1;
  background: linear-gradient(165deg, #292524 0%, #1c1917 100%);
  border-color: rgba(255, 106, 0, 0.25);
  box-shadow: 0 16px 40px rgba(28, 25, 23, 0.35);
}

.aliyun-scene__dash-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.5rem;
  font-weight: 600;
  color: #e7e5e4;
}

.aliyun-scene__dash-live {
  font-size: 0.4375rem;
  color: #ff6a00;
  font-weight: 700;
}

.aliyun-scene__bars {
  display: flex;
  align-items: flex-end;
  gap: 0.2rem;
  height: 52px;
  margin-bottom: 0.35rem;
}

.aliyun-scene__bar {
  flex: 1;
  height: var(--h, 50%);
  min-height: 8px;
  border-radius: 3px 3px 1px 1px;
  background: linear-gradient(180deg, #fdba74, #ea580c);
  opacity: 0.75;
}

.aliyun-scene__bar--peak {
  background: linear-gradient(180deg, #ff8a1f, #ff6a00);
  opacity: 1;
  box-shadow: 0 0 12px rgba(255, 106, 0, 0.45);
}

.aliyun-scene__dash-foot {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.aliyun-scene__dash-val {
  font-size: 0.5625rem;
  font-weight: 700;
  color: #fafaf9;
  letter-spacing: -0.02em;
}

.aliyun-scene__dash-delta {
  font-size: 0.4375rem;
  color: #86efac;
  font-weight: 600;
}

@media (min-width: 900px) {
  .aliyun-scene__chat-head-text strong {
    font-size: 0.6875rem;
  }

  .aliyun-scene__alert-text span {
    font-size: 0.5rem;
  }

  .aliyun-scene__input {
    font-size: 0.5625rem;
  }
}
</style>
