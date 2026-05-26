import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ProductLayout from "./ProductLayout.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout: ProductLayout,
} satisfies Theme;
