import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '../../../../ui/button';
import type { LeaveTypeListDto } from '../../../../../types/core/Settings/leavetype';
import { createPortal } from 'react-dom';

interface LeaveTypeCardProps {
  leaveType: LeaveTypeListDto;
  onEdit: (leaveType: LeaveTypeListDto) => void;
  onDelete: (leaveType: LeaveTypeListDto) => void;
  onToggleStatus?: (leaveType: LeaveTypeListDto) => void;
  onAssign?: (leaveType: LeaveTypeListDto) => void;
  onView?: (leaveType: LeaveTypeListDto) => void;
}

const LeaveTypeCard: React.FC<LeaveTypeCardProps> = ({
                                                       leaveType,
                                                       onEdit,
                                                       onDelete,
                                                       onToggleStatus,
                                                       onAssign,
                                                       onView,
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

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onView) onView(leaveType);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(leaveType);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(leaveType);
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onAssign) onAssign(leaveType);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onToggleStatus) onToggleStatus(leaveType);
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

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Paid': 'bg-emerald-100 text-emerald-700',
      'Unpaid': 'bg-orange-100 text-orange-700',
      'Special': 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (isActive: boolean): string => {
    return isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';
  };

  const getBooleanIcon = (value: boolean) => {
    return value ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
    ) : (
        <XCircle className="h-3.5 w-3.5 text-red-600" />
    );
  };

  const getBooleanColor = (value: boolean): string => {
    return value
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';
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
            className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] py-1"
        >
          {onView && (
              <button
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={handleView}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
          )}
          <button
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          {onAssign && (
              <button
                  className="w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer"
                  onClick={handleAssign}
              >
                <Users className="h-4 w-4 mr-2" />
                Assign to Employees
              </button>
          )}
          {onToggleStatus && (
              <button
                  className={`w-full flex items-center px-3 py-2 text-sm cursor-pointer ${
                      leaveType.isActive
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-green-600 hover:bg-green-50'
                  }`}
                  onClick={handleToggleStatus}
              >
                {leaveType.isActive ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </>
                )}
              </button>
          )}
          <button
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100 mt-1"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative cursor-pointer group"
        >
          {/* More Options Menu Button */}
          <div className="absolute top-3 right-3 z-10">
            <Button
                ref={menuButtonRef}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer rounded-full"
                onClick={handleMenuClick}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Content */}
          <div className="p-5">
            {/* Header with Icon and Name */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">
                  {leaveType.name.charAt(0).toUpperCase()}
                </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                  {leaveType.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(leaveType.leaveCategory)}`}>
                  {leaveType.leaveCategoryStr || leaveType.leaveCategory}
                </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(leaveType.isActive)}`}>
                  {leaveType.isActiveStr}
                </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {getBooleanIcon(leaveType.requiresApproval)}
                  <span className="text-xs text-gray-600">Requires Approval</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {getBooleanIcon(leaveType.allowHalfDay)}
                  <span className="text-xs text-gray-600">Half Day Allowed</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {getBooleanIcon(leaveType.holidaysAsLeave)}
                  <span className="text-xs text-gray-600">Holidays as Leave</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {getBooleanIcon(leaveType.requiresAttachment || false)}
                  <span className="text-xs text-gray-600">Requires Attachment</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Code:</span>
                  <span className="font-mono">{leaveType.code || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Max Days/Year:</span>
                  <span>{leaveType.maxDaysPerYear || 0}</span>
                </div>
              </div>
              {leaveType.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {leaveType.description}
                  </p>
              )}
            </div>
          </div>
        </motion.div>
        <DropdownMenu />
      </>
  );
};

export default LeaveTypeCard;