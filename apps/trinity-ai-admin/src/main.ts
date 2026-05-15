import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@trinity/tokens/theme.css";
import "@trinity/ui/styles/ui-base.css";
import "./styles/admin-theme.css";
import "./styles/admin-page.css";
import "./styles/admin-buttons.css";
import "virtual:uno.css";

createApp(App).use(router).mount("#app");
