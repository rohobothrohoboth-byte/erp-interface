import { getFileTypeConfig } from './fileTypeConfig';
import type { DocumentItem } from '../../types/file/folder.types';

interface FileThumbnailProps {
  doc: DocumentItem;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { wrapper: 'w-10 h-10', icon: 'w-5 h-5', ext: 'text-[9px]' },
  md: { wrapper: 'w-16 h-16', icon: 'w-8 h-8',  ext: 'text-[10px]' },
  lg: { wrapper: 'w-24 h-24', icon: 'w-12 h-12', ext: 'text-xs' },
};

export function FileThumbnail({ doc, size = 'md' }: FileThumbnailProps) {
  const cfg = getFileTypeConfig(doc.contentType, doc.name);
  const s = SIZE_MAP[size];

  // Real image — show actual thumbnail
  if (doc.thumbnailUrl && doc.contentType.startsWith('image/')) {
    return (
      <div className={`${s.wrapper} rounded-lg overflow-hidden shrink-0`}>
        <img src={doc.thumbnailUrl} alt={doc.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  const ext = doc.name.split('.').pop()?.toUpperCase() ?? '';

  return (
    <div className={`${s.wrapper} ${cfg.bgClass} rounded-lg flex flex-col items-center justify-center shrink-0 relative overflow-hidden`}>
      <span className={`${s.icon} ${cfg.iconClass}`}>{cfg.icon}</span>
      {ext && (
        <span className={`absolute bottom-0.5 ${s.ext} font-bold ${cfg.iconClass} opacity-70 leading-none`}>
          {ext}
        </span>
      )}
    </div>
  );
}
