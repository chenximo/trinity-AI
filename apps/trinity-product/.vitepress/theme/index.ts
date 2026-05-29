import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ApiAcceptanceConsole from "./ApiAcceptanceConsole.vue";
import ApiInternalDocViewer from "./ApiInternalDocViewer.vue";
import ProductLayout from "./ProductLayout.vue";
import "./custom.css";
import "./api-validation-report.css";

export default {
  extends: DefaultTheme,
  Layout: ProductLayout,
  enhanceApp({ app }) {
    app.component("ApiAcceptanceConsole", ApiAcceptanceConsole);
    app.component("ApiInternalDocViewer", ApiInternalDocViewer);
  },
} satisfies Theme;
