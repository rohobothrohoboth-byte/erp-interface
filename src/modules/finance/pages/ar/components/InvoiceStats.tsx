// src/pages/finance/ar/components/InvoiceStats.tsx
import React from 'react';
import { FileText, Clock, CheckCircle, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { InvoiceStats as InvoiceStatsType } from '@/modules/finance/pages/ar/types/invoice.types';
import { formatCurrency } from '@/modules/finance/pages/ar/utils/invoice.utils';

interface InvoiceStatsProps {
    stats: InvoiceStatsType;
}

export const InvoiceStats: React.FC<InvoiceStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Sales Invoices</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.totalInvoices}</p>
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
                            <p className="text-sm text-yellow-700 font-medium">Draft</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.draftCount}</p>
                            <p className="text-xs text-yellow-600 mt-1">Awaiting posting</p>
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

            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-700 font-medium">Paid</p>
                            <p className="text-2xl font-bold text-indigo-900">{stats.paidCount}</p>
                            <p className="text-xs text-indigo-600 mt-1">Fully paid</p>
                        </div>
                        <div className="p-3 bg-indigo-200 rounded-xl">
                            <BadgeCheck className="h-6 w-6 text-indigo-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};