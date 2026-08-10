// src/components/hr/Leave/ProcessResult.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { CheckCircle, AlertCircle, Users, TrendingUp, DollarSign, Undo2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { ProcessResult as ProcessResultType } from '@/modules/hr/types/leave/leaveye';

interface Props {
    result: ProcessResultType | null;
    isAdminOrManager: boolean;
    onRevert: () => void;
    reverting: boolean;
}

export const ProcessResult: React.FC<Props> = ({ result, isAdminOrManager, onRevert, reverting }) => {
    // If result is null, don't render anything
    if (!result) {
        return null;
    }

    // Check if there's actual data to show
    const employeesProcessed = result.employeesProcessed ?? 0;
    const carryoverRecordsCreated = result.carryoverRecordsCreated ?? 0;
    const encashmentRecordsCreated = result.encashmentRecordsCreated ?? 0;

    // If all counts are zero, don't render the component (nothing to show/revert)
    if (employeesProcessed === 0 && carryoverRecordsCreated === 0 && encashmentRecordsCreated === 0) {
        return null;
    }

    const success = result.success === true;
    const message = result.message || (success ? 'Processing completed successfully' : 'Processing failed');
    const processedAt = result.processedAt ? new Date(result.processedAt).toLocaleString() : new Date().toLocaleString();
    const errors = result.errors || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        {success ?
                            <CheckCircle className="w-5 h-5 text-green-600" /> :
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        }
                        <span>Processing Result</span>
                    </div>
                    {isAdminOrManager && success && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onRevert}
                            disabled={reverting}
                            className="flex items-center gap-2"
                        >
                            {reverting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Reverting...
                                </>
                            ) : (
                                <>
                                    <Undo2 className="w-4 h-4" />
                                    Revert
                                </>
                            )}
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Message Section */}
                <div className={`p-4 rounded-lg ${success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
                    <p className="text-xs text-gray-500 mt-1">Processed at: {processedAt}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700">{employeesProcessed}</p>
                        <p className="text-xs text-blue-600">Employees Processed</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700">{carryoverRecordsCreated}</p>
                        <p className="text-xs text-green-600">Carryover Records</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-700">{encashmentRecordsCreated}</p>
                        <p className="text-xs text-purple-600">Encashment Records</p>
                    </div>
                </div>

                {/* Errors Section */}
                {errors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                        <p className="font-medium text-red-800 mb-2">Errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, idx) => (
                                <li key={idx} className="text-sm text-red-700">
                                    {typeof error === 'string' ? error : error.errorMessage || 'Unknown error'}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};