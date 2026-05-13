import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@repo/assets/trinity-base.css";
import "virtual:uno.css";

createApp(App).use(router).mount("#app");
