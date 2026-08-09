// src/pages/finance/ap/components/PaymentsStats.tsx
import React from 'react';
import { FileText, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../../../../components/ui/card';
import type{ PaymentStats as PaymentStatsType } from '../types/payment.types';
import { formatCurrency } from '../utils/payment.utils';

interface PaymentsStatsProps {
    stats: PaymentStatsType;
}

export const PaymentsStats: React.FC<PaymentsStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-gray-200 rounded-lg">
                            <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Draft</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.draft}</p>
                        </div>
                        <div className="p-3 bg-yellow-200 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Posted</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.posted}</p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Paid</p>
                            <p className="text-2xl font-bold text-green-900">{stats.paid}</p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-700" />
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
                            <DollarSign className="h-5 w-5 text-purple-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};