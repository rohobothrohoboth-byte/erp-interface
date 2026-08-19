import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { JobGradeListDto } from '@/modules/hr/types/jobgrade';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

interface JobGradeCardProps {
  jobGrade: JobGradeListDto;
  expanded: boolean;
  onToggleExpand: () => void;
  viewMode: 'grid' | 'list';
  onEdit: (jobGrade: JobGradeListDto) => void;
  onDelete: (jobGrade: JobGradeListDto) => void;
}

const JobGradeCard: React.FC<JobGradeCardProps> = ({
  jobGrade,
  viewMode,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null); // New ref for the dropdown menu
  const navigate = useNavigate();

  // Convert salary to display format with ETB after the amount
  const formatSalary = (salary: number): string => {
    const formattedAmount = new Intl.NumberFormat('en-ET', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
    
    return `${formattedAmount} ETB`;
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both menu button and dropdown menu
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
    onEdit(jobGrade);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(jobGrade);
  };

  // Navigate to subgrades page when card is clicked
  const handleCardClick = () => {
    navigate(`/settings/hr/jobgrade/${jobGrade.id}/steps`, {
      state: { jobGrade }
    });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 160 // Adjust based on menu width
      });
    }
    
    setShowMenu(!showMenu);
  };

  // Dropdown menu component using portal
  const DropdownMenu = () => {
    if (!showMenu) return null;

    return createPortal(
      <motion.div
        ref={menuRef} // Add ref to the dropdown menu
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
      <div

        onClick={handleCardClick}
        className={`bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-all relative cursor-pointer ${
          viewMode === 'grid' ? 'p-5' : 'p-4 flex items-start'
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

        {viewMode === 'grid' ? (
          <>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-green-50 mr-4">
                <Briefcase className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-1">
                  {jobGrade.name}
                </h3>
              </div>
            </div>
            
            {/* Salary Information */}
            <div className="space-y-3 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-800 mb-2">Salary Range</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start:</span>
                    <span className="font-semibold">{formatSalary(jobGrade.startSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum:</span>
                    <span className="font-semibold">{formatSalary(jobGrade.maxSalary)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // List View
          <>
            <div className="p-2 rounded-md bg-green-50 mr-4">
              <Briefcase className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-black">
                    {jobGrade.name}
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Start Salary</p>
                  <p className="font-semibold">{formatSalary(jobGrade.startSalary)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Max Salary</p>
                  <p className="font-semibold">{formatSalary(jobGrade.maxSalary)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <DropdownMenu />
    </>
  );
};

export default JobGradeCard;