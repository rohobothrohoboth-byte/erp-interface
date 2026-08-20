import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createAccount,
  deleteAccount,
  getAccounts,
  toggleAccountStatus,
  updateAccount,
} from '@/modules/finance/services/finance.api';
import AccountFormModal, { type AccountFormValue } from '@/modules/finance/components/accounts/chartofAccount/AccountFormModal';
import { showToast } from '@/shared/layout/layout';

interface Account extends Partial<AccountFormValue> {
  id: string;
  code: string;
  name: string;
  accountType: string;
  normalBalance?: string;
  isActive: boolean;
  level: number;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const extractAccounts = (response: any): Account[] => {
    const value = response?.data;
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data?.items)) return value.data.items;
    return [];
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await getAccounts({ page: 1, pageSize: 500 });
      setAccounts(extractAccounts(response));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (data: AccountFormValue) => {
    const payload = {
      id: data.id,
      code: data.code,
      name: data.name,
      accountType: data.accountType,
      normalBalance: data.normalBalance,
      accountSubType: data.accountSubType || '',
      description: data.description || '',
      openingBalance: data.openingBalance || 0,
      isActive: data.isActive,
      level: 1,
    };

    if (data.id) {
      await updateAccount(payload);
      showToast.success('Account updated successfully');
    } else {
      await createAccount(payload);
      showToast.success('Account created successfully');
    }

    await fetchAccounts();
    setModalOpen(false);
    setSelectedAccount(null);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteAccount(id);
      showToast.success('Account deleted successfully');
      await fetchAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showToast.error(error?.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAccountStatus(id);
      await fetchAccounts();
      showToast.success('Account status updated');
    } catch (error: any) {
      console.error('Error toggling account status:', error);
      showToast.error(error?.response?.data?.message || 'Failed to update account status');
    }
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
    const search = searchTerm.toLowerCase();
    const matchesSearch = (account.name || '').toLowerCase().includes(search) || (account.code || '').toLowerCase().includes(search);
    const matchesType = filterType === 'All' || account.accountType === filterType;
    const matchesStatus = filterStatus === 'All' ||
      (filterStatus === 'Active' && account.isActive) ||
      (filterStatus === 'Inactive' && !account.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-500">Manage accounts and their normal balances</p>
        </div>
        <button onClick={() => { setSelectedAccount(null); setModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          <Plus size={18} /> Add Account
        </button>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2">
          <option value="All">All Types</option>
          <option value="Asset">Asset</option>
          <option value="Liability">Liability</option>
          <option value="Equity">Equity</option>
          <option value="Revenue">Revenue</option>
          <option value="Expense">Expense</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2">
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button onClick={fetchAccounts} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"><RefreshCw size={18} /> Refresh</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Normal Balance</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Level</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No accounts found</td></tr>
              ) : filteredAccounts.map(account => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-sm text-gray-900">{account.code}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{account.name}</td>
                  <td className="px-5 py-4"><span className={`rounded-full border px-2 py-1 text-xs font-medium ${getTypeColor(account.accountType)}`}>{account.accountType}</span></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${account.normalBalance === 'Credit' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{account.normalBalance || '—'}</span></td>
                  <td className="px-5 py-4 text-sm text-gray-500">{account.level || 1}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{account.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/finance/accounts/${account.id}`)} title="View details" className="rounded p-1 hover:bg-blue-100"><Eye size={16} className="text-blue-500" /></button>
                      <button onClick={() => handleEdit(account)} title="Edit" className="rounded p-1 hover:bg-yellow-100"><Edit size={16} className="text-yellow-600" /></button>
                      <button onClick={() => handleToggleStatus(account.id)} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">{account.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => handleDelete(account.id)} title="Delete" className="rounded p-1 hover:bg-red-100"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t bg-gray-50 px-6 py-3 text-sm text-gray-500">
          <span>Showing {filteredAccounts.length} of {accounts.length} accounts</span>
          <span className="text-indigo-600">{accounts.filter(a => a.isActive).length} active</span>
        </div>
      </div>

      <AccountFormModal
        isOpen={modalOpen}
        account={selectedAccount}
        onClose={() => { setModalOpen(false); setSelectedAccount(null); }}
        onSave={handleSaveAccount}
      />
    </motion.div>
  );
};

export default PageAccounts;
