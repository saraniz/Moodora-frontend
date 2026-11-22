import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { PageHeading } from "@/components/layout/PageHeading";
import { ConfirmModal } from "@/components/y2k/Modal";
import { Window } from "@/components/y2k/Window";
import { clearAllData } from "@/lib/clear-data";
import type { Theme } from "@/models";
import { useSettingsStore } from "@/stores/settings-store";
import { notify } from "@/stores/toast-store";
import { useUserStore } from "@/stores/user-store";

function SettingRow(props: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="setting">
      <div>
        <strong>{props.title}</strong>
        <p className="muted">{props.text}</p>
      </div>
      {props.children}
    </div>
  );
}

export function SettingsPage() {
  const [, go] = useLocation();
  const { theme, compact, setTheme, setCompact } = useSettingsStore();
  const signOut = useUserStore((state) => state.signOut);
  const [confirming, setConfirming] = useState(false);

  const clear = async () => {
    try {
      await clearAllData();
      notify("Local data cleared.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not clear saved images.",
      );
    }
  };

  return (
    <div className="narrow">
      <PageHeading
        title="Settings"
        description="How Moodora looks and what it keeps in this browser."
      />
      <Window title="Preferences" slab>
        <SettingRow title="Theme" text="Daylight blue or midnight.">
          <select
            className="field field--auto"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            aria-label="Theme"
          >
            <option value="light">Daylight</option>
            <option value="dark">Midnight</option>
          </select>
        </SettingRow>
        <SettingRow title="Compact projects" text="Smaller cards on the Projects page.">
          <button
            role="switch"
            aria-checked={compact}
            aria-label="Compact projects"
            className="switch"
            onClick={() => setCompact(!compact)}
          >
            <i />
          </button>
        </SettingRow>
        <SettingRow
          title="Local data"
          text="Projects, photos and preferences live in this browser only."
        >
          <button className="btn btn--danger" onClick={() => setConfirming(true)}>
            Clear data
          </button>
        </SettingRow>
        <SettingRow title="Session" text="Your projects stay here after you log out.">
          <button
            className="btn"
            onClick={() => {
              signOut();
              notify("Logged out. Your projects are still here.");
              go("/login");
            }}
          >
            Log out
          </button>
        </SettingRow>
      </Window>
      {confirming && (
        <ConfirmModal
          title="Clear data"
          message="This removes all projects, saved photos, your profile and preferences from this browser. It can't be undone."
          confirmLabel="Clear data"
          onConfirm={() => void clear()}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
