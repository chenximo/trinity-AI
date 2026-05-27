<script setup lang="ts">
import type { LegalBlock } from "./types";
import TrinityLegalTbdBlock from "./TrinityLegalTbdBlock.vue";

defineProps<{
  blocks: LegalBlock[];
}>();
</script>

<template>
  <template v-for="(block, i) in blocks" :key="i">
    <p v-if="block.kind === 'p'" class="trinity-legal-p">{{ block.text }}</p>
    <h3 v-else-if="block.kind === 'h3'" class="trinity-legal-h3">{{ block.text }}</h3>
    <ul v-else-if="block.kind === 'ul'" class="trinity-legal-ul">
      <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
    </ul>
    <TrinityLegalTbdBlock
      v-else-if="block.kind === 'tbd'"
      :title="block.title"
      :lines="block.lines"
      :table="block.table"
    />
    <div v-else-if="block.kind === 'table'" class="trinity-legal-table-wrap">
      <table class="trinity-legal-table">
        <thead>
          <tr>
            <th v-for="(h, hi) in block.headers" :key="hi" scope="col">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in block.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>
