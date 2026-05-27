import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@repo/assets/trinity-base.css";
import "virtual:uno.css";
import "@trinity/ui/styles/trinity-shell-chrome.css";

const app = createApp(App);
app.use(router);
void router.isReady().then(() => {
  app.mount("#app");
});
