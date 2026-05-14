import { AlertCircle, Loader2 } from 'lucide-react';

export const DetailSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-1/3 mb-5" />
    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
      {Array.from({ length: rows * 2 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export const DetailError = ({ message }: { message: string }) => (
  <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 flex items-center gap-3 text-red-600">
    <AlertCircle className="w-5 h-5 shrink-0" />
    <p className="text-sm">{message}</p>
  </div>
);

export const InlineLoader = () => (
  <div className="flex items-center justify-center py-10">
    <Loader2 className="w-6 h-6 animate-spin text-green-500" />
  </div>
);

