import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PaletteMode } from "@mui/material";

export const USER_PREFERENCES_STORAGE_KEY = "supportflow_user_preferences";

export type NotificationPreferenceKey =
  | "assignments"
  | "comments"
  | "statusChanges"
  | "mentions"
  | "knowledgeBase"
  | "userLifecycle";

export type UserPreferences = {
  themeMode: PaletteMode;
  locale: string;
  defaultProjectId: number | null;
  recentSearches: string[];
  notificationPreferences: Record<NotificationPreferenceKey, boolean>;
  calendar: {
    dayStartHour: number;
    dayEndHour: number;
  };
};

type PreferencesContextValue = {
  preferences: UserPreferences;
  updatePreferences: (value: Partial<UserPreferences>) => void;
  updateNotificationPreference: (key: NotificationPreferenceKey, enabled: boolean) => void;
  addRecentSearch: (value: string) => void;
  clearRecentSearches: () => void;
};

const defaultPreferences: UserPreferences = {
  themeMode: "light",
  locale: "en-IN",
  defaultProjectId: null,
  recentSearches: [],
  notificationPreferences: {
    assignments: true,
    comments: true,
    statusChanges: true,
    mentions: true,
    knowledgeBase: true,
    userLifecycle: false,
  },
  calendar: {
    dayStartHour: 8,
    dayEndHour: 18,
  },
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

function loadPreferences(): UserPreferences {
  const raw = window.localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...defaultPreferences,
      ...parsed,
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches.slice(0, 8) : [],
      notificationPreferences: {
        ...defaultPreferences.notificationPreferences,
        ...(parsed.notificationPreferences ?? {}),
      },
      calendar: {
        ...defaultPreferences.calendar,
        ...(parsed.calendar ?? {}),
      },
    };
  } catch {
    window.localStorage.removeItem(USER_PREFERENCES_STORAGE_KEY);
    return defaultPreferences;
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());

  useEffect(() => {
    window.localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    updatePreferences: (nextValue) => {
      setPreferences((current) => ({
        ...current,
        ...nextValue,
        notificationPreferences: nextValue.notificationPreferences
          ? { ...current.notificationPreferences, ...nextValue.notificationPreferences }
          : current.notificationPreferences,
        calendar: nextValue.calendar ? { ...current.calendar, ...nextValue.calendar } : current.calendar,
      }));
    },
    updateNotificationPreference: (key, enabled) => {
      setPreferences((current) => ({
        ...current,
        notificationPreferences: {
          ...current.notificationPreferences,
          [key]: enabled,
        },
      }));
    },
    addRecentSearch: (value) => {
      const normalized = value.trim();
      if (!normalized) {
        return;
      }

      setPreferences((current) => ({
        ...current,
        recentSearches: [
          normalized,
          ...current.recentSearches.filter((entry) => entry.toLowerCase() !== normalized.toLowerCase()),
        ].slice(0, 8),
      }));
    },
    clearRecentSearches: () => {
      setPreferences((current) => ({ ...current, recentSearches: [] }));
    },
  }), [preferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
