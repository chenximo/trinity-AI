import { reactive } from "vue";
import { NOTIFY_ITEMS } from "./mock";

export function useSettingsNotificationsInteractions() {
  const toggles = reactive<Record<string, boolean>>(
    Object.fromEntries(NOTIFY_ITEMS.map((item) => [item.id, item.defaultEnabled])),
  );

  return { toggles };
}
