// src/components/crm/companies/ViewCompanyModal.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Briefcase,
    Calendar,
    User,
    Users,
    Tag,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { CompanyDto } from '@/modules/crm/types/crm.types';

interface ViewCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: CompanyDto | null;
    onEdit?: () => void;
}

const ViewCompanyModal: React.FC<ViewCompanyModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               company,
                                                               onEdit,
                                                           }) => {
    if (!isOpen || !company) return null;

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'Active': 'bg-green-100 text-green-700 border-green-200',
            'Inactive': 'bg-gray-100 text-gray-700 border-gray-200',
            'Lead': 'bg-blue-100 text-blue-700 border-blue-200',
            'Prospect': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Customer': 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <Building2 className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge className={getStatusBadge(company.status)}>
                                    {company.status}
                                </Badge>
                                {company.industry && (
                                    <span className="text-sm text-gray-500">
                                        {company.industry}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InfoRow icon={Mail} label="Email" value={company.email} />
                            <InfoRow icon={Phone} label="Phone" value={company.phone} />
                            <InfoRow icon={Globe} label="Website" value={company.website} />
                            <InfoRow icon={Briefcase} label="Industry" value={company.industry} />
                        </div>
                    </div>

                    {/* Address */}
                    {(company.address || company.city || company.state || company.country) && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                Address
                            </h3>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        {company.address && (
                                            <p className="text-sm text-gray-900">{company.address}</p>
                                        )}
                                        {(company.city || company.state) && (
                                            <p className="text-sm text-gray-900">
                                                {company.city}{company.city && company.state ? ', ' : ''}{company.state}
                                            </p>
                                        )}
                                        {company.country && (
                                            <p className="text-sm text-gray-900">{company.country}</p>
                                        )}
                                        {company.postalCode && (
                                            <p className="text-sm text-gray-900">{company.postalCode}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {company.description && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                Description
                            </h3>
                            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {company.description}
                            </p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-blue-900">
                                {company.contactCount || 0}
                            </p>
                            <p className="text-xs text-blue-700">Contacts</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                            <Tag className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-green-900">
                                {company.leadCount || 0}
                            </p>
                            <p className="text-xs text-green-700">Leads</p>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(company.createdAt)}
                        </span>
                        {company.updatedAt && (
                            <span className="flex items-center gap-1">
                                Updated: {formatDate(company.updatedAt)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {onEdit && (
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={onEdit}
                        >
                            Edit Company
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ViewCompanyModal;