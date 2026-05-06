import React from 'react';
import { User } from 'lucide-react';
import type { EmpPhotoRes } from '../../types/hr/employee/empPhoto';

interface EmpPhotoProps {
  photo?: EmpPhotoRes | null;
  name?: string;        // used for initials fallback
  size?: number;        // px, default 80
  className?: string;
}

/** Extract up to 2 initials from a name string */
const getInitials = (name?: string): string => {
  if (!name?.trim()) return '';
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
};

/** Safely resolve image source */
const imgSrc = (photo: EmpPhotoRes) => {
  if (!photo?.photo) return '';

  if (photo.photo.startsWith('http')) return photo.photo;
  if (photo.photo.startsWith('data:')) return photo.photo;

  return `data:${photo.contentType};base64,${photo.photo}`;
};

/** Circle Avatar */
export const EmpPhotoCircle: React.FC<EmpPhotoProps> = ({
  photo,
  name,
  size = 32,
  className = '',
}) => {
  const [error, setError] = React.useState(false);
  const dim = `${size}px`;

  const showImage = photo?.photo && !error;
  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {showImage ? (
        <img
          src={imgSrc(photo!)}
          alt={name || photo?.fileName || 'Employee photo'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : initials ? (
        <span
          className="text-emerald-600 font-semibold select-none"
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </span>
      ) : (
        <User
          className="text-green-600"
          style={{ width: size * 0.45, height: size * 0.45 }}
        />
      )}
    </div>
  );
};

/** Rectangle Photo */
export const EmpPhotoRect: React.FC<
  EmpPhotoProps & { width?: number; height?: number }
> = ({
  photo,
  name,
  width = 48,
  height = 60,
  className = '',
}) => {
  const [error, setError] = React.useState(false);

  const showImage = photo?.photo && !error;
  const initials = getInitials(name);

  return (
    <div
      className={`rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0 border border-gray-100 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {showImage ? (
        <img
          src={imgSrc(photo!)}
          alt={name || photo?.fileName || 'Employee photo'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : initials ? (
        <span
          className="text-emerald-600 font-semibold select-none"
          style={{ fontSize: width * 0.28 }}
        >
          {initials}
        </span>
      ) : (
        <User
          className="text-green-600"
          style={{ width: width * 0.35, height: width * 0.35 }}
        />
      )}
    </div>
  );
};