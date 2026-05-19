import { Settings, HardDrive, Shield, Bell } from 'lucide-react';

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

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-10 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
    </label>
  );
}

export function FileSettingsSection() {
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
            <span>Used: 2.4 GB</span>
            <span>Total: 10 GB</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24%' }} />
          </div>
        </div>
        <SettingRow label="Auto-delete trash" description="Automatically delete files in trash after 30 days">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Compress uploads" description="Automatically compress large files on upload">
          <Toggle />
        </SettingRow>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Permissions</h2>
        </div>
        <SettingRow label="Allow public sharing" description="Let users share files with public links">
          <Toggle />
        </SettingRow>
        <SettingRow label="Require approval for uploads" description="New uploads need admin approval before visible">
          <Toggle />
        </SettingRow>
        <SettingRow label="Restrict file types" description="Only allow approved file types to be uploaded">
          <Toggle defaultChecked />
        </SettingRow>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Notifications</h2>
        </div>
        <SettingRow label="Upload notifications" description="Get notified when files are uploaded">
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow label="Share notifications" description="Get notified when files are shared with you">
          <Toggle defaultChecked />
        </SettingRow>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
