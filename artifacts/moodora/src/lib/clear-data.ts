import { useAestheticStore } from "@/stores/aesthetic-store";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useUserStore } from "@/stores/user-store";
import { clearLocalAssets } from "./local-assets";
import { clearMoodoraStorage } from "./storage";

/** Removes everything Moodora saved in this browser. */
export async function clearAllData() {
  await clearLocalAssets();
  clearMoodoraStorage();
  useProjectStore.getState().resetProjects();
  useAestheticStore.getState().resetAesthetics();
  useSettingsStore.getState().resetSettings();
  useUserStore.getState().resetUser();
}
