// src/components/crm/salesManagement/components/contracts/ViewContractModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    DollarSign,
    Calendar,
    Building2,
    Users,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Mail,
    Phone,
    AlertCircle,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Badge } from '../../../../ui/badge';
import type { ContractDto } from '../../../../../types/crm/crm.types';

interface ViewContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    contract: ContractDto | null;
    isLoading?: boolean;
}

const ViewContractModal: React.FC<ViewContractModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onEdit,
                                                                 onDelete,
                                                                 contract,
                                                                 isLoading = false,
                                                             }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusValue = (status: number | string): number => {
        return typeof status === 'string' ? parseInt(status) : status;
    };

    const getStatusBadge = (status: number | string) => {
        const statusNum = getStatusValue(status);
        const variants: Record<number, { label: string; className: string; icon: React.ReactNode }> = {
            1: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FileText className="h-4 w-4" /> },
            2: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
            3: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
            4: { label: 'Signed', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FileText className="h-4 w-4" /> },
            5: { label: 'Expired', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock className="h-4 w-4" /> },
            6: { label: 'Terminated', className: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-4 w-4" /> },
        };
        return variants[statusNum] || variants[1];
    };

    const statusNum = getStatusValue(contract.status);
    const isEditable = statusNum === 1 || statusNum === 2; // Draft or Pending
    const isDeletable = statusNum === 1 || statusNum === 2; // Draft or Pending

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8"
                >
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="mt-4 text-gray-600 font-medium">Loading contract details...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!contract) return null;

    const statusInfo = getStatusBadge(contract.status);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 rounded-lg p-2">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {contract.contractNumber}
                                        </h2>
                                        <p className="text-sm text-indigo-200">
                                            {contract.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={statusInfo.className}>
                                        <span className="flex items-center gap-1">
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </span>
                                    </Badge>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                                {isEditable && onEdit && (
                                    <Button
                                        size="sm"
                                        onClick={onEdit}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                                {isDeletable && onDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onDelete}
                                        className="border-red-300 text-red-600 hover:bg-red-50 ml-auto"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                )}
                            </div>

                            {/* Status Message for Non-Editable Contracts */}
                            {!isEditable && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>
                                        This contract is <strong>{contract.status}</strong> and cannot be modified.
                                    </span>
                                </div>
                            )}

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-700 font-medium">Total Value</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {formatCurrency(contract.totalValue || 0)}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-blue-200 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-blue-700" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-700 font-medium">Start Date</p>
                                                <p className="text-lg font-bold text-green-900">
                                                    {formatDate(contract.startDate)}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-green-200 rounded-lg">
                                                <Calendar className="h-5 w-5 text-green-700" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-purple-700 font-medium">End Date</p>
                                                <p className="text-lg font-bold text-purple-900">
                                                    {formatDate(contract.endDate)}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-purple-200 rounded-lg">
                                                <Calendar className="h-5 w-5 text-purple-700" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Description */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Description</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700">
                                                {contract.description || 'No description provided.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Terms & Conditions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Terms & Conditions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {contract.termsAndConditions || 'No terms and conditions specified.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    {/* Customer Info */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Customer</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 rounded-full">
                                                    <Building2 className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {contract.customerName || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Related Records */}
                                    {(contract.opportunityName || contract.quoteNumber) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Related Records</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {contract.opportunityName && (
                                                    <div className="flex items-center gap-3">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700">
                                                            Opportunity: {contract.opportunityName}
                                                        </span>
                                                    </div>
                                                )}
                                                {contract.quoteNumber && (
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700">
                                                            Quote: {contract.quoteNumber}
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Signed Date */}
                                    {contract.signedDate && (
                                        <Card className="border-green-200 bg-green-50">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2 text-green-700">
                                                    <CheckCircle className="h-5 w-5" />
                                                    <span className="text-sm font-medium">
                                                                        Signed on {formatDate(contract.signedDate)}
                                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Status:</span>
                                <Badge className={statusInfo.className}>
                                    <span className="flex items-center gap-1">
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                    </span>
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                                {isEditable && onEdit && (
                                    <Button
                                        onClick={onEdit}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Contract
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewContractModal;