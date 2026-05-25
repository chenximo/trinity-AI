<script setup lang="ts">
import aliyunLogoUrl from "../assets/home/cloud-logos/aliyun.png";
import awsLogoUrl from "../assets/home/cloud-logos/aws.png";
import azureLogoUrl from "../assets/home/cloud-logos/azure.png";
import gcpLogoUrl from "../assets/home/cloud-logos/gcp.png";
import huaweiLogoUrl from "../assets/home/cloud-logos/huawei.png";
import tencentLogoUrl from "../assets/home/cloud-logos/tencent.png";

defineOptions({ name: "CloudVendorLogo" });

defineProps<{
  vendor: "aliyun" | "tencent" | "huawei" | "aws" | "gcp" | "azure";
}>();
</script>

<template>
  <!-- 仅图形、无文字；阿里云等使用官方标识 PNG -->
  <img
    v-if="vendor === 'aliyun'"
    class="cloud-vendor-logo cloud-vendor-logo--aliyun cloud-vendor-logo--img"
    :src="aliyunLogoUrl"
    alt=""
    aria-hidden="true"
    decoding="async"
  />

  <img
    v-else-if="vendor === 'aws'"
    class="cloud-vendor-logo cloud-vendor-logo--aws cloud-vendor-logo--img"
    :src="awsLogoUrl"
    alt=""
    aria-hidden="true"
    decoding="async"
  />

  <img
    v-else-if="vendor === 'gcp'"
    class="cloud-vendor-logo cloud-vendor-logo--gcp cloud-vendor-logo--img"
    :src="gcpLogoUrl"
    alt=""
    aria-hidden="true"
    decoding="async"
  />

  <img
    v-else-if="vendor === 'tencent'"
    class="cloud-vendor-logo cloud-vendor-logo--tencent cloud-vendor-logo--img"
    :src="tencentLogoUrl"
    alt=""
    aria-hidden="true"
    decoding="async"
  />

  <img
    v-else-if="vendor === 'huawei'"
    class="cloud-vendor-logo cloud-vendor-logo--huawei cloud-vendor-logo--img"
    :src="huaweiLogoUrl"
    alt=""
    aria-hidden="true"
    decoding="async"
  />

  <img
    v-else-if="vendor === 'azure'"
    class="cloud-vendor-logo cloud-vendor-logo--azure cloud-vendor-logo--img"
    :src="azureLogoUrl"
    alt=""
    aria-hidden="true"
    decoding="async"
  />
</template>

<style scoped>
.cloud-vendor-logo {
  display: block;
  width: 100%;
  height: 100%;
}

.cloud-vendor-logo--img {
  object-fit: contain;
}

.cloud-vendor-logo--aliyun {
  padding: 8%;
}

.cloud-vendor-logo--tencent {
  padding: 6%;
}

.cloud-vendor-logo--huawei {
  padding: 8%;
}

.cloud-vendor-logo--aws {
  padding: 6%;
}

.cloud-vendor-logo--gcp {
  padding: 8%;
}

.cloud-vendor-logo--azure {
  padding: 10%;
}
</style>
