import { motion } from "framer-motion";
import { useState } from "react";
import LeaveHeader from '@/modules/settings/components/hrSettings/leave/leavetype/LeaveHeader';
import LeaveTypeSection from '@/modules/settings/components/hrSettings/leave/leavetype/LeaveTypeSection';
// import LeavePolicySection from '@/modules/settings/components/hrSettings/leave/leavepolicy/LeavePolicySection';
import type { LeaveTypeListDto, LeaveTypeAddDto, LeaveTypeModDto } from '@/modules/core/types/Settings/leavetype';
import type { LeavePolicyListDto, LeavePolicyAddDto, LeavePolicyModDto, LeaveTypeOptionDto } from '@/modules/core/types/Settings/leavepolicy';

const PageAnnualLeave = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [policySearchTerm, setPolicySearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [policyViewMode, setPolicyViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeListDto[]>([
    {
      id: '1',
      name: 'Annual Leave',
      code: '0',
      isPaid: true,
      codeStr: 'ANNUAL',
      isPaidStr: 'Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    },
    {
      id: '2',
      name: 'Sick Leave',
      code: '1',
      codeStr: 'SICK',
      isPaid: true,
      isPaidStr: 'Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    },
    {
      id: '3',
      name: 'Unpaid Leave',
      code: '2',
      codeStr: 'UNPAID',
      isPaid: false,
      isPaidStr: 'Unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    },
  ]);

  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyListDto[]>([
    {
      id: '1',
      leaveTypeId: '1',
      name: 'Annual Leave Policy',
      requiresAttachment: true,
      minDurPerReq: 1,
      maxDurPerReq: 30,
      holidaysAsLeave: false,
      leaveType: 'Annual Leave',
      requiresAttachmentStr: 'Yes',
      minDurPerReqStr: '1 day',
      maxDurPerReqStr: '30 days',
      holidaysAsLeaveStr: 'No',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    },
    {
      id: '2',
      leaveTypeId: '2',
      name: 'Sick Leave Policy',
      requiresAttachment: true,
      minDurPerReq: 1,
      maxDurPerReq: 15,
      holidaysAsLeave: true,
      leaveType: 'Sick Leave',
      requiresAttachmentStr: 'Yes',
      minDurPerReqStr: '1 day',
      maxDurPerReqStr: '15 days',
      holidaysAsLeaveStr: 'Yes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    },
    {
      id: '3',
      leaveTypeId: '3',
      name: 'Unpaid Leave Policy',
      requiresAttachment: false,
      minDurPerReq: 1,
      maxDurPerReq: 90,
      holidaysAsLeave: false,
      leaveType: 'Unpaid Leave',
      requiresAttachmentStr: 'No',
      minDurPerReqStr: '1 day',
      maxDurPerReqStr: '90 days',
      holidaysAsLeaveStr: 'No',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    },
  ]);

  // Convert leave types to options for the dropdown
  const leaveTypeOptions: LeaveTypeOptionDto[] = leaveTypes.map(lt => ({
    id: lt.id as UUID,
    name: lt.name
  }));

  // Filter leave types based on search term
  const filteredLeaveTypes = leaveTypes.filter(leaveType =>
    leaveType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leaveType.codeStr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter leave policies based on search term
  const filteredLeavePolicies = leavePolicies.filter(policy =>
    policy.name.toLowerCase().includes(policySearchTerm.toLowerCase()) ||
    policy.leaveType.toLowerCase().includes(policySearchTerm.toLowerCase())
  );

  const handleEdit = (leaveType: LeaveTypeListDto | LeaveTypeModDto) => {
    console.log('Edit leave type:', leaveType);

    // If it's a modification (from edit modal)
    if ('rowVersion' in leaveType) {
      const updatedLeaveType = leaveType as LeaveTypeModDto;

      // Update the leave type in state
      setLeaveTypes(prev => prev.map(lt =>
        lt.id === updatedLeaveType.id
          ? {
            ...lt,
            name: updatedLeaveType.name,
            code: updatedLeaveType.code,
            isPaid: updatedLeaveType.isPaid,
            codeStr: updatedLeaveType.code === '0' ? 'ANNUAL' : 'SICK',
            isPaidStr: updatedLeaveType.isPaid ? 'Paid' : 'Unpaid',
            updatedAt: new Date().toISOString(),
            updatedBy: 'user',
            rowVersion: updatedLeaveType.rowVersion
          }
          : lt
      ));
    }
  };

  const handleDelete = (leaveType: LeaveTypeListDto) => {
    console.log('Delete leave type:', leaveType);

    // Remove the leave type from state
    setLeaveTypes(prev => prev.filter(lt => lt.id !== leaveType.id));
  };

  const handleAddLeaveType = (leaveTypeData: LeaveTypeAddDto) => {
    console.log('Adding new leave type:', leaveTypeData);

    // Create a new leave type with generated ID and additional fields
    const newLeaveType: LeaveTypeListDto = {
      id: Date.now().toString(),
      name: leaveTypeData.name,
      code: leaveTypeData.code,
      isPaid: leaveTypeData.isPaid,
      codeStr: leaveTypeData.code === '0' ? 'ANNUAL' : 'SICK',
      isPaidStr: leaveTypeData.isPaid ? 'Paid' : 'Unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
      updatedBy: 'user',
      rowVersion: '1'
    };

    // Add the new leave type to the state
    setLeaveTypes(prev => [...prev, newLeaveType]);
    setIsAddModalOpen(false);
  };

  const handleAddLeavePolicy = (policyData: LeavePolicyAddDto) => {
    console.log('Adding new leave policy:', policyData);

    // Find the leave type name for display
    const leaveType = leaveTypes.find(lt => lt.id === policyData.leaveTypeId);

    // Create a new leave policy with generated ID and additional fields
    const newLeavePolicy: LeavePolicyListDto = {
      id: Date.now().toString(),
      leaveTypeId: policyData.leaveTypeId,
      name: policyData.name,
      requiresAttachment: policyData.requiresAttachment,
      minDurPerReq: policyData.minDurPerReq,
      maxDurPerReq: policyData.maxDurPerReq,
      holidaysAsLeave: policyData.holidaysAsLeave,
      leaveType: leaveType?.name || 'Unknown',
      requiresAttachmentStr: policyData.requiresAttachment ? 'Yes' : 'No',
      minDurPerReqStr: `${policyData.minDurPerReq} day${policyData.minDurPerReq !== 1 ? 's' : ''}`,
      maxDurPerReqStr: `${policyData.maxDurPerReq} day${policyData.maxDurPerReq !== 1 ? 's' : ''}`,
      holidaysAsLeaveStr: policyData.holidaysAsLeave ? 'Yes' : 'No',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
      updatedBy: 'user',
      rowVersion: '1'
    };

    // Add the new leave policy to the state
    setLeavePolicies(prev => [...prev, newLeavePolicy]);
    setIsAddPolicyModalOpen(false);
  };

  const handlePolicyEdit = (policy: LeavePolicyListDto | LeavePolicyModDto) => {
    console.log('Edit leave policy:', policy);

    // If it's a modification (from edit modal)
    if ('rowVersion' in policy) {
      const updatedPolicy = policy as LeavePolicyModDto;

      // Find the leave type name for display
      const leaveType = leaveTypes.find(lt => lt.id === updatedPolicy.leaveTypeId);

      // Update the leave policy in state
      setLeavePolicies(prev => prev.map(p =>
        p.id === updatedPolicy.id
          ? {
            ...p,
            name: updatedPolicy.name,
            requiresAttachment: updatedPolicy.requiresAttachment,
            minDurPerReq: updatedPolicy.minDurPerReq,
            maxDurPerReq: updatedPolicy.maxDurPerReq,
            holidaysAsLeave: updatedPolicy.holidaysAsLeave,
            leaveTypeId: updatedPolicy.leaveTypeId,
            leaveType: leaveType?.name || 'Unknown',
            requiresAttachmentStr: updatedPolicy.requiresAttachment ? 'Yes' : 'No',
            minDurPerReqStr: `${updatedPolicy.minDurPerReq} day${updatedPolicy.minDurPerReq !== 1 ? 's' : ''}`,
            maxDurPerReqStr: `${updatedPolicy.maxDurPerReq} day${updatedPolicy.maxDurPerReq !== 1 ? 's' : ''}`,
            holidaysAsLeaveStr: updatedPolicy.holidaysAsLeave ? 'Yes' : 'No',
            updatedAt: new Date().toISOString(),
            updatedBy: 'user',
            rowVersion: updatedPolicy.rowVersion
          }
          : p
      ));
    }
  };

  const handlePolicyDelete = (policy: LeavePolicyListDto) => {
    console.log('Delete leave policy:', policy);
    // Remove the leave policy from state
    setLeavePolicies(prev => prev.filter(p => p.id !== policy.id));
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenAddPolicyModal = () => {
    setIsAddPolicyModalOpen(true);
  };

  const handleCloseAddPolicyModal = () => {
    setIsAddPolicyModalOpen(false);
  };

  const handlePolicyAddClick = () => {
    handleOpenAddPolicyModal();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      {/* Use the LeaveHeader component */}
      <LeaveHeader />

      {/* Leave Type Section */}
      <LeaveTypeSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        leaveTypes={filteredLeaveTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAddModalOpen={isAddModalOpen}
        onAddLeaveType={handleAddLeaveType}
        onCloseAddModal={handleCloseAddModal}
        onOpenAddModal={handleOpenAddModal}
      />
    </motion.section>
  );
};

export default PageAnnualLeave;