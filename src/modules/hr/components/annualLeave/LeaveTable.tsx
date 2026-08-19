import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  PenBox,
  Trash2
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import type { LeaveRequestListDto } from '@/modules/hr/types/leaverequest';
import type { UUID } from 'crypto';

interface LeaveTableProps {
  leaves: LeaveRequestListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLeaveEdit: (leave: LeaveRequestListDto) => void;
  onLeaveDelete: (leave: LeaveRequestListDto) => void; // Changed from (leaveId: UUID)
  loading?: boolean;
}

// Helper function to convert isHalfDay display value to boolean
const getIsHalfDayBoolean = (isHalfDayValue: any): boolean => {
  if (typeof isHalfDayValue === 'boolean') {
    return isHalfDayValue;
  }
  
  if (typeof isHalfDayValue === 'string') {
    const str = isHalfDayValue.toLowerCase();
    return str === 'yes' || str === 'true' || str === 'half day' || str === '1';
  }
  
  return false;
};

// Helper function to get display text for half day
const getHalfDayDisplayText = (isHalfDayValue: any): string => {
  const isHalfDay = getIsHalfDayBoolean(isHalfDayValue);
  return isHalfDay ? 'Half Day' : 'Full Day';
};

const LeaveTable: React.FC<LeaveTableProps> = ({
  leaves,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onLeaveEdit,
  onLeaveDelete,
  loading = false
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const sortedLeaves = [...leaves].sort((a, b) => {
    const dateA = new Date(a.dateRequested);
    const dateB = new Date(b.dateRequested);
    return dateB.getTime() - dateA.getTime();
  });

  const handleEdit = (leave: LeaveRequestListDto) => {
    onLeaveEdit(leave);
    setPopoverOpen(null);
  };

  const handleDelete = (leave: LeaveRequestListDto) => {
    onLeaveDelete(leave); // Pass the entire leave object
    setPopoverOpen(null);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (statusStr: string) => {
    const status = statusStr.toLowerCase();
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
        status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
        status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
        'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        {statusStr}
      </span>
    );
  };

  const getHalfDayBadge = (isHalfDayValue: any) => {
    const isHalfDay = getIsHalfDayBoolean(isHalfDayValue);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isHalfDay 
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        {getHalfDayDisplayText(isHalfDayValue)}
      </span>
    );
  };

  // Mock data flag for development
  const USE_MOCK_DATA = false; // Set to false for production
  
  // Mock data for UI testing
  const MOCK_LEAVES: LeaveRequestListDto[] = [
    {
      id: '1' as UUID,
      employeeId: 'emp001' as UUID,
      approvedById: undefined,
      leaveTypeId: 'lt001' as UUID,
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      dateRequested: '2024-01-10',
      dateApproved: '2024-01-11',
      comments: 'Family vacation',
      daysRequestedStr: '3 days',
      isHalfDayStr: 'No',
      statusStr: 'Approved',
      startDateStr: 'January 15, 2024',
      startDateStrAm: '',
      endDateStr: 'January 17, 2024',
      endDateStrAm: '',
      dateApprovedStr: 'January 11, 2024',
      dateApprovedStrAm: '',
      dateRequestedStr: 'January 10, 2024',
      dateRequestedStrAm: '',
      approvedBy: 'Manager',
      employee: 'John Doe',
      leaveType: 'Annual Leave',
      isHalfDay: false, // Boolean field
      rowVersion: 'v1'
    },
    {
      id: '2' as UUID,
      employeeId: 'emp002' as UUID,
      approvedById: undefined,
      leaveTypeId: 'lt002' as UUID,
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      dateRequested: '2024-01-19',
      dateApproved: null,
      comments: 'Medical appointment',
      daysRequestedStr: '1 day',
      isHalfDayStr: 'Yes',
      statusStr: 'Pending',
      startDateStr: 'January 20, 2024',
      startDateStrAm: '',
      endDateStr: 'January 20, 2024',
      endDateStrAm: '',
      dateApprovedStr: '',
      dateApprovedStrAm: '',
      dateRequestedStr: 'January 19, 2024',
      dateRequestedStrAm: '',
      approvedBy: '',
      employee: 'Jane Smith',
      leaveType: 'Sick Leave',
      isHalfDay: true, // Boolean field
      rowVersion: 'v1'
    },
  ];

  const dataToDisplay = USE_MOCK_DATA && leaves.length === 0 ? MOCK_LEAVES : leaves;

  if (loading && dataToDisplay.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  // Show mock data indicator if using mock data
  const isUsingMockData = USE_MOCK_DATA && leaves.length === 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            duration: 0.5
          }
        }
      }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden"
    >
      {/* Mock Data Indicator */}
      {isUsingMockData && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="text-sm text-yellow-800">
              <span className="font-medium">Note:</span> Using mock data for UI preview
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <motion.tr
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Start Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                End Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Date Approved
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Requested
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Duration
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Half Day
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeaves.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  {loading ? 'Loading leave requests...' : 'No leave requests found'}
                </td>
              </tr>
            ) : (
              sortedLeaves.map((leave, index) => (
                <motion.tr
                  key={leave.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: (i) => ({
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.05,
                        duration: 0.3
                      }
                    }),
                    hover: {
                      backgroundColor: 'rgba(243, 244, 246, 0.5)',
                      transition: { duration: 0.2 }
                    }
                  }}
                  whileHover="hover"
                  className={`cursor-pointer transition-colors duration-150 ${leave.statusStr.toLowerCase() === 'pending' ? 'bg-blue-50/30' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(leave.statusStr)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {formatDate(leave.startDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {formatDate(leave.endDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    {leave.dateApproved ? formatDate(leave.dateApproved) : 'Not Approved'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(leave.dateRequested)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden xl:table-cell">
                    <span>{leave.daysRequestedStr || "0 days"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {getHalfDayBadge(leave.isHalfDay || leave.isHalfDayStr)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {leave.leaveType || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Popover open={popoverOpen === leave.id} onOpenChange={(open) => setPopoverOpen(open ? leave.id : null)}>
                      <PopoverTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-150"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </motion.button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0" align="end">
                        <div className="py-1">
                          <button 
                            onClick={() => handleEdit(leave)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 rounded text-gray-700 flex items-center gap-2.5 transition-colors duration-150"
                          >
                            <PenBox size={16} />
                            Edit
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(leave)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2.5 transition-colors duration-150"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> requests
              {isUsingMockData && ' (Mock Data)'}
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ${
                    currentPage === page
                      ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <span className="sr-only">Next</span>
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaveTable;