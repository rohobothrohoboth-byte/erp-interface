import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import DepartmentManagementHeader from "@/modules/core/components/department/DeptHeader";
import DepartmentSearchFilters from "@/modules/core/components/department/DeptSearchFilters";
import DepartmentTable from "@/modules/core/components/department/DeptTable";
import EditDeptModal from "@/modules/core/components/department/EditDeptModal";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useDepartmentStatus,
} from "@/modules/core/services/department/dept.queries";
import type {
  AddDeptDto,
  EditDeptDto,
  DeptListDto,
  UUID,
} from "@/modules/core/types/dept";

const DepartmentOverview = () => {
  const [searchParams] = useSearchParams();
  // When drilling in from a branch (/core/department?branchId=...), scope the list
  // to that branch and default new departments to it (Branch -> Department hierarchy).
  const branchId = (searchParams.get("branchId") || "") as UUID | "";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDepartment, setEditingDepartment] = useState<DeptListDto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const itemsPerPage = 8;

  // React Query hooks
  const {
    data: departments = [],
    isLoading,
    error: queryError,
    refetch,
  } = useDepartments();

  const createDepartmentMutation = useCreateDepartment({
    onSuccess: () => {
      setFormError(null);
      setCurrentPage(1);
    },
    onError: (error) => {
      setFormError(error.message || 'Failed to create department');
    },
  });

  const updateDepartmentMutation = useUpdateDepartment({
    onSuccess: () => {
      setFormError(null);
      setIsEditModalOpen(false);
      setEditingDepartment(null);
    },
    onError: (error) => {
      setFormError(error.message || 'Failed to update department');
    },
  });

  const deleteDepartmentMutation = useDeleteDepartment({
    onSuccess: () => {
      setFormError(null);
    },
    onError: (error) => {
      setFormError(error.message || 'Failed to delete department');
    },
  });

  const { getStatusText } = useDepartmentStatus();

  const handleAddDepartment = async (newDepartment: AddDeptDto) => {
    setFormError(null);
    await createDepartmentMutation.mutateAsync(newDepartment);
  };

  const handleEditClick = (department: EditDeptDto) => {
    const departmentToEdit = departments.find(
        (dept) => dept.id === department.id
    );
    if (departmentToEdit) {
      setEditingDepartment(departmentToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateDepartment = async (updatedDepartment: EditDeptDto) => {
    setFormError(null);
    await updateDepartmentMutation.mutateAsync(updatedDepartment);
  };

  const handleDepartmentStatusChange = async (
      departmentId: UUID,
      newStatus: "active" | "inactive"
  ) => {
    setFormError(null);
    const department = departments.find((dept) => dept.id === departmentId);
    if (department) {
      const updateData: EditDeptDto = {
        id: department.id,
        name: department.name,
        nameAm: department.nameAm,
        deptStat: newStatus === "active" ? "0" : "1",
        branchId: department.branchId,
        rowVersion: department.rowVersion,
      };
      await updateDepartmentMutation.mutateAsync(updateData);
    }
  };

  const handleDepartmentDelete = async (departmentId: UUID) => {
    setFormError(null);
    await deleteDepartmentMutation.mutateAsync(departmentId);
  };

  // Scope to a single branch when drilling in from the Branch page.
  const scopedDepartments = useMemo(
    () => (branchId ? departments.filter((d) => d.branchId === branchId) : departments),
    [departments, branchId]
  );

  // Filter departments
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) {
      return scopedDepartments;
    }

    const searchLower = searchTerm.toLowerCase();

    return scopedDepartments.filter((department) => {
      const basicMatch =
          department.name.toLowerCase().includes(searchLower) ||
          department.nameAm.toLowerCase().includes(searchLower) ||
          (department.branch && department.branch.toLowerCase().includes(searchLower));

      const statusText = getStatusText(department.deptStat).toLowerCase();
      const statusMatch = statusText.includes(searchLower);

      const numericStatusMatch =
          (searchLower.includes('0') && department.deptStat === "0") ||
          (searchLower.includes('1') && department.deptStat === "1");

      const statStrMatch = department.deptStatStr
          ? department.deptStatStr.toLowerCase().includes(searchLower)
          : false;

      return basicMatch || statusMatch || numericStatusMatch || statStrMatch;
    });
  }, [scopedDepartments, searchTerm, getStatusText]);

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDepartments, currentPage, itemsPerPage]);

  const displayError = queryError?.message || formError;

  const clearErrors = () => {
    setFormError(null);
    if (queryError) {
      refetch();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
        </div>
    );
  }

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Department Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage organizational departments and their structures
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {displayError.includes("load") ? (
                  <>
                    Failed to load departments.{' '}
                    <button
                        onClick={handleRefresh}
                        className="underline hover:text-red-800 font-medium"
                    >
                      Try again
                    </button>
                  </>
              ) : (
                  displayError
              )}
            </span>
                <button
                    onClick={clearErrors}
                    className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold text-lg ml-4"
                >
                  ×
                </button>
              </div>
            </div>
        )}

        {/* Search Filters */}
        <DepartmentSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddDepartment={handleAddDepartment}
            selectedBranchId={branchId}
            onRefresh={handleRefresh}
            isLoading={isLoading}
        />

        {/* Empty State */}
        {!isLoading && filteredDepartments.length === 0 && !displayError && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No departments found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search" : "Click 'Add Department' to create one"}
              </p>
            </div>
        )}

        {/* Department Table */}
        {!isLoading && filteredDepartments.length > 0 && (
            <DepartmentTable
                departments={paginatedDepartments}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDepartments.length}
                onPageChange={setCurrentPage}
                onEditDepartment={handleEditClick}
                onDepartmentStatusChange={handleDepartmentStatusChange}
                onDepartmentDelete={handleDepartmentDelete}
            />
        )}

        {/* Edit Department Modal */}
        {isEditModalOpen && editingDepartment && (
            <EditDeptModal
                department={editingDepartment}
                onEditDepartment={handleUpdateDepartment}
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setEditingDepartment(null);
                }}
            />
        )}
      </div>
  );
};

export default DepartmentOverview;