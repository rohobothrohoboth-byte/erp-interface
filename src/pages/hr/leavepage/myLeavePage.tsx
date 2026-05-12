import React, { useState, useEffect } from 'react';
import AnnualLeaveSearchFilters from '../../../components/hr/annualLeave/AnnualLeaveSerchFilter';
import LeaveTable from '../../../components/hr/annualLeave/LeaveTable';
import AddLeaveRequestModal from '../../../components/hr/annualLeave/AddLeaveRequestModal';
import EditLeaveReqModal from '../../../components/hr/annualLeave/EditLeaveReqModal';
import DeleteLeaveReqModal from '../../../components/hr/annualLeave/DeleteLeaveReqModal';
import { leaveApi } from '../../../services/hr/leave/leave.api';
import { hrmLeaveListApi } from '../../../services/List/hrmLeave/hrmLeaveList.api'; 
import type { LeaveRequestListDto, LeaveRequestAddDto, LeaveRequestModDto } from '../../../types/hr/leaverequest';
import type { ListItem } from '../../../types/List/list'; 
import type { UUID } from 'crypto';
import useToast from '../../../hooks/useToast';

const LeaveList = () => {
  const toast = useToast();
  const [leaves, setLeaves] = useState<LeaveRequestListDto[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<ListItem[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestListDto | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequestListDto | null>(null);

  // Fetch leave types from hrmLeaveList service
  const fetchLeaveTypes = async () => {
    try {
      setLeaveTypesLoading(true);
      const types = await hrmLeaveListApi.getAllLeaveTypes();
      setLeaveTypes(types);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch leave types');
      console.error('Error fetching leave types:', error);
      setLeaveTypes([]);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  // Fetch leave requests from API using leaveService
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const leaveRequests = await leaveApi.getMyLeaveRequests();
      setLeaves(leaveRequests);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch leave requests');
      console.error('Error fetching leave requests:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchLeaveTypes(),
        fetchLeaveRequests()
      ]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showAddModal && leaveTypes.length === 0) {
      fetchLeaveTypes();
    }
  }, [showAddModal]);

  // Filter leaves based on search term
  const filteredLeaves = leaves.filter(leave => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (leave.leaveType && leave.leaveType.toLowerCase().includes(searchLower)) ||
      (leave.comments && leave.comments.toLowerCase().includes(searchLower)) ||
      (leave.statusStr && leave.statusStr.toLowerCase().includes(searchLower)) ||
      (leave.id && leave.id.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const itemsPerPage = 10;
  const totalItems = filteredLeaves.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddLeaveClick = () => {
    setShowAddModal(true);
  };

  const handleLeaveEdit = (leave: LeaveRequestListDto) => {
    setSelectedLeave(leave);
    setShowEditModal(true);
  };

  const handleLeaveDelete = (leave: LeaveRequestListDto) => {
    setLeaveToDelete(leave);
    setShowDeleteModal(true);
  };

  // Handle adding new leave request via API using leaveService
  const handleAddLeave = async (leaveData: LeaveRequestAddDto): Promise<any> => {
    setActionLoading(true);
    try {
      const result = await leaveApi.addLeaveRequest(leaveData); // Use leaveService
      
      // Refresh the list
      await fetchLeaveRequests();
      
      toast.success('Leave request submitted successfully!');
      
      return { message: 'Leave request submitted successfully!', data: result };
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit leave request');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle editing leave request via API using leaveService
  const handleEditLeave = async (leaveData: LeaveRequestModDto): Promise<any> => {
    setActionLoading(true);
    try {
      const result = await leaveApi.updateLeaveRequest(leaveData); 
      
      await fetchLeaveRequests();
      
      toast.success('Leave request updated successfully!');
      
      return { message: 'Leave request updated successfully!', data: result };
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to update leave request');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deleting leave request via API using leaveService
  const handleConfirmDelete = async (leaveId: UUID): Promise<any> => {
    setActionLoading(true);
    try {
      await leaveApi.deleteLeaveRequest(leaveId); // Use leaveService
      
      // Update local state immediately for better UX
      setLeaves(prevLeaves => prevLeaves.filter(leave => leave.id !== leaveId));
      
      toast.success('Leave request deleted successfully!');
      
      return { message: 'Leave request deleted successfully!' };
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete leave request');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedLeave(null);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setLeaveToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Search filter component without refresh button */}
      <AnnualLeaveSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddLeave={handleAddLeaveClick}
      />

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{leaves.length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">TR</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {leaves.filter(l => l.statusStr === 'Pending').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">P</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {leaves.filter(l => l.statusStr === 'Approved').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold">A</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {leaves.filter(l => l.statusStr === 'Rejected').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-semibold">R</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && leaves.length === 0 ? (
        <div className="bg-white rounded-lg p-8 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600">Loading leave requests...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Leave Table Component */}
          <LeaveTable
            leaves={paginatedLeaves}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onLeaveEdit={handleLeaveEdit}
            onLeaveDelete={handleLeaveDelete}
            loading={loading || actionLoading}
          />
          
        </>
      )}

      {/* Add Leave Request Modal */}
      <AddLeaveRequestModal
        onAddLeave={handleAddLeave}
        leaveTypes={leaveTypes}
        leaveTypesLoading={leaveTypesLoading}
        employeeId={'current-user-id' as UUID} // Replace with actual user ID from auth context
        isOpen={showAddModal}
        onClose={handleAddModalClose}
        isLoading={actionLoading}
      />

      {/* Edit Leave Request Modal */}
      {selectedLeave && (
        <EditLeaveReqModal
          leave={selectedLeave}
          onEditLeave={handleEditLeave}
          leaveTypes={leaveTypes}
          leaveTypesLoading={leaveTypesLoading}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          isLoading={actionLoading}
        />
      )}

      {/* Delete Leave Request Modal */}
      {leaveToDelete && (
        <DeleteLeaveReqModal
          leave={leaveToDelete}
          isOpen={showDeleteModal}
          onClose={handleDeleteModalClose}
          onConfirm={handleConfirmDelete}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default LeaveList;