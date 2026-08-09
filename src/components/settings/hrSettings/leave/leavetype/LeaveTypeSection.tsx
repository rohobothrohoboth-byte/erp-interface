import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon } from 'lucide-react';
import { leaveTypeService } from '../../../../../services/core/settings/ModHrm/LeaveTypeService';
import { empLeavePolicyService } from '../../../../../services/core/settings/ModHrm/EmpLeavePolicyService';
import type { LeaveTypeListDto, LeaveTypeAddDto, LeaveTypeModDto, UUID } from '../../../../../types/core/Settings/leavetype';
import LeaveSearchFilters from './LeaveSearchFilter';
import LeaveTypeTable from "./LeaveTypeTable";
import AddLeaveTypeModal from "./AddLeaveTypeModal";
import EditLeaveTypeModal from "./EditLeaveTypeModal";
import DeleteLeaveTypeModal from "./DeleteLeaveTypeModal";
import AssignLeaveTypeModal from "../../../../hr/Leave/AssignLeaveTypeModal";
import toast from 'react-hot-toast';

const LeaveTypeSection: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignType, setSelectedAssignType] = useState<LeaveTypeListDto | null>(null);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveTypeListDto | null>(null);
  const [deletingLeaveType, setDeletingLeaveType] = useState<LeaveTypeListDto | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const itemsPerPage = 10;

  // Filter leave types based on search term
  const filteredLeaveTypes = leaveTypes.filter(leaveType =>
      leaveType.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination calculations
  const totalItems = filteredLeaveTypes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeaveTypes = filteredLeaveTypes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const leaveTypesData = await leaveTypeService.getAllLeaveTypes();
      setLeaveTypes(leaveTypesData);
    } catch (err) {
      console.error('Failed to fetch leave types:', err);
      setError('Failed to load leave types. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleAddLeaveType = async (leaveTypeData: LeaveTypeAddDto) => {
    try {
      const newLeaveType = await leaveTypeService.createLeaveType(leaveTypeData);
      setLeaveTypes((prev) => [...prev, newLeaveType]);
      setIsAddModalOpen(false);
      setError(null);
      toast.success('Leave type created successfully');
    } catch (err) {
      console.error('Failed to create leave type:', err);
      setError('Failed to create leave type. Please try again.');
      toast.error('Failed to create leave type');
      throw err;
    }
  };

  const handleEditLeaveType = async (updatedLeaveType: LeaveTypeModDto) => {
    try {
      const result = await leaveTypeService.updateLeaveType(updatedLeaveType);
      setLeaveTypes((prev) =>
          prev.map((lt) => (lt.id === result.id ? result : lt))
      );
      setEditingLeaveType(null);
      setError(null);
      toast.success('Leave type updated successfully');
    } catch (err) {
      console.error('Failed to update leave type:', err);
      setError('Failed to update leave type. Please try again.');
      toast.error('Failed to update leave type');
      throw err;
    }
  };

  const handleDeleteLeaveType = async (leaveTypeId: UUID) => {
    try {
      await leaveTypeService.deleteLeaveType(leaveTypeId);
      setLeaveTypes((prev) => prev.filter((lt) => lt.id !== leaveTypeId));
      setDeletingLeaveType(null);
      setError(null);
      toast.success('Leave type deleted successfully');
    } catch (err) {
      console.error('Failed to delete leave type:', err);
      setError('Failed to delete leave type. Please try again.');
      toast.error('Failed to delete leave type');
    }
  };

  const handleToggleStatus = async (leaveType: LeaveTypeListDto) => {
    try {
      const updatedLeaveType = {
        ...leaveType,
        isActive: !leaveType.isActive,
      };
      const result = await leaveTypeService.updateLeaveType(updatedLeaveType as LeaveTypeModDto);
      setLeaveTypes((prev) =>
          prev.map((lt) => (lt.id === result.id ? result : lt))
      );
      setError(null);
      toast.success(`Leave type ${result.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Failed to toggle leave type status:', err);
      setError('Failed to update leave type status. Please try again.');
      toast.error('Failed to update status');
    }
  };

  // In your parent component's handleAssign function (LeaveTypeSection.tsx)
  const handleAssignLeaveType = async (data: any) => {
    try {
      // Use the fallback method that handles duplicates
      const result = await empLeavePolicyService.bulkAssignWithFallback(data);

      if (result.results) {
        // Show detailed results
        const successCount = result.results.successful.length;
        const failCount = result.results.failed.length;

        if (failCount > 0) {
          toast.warning(
              `Assigned to ${successCount} employees. ${failCount} employees already had this leave type.`,
              { duration: 5000 }
          );
        }
      }

      return result;
    } catch (error) {
      console.error('Error in handleAssignLeaveType:', error);
      throw error;
    }
  };

  const handleOpenAssignModal = (leaveType?: LeaveTypeListDto) => {
    if (leaveType) {
      setSelectedAssignType(leaveType);
    }
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedAssignType(null);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleEdit = (leaveType: LeaveTypeListDto) => {
    setEditingLeaveType(leaveType);
  };

  const handleDelete = (leaveType: LeaveTypeListDto) => {
    setDeletingLeaveType(leaveType);
  };

  const handleCloseEditModal = () => {
    setEditingLeaveType(null);
  };

  const handleCloseDeleteModal = () => {
    setDeletingLeaveType(null);
  };

  return (
      <div className="space-y-6">
        {/* Error message for API errors */}
        {error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
            >
              <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("load") ? (
                  <>
                    Failed to load leave types.{" "}
                    <button
                        onClick={fetchLeaveTypes}
                        className="underline hover:text-red-800 font-semibold focus:outline-none"
                    >
                      Try again
                    </button>{" "}
                    later.
                  </>
              ) : error.includes("create") ? (
                  "Failed to create leave type. Please try again."
              ) : error.includes("update") ? (
                  "Failed to update leave type. Please try again."
              ) : error.includes("delete") ? (
                  "Failed to delete leave type. Please try again."
              ) : (
                  error
              )}
            </span>
                <button
                    onClick={() => setError(null)}
                    className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
                >
                  ×
                </button>
              </div>
            </motion.div>
        )}

        {/* Search and Filters Section for Leave Types */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-2"
        >
          <LeaveSearchFilters
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
              onAddClick={handleOpenAddModal}
              onAssignClick={() => handleOpenAssignModal()}
          />
        </motion.div>

        {/* Loading state */}
        {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )}

        {/* No leave types message */}
        {!loading && leaveTypes.length === 0 && !error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6 mb-6"
            >
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <h3 className="text-yellow-800 font-medium">No Leave Types Found</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    There are currently no leave types in the system. Please add a leave type to get started.
                  </p>
                </div>
              </div>
            </motion.div>
        )}

        {/* Leave Types Table */}
        {!loading && leaveTypes.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-0 pb-0 -mt-2"
            >
              <LeaveTypeTable
                  leaveTypes={paginatedLeaveTypes}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  isLoading={loading}
                  onPageChange={setCurrentPage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onAssign={handleOpenAssignModal}
              />
            </motion.div>
        )}

        {/* Add Leave Type Modal */}
        <AddLeaveTypeModal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            onAddLeaveType={handleAddLeaveType}
        />

        {/* Edit Leave Type Modal */}
        <EditLeaveTypeModal
            isOpen={!!editingLeaveType}
            onClose={handleCloseEditModal}
            onSave={handleEditLeaveType}
            leaveType={editingLeaveType}
        />

        {/* Delete Leave Type Modal */}
        <DeleteLeaveTypeModal
            leaveType={deletingLeaveType}
            isOpen={!!deletingLeaveType}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDeleteLeaveType}
        />

        {/* Assign Leave Type Modal */}
        <AssignLeaveTypeModal
            isOpen={isAssignModalOpen}
            onClose={handleCloseAssignModal}
            onAssign={handleAssignLeaveType}
            leaveType={selectedAssignType}
            loading={assignLoading}
        />
      </div>
  );
};

export default LeaveTypeSection;