import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@repo/assets/trinity-base.css";
import "virtual:uno.css";
import "./design-hub.css";
import "./assets/design-tokens-page.css";

createApp(App).use(router).mount("#app");
