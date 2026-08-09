// src/pages/finance/PageAccounts.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getAccounts, toggleAccountStatus, deleteAccount,
  getBranches, getDepartments
} from '../../../services/finance/finance.api';
import AddAccountModal from '../../../components/finance/accounts/chartofAccount/AddAccountModal';

import DeleteAccountModal from '../../../components/finance/accounts/chartofAccount/DeleteAccountModal';
import EditAccountModal from '../../../components/finance/accounts/chartofAccount/EditAccountModal';
import { showToast } from '../../../layout/layout';


interface Account {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  accountType: string;
  accountSubType?: string;
  isActive: boolean;
  description?: string;
  level: number;
  openingBalance?: number;
  parentId?: string;
  parentName?: string;
  dateAdd: string;
  dateMod?: string;
}

const PageAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      const data = res.data.data || res.data || [];
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAccountStatus(id);
      await fetchAccounts();
      showToast.success('Account status toggled successfully');
    } catch (error) {
      console.error('Error toggling account status:', error);
      showToast.error('Failed to toggle account status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      await fetchAccounts();
      showToast.success('Account deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast.error('Failed to delete account');
    }
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/finance/accounts/${id}`);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Asset: 'bg-blue-100 text-blue-700 border-blue-200',
      Liability: 'bg-red-100 text-red-700 border-red-200',
      Equity: 'bg-purple-100 text-purple-700 border-purple-200',
      Revenue: 'bg-green-100 text-green-700 border-green-200',
      Expense: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
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
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
            <p className="text-gray-500">Manage your financial accounts</p>
          </div>
          <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
          <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
              onClick={fetchAccounts}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No accounts found
                    </td>
                  </tr>
              ) : (
                  filteredAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{account.code}</td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{account.name}</span>
                            {account.nameAm && (
                                <span className="text-xs text-gray-400 ml-2">({account.nameAm})</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(account.accountType)}`}>
                        {account.accountType}
                      </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{account.accountSubType || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{account.level}</td>
                        <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => handleViewDetails(account.id)}
                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                            >
                              <Eye size={16} className="text-blue-500" />
                            </button>
                            <button
                                onClick={() => handleEdit(account)}
                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                              <Edit size={16} className="text-yellow-600" />
                            </button>
                            <button
                                onClick={() => handleToggleStatus(account.id)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                title={account.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {account.isActive ? (
                                  <span className="text-red-500 text-xs font-medium">Deactivate</span>
                              ) : (
                                  <span className="text-green-500 text-xs font-medium">Activate</span>
                              )}
                            </button>
                            <button
                                onClick={() => handleDeleteClick(account)}
                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
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
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between">
            <span>Showing {filteredAccounts.length} of {accounts.length} accounts</span>
            <span className="text-indigo-600">
            {accounts.filter(a => a.isActive).length} active
          </span>
          </div>
        </div>

        {/* Modals */}
        <AddAccountModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddAccount={async (data) => {
              // Implement add account logic
              console.log('Add account data:', data);
              showToast.success('Account added successfully');
              await fetchAccounts();
              setIsAddModalOpen(false);
              return { data: { message: 'Account created successfully' } };
            }}
            accountCategories={[]}
            currencies={[]}
            companies={[]}
            parentAccount={null}
        />

        <EditAccountModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAccount(null);
            }}
            onEditAccount={async (data) => {
              console.log('Edit account data:', data);
              showToast.success('Account updated successfully');
              await fetchAccounts();
              setIsEditModalOpen(false);
              setSelectedAccount(null);
              return { data: { message: 'Account updated successfully' } };
            }}
            account={selectedAccount as any}
            accountCategories={[]}
            currencies={[]}
            companies={[]}
        />

        <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedAccount(null);
            }}
            onDelete={() => {
              if (selectedAccount) {
                handleDelete(selectedAccount.id);
              }
            }}
            accountName={selectedAccount?.name || ''}
        />
      </motion.div>
  );
};

export default PageAccounts;