import React from 'react';
import { User } from 'lucide-react';
import type { EmpPhotoRes } from '../../types/hr/employee/empPhoto';

interface EmpPhotoProps {
  photo?: EmpPhotoRes | null;
  size?: number;        // px, default 80
  className?: string;
}

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
  size = 32,
  className = '',
}) => {
  const [error, setError] = React.useState(false);
  const dim = `${size}px`;

  const showImage = photo?.photo && !error;

  return (
    <div
      className={`rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {showImage ? (
        <img
          src={imgSrc(photo!)}
          alt={photo?.fileName || 'Employee photo'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
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
  width = 48, // 80 X 100 for medium
  height = 60,
  className = '',
}) => {
  const [error, setError] = React.useState(false);

  const showImage = photo?.photo && !error;

  return (
    <div
      className={`rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0 border border-gray-100 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {showImage ? (
        <img
          src={imgSrc(photo!)}
          alt={photo?.fileName || 'Employee photo'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <User
          className="text-green-600"
          style={{ width: width * 0.35, height: width * 0.35 }}
        />
      )}
    </div>
  );
};