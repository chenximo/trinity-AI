import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import TrinityLayout from "./TrinityLayout.vue";
import FaqItem from "./components/FaqItem.vue";
import FaqSection from "./components/FaqSection.vue";
import "@repo/assets/trinity-base.css";
import "./trinity-docs.css";

export default {
  extends: DefaultTheme,
  Layout: TrinityLayout,
  enhanceApp({ app }) {
    app.component("FaqSection", FaqSection);
    app.component("FaqItem", FaqItem);
  },
} satisfies Theme;
