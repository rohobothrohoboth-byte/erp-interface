import { Upload } from 'lucide-react';
import { UploadZone } from './UploadZone';

export function UploadSection() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Upload Manager</h1>
          <p className="text-sm text-gray-500">Upload and manage your files</p>
        </div>
      </div>
      <UploadZone />
    </div>
  );
}
