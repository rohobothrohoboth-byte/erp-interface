import React, { createContext, useContext, useMemo, useState } from 'react';

type FileSettings = Record<string, unknown>;

type FileSettingsContextValue = {
  settings: FileSettings;
  setSettings: React.Dispatch<React.SetStateAction<FileSettings>>;
  loading: boolean;
  saveSettings: () => Promise<void>;
};

const FileSettingsContext = createContext<FileSettingsContextValue | null>(null);

export function FileSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FileSettings>({});
  const [loading] = useState(false);
  const value = useMemo(
    () => ({
      settings,
      setSettings,
      loading,
      saveSettings: async () => undefined,
    }),
    [settings, loading],
  );
  return <FileSettingsContext.Provider value={value}>{children}</FileSettingsContext.Provider>;
}

export function useFileSettings() {
  const ctx = useContext(FileSettingsContext);
  if (!ctx) {
    throw new Error('useFileSettings must be used within FileSettingsProvider');
  }
  return ctx;
}
