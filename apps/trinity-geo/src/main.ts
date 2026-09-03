import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@trinity/tokens/theme.css";
import "virtual:uno.css";
/* 控制台样式全局一次加载，避免子页漏引导致走样 */
import "./views/shell/shell.css";
import "./assets/geo-css/vue-bridge.css";

createApp(App).use(router).mount("#app");
