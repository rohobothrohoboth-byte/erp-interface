import { useState, useRef } from 'react';
import { Upload, X, FileText, FileImage, File, CheckCircle2 } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-400" />;
  if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

export function UploadZone() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${Date.now()}`,
      file: f,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
          <Upload className="w-7 h-7" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Drop files here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">PDF, images, documents up to 50 MB</p>
        </div>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-4 px-5 py-3">
              <FileIcon type={f.file.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.file.name}</p>
                <p className="text-xs text-gray-400">{(f.file.size / 1024).toFixed(1)} KB</p>
                {f.status === 'uploading' && (
                  <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                  </div>
                )}
              </div>
              {f.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              <button onClick={() => remove(f.id)} className="p-1 rounded-lg hover:bg-gray-100 shrink-0">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <div className="px-5 py-3 flex justify-end">
            <button className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
