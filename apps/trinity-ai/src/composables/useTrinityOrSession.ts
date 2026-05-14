import { onMounted, ref } from "vue";

const STORAGE_SESSION = "trinity_or_session";

/** 与壳脚本 `STORAGE_SESSION` / `isLoggedIn` / `setLoggedIn` 对齐（演示用 localStorage） */
export function useTrinityOrSession() {
  const isSignedIn = ref(false);

  function read() {
    try {
      return localStorage.getItem(STORAGE_SESSION) === "1";
    } catch {
      return false;
    }
  }

  function setSignedIn(v: boolean) {
    isSignedIn.value = v;
    try {
      if (v) localStorage.setItem(STORAGE_SESSION, "1");
      else localStorage.removeItem(STORAGE_SESSION);
    } catch {
      /* ignore */
    }
  }

  onMounted(() => {
    isSignedIn.value = read();
  });

  return { isSignedIn, setSignedIn };
}
