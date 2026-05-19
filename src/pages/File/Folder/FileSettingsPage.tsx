import { Settings } from 'lucide-react';
import { FileSettingsSection } from '../../../components/file/settings/FileSettingsSection';

export default function FileSettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">File Settings</h1>
          <p className="text-sm text-gray-500">Configure storage, permissions and notifications</p>
        </div>
      </div>
      <FileSettingsSection />
    </div>
  );
}
