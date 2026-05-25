<script setup lang="ts">
defineOptions({ name: "CloudVendorLogo" });

defineProps<{
  vendor: "aliyun" | "tencent" | "huawei" | "aws" | "gcp" | "azure";
}>();
</script>

<template>
  <!-- 仅图形、无文字；造型参考用户提供的云厂商标识样张 -->
  <svg
    v-if="vendor === 'aliyun'"
    class="cloud-vendor-logo cloud-vendor-logo--aliyun"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 阿里云官方图形标：左右括号 + 中横 #FF6A00（与用户提供的标识一致） -->
    <path
      fill="#FF6A00"
      d="M5 5.2h3.4v2H6.9v9.6h1.5v2H5V5.2z"
    />
    <path
      fill="#FF6A00"
      d="M19 5.2h-3.4v2h1.5v9.6h-1.5v2H19V5.2z"
    />
    <path fill="#FF6A00" d="M10.1 11h3.8v2H10.1V11z" />
  </svg>

  <svg
    v-else-if="vendor === 'aws'"
    class="cloud-vendor-logo"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <text
      x="24"
      y="21"
      text-anchor="middle"
      fill="#232F3E"
      font-family="system-ui, -apple-system, Segoe UI, sans-serif"
      font-size="13"
      font-weight="700"
      letter-spacing="-0.04em"
    >
      aws
    </text>
    <path
      fill="#FF9900"
      d="M12.5 25.2c4.8 2.2 10.7 2.2 15.5 0-.4.5-.9.9-1.4 1.2-3.6 1.6-7.8 1.6-11.4 0-.5-.3-1-.6-1.4-1z"
    />
  </svg>

  <svg
    v-else-if="vendor === 'gcp'"
    class="cloud-vendor-logo"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fill="#EA4335" d="M30 20.5a6.5 6.5 0 0 0-1-3.6l-7.2 4.2c.4 1 .7 2.1.7 3.2 0 1.1-.2 2.2-.7 3.2l7.2 4.2c.6-1.1 1-2.3 1-3.6z" />
    <path fill="#4285F4" d="M24 13.5c-3.7 0-6.9 2-8.6 5l7.2 4.2c.9-1.6 2.6-2.6 4.6-2.6 1.4 0 2.6.5 3.6 1.3l5.5-5.5C29.6 14.8 27 13.5 24 13.5z" />
    <path fill="#34A853" d="M14.8 28.2c-.5-1.2-.8-2.4-.8-3.7s.3-2.5.8-3.7l-7.2-4.2c-.8 2-1.2 4.1-1.2 6.4s.4 4.4 1.2 6.4l7.2-4.2z" />
    <path fill="#FBBC05" d="M24 34.5c2.7 0 5.2-1 7.1-2.8l-5.5-5.5c-1 .8-2.2 1.3-3.6 1.3-2 0-3.7-1-4.6-2.6l-7.2 4.2c1.9 3.2 5.4 5.4 9.4 5.4z" />
    <circle cx="32.5" cy="17" r="4.8" fill="#EA4335" />
  </svg>

  <svg
    v-else-if="vendor === 'tencent'"
    class="cloud-vendor-logo"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fill="#00A4FF"
      d="M17 30c-7-3-8-12-1-16 4-2.5 9-2 12.5 1.5 1.2 2.5 3.2 2.8 5.2-3.5-1.2-7.5.5-9 3.8-1.5 3.3.2 7.2 3.5 9 2.2 1.2 4.8 1.5 7.2.8"
    />
    <path
      fill="#006EFF"
      d="M31 30c7-3 8-12 1-16-4-2.5-9-2-12.5 1.5-1.2-2.5-3.2-2.8-5.2 3.5-1.2 7.5.5 9 3.8 1.5 3.3-.2 7.2-3.5 9-2.2 1.2-4.8 1.5-7.2.8"
    />
  </svg>

  <svg
    v-else-if="vendor === 'huawei'"
    class="cloud-vendor-logo"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fill="#E60012"
      d="M24 7.5l3.1 9.5h10l-8.1 5.9 3.1 9.5L24 26.4l-8.1 5.9 3.1-9.5-8.1-5.9h10L24 7.5z"
    />
  </svg>

  <svg
    v-else
    class="cloud-vendor-logo"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fill="#0078D4" d="M7.5 37 24 9l16.5 28H7.5zm16.2-23.8L14.2 33h19.6L23.7 13.2z" />
  </svg>
</template>

<style scoped>
.cloud-vendor-logo {
  display: block;
  width: 100%;
  height: 100%;
}

.cloud-vendor-logo--aliyun {
  padding: 8%;
}
</style>
