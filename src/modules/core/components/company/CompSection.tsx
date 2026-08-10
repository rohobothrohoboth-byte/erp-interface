import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, RefreshCw } from 'lucide-react';
import AddCompModal from '@/modules/core/components/company/AddCompModal';
import EditCompModal from '@/modules/core/components/company/EditCompModal';
import DeleteCompDialog from '@/modules/core/components/company/DeleteCompModal';
import CompList from '@/modules/core/components/company/CompList';
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany
} from '@/modules/core/services/company/company.queries';
import type { CompListDto, UUID, AddCompDto } from '@/modules/core/types/comp';
import { Button } from '@/shared/components/ui/button';

interface CompSectionProps {
  onClick?: (companyId: UUID) => void;
}

const CompSection: React.FC<CompSectionProps> = ({ onClick }) => {
  const navigate = useNavigate();
  const [editCompany, setEditCompany] = useState<CompListDto | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<CompListDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // React Query hooks
  const {
    data: companies = [],
    isLoading,
    error: queryError,
    refetch
  } = useCompanies();

  const createCompanyMutation = useCreateCompany({
    onError: (error) => {
      setFormError(error.message || 'Failed to create company');
    }
  });

  const updateCompanyMutation = useUpdateCompany({
    onError: (error) => {
      setFormError(error.message || 'Failed to update company');
    }
  });

  const deleteCompanyMutation = useDeleteCompany({
    onError: (error) => {
      setFormError(error.message || 'Failed to delete company');
    }
  });

  const handleAddCompany = async (companyData: { name: string; nameAm: string; code?: string }) => {
    setFormError(null);
    const newCompanyData: AddCompDto = { ...companyData };
    await createCompanyMutation.mutateAsync(newCompanyData);
  };

  const handleEditCompany = async (updatedCompany: CompListDto) => {
    setFormError(null);
    await updateCompanyMutation.mutateAsync(updatedCompany);
    setEditCompany(null);
  };

  const handleDeleteCompany = async (companyId: UUID) => {
    setFormError(null);
    await deleteCompanyMutation.mutateAsync(companyId);
    setDeleteCompany(null);
  };


// In CompSection.tsx
  const handleViewBranches = (companyId: UUID) => {
    // Navigate to the company branches view instead
    navigate(`/core/company/${companyId}/branches`);
  };
  const handleRefresh = () => {
    refetch();
  };

  const handleCloseError = () => {
    setFormError(null);
    if (queryError) refetch();
  };

  const displayError = queryError?.message || formError;

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
                Companies
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage company profiles and branch locations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-sm"
                disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AddCompModal onAddCompany={handleAddCompany} />
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {displayError.includes("load") ? (
                  <>
                    Failed to load companies.{' '}
                    <button
                        onClick={handleRefresh}
                        className="underline hover:text-red-800 font-medium"
                        disabled={isLoading}
                    >
                      Try again
                    </button>
                  </>
              ) : (
                  displayError
              )}
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

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
            </div>
        )}

        {/* Empty State */}
        {!isLoading && companies.length === 0 && !displayError && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No companies found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click "Add Company" to create your first company
              </p>
            </div>
        )}

        {/* Companies List */}
        {!isLoading && companies.length > 0 && (
            <CompList
                companies={companies}
                onEditCompany={setEditCompany}
                onDeleteCompany={setDeleteCompany}
                onViewBranches={handleViewBranches}
            />
        )}

        {/* Edit Modal */}
        <EditCompModal
            company={editCompany}
            isOpen={!!editCompany}
            onClose={() => setEditCompany(null)}
            onSave={handleEditCompany}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteCompDialog
            company={deleteCompany}
            isOpen={!!deleteCompany}
            onClose={() => setDeleteCompany(null)}
            onConfirm={handleDeleteCompany}
        />
      </div>
  );
};

export default CompSection;