// src/components/file/settings/FileSettingsSection.tsx

import React, { useState } from 'react';
import { Settings, HardDrive, Shield, Bell, Loader2, Save } from 'lucide-react';
import { useFileSettings } from '@/shared/contexts/FileSettingsContext';
import { showToast } from '@/shared/layout/layout';

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
      <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <div className="shrink-0 ml-8">{children}</div>
      </div>
  );
}

function Toggle({
                  checked = false,
                  onChange,
                  disabled = false
                }: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
      <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
      </label>
  );
}

export function FileSettingsSection() {
  const { settings, loading, updateStorage, updatePermissions, updateNotifications, saveAllSettings } = useFileSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when server settings change
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggleChange = (
      section: 'storage' | 'permissions' | 'notifications',
      key: string,
      value: boolean
  ) => {
    if (!localSettings) return;

    setLocalSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
    });
  };

  const handleSave = async () => {
    if (!localSettings) return;
    setIsSaving(true);
    try {
      await saveAllSettings(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
    );
  }

  if (!localSettings) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">No settings available</p>
        </div>
    );
  }

  const { storage, permissions, notifications } = localSettings;

  // Calculate storage percentage
  const usedPercentage = storage.totalSpace > 0
      ? (storage.usedSpace / storage.totalSpace) * 100
      : 0;

  return (
      <div className="space-y-6">
        {/* Storage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Storage</h2>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Used: {(storage.usedSpace / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
              <span>Total: {(storage.totalSpace / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                  className={`h-full rounded-full transition-all duration-500 ${
                      usedPercentage > 90 ? 'bg-red-500' :
                          usedPercentage > 70 ? 'bg-yellow-500' :
                              'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usedPercentage, 100)}%` }}
              />
            </div>
            {usedPercentage > 90 && (
                <p className="text-xs text-red-500 mt-1">⚠️ Storage is almost full. Please free up space.</p>
            )}
          </div>
          <SettingRow
              label="Auto-delete trash"
              description="Automatically delete files in trash after 30 days"
          >
            <Toggle
                checked={storage.autoDeleteTrash}
                onChange={(checked) => handleToggleChange('storage', 'autoDeleteTrash', checked)}
            />
          </SettingRow>
          <SettingRow
              label="Compress uploads"
              description="Automatically compress large files on upload"
          >
            <Toggle
                checked={storage.compressUploads}
                onChange={(checked) => handleToggleChange('storage', 'compressUploads', checked)}
            />
          </SettingRow>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Permissions</h2>
          </div>
          <SettingRow
              label="Allow public sharing"
              description="Let users share files with public links"
          >
            <Toggle
                checked={permissions.allowPublicSharing}
                onChange={(checked) => handleToggleChange('permissions', 'allowPublicSharing', checked)}
            />
          </SettingRow>
          <SettingRow
              label="Require approval for uploads"
              description="New uploads need admin approval before visible"
          >
            <Toggle
                checked={permissions.requireApprovalForUploads}
                onChange={(checked) => handleToggleChange('permissions', 'requireApprovalForUploads', checked)}
            />
          </SettingRow>
          <SettingRow
              label="Restrict file types"
              description="Only allow approved file types to be uploaded"
          >
            <Toggle
                checked={permissions.restrictFileTypes}
                onChange={(checked) => handleToggleChange('permissions', 'restrictFileTypes', checked)}
            />
          </SettingRow>
          {permissions.restrictFileTypes && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Allowed file types:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {permissions.allowedFileTypes?.map((type, index) => (
                      <span key={index} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
                                    .{type}
                                </span>
                  ))}
                </div>
              </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Notifications</h2>
          </div>
          <SettingRow
              label="Upload notifications"
              description="Get notified when files are uploaded"
          >
            <Toggle
                checked={notifications.uploadNotifications}
                onChange={(checked) => handleToggleChange('notifications', 'uploadNotifications', checked)}
            />
          </SettingRow>
          <SettingRow
              label="Share notifications"
              description="Get notified when files are shared with you"
          >
            <Toggle
                checked={notifications.shareNotifications}
                onChange={(checked) => handleToggleChange('notifications', 'shareNotifications', checked)}
            />
          </SettingRow>
          <SettingRow
              label="Folder update notifications"
              description="Get notified when folders are updated"
          >
            <Toggle
                checked={notifications.folderUpdateNotifications || false}
                onChange={(checked) => handleToggleChange('notifications', 'folderUpdateNotifications', checked)}
            />
          </SettingRow>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
            ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
            )}
          </button>
        </div>
      </div>
  );
}