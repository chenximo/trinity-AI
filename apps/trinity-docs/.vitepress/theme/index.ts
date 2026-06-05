import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import TrinityLayout from "./TrinityLayout.vue";
import "@repo/assets/trinity-base.css";
import "./trinity-docs.css";

export default {
  extends: DefaultTheme,
  Layout: TrinityLayout,
} satisfies Theme;
