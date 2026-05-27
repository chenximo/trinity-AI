<script setup lang="ts">
defineProps<{
  title: string;
  lines?: string[];
  table?: { headers: string[]; rows: string[][] };
}>();
</script>

<template>
  <aside class="trinity-legal-tbd" role="note">
    <p class="trinity-legal-tbd__badge">待运营确认</p>
    <p class="trinity-legal-tbd__title">{{ title }}</p>
    <ul v-if="lines?.length" class="trinity-legal-tbd__list">
      <li v-for="(line, i) in lines" :key="i">{{ line }}</li>
    </ul>
    <table v-if="table" class="trinity-legal-tbd__table">
      <thead>
        <tr>
          <th v-for="(h, i) in table.headers" :key="i" scope="col">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in table.rows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
    <slot />
  </aside>
</template>
