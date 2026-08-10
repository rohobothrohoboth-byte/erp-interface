// src/pages/finance/PageAccountDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Folder, Coins, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { getAccountById } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';

interface AccountDetail {
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

const PageAccountDetail: React.FC = () => {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState<AccountDetail | null>(null);

    useEffect(() => {
        if (accountId) {
            fetchAccount(accountId);
        }
    }, [accountId]);

    const fetchAccount = async (id: string) => {
        try {
            setLoading(true);
            const res = await getAccountById(id);
            const data = res.data.data || res.data;
            setAccount(data);
        } catch (error) {
            console.error('Error fetching account:', error);
            showToast.error('Failed to load account details');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Account not found</p>
                <button
                    onClick={() => navigate('/finance/accounts')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                >
                    Back to Accounts
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate('/finance/accounts')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Accounts
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                            <FileText size={32} className="text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
                            <p className="text-sm text-gray-500 font-mono">{account.code}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
            <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                    account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
            >
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(account.accountType)}`}>
              {account.accountType}
            </span>
                    </div>
                </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Folder size={18} />
                            <span className="text-sm font-medium">Account Type</span>
                        </div>
                        <p className="text-gray-900 font-medium">{account.accountType}</p>
                    </div>

                    {account.accountSubType && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Folder size={18} />
                                <span className="text-sm font-medium">Sub Type</span>
                            </div>
                            <p className="text-gray-900 font-medium">{account.accountSubType}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Building size={18} />
                            <span className="text-sm font-medium">Level</span>
                        </div>
                        <p className="text-gray-900 font-medium">{account.level}</p>
                    </div>

                    {account.parentName && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Folder size={18} />
                                <span className="text-sm font-medium">Parent Account</span>
                            </div>
                            <p className="text-gray-900 font-medium">{account.parentName}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Created</span>
                        </div>
                        <p className="text-gray-900 font-medium">{formatDate(account.dateAdd)}</p>
                    </div>

                    {account.description && (
                        <div className="space-y-2 col-span-full">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FileText size={18} />
                                <span className="text-sm font-medium">Description</span>
                            </div>
                            <p className="text-gray-900">{account.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Balance Card */}
            {account.openingBalance !== undefined && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-700">
                            <DollarSign size={24} />
                            <span className="text-lg font-medium">Opening Balance</span>
                        </div>
                        <p className="text-3xl font-bold text-indigo-900">
                            {formatCurrency(account.openingBalance)}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PageAccountDetail;