<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Download, Refresh, Select } from "@element-plus/icons-vue";
import {
  api,
  type FinanceLedgerLine,
  type FinanceLedgerLineIn,
  type FinanceLedgerOut,
  type FinanceLedgerTotal,
} from "../api/client";

/** 财务表常填上一自然月 */
function prevMonth() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

const monthKey = ref(prevMonth());
const loading = ref(false);
const saving = ref(false);
const data = ref<FinanceLedgerOut | null>(null);

const incomeCny = ref<FinanceLedgerLine[]>([]);
const incomeUsd = ref<FinanceLedgerLine[]>([]);
const expenseCny = ref<FinanceLedgerLine[]>([]);
const expenseUsd = ref<FinanceLedgerLine[]>([]);
const footnotes = ref<FinanceLedgerLine[]>([]);

function money(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function bal(row: FinanceLedgerLine, withFee: boolean) {
  const has =
    row.opening != null || row.recharge != null || row.consume != null || (withFee && row.fee != null);
  if (!has) return null;
  const fee = withFee ? Number(row.fee || 0) : 0;
  return (
    Math.round(
      (Number(row.opening || 0) + Number(row.recharge || 0) - Number(row.consume || 0) - fee) * 100,
    ) / 100
  );
}

function tot(rows: FinanceLedgerLine[], withFee: boolean): FinanceLedgerTotal {
  const sum = (key: keyof FinanceLedgerLine) => {
    const vals = rows.map((r) => r[key]).filter((v) => typeof v === "number") as number[];
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100;
  };
  const opening = sum("opening");
  const recharge = sum("recharge");
  const consume = sum("consume");
  const fee = withFee ? sum("fee") : null;
  const has = opening != null || recharge != null || consume != null || fee != null;
  return {
    opening,
    recharge,
    consume,
    fee,
    balance: has
      ? Math.round(
          ((opening || 0) + (recharge || 0) - (consume || 0) - (fee || 0)) * 100,
        ) / 100
      : null,
  };
}

const incomeCnyTotal = computed(() => tot(incomeCny.value, true));
const incomeUsdTotal = computed(() => tot(incomeUsd.value, true));
const expenseCnyTotal = computed(() => tot(expenseCny.value, false));
const expenseUsdTotal = computed(() => tot(expenseUsd.value, false));

async function load() {
  loading.value = true;
  try {
    const res = await api.financeLedger(monthKey.value);
    data.value = res;
    incomeCny.value = structuredClone(res.income_cny);
    incomeUsd.value = structuredClone(res.income_usd);
    expenseCny.value = structuredClone(res.expense_cny);
    expenseUsd.value = structuredClone(res.expense_usd);
    footnotes.value = structuredClone(res.footnotes);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

function collectLines(): FinanceLedgerLineIn[] {
  const packs = [incomeCny.value, incomeUsd.value, expenseCny.value, expenseUsd.value, footnotes.value];
  const out: FinanceLedgerLineIn[] = [];
  for (const rows of packs) {
    for (const r of rows) {
      out.push({
        book: r.book,
        party_key: r.party_key,
        party_name: r.party_name,
        opening: r.opening,
        recharge: r.recharge,
        consume: r.consume,
        fee: r.fee,
        remark: r.remark || "",
        sort_order: r.sort_order || 0,
      });
    }
  }
  return out;
}

async function save() {
  saving.value = true;
  try {
    const res = await api.saveFinanceLedger({
      month_key: monthKey.value,
      lines: collectLines(),
    });
    data.value = res;
    incomeCny.value = structuredClone(res.income_cny);
    incomeUsd.value = structuredClone(res.income_usd);
    expenseCny.value = structuredClone(res.expense_cny);
    expenseUsd.value = structuredClone(res.expense_usd);
    footnotes.value = structuredClone(res.footnotes);
    ElMessage.success("已保存（财务口径覆盖已写入库）");
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    saving.value = false;
  }
}

function exportXlsx() {
  window.open(api.financeLedgerExportUrl(monthKey.value), "_blank");
}

watch(monthKey, () => load());
onMounted(load);
</script>

<template>
  <div class="page" v-loading="loading">
    <div class="page-head">
      <div>
        <h2>财务分类账</h2>
        <p class="sub">
          有结算/出付款/Trinity 的自动汇总；期初、客户充值等无来源的先空着，可手工补
        </p>
      </div>
      <div class="head-actions">
        <el-date-picker
          v-model="monthKey"
          type="month"
          value-format="YYYY-MM"
          placeholder="账期"
          style="width: 140px"
        />
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Select" :loading="saving" @click="save">保存</el-button>
        <el-button :icon="Download" @click="exportXlsx">导出 Excel</el-button>
      </div>
    </div>

    <div class="panel">
      <el-alert
        v-if="data?.sources"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 14px"
        title="汇总依据：收入消耗←结算按公司；支出消耗←结算按云厂商；支出充值←出付款用途月；美元←Trinity；星瀚阿里附注←结算。其余空着可手填。"
      />
      <h3>收入分类账 · 人民币</h3>
      <p class="hint">消耗 / 服务费来自客户结算（有数才填）。</p>
      <el-table :data="incomeCny" border stripe class="fin-table">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="party_name" label="公司名称" min-width="200" />
        <el-table-column label="期初余额" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.opening"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="本月充值" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.recharge"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" width="140">
          <template #default="{ row }">
            <el-input-number
              v-model="row.consume"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
            <div class="src" v-if="row.consume_source === 'settlement'">结算</div>
          </template>
        </el-table-column>
        <el-table-column label="服务费" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.fee"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">{{ money(bal(row, true)) }}</template>
        </el-table-column>
        <el-table-column label="备注" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.remark" />
          </template>
        </el-table-column>
      </el-table>
      <p class="total">
        总计：充值 {{ money(incomeCnyTotal.recharge) }} · 消耗 {{ money(incomeCnyTotal.consume) }} ·
        服务费 {{ money(incomeCnyTotal.fee) }} · 余额 {{ money(incomeCnyTotal.balance) }}
      </p>

      <h3 class="mt">收入分类账 · 美元</h3>
      <el-table :data="incomeUsd" border stripe class="fin-table">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="party_name" label="公司名称" min-width="220" />
        <el-table-column label="期初余额" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.opening"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="本月充值" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.recharge"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="AI消耗" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.consume"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
            <div class="src" v-if="row.consume_source === 'trinity'">Trinity</div>
          </template>
        </el-table-column>
        <el-table-column label="服务费" width="110">
          <template #default="{ row }">
            <el-input-number
              v-model="row.fee"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">{{ money(bal(row, true)) }}</template>
        </el-table-column>
        <el-table-column label="备注" min-width="100">
          <template #default="{ row }"><el-input v-model="row.remark" /></template>
        </el-table-column>
      </el-table>
      <p class="total">
        总计：充值 {{ money(incomeUsdTotal.recharge) }} · 消耗 {{ money(incomeUsdTotal.consume) }} ·
        余额 {{ money(incomeUsdTotal.balance) }}
      </p>

      <h3 class="mt">支出分类账 · 人民币</h3>
      <p class="hint">「本月消耗」按云厂商汇总客户结算；「本月充值」来自出付款用途月（有数才填）。</p>
      <el-table :data="expenseCny" border stripe class="fin-table">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="party_name" label="公司名称" min-width="220" />
        <el-table-column label="期初余额" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.opening"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="本月充值" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.recharge"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
            <div class="src" v-if="row.recharge_source === 'payments'">出付款</div>
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" width="168">
          <template #default="{ row }">
            <el-input-number
              v-model="row.consume"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
            <div class="src-row" v-if="row.consume_source === 'settlement'">
              <span class="src">结算·按云</span>
              <el-popover
                v-if="row.consume_detail?.length"
                placement="top"
                :width="280"
                trigger="hover"
                popper-class="fin-detail-pop"
              >
                <template #reference>
                  <el-button type="primary" link class="detail-link">明细</el-button>
                </template>
                <div class="detail-title">本月消耗 · 客户拆分</div>
                <ul class="detail-list">
                  <li v-for="d in row.consume_detail" :key="d.name">
                    <span class="detail-name">{{ d.name }}</span>
                    <span class="detail-amt">{{ money(d.amount) }}</span>
                  </li>
                </ul>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">{{ money(bal(row, false)) }}</template>
        </el-table-column>
        <el-table-column label="备注" min-width="100">
          <template #default="{ row }"><el-input v-model="row.remark" /></template>
        </el-table-column>
      </el-table>
      <p class="total">
        总计：充值 {{ money(expenseCnyTotal.recharge) }} · 消耗 {{ money(expenseCnyTotal.consume) }} ·
        余额 {{ money(expenseCnyTotal.balance) }}
      </p>

      <h3 class="mt">支出分类账 · 美元</h3>
      <el-table :data="expenseUsd" border stripe class="fin-table">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="party_name" label="公司名称" min-width="180" />
        <el-table-column label="期初余额" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.opening"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="本月充值" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.recharge"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num"
            />
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.consume"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">{{ money(bal(row, false)) }}</template>
        </el-table-column>
        <el-table-column label="备注" min-width="100">
          <template #default="{ row }"><el-input v-model="row.remark" /></template>
        </el-table-column>
      </el-table>

      <h3 class="mt">附注 · 星瀚服务器成本</h3>
      <el-table :data="footnotes" border stripe class="fin-table" style="max-width: 720px">
        <el-table-column prop="party_name" label="项" min-width="260" />
        <el-table-column label="金额" width="160">
          <template #default="{ row }">
            <el-input-number
              v-model="row.consume"
              :controls="false"
              :precision="2"
              :value-on-clear="null"
              class="num yellow"
            />
            <div class="src" v-if="row.consume_source === 'settlement'">结算</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="140">
          <template #default="{ row }"><el-input v-model="row.remark" /></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
}
h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 650;
}
.sub {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.panel {
  background: #fff;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px 18px 24px;
}
h3 {
  margin: 0 0 6px;
  font-size: 16px;
}
h3.mt {
  margin-top: 28px;
}
.hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.total {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.fin-table :deep(.el-input-number) {
  width: 100%;
}
.fin-table :deep(.el-input-number .el-input__inner) {
  text-align: right;
}
/* 自动汇总格：主色浅底，对齐 Element / 对账页选中态 */
.num.yellow :deep(.el-input__wrapper) {
  background: var(--el-color-primary-light-9);
}
.src {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.2;
}
.src-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  flex-wrap: wrap;
}
.detail-link {
  height: auto !important;
  padding: 0 !important;
  font-size: 11px !important;
}
</style>

<style>
/* popover 挂到 body，需非 scoped；白底 + 主色描边，贴合平台 */
.fin-detail-pop {
  padding: 10px 12px !important;
  border: 1px solid var(--el-color-primary-light-5) !important;
  background: #fff !important;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.12) !important;
}
.fin-detail-pop .detail-title {
  font-size: 12px;
  font-weight: 650;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}
.fin-detail-pop .detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.fin-detail-pop .detail-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  line-height: 1.7;
  border-bottom: 1px dashed var(--el-border-color-extra-light);
}
.fin-detail-pop .detail-list li:last-child {
  border-bottom: none;
}
.fin-detail-pop .detail-name {
  color: var(--el-text-color-regular);
}
.fin-detail-pop .detail-amt {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>
