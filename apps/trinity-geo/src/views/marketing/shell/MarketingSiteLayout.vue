<script setup lang="ts">
import { RouterView } from "vue-router";
import { useGeoSiteBodyClass } from "../../home/homeInteractions";
import MarketingSiteFooter from "./MarketingSiteFooter.vue";
import MarketingSiteHeader from "./MarketingSiteHeader.vue";
import "./marketing-site-shell.css";

useGeoSiteBodyClass();
</script>

<template>
  <a class="skip" href="#main">跳转至正文</a>
  <MarketingSiteHeader />
  <RouterView />
  <MarketingSiteFooter />
</template>
