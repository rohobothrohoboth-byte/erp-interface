import React, { useState, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MoreVertical, Edit, Trash2, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { JgStepListDto } from '../../../../types/hr/JgStep';
import { createPortal } from 'react-dom';

interface StepCardProps {
  step: JgStepListDto;
  index: number;
  totalSteps: number;
  onEdit: (step: JgStepListDto) => void;
  onDelete: (step: JgStepListDto) => void;
  isDeleting: boolean;
  viewMode: 'grid' | 'list';
}

// ✅ Map salary pay frequency abbreviations to full labels
const getPayFrequencyLabel = (freq: string): string => {
  if (!freq) return 'Monthly';
  const map: Record<string, string> = {
    'Mthly': 'Monthly',
    'BiWkly': 'Bi-Weekly',
    'Wkly': 'Weekly',
    'Hrly': 'Hourly',
    'Annl': 'Annually',
    'Monthly': 'Monthly',
    'BiWeekly': 'Bi-Weekly',
    'Weekly': 'Weekly',
    'Hourly': 'Hourly',
    'Annually': 'Annually',
  };
  return map[freq] || freq;
};

// ✅ Safe number formatter
const formatSalary = (salary: number | string | undefined): string => {
  // Convert to number safely
  const numSalary = typeof salary === 'string' ? parseFloat(salary) : salary;

  // Check if it's a valid number
  if (numSalary === undefined || numSalary === null || isNaN(numSalary)) {
    return '0';
  }

  try {
    const formattedAmount = new Intl.NumberFormat('en-ET', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numSalary);

    return formattedAmount;
  } catch (error) {
    return '0';
  }
};

const StepCard: React.FC<StepCardProps> = memo(({
                                                  step,
                                                  index,
                                                  onEdit,
                                                  onDelete,
                                                  viewMode
                                                }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
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

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(step);
  }, [onEdit, step]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(step);
  }, [onDelete, step]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 160
      });
    }

    setShowMenu(prev => !prev);
  }, []);

  // Memoized color getter
  const getStepColor = useCallback((index: number) => {
    const colors = [
      { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-500 to-blue-600' },
      { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100', gradient: 'from-green-500 to-green-600' },
      { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100', gradient: 'from-purple-500 to-purple-600' },
      { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100', gradient: 'from-orange-500 to-orange-600' },
      { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100', gradient: 'from-indigo-500 to-indigo-600' },
      { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-100', gradient: 'from-pink-500 to-pink-600' },
    ];
    return colors[index % colors.length];
  }, []);

  const stepColor = getStepColor(index);

  // ✅ Safe salary formatting
  const formattedSalary = formatSalary(step.salary);
  const payFreqLabel = getPayFrequencyLabel(step.salaryPayFreq);
  const currency = step.currency || 'ETB';
  const stepName = step.name || 'Unnamed Step';
  const jobGrade = step.jobGrade || '';

  // Dropdown menu component using portal
  const DropdownMenu = useCallback(() => {
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
  }, [showMenu, menuPosition, handleEdit, handleDelete]);

  // List View
  if (viewMode === 'list') {
    return (
        <>
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white border ${stepColor.border} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-200 relative p-4`}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`p-2 rounded-full ${stepColor.bg} mr-4`}>
                  <TrendingUp className={stepColor.icon} size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {stepName}
                  </h3>
                  {jobGrade && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {jobGrade}
                      </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 mr-8">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formattedSalary}
                  </p>
                  <p className="text-xs text-gray-500">Salary</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {currency}
                  </p>
                  <p className="text-xs text-gray-500">Currency</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {payFreqLabel}
                  </p>
                  <p className="text-xs text-gray-500">Frequency</p>
                </div>
              </div>
            </div>
          </motion.div>
          <DropdownMenu />
        </>
    );
  }

  // Grid View
  return (
      <>
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-white border ${stepColor.border} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-200 relative p-6`}
        >
          {/* More Options Menu Button */}
          <div className="absolute top-4 right-4">
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

          <div className="flex flex-col">
            {/* Top section: Icon and Name */}
            <div className="flex items-start mb-4">
              <div className={`p-3 rounded-full ${stepColor.bg} mr-4 flex-shrink-0`}>
                <TrendingUp className={stepColor.icon} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {stepName}
                </h3>
                {jobGrade && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{jobGrade}</span>
                    </p>
                )}
              </div>
            </div>

            {/* Bottom section: All details in a grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {formattedSalary}
                </p>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Salary
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {currency}
                </p>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <span className="font-mono">$</span>
                  Currency
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {payFreqLabel}
                </p>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Frequency
                </p>
              </div>
            </div>

            {/* Progress indicator showing step position */}
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Step {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <div className={`h-1 w-12 rounded-full bg-gray-200 overflow-hidden`}>
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${stepColor.gradient}`}
                        style={{ width: `${((index + 1) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <DropdownMenu />
      </>
  );
});

StepCard.displayName = 'StepCard';

export default StepCard;