import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@repo/assets/trinity-base.css";
import "@trinity/tokens/theme.css";
import "@trinity/ui/styles/auth-signup-modal.css";
import "virtual:uno.css";

createApp(App).use(router).mount("#app");
