// src/pages/settings/finance/PageAccounts.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, RefreshCw, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, FolderTree, DollarSign,
  Building2, Tag, AlertCircle, CheckCircle, XCircle,
  Download, Printer, MoreVertical
} from 'lucide-react';
import { getAccounts, deleteAccount, updateAccount } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

interface Account {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  accountType: string;
  accountSubType?: string;
  isActive: boolean;
  description?: string;
  openingBalance?: number;
  parentId?: string;
  parentName?: string;
  level: number;
  dateAdd: string;
  dateMod?: string;
}

const PageAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAccounts();
      const data = response.data.data || response.data || [];
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      showToast.success('Account deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast.error('Failed to delete account');
    }
  };

  const handleToggleStatus = async (account: Account) => {
    try {
      await updateAccount({
        ...account,
        isActive: !account.isActive,
      });
      showToast.success(`Account ${account.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchAccounts();
    } catch (error) {
      console.error('Error toggling account status:', error);
      showToast.error('Failed to update account status');
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || account.accountType === filterType;
    const matchesStatus = filterStatus === 'All' ||
        (filterStatus === 'Active' && account.isActive) ||
        (filterStatus === 'Inactive' && !account.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Asset: 'text-blue-600 bg-blue-50',
      Liability: 'text-red-600 bg-red-50',
      Equity: 'text-purple-600 bg-purple-50',
      Revenue: 'text-green-600 bg-green-50',
      Expense: 'text-orange-600 bg-orange-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FolderTree className="h-6 w-6 text-indigo-600" />
              Chart of Accounts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account hierarchy and structure
            </p>
          </div>
          <div className="flex gap-2">
            <Button
                onClick={fetchAccounts}
                variant="outline"
                className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
                variant="outline"
                className="flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </Button>
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus size={16} />
              New Account
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {accounts.filter(a => a.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {accounts.filter(a => !a.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Account Types</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(accounts.map(a => a.accountType)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Liability">Liability</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {paginatedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No accounts found
                    </td>
                  </tr>
              ) : (
                  paginatedAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{account.code}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{account.name}</p>
                            {account.nameAm && (
                                <p className="text-xs text-gray-400">{account.nameAm}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getTypeColor(account.accountType)}>
                            {account.accountType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(account.openingBalance || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View"
                            >
                              <Eye size={16} className="text-blue-500" />
                            </button>
                            <button
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                              <Edit size={16} className="text-green-500" />
                            </button>
                            <button
                                onClick={() => handleToggleStatus(account)}
                                className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
                                title={account.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {account.isActive ? (
                                  <XCircle size={16} className="text-amber-500" />
                              ) : (
                                  <CheckCircle size={16} className="text-green-500" />
                              )}
                            </button>
                            <button
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length}
                </p>
                <div className="flex gap-2">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="font-mono">{selectedAccount.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedAccount.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p>{selectedAccount.accountType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="font-bold">{formatCurrency(selectedAccount.openingBalance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={selectedAccount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {selectedAccount.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm">{formatDate(selectedAccount.dateAdd)}</p>
                    </div>
                  </div>
                  {selectedAccount.description && (
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm">{selectedAccount.description}</p>
                      </div>
                  )}
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedAccount?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={() => selectedAccount && handleDelete(selectedAccount.id)}
                  className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
  );
};

export default PageAccounts;