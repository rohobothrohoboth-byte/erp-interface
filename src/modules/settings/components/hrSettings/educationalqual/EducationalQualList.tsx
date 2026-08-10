import { motion } from 'framer-motion';
import { GraduationCap, Trash2, MoreVertical, PenBox } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useRef, useState, useEffect } from 'react';
import type { EducationQualListDto } from '@/modules/hr/types/educationalqual';

interface EducationalQualListProps {
  educationalQuals: EducationQualListDto[];
  onEdit?: (qual: EducationQualListDto) => void;
  onDelete?: (qual: EducationQualListDto) => void;
}

const EducationalQualList: React.FC<EducationalQualListProps> = ({
  educationalQuals,
  onEdit,
  onDelete,
}) => {
  if (educationalQuals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No Educational Qualifications
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Get started by adding your first educational qualification to the system.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {educationalQuals.map((qual, index) => (
          <EducationalQualCard
            key={qual.id}
            qual={qual}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </motion.div>
  );
};

interface EducationalQualCardProps {
  qual: EducationQualListDto;
  index: number;
  onEdit?: (qual: EducationQualListDto) => void;
  onDelete?: (qual: EducationQualListDto) => void;
}

const EducationalQualCard: React.FC<EducationalQualCardProps> = ({
  qual,
  index,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(qual);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.(qual);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <GraduationCap className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
              {qual.name}
            </h3>
          </div>
        </div>
        
        <div className="absolute top-3 right-3" ref={menuRef}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            onClick={handleMenuClick}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"
            >
              <button
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={handleEdit}
              >
                <PenBox className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created: {new Date(qual.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};

export default EducationalQualList;