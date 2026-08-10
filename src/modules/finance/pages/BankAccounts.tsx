// src/pages/finance/BankAccounts.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, Plus, Search, RefreshCw, Eye, Edit, Trash2,
    DollarSign, CreditCard, ChevronLeft, ChevronRight, MoreVertical,
    X, Save, AlertCircle, CheckCircle, Banknote, Wallet,
    Download, Printer, FileText
} from 'lucide-react';
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
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
    DialogFooter,
    DialogDescription,
} from '@/shared/components/ui/dialog';

interface BankAccount {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    openingBalance: number;
    currentBalance: number;
    isActive: boolean;
    branchId?: string;
    branchName?: string;
    dateAdd: string;
    dateMod?: string;
}

const BankAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBalance, setTotalBalance] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [formData, setFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        accountType: 'Checking',
        openingBalance: 0,
        branchId: '',
    });

    // ✅ Use the report export hook
    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
        title,
    } = useReportExport('bank-accounts');

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const res = await getBankAccounts();
            const data = res.data.data || res.data || [];
            setAccounts(data);
            setTotalBalance(data.reduce((sum: number, a: any) => sum + a.currentBalance, 0));
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            showToast.error('Failed to load bank accounts');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleAddAccount = async () => {
        if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            await createBankAccount(formData);
            showToast.success('Bank account created successfully');
            setIsAddModalOpen(false);
            resetForm();
            await fetchBankAccounts();
        } catch (error) {
            console.error('Error creating bank account:', error);
            showToast.error('Failed to create bank account');
        }
    };

    const handleUpdateAccount = async () => {
        if (!selectedAccount) return;
        try {
            await updateBankAccount({
                id: selectedAccount.id,
                ...formData,
                isActive: selectedAccount.isActive,
            });
            showToast.success('Bank account updated successfully');
            setIsEditModalOpen(false);
            await fetchBankAccounts();
        } catch (error) {
            console.error('Error updating bank account:', error);
            showToast.error('Failed to update bank account');
        }
    };

    const handleDeleteAccount = async () => {
        if (!selectedAccount) return;
        try {
            await deleteBankAccount(selectedAccount.id);
            showToast.success('Bank account deleted successfully');
            setIsDeleteModalOpen(false);
            await fetchBankAccounts();
        } catch (error) {
            console.error('Error deleting bank account:', error);
            showToast.error('Failed to delete bank account');
        }
    };

    const resetForm = () => {
        setFormData({
            accountName: '',
            accountNumber: '',
            bankName: '',
            accountType: 'Checking',
            openingBalance: 0,
            branchId: '',
        });
    };

    const openEditModal = (account: BankAccount) => {
        setSelectedAccount(account);
        setFormData({
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            bankName: account.bankName,
            accountType: account.accountType,
            openingBalance: account.openingBalance,
            branchId: account.branchId || '',
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (account: BankAccount) => {
        setSelectedAccount(account);
        setIsViewModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredAccounts = accounts.filter(a =>
        a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
                    <p className="text-sm text-gray-500">Manage all bank and cash accounts</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => handleRefresh(fetchBankAccounts)}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport(accounts)}
                        disabled={!accounts || accounts.length === 0}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Add Account
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Balance</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalBalance)}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Active Accounts</p>
                                <p className="text-2xl font-bold text-emerald-900">{accounts.filter(a => a.isActive).length}</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-lg">
                                <Building2 className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Accounts</p>
                                <p className="text-2xl font-bold text-purple-900">{accounts.length}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <CreditCard className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search accounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Number</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedAccounts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No bank accounts found
                                </td>
                            </tr>
                        ) : (
                            paginatedAccounts.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                                                <p className="text-xs text-gray-400">ID: {account.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{account.bankName}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{account.accountNumber}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                            {account.accountType}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                        {formatCurrency(account.currentBalance)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                            {account.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-0" align="end">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => openViewModal(account)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(account)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAccount(account);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAccounts.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAccounts.length)} of {filteredAccounts.length} accounts
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Account Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-indigo-600" />
                            Add Bank Account
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Account Name *</Label>
                            <Input
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                placeholder="e.g., Commercial Bank - Main"
                            />
                        </div>
                        <div>
                            <Label>Account Number *</Label>
                            <Input
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="e.g., 1000123456789"
                            />
                        </div>
                        <div>
                            <Label>Bank Name *</Label>
                            <Input
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="e.g., Commercial Bank of Ethiopia"
                            />
                        </div>
                        <div>
                            <Label>Account Type</Label>
                            <Select
                                value={formData.accountType}
                                onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Checking">Checking</SelectItem>
                                    <SelectItem value="Savings">Savings</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Opening Balance</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.openingBalance}
                                onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddAccount}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Account Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-indigo-600" />
                            Edit Bank Account
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Account Name *</Label>
                            <Input
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Account Number *</Label>
                            <Input
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Bank Name *</Label>
                            <Input
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Account Type</Label>
                            <Select
                                value={formData.accountType}
                                onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Checking">Checking</SelectItem>
                                    <SelectItem value="Savings">Savings</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateAccount}>
                            <Save className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Account Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Account Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedAccount && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Account Name</p>
                                    <p className="font-medium">{selectedAccount.accountName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Number</p>
                                    <p className="font-mono">{selectedAccount.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Bank Name</p>
                                    <p className="font-medium">{selectedAccount.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Type</p>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                        {selectedAccount.accountType}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Opening Balance</p>
                                    <p className="font-medium">{formatCurrency(selectedAccount.openingBalance)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Current Balance</p>
                                    <p className="font-medium text-indigo-600">{formatCurrency(selectedAccount.currentBalance)}</p>
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
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Account
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong>{selectedAccount?.accountName}</strong>?
                        </p>
                        <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ✅ Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export Bank Accounts'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the bank accounts list in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select
                                value={exportFormat}
                                onValueChange={(value: any) => setExportFormat(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500" />
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total Accounts: <strong>{accounts.length}</strong></p>
                                <p>Active Accounts: <strong>{accounts.filter(a => a.isActive).length}</strong></p>
                                <p>Total Balance: <strong>{formatCurrency(totalBalance)}</strong></p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 space-y-1">
                            <p>📄 PDF: Professional formatted report</p>
                            <p>📊 Excel: Full data with multiple sheets</p>
                            <p>📋 CSV: Raw data for further analysis</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleExport(accounts)}
                            disabled={exporting || !accounts || accounts.length === 0}
                        >
                            {exporting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export {exportFormat.toUpperCase()}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default BankAccounts;