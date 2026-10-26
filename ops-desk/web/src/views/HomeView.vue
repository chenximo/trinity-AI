<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  api,
  type HealthOut,
  type InvoiceQuota,
} from "../api/client";

const router = useRouter();
const loading = ref(true);
const apiOk = ref(false);
const health = ref<HealthOut | null>(null);

const monthKey = new Date().toISOString().slice(0, 7);

const paymentCount = ref(0);
const trinityCount = ref(0);
const invoiceCount = ref(0);
const quota = ref<InvoiceQuota | null>(null);
const ledgerCount = ref(0);
const ledgerUnbilled = ref(0);
const reconCount = ref(0);
const contractCount = ref(0);

function money(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const modules = computed(() => [
  {
    key: "payments",
    title: "出付款申请",
    tag: "付钱给云厂",
    desc: "公司 × 云 × 金额 → 预览 / 打印 / 下载付款申请单",
    metric: `本月 ${paymentCount.value} 笔`,
    path: "/payments",
    action: "进入出单",
  },
  {
    key: "receipts",
    title: "收款",
    tag: "客户付钱给我们",
    desc: "Trinity USD Invoice；国内增值税走开票信息",
    metric: `本月 Trinity ${trinityCount.value} 张`,
    path: "/receipts",
    action: "进入收款",
  },
  {
    key: "invoices",
    title: "开票信息",
    tag: "国内增值税",
    desc: "已开票记录 · 抬头额度；待开票请去消耗台账",
    metric: quota.value
      ? `本月剩余 ¥ ${money(quota.value.remaining)} · ${invoiceCount.value} 笔`
      : `本月 ${invoiceCount.value} 笔`,
    path: "/invoices",
    action: "进入开票",
  },
  {
    key: "contracts",
    title: "合同管理",
    tag: "样板 + 签约状态",
    desc: "样板库 · 客户合同状态 · 与开票抬头对齐 · 留档 AI云业务/合同/",
    metric: contractCount.value ? `${contractCount.value} 份` : "样板库索引",
    path: "/contracts",
    action: "进入合同",
  },
  {
    key: "cloud",
    title: "消耗台账",
    tag: "客户用了多少云",
    desc: "待开票一览 · 按公司/云导出；去开票跳转开票信息",
    metric: `${ledgerCount.value} 行 · 未开票 ${ledgerUnbilled.value}`,
    path: "/cloud",
    action: "进入台账",
  },
  {
    key: "finance",
    title: "财务分类账",
    tag: "收入 / 支出给财务",
    desc: "对齐财务模板：期初·充值·消耗·余额；可改可导出",
    metric: "按月汇总",
    path: "/finance",
    action: "进入财务账",
  },
  {
    key: "recon",
    title: "账单对账",
    tag: "API 聚合",
    desc: "浏览 pricing 账单对账目录（只读索引）",
    metric: reconCount.value ? `${reconCount.value} 项` : "目录索引",
    path: "/recon",
    action: "进入对账",
  },
]);

onMounted(async () => {
  loading.value = true;
  try {
    const [h, ledger, payments, trinity, invoices, q, recon, contracts] = await Promise.all([
      api.health(),
      api.cloudLedger(),
      api.paymentList(monthKey).catch(() => []),
      api.trinityInvoiceList(monthKey).catch(() => []),
      api.invoiceRecords(monthKey).catch(() => []),
      api.invoiceQuota(monthKey).catch(() => null),
      api.reconIndex().catch(() => ({ items: [] as { name: string }[] })),
      api.contractList().catch(() => []),
    ]);
    health.value = h;
    apiOk.value = !!h?.ok;
    ledgerCount.value = ledger.row_count;
    ledgerUnbilled.value = ledger.rows.filter((r) => r.invoice_status === "unbilled").length;
    paymentCount.value = payments.length;
    trinityCount.value = trinity.length;
    invoiceCount.value = invoices.length;
    quota.value = q;
    reconCount.value = recon.items?.length ?? 0;
    contractCount.value = contracts.length;
  } catch (e) {
    apiOk.value = false;
    ElMessage.error(e instanceof Error ? e.message : "后端未就绪，请先启动 api:8787");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-loading="loading" class="home">
    <section class="hero">
      <div class="hero-text">
        <h1>Ops Desk · 运营总览</h1>
        <p class="flow">
          <span>客户付钱</span>
          <em>→</em>
          <span>收款 / 开票</span>
          <em>→</em>
          <span>消耗台账</span>
          <em>→</em>
          <span>付钱给云厂</span>
        </p>
        <p class="sub">独立工具，不接 Admin。本月 {{ monthKey }}</p>
      </div>
      <div class="hero-status">
        <el-tag :type="apiOk ? 'success' : 'danger'" effect="plain" size="large">
          {{ apiOk ? "API 正常" : "API 未连接" }}
        </el-tag>
        <el-tag v-if="quota" type="warning" effect="plain" size="large">
          开票剩余 ¥ {{ money(quota.remaining) }}
        </el-tag>
        <el-tag type="info" effect="plain" size="large">台账 {{ ledgerCount }} 行</el-tag>
      </div>
    </section>

    <el-row :gutter="16">
      <el-col v-for="m in modules" :key="m.key" :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="mod-card" @click="router.push(m.path)">
          <div class="mod-top">
            <div>
              <div class="mod-title">{{ m.title }}</div>
              <el-tag size="small" type="info" class="mod-tag">{{ m.tag }}</el-tag>
            </div>
            <div class="mod-metric">{{ m.metric }}</div>
          </div>
          <p class="mod-desc">{{ m.desc }}</p>
          <el-button type="primary" @click.stop="router.push(m.path)">{{ m.action }}</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home {
  max-width: 1100px;
}
.hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px 22px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.hero h1 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}
.flow {
  margin: 0 0 6px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.flow em {
  margin: 0 6px;
  font-style: normal;
  color: var(--el-text-color-secondary);
}
.sub {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.hero-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.mod-card {
  margin-bottom: 16px;
  cursor: pointer;
  min-height: 168px;
  display: flex;
  flex-direction: column;
}
.mod-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}
.mod-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}
.mod-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}
.mod-tag {
  margin-top: 0;
}
.mod-metric {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
  text-align: right;
  white-space: nowrap;
}
.mod-desc {
  margin: 0 0 16px;
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
