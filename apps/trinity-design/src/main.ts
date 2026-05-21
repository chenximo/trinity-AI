import { createApp } from "vue";
import { installTrinityElementPlus } from "@trinity/element-plus";
import App from "./App.vue";
import router from "./router";
import "@trinity-ai-admin/installAdminStyles";
import "@repo/assets/trinity-base.css";
import "virtual:uno.css";
import "./design-hub.css";
import "./assets/design-tokens-page.css";

const app = createApp(App);
app.use(router);
installTrinityElementPlus(app);
app.mount("#app");
