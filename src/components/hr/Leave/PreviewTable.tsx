// src/components/hr/Leave/PreviewTable.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Coins, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { CarryoverPreview, EncashmentConfig } from '../../../types/hr/leave/leaveye';

interface Props {
    data: CarryoverPreview[];
    loading: boolean;
    fiscalYearName: string;
    hasProcessedData: boolean;
    encashmentConfig: Record<string, EncashmentConfig>;
    encashmentTotals: Record<string, number>;
    onEncashClick: (item: CarryoverPreview) => void;
    onYearEndProcess: () => void;
    isAlreadyProcessed?: boolean;  // Add this
    processing: boolean;
}

const ITEMS_PER_PAGE = 10;

export const PreviewTable: React.FC<Props> = ({
                                                  data,
                                                  loading,
                                                  fiscalYearName,
                                                  hasProcessedData,
                                                  encashmentConfig,
                                                  encashmentTotals,
                                                  onEncashClick,
                                                  onYearEndProcess,
                                                  processing
                                              }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalRemaining = data.reduce((s, i) => s + i.remainingBalance, 0);
    const totalCarryover = data.reduce((s, i) => s + i.carryoverAmount, 0);
    const totalLost = data.reduce((s, i) => s + i.lostAmount, 0);

    if (hasProcessedData) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Year-End Already Processed</h3>
                    <p className="text-gray-500">Processing completed for {fiscalYearName}.</p>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No data found for {fiscalYearName}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Carryover Preview for {fiscalYearName}</span>
                    <Button onClick={onYearEndProcess} disabled={processing} className="bg-purple-600 hover:bg-purple-700">
                        Process Year-End
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Leave Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Remaining</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Max Carryover</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Will Carry Over</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Will be Lost</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedData.map((item) => {
                            const config = encashmentConfig[item.leaveTypeId];
                            const totalEncashed = encashmentTotals[item.employeeId] || 0;
                            const maxEncashable = config?.maxEncashableDays || 0;
                            const remainingEncashable = Math.max(0, maxEncashable - totalEncashed);
                            const canEncash = config?.allowEncashment && item.remainingBalance > 0 && remainingEncashable > 0;
                            const hasReachedMax = totalEncashed >= maxEncashable && maxEncashable > 0;

                            return (
                                <tr key={`${item.employeeId}-${item.leaveTypeId}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.employeeName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{item.leaveTypeName}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">{item.remainingBalance.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right">{item.maxCarryoverDays.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{item.carryoverAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">{item.lostAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {canEncash ? (
                                            <Button size="sm" variant="outline" onClick={() => onEncashClick(item)} className="flex items-center gap-1">
                                                <Coins className="w-3 h-3" />
                                                Encash ({remainingEncashable} left)
                                            </Button>
                                        ) : hasReachedMax ? (
                                            <Badge variant="outline" className="text-gray-400 bg-gray-50">
                                                Max Encashed ({maxEncashable}/{maxEncashable})
                                            </Badge>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold">
                        <tr>
                            <td colSpan={2} className="px-4 py-3 text-sm">Total</td>
                            <td className="px-4 py-3 text-sm text-right">{totalRemaining.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right">-</td>
                            <td className="px-4 py-3 text-sm text-right text-green-600">{totalCarryover.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-red-600">{totalLost.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-center"></td>
                        </tr>
                        </tfoot>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="px-2 py-1 text-sm">{currentPage}</span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};