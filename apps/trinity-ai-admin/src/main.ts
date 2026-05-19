import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { installTrinityAdminUi } from "./installAdminUi";
import "@trinity/tokens/theme.css";
import "virtual:uno.css";

const app = createApp(App);
app.use(router);
installTrinityAdminUi(app);
app.mount("#app");
