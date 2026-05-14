<script setup lang="ts">
import {
  FilterForm1MoreTrigger,
  FilterForm2PillListboxTrigger,
  FilterForm3LabeledSegmented,
  SelectListForm1ModelRow,
  TButton,
  TextLink,
} from "@trinity/ui";
</script>

<template>
  <div class="max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="mb-3 text-sm text-slate-600">
      <code class="text-xs">@trinity/ui</code> 烟测；不承诺路由长期稳定。还原业务页时请用计划文档中的映射表。
    </p>

    <p class="mb-2 text-xs font-semibold text-slate-500">按钮</p>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <TButton>线框</TButton>
      <TButton variant="gradient">主渐变</TButton>
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="关闭（示意）"
      >
        <span aria-hidden="true" class="text-lg leading-none">&times;</span>
      </button>
    </div>
    <p class="mt-3 text-sm text-slate-600">文字链：<TextLink href="#">查看详情</TextLink></p>

    <p class="mb-2 mt-4 text-xs font-semibold text-slate-500">筛选</p>
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-slate-500">形式1</span>
        <FilterForm1MoreTrigger />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-slate-500">形式2</span>
        <FilterForm2PillListboxTrigger>按模型</FilterForm2PillListboxTrigger>
      </div>
      <div>
        <span class="mb-1 block text-xs text-slate-500">形式3（segments）</span>
        <FilterForm3LabeledSegmented
          label="到期"
          :segments="[
            { label: '全部', active: true },
            { label: '过期' },
            { label: '不过期' },
          ]"
        />
      </div>
    </div>

    <p class="mb-2 mt-4 text-xs font-semibold text-slate-500">多选列表 · 形式1（示意一行）</p>
    <div class="orc-model-list max-w-[20rem]" role="group" aria-label="示意：可多选">
      <SelectListForm1ModelRow :selected="true" :active="true">
        <span class="orc-pv orc-pv--google" aria-hidden="true"></span>
        <span class="orc-model-row-name">Gemini 3.1 Flash Lite</span>
        <span class="orc-model-row-fav" aria-hidden="true">★</span>
        <span class="orc-model-row-mark" aria-hidden="true">✓</span>
      </SelectListForm1ModelRow>
    </div>
  </div>
</template>
