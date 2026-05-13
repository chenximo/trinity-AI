import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@repo/assets/trinity-base.css";
import "virtual:uno.css";
import "@trinity-design/design-hub.css";
import "@trinity-design/assets/design-tokens-page.css";

createApp(App).use(router).mount("#app");
