// src/pages/finance/ap/invoice/components/InvoiceStats.tsx

import React from 'react';
import { FileText, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { InvoiceStats as InvoiceStatsType } from '@/modules/finance/pages/ap/invoice/types/invoice.types';
import { formatCurrency } from '@/modules/finance/pages/ap/invoice/utils/invoice.utils';

interface InvoiceStatsProps {
    stats: InvoiceStatsType;
}

export const InvoiceStats: React.FC<InvoiceStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Invoices</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.totalInvoices}</p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {stats.pendingCount + stats.draftCount}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-200 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Paid</p>
                            <p className="text-2xl font-bold text-green-900">{stats.paidCount}</p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Total Amount</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {formatCurrency(stats.totalAmount)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-lg">
                            <DollarSign className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};