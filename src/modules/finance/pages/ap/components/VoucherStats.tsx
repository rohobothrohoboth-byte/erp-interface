// components/VoucherStats.tsx
import React from 'react';
import { FileText, Clock, CheckCircle, X, Shield } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { VoucherStats as VoucherStatsType } from '@/modules/finance/pages/ap/components/types/voucher.types';
import { formatCurrency } from '@/modules/finance/pages/ap/components/utils/voucher.utils';

interface VoucherStatsProps {
    stats: VoucherStatsType;
}

export const VoucherStats: React.FC<VoucherStatsProps> = ({ stats }) => {
    const approvalRate = stats.totalVouchers > 0
        ? Math.round(((stats.approvedCount + stats.postedCount) / stats.totalVouchers) * 100)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Vouchers</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.totalVouchers}</p>
                            <p className="text-xs text-blue-600 mt-1">{formatCurrency(stats.totalAmount)} total</p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-xl">
                            <FileText className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.pendingCount}</p>
                            <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
                        </div>
                        <div className="p-3 bg-yellow-200 rounded-xl">
                            <Clock className="h-6 w-6 text-yellow-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Posted</p>
                            <p className="text-2xl font-bold text-green-900">{stats.postedCount}</p>
                            <p className="text-xs text-green-600 mt-1">In GL</p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-medium">Rejected</p>
                            <p className="text-2xl font-bold text-red-900">{stats.rejectedCount}</p>
                            <p className="text-xs text-red-600 mt-1">Needs correction</p>
                        </div>
                        <div className="p-3 bg-red-200 rounded-xl">
                            <X className="h-6 w-6 text-red-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Approval Rate</p>
                            <p className="text-2xl font-bold text-purple-900">{approvalRate}%</p>
                            <p className="text-xs text-purple-600 mt-1">{stats.approvedCount + stats.postedCount} approved</p>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-xl">
                            <Shield className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};