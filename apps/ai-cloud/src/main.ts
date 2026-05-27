import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@repo/assets/trinity-base.css";
import "@trinity/tokens/theme.css";
import "virtual:uno.css";
import "@trinity/ui/styles/trinity-shell-chrome.css";

createApp(App).use(router).mount("#app");
