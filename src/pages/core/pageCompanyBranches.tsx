// src/pages/core/pageCompanyBranches.tsx (NEW FILE)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import BranchTable from '../../components/core/branch/BranchTable';
import AddHeader from '../../components/core/branch/AddHeader';
import {
    useBranches,
    useCreateBranch,
    useUpdateBranch,
    useDeleteBranch
} from '../../services/core/branch/branch.queries';
import type {
    BranchListDto,
    AddBranchDto,
    EditBranchDto,
    UUID
} from '../../types/core/branch';
import { BranchType, BranchStat } from '../../types/core/enum';
import { Button } from '../../components/ui/button';
import { PageLoader } from '../../components/ui/page-loader';

const CompanyBranchesPage = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [companyName, setCompanyName] = useState('');
    const itemsPerPage = 10;

    // Fetch branches for this company
    const {
        data: branches = [],
        isLoading,
        error: queryError,
        refetch
    } = useBranches(companyId ? { companyId: companyId as UUID } : undefined);

    const createBranchMutation = useCreateBranch();
    const updateBranchMutation = useUpdateBranch();
    const deleteBranchMutation = useDeleteBranch();

    // Fetch company name
    useEffect(() => {
        const fetchCompanyName = async () => {
            if (!companyId) return;
            try {
                const response = await fetch(`/api/auth/v1/Company/Get/${companyId}`);
                const data = await response.json();
                if (data.success) {
                    setCompanyName(data.data?.name || 'Company');
                }
            } catch (error) {
                console.error('Error fetching company:', error);
                setCompanyName('Company');
            }
        };
        fetchCompanyName();
    }, [companyId]);

    // Helper functions
    const getStatusText = (status: string): string => {
        const statusNum = parseInt(status);
        switch (statusNum) {
            case 0: return "Active";
            case 1: return "Inactive";
            case 2: return "Under Construction";
            default: return status || "Unknown";
        }
    };

    const getBranchTypeText = (branchType: string): string => {
        const typeNum = parseInt(branchType);
        switch (typeNum) {
            case 0: return "Head Office";
            case 1: return "Regional";
            case 2: return "Local";
            case 3: return "Virtual";
            default: return branchType || "Unknown";
        }
    };

    // Filter branches based on search term
    const filteredBranches = branches.filter((branch) => {
        if (!searchTerm.trim()) return true;
        const lowercasedSearch = searchTerm.toLowerCase().trim();
        return (
            (branch.name && branch.name.toLowerCase().includes(lowercasedSearch)) ||
            (branch.nameAm && branch.nameAm.toLowerCase().includes(lowercasedSearch)) ||
            (branch.code && branch.code.toLowerCase().includes(lowercasedSearch)) ||
            (branch.location && branch.location.toLowerCase().includes(lowercasedSearch))
        );
    });

    // Paginate
    const paginatedBranches = filteredBranches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
            refetch();
        } catch (err) {
            toast.error("Failed to add branch. Please try again.");
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
            refetch();
        } catch (err) {
            toast.error("Failed to update branch. Please try again.");
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
                refetch();
            }
        } catch (err) {
            toast.error("Failed to update branch status. Please try again.");
            console.error("Error updating branch status:", err);
        }
    };

    const handleBranchDelete = async (id: string) => {
        try {
            await deleteBranchMutation.mutateAsync(id as UUID);
            toast.success("Branch deleted successfully!");
            refetch();
        } catch (err) {
            toast.error("Failed to delete branch. Please try again.");
            console.error("Error deleting branch:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Back Button */}
            <button
                onClick={() => navigate('/core/companies')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Companies
            </button>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {companyName} Branches
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage branch locations for this company
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-sm"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <AddHeader
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        onAddBranch={handleAddBranch}
                        defaultCompanyId={companyId as UUID}
                    />
                </div>
            </div>

            {/* Error Message */}
            {queryError && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <span className="text-sm text-red-700 dark:text-red-400">
            Failed to load branches. Please try again.
          </span>
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

export default CompanyBranchesPage;