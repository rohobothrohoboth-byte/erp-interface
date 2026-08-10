import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { LeavePolicyListDto } from '@/modules/core/types/Settings/leavepolicy';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

interface LeavePolicyCardProps {
  leavePolicy: LeavePolicyListDto;
  viewMode: 'grid' | 'list';
  onEdit: (leavePolicy: LeavePolicyListDto) => void;
  onDelete: (leavePolicy: LeavePolicyListDto) => void;
}

const LeavePolicyCard: React.FC<LeavePolicyCardProps> = ({
  leavePolicy,
  viewMode,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideMenuButton = menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node);
      const isOutsideMenu = menuRef.current &&
        !menuRef.current.contains(event.target as Node);

      if (isOutsideMenuButton && isOutsideMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(leavePolicy);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(leavePolicy);
  };

  const handleCardClick = () => {
    navigate(`/settings/hr/annualleave/${leavePolicy.id}/policy`, {
      state: { leavePolicy }
    });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 160
      });
    }

    setShowMenu(!showMenu);
  };

  // Dropdown menu component using portal
  const DropdownMenu = () => {
    if (!showMenu) return null;

    return createPortal(
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        style={{
          position: 'absolute',
          top: menuPosition.top,
          left: menuPosition.left,
        }}
        className="fixed w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] py-1"
      >
        <button
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </button>
        <button
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
      </motion.div>,
      document.body
    );
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        className={`bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-all relative cursor-pointer group ${viewMode === 'grid' ? 'p-6' : 'p-5 flex items-start'
          }`}
      >
        {/* More Options Menu Button */}
        <div className="absolute top-3 right-3">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer relative z-10"
            onClick={handleMenuClick}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Click Indicator */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="h-4 w-4 text-green-600" />
        </div>

        {viewMode === 'grid' ? (
          // Grid View
          <>
            <div className="flex items-center mb-4">

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                  {leavePolicy.name}
                </h3>
                <p className="text-sm text-gray-600">{leavePolicy.leaveType}</p>
              </div>
            </div>

            {/* Click Hint */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center group-hover:text-green-600 transition-colors">
                Click to view policy details
              </p>
            </div>
          </>
        ) : (

          <>

          </>
        )}
      </motion.div>

      <DropdownMenu />
    </>
  );
};

export default LeavePolicyCard;