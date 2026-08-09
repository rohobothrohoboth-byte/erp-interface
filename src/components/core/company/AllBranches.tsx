import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { BranchSearch } from '../branch/BranchsSearch';
import { useBranches } from '../../../services/core/branch/branch.queries';

const AllBranchs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: branches = [],
    isLoading,
    error: queryError,
    refetch
  } = useBranches();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case '0': return 'bg-green-50 text-green-700 border-green-200';
      case '1': return 'bg-red-50 text-red-700 border-red-200';
      case '2': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "0": return "Active";
      case "1": return "Inactive";
      case "2": return "Under Construction";
      default: return status;
    }
  };

  const getBranchTypeText = (branchType: string): string => {
    switch (branchType) {
      case "0": return "Head Office";
      case "1": return "Regional";
      case "2": return "Local";
      case "3": return "Virtual";
      default: return branchType;
    }
  };

  // Filter branches based on search term
  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) {
      return branches;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    return branches.filter(branch =>
        branch.name?.toLowerCase().includes(lowercasedSearch) ||
        branch.location?.toLowerCase().includes(lowercasedSearch) ||
        branch.code?.toLowerCase().includes(lowercasedSearch) ||
        branch.comp?.toLowerCase().includes(lowercasedSearch)
    );
  }, [branches, searchTerm]);

  // Paginate filtered branches
  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBranches, currentPage]);

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const totalItems = filteredBranches.length;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const errorMessage = queryError?.message || null;

  // Pagination helpers
  const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  let displayedPages = totalPagesArray;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      displayedPages = [...totalPagesArray.slice(0, 5), -1, ...totalPagesArray.slice(-2)];
    } else if (currentPage >= totalPages - 3) {
      displayedPages = [...totalPagesArray.slice(0, 2), -1, ...totalPagesArray.slice(-5)];
    } else {
      displayedPages = [
        ...totalPagesArray.slice(0, 2),
        -1,
        ...totalPagesArray.slice(currentPage - 2, currentPage + 1),
        -1,
        ...totalPagesArray.slice(-2)
      ];
    }
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
              All Branches
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View all branch locations across the organization
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <BranchSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onRefresh={() => refetch()}
            loading={isLoading}
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
              </div>
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400"></div>
            </div>
        )}

        {/* Branch Table */}
        {!isLoading && !errorMessage && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Opened
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedBranches.length > 0 ? (
                      paginatedBranches.map((branch) => (
                          <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {branch.name}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {branch.code}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                              {getBranchTypeText(branch.branchType)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(branch.branchStat)}`}>
                          {getStatusText(branch.branchStatStr)}
                        </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                              {branch.location}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                              {branch.comp}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                              {branch.openDateStr}
                            </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                          {branches.length === 0
                              ? "No branches available."
                              : "No branches found matching your search criteria."}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginatedBranches.length > 0 && totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {startItem} to {endItem} of {totalItems} branches
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {displayedPages.map((page, index) => (
                            page === -1 ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-slate-400 dark:text-slate-500">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`h-8 w-8 rounded-md border text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? 'bg-slate-800 dark:bg-slate-700 border-slate-800 dark:border-slate-700 text-white'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  {page}
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default AllBranchs;