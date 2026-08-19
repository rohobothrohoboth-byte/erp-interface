import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import BranchTable from "@/modules/core/components/branch/BranchTable";
import AddHeader from "@/modules/core/components/branch/AddHeader";
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch
} from "@/modules/core/services/branch/branch.queries";
import { useCompanies } from "@/modules/core/services/company/company.queries";
import type {
  BranchListDto,
  AddBranchDto,
  EditBranchDto,
} from "@/modules/core/types/branch";
import type { UUID } from "@/modules/core/types/branch";
import { BranchType, BranchStat } from "@/modules/core/types/enum";
import { Building2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface BranchesPageProps {
  onBack?: () => void;
}

const BranchesPage: React.FC<BranchesPageProps> = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId") as UUID | null;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // React Query hooks
  const {
    data: branches = [],
    isLoading,
    error: queryError,
    refetch
  } = useBranches(companyId ? { companyId } : undefined);

  // In a single-company deployment there is no ?companyId in the URL, so default
  // the branch's company to the (first/only) registered company. This makes
  // "Add Branch" work from /core/branch without requiring a company drill-down.
  const { data: companies = [] } = useCompanies();
  const effectiveCompanyId = (companyId ?? companies[0]?.id) as UUID | undefined;

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();

  // Helper functions for search
  const getStatusText = (status: string): string => {
    const statusNum = parseInt(status);
    switch (statusNum) {
      case 0:
        return "Active";
      case 1:
        return "Inactive";
      case 2:
        return "Under Construction";
      default:
        return status || "Unknown";
    }
  };

  const getBranchTypeText = (branchType: string): string => {
    const typeNum = parseInt(branchType);
    switch (typeNum) {
      case 0:
        return "Head Office";
      case 1:
        return "Regional";
      case 2:
        return "Local";
      case 3:
        return "Virtual";
      default:
        return branchType || "Unknown";
    }
  };

  // Filter branches based on search term
  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) {
      return branches;
    }

    const lowercasedSearch = searchTerm.toLowerCase().trim();

    return branches.filter((branch) => {
      const basicMatch =
          (branch.name && branch.name.toLowerCase().includes(lowercasedSearch)) ||
          (branch.nameAm && branch.nameAm.toLowerCase().includes(lowercasedSearch)) ||
          (branch.code && branch.code.toLowerCase().includes(lowercasedSearch)) ||
          (branch.location && branch.location.toLowerCase().includes(lowercasedSearch));

      const statusValue = branch.branchStat?.toString() || "";
      const statusText = getStatusText(statusValue);
      const statusMatch = statusText.toLowerCase().includes(lowercasedSearch);

      const branchTypeValue = branch.branchType?.toString() || "";
      const branchTypeText = getBranchTypeText(branchTypeValue);
      const branchTypeMatch = branchTypeText.toLowerCase().includes(lowercasedSearch);

      return basicMatch || statusMatch || branchTypeMatch;
    });
  }, [branches, searchTerm]);

  // Paginate filtered branches
  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBranches, currentPage]);

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddBranch = async (branchData: AddBranchDto) => {
    try {
      await createBranchMutation.mutateAsync(branchData);
      toast.success("Branch added successfully!");
    } catch (err) {
      const errorMessage = "Failed to add branch. Please try again.";
      toast.error(errorMessage);
      console.error("Error adding branch:", err);
      throw err;
    }
  };

  const handleBranchUpdate = async (updatedBranch: BranchListDto) => {
    try {
      const updateData: EditBranchDto = {
        id: updatedBranch.id as UUID,
        name: updatedBranch.name,
        nameAm: updatedBranch.nameAm,
        code: updatedBranch.code,
        location: updatedBranch.location,
        dateOpened: new Date().toISOString(),
        branchType: updatedBranch.branchType || BranchType["0"],
        branchStat: updatedBranch.branchStat || BranchStat["0"],
        compId: updatedBranch.compId as UUID,
        rowVersion: updatedBranch.rowVersion,
      };

      await updateBranchMutation.mutateAsync(updateData);
      toast.success("Branch updated successfully!");
    } catch (err) {
      const errorMessage = "Failed to update branch. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating branch:", err);
      throw err;
    }
  };

  const handleBranchStatusChange = async (id: string, status: string) => {
    try {
      const branch = branches.find((b) => b.id === id);
      if (branch) {
        const updateData: EditBranchDto = {
          id: branch.id as UUID,
          name: branch.name,
          nameAm: branch.nameAm,
          code: branch.code,
          location: branch.location,
          dateOpened: new Date().toISOString(),
          branchType: branch.branchType || BranchType["0"],
          branchStat: status as BranchStat,
          compId: branch.compId as UUID,
          rowVersion: branch.rowVersion,
        };

        await updateBranchMutation.mutateAsync(updateData);
        toast.success(`Branch status updated to ${getStatusText(status)}`);
      }
    } catch (err) {
      const errorMessage = "Failed to update branch status. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating branch status:", err);
    }
  };

  const handleBranchDelete = async (id: string) => {
    try {
      await deleteBranchMutation.mutateAsync(id as UUID);
      toast.success("Branch deleted successfully!");
    } catch (err) {
      const errorMessage = "Failed to delete branch. Please try again.";
      toast.error(errorMessage);
      console.error("Error deleting branch:", err);
    }
  };

  const handleCloseError = () => {
    createBranchMutation.reset();
    updateBranchMutation.reset();
    deleteBranchMutation.reset();
  };

  const errorMessage = queryError?.message || null;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400"></div>
        </div>
    );
  }

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {companyId ? "Company Branches" : "All Branches"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage branch locations and details
            </p>
          </div>
        </div>

        {/* Add Header with Search */}
        <AddHeader
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddBranch={effectiveCompanyId ? handleAddBranch : undefined}
            defaultCompanyId={effectiveCompanyId as UUID}
        />

        {/* Error Message */}
        {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {errorMessage.includes("load") ? (
                  <>
                    Failed to load branches.{" "}
                    <button
                        onClick={() => refetch()}
                        className="underline hover:text-red-800 font-medium"
                        disabled={isLoading}
                    >
                      Try again
                    </button>
                  </>
              ) : (
                  errorMessage
              )}
            </span>
                <button
                    onClick={() => {}}
                    className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold text-lg ml-4"
                >
                  ×
                </button>
              </div>
            </div>
        )}

        {/* Mutation Error Display */}
        {(createBranchMutation.error || updateBranchMutation.error || deleteBranchMutation.error) && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {createBranchMutation.error?.message ||
                  updateBranchMutation.error?.message ||
                  deleteBranchMutation.error?.message}
            </span>
                <button
                    onClick={handleCloseError}
                    className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold text-lg ml-4"
                >
                  ×
                </button>
              </div>
            </div>
        )}

        {/* Branch Table */}
        <BranchTable
            branches={paginatedBranches}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBranches.length}
            onPageChange={handlePageChange}
            onBranchUpdate={handleBranchUpdate}
            onBranchStatusChange={handleBranchStatusChange}
            onBranchDelete={handleBranchDelete}
        />
      </div>
  );
};
console.log('BranchesPage rendering...');
export default BranchesPage;