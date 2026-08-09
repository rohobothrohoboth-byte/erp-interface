// src/components/crm/interactions/ViewInteractionModal.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
    X,
    MessageSquare,
    Mail,
    Phone,
    Users,
    Calendar,
    Clock,
    User,
    Building2,
    FileText,
    Target,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    AlertCircle,
    Edit,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { InteractionDto } from '../../../types/crm/crm.types';

interface ViewInteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    interaction: InteractionDto | null;
    onEdit?: () => void;
}

const ViewInteractionModal: React.FC<ViewInteractionModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       interaction,
                                                                       onEdit,
                                                                   }) => {
    if (!isOpen || !interaction) return null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Call':
                return <Phone className="h-5 w-5" />;
            case 'Email':
                return <Mail className="h-5 w-5" />;
            case 'Meeting':
                return <Users className="h-5 w-5" />;
            case 'Note':
                return <FileText className="h-5 w-5" />;
            case 'Task':
                return <FileText className="h-5 w-5" />;
            case 'Chat':
                return <MessageSquare className="h-5 w-5" />;
            default:
                return <MessageSquare className="h-5 w-5" />;
        }
    };

    const getStatusBadge = (status: number) => {
        const variants: Record<number, { label: string; className: string; icon: React.ReactNode }> = {
            1: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Calendar className="h-3 w-3" /> },
            2: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <ClockIcon className="h-3 w-3" /> },
            3: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="h-3 w-3" /> },
            4: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
            5: { label: 'Postponed', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <AlertCircle className="h-3 w-3" /> },
        };
        return variants[status] || variants[1];
    };

    const getPriorityBadge = (priority: number) => {
        const variants: Record<number, { label: string; className: string }> = {
            1: { label: 'Low', className: 'bg-gray-100 text-gray-700 border-gray-200' },
            2: { label: 'Medium', className: 'bg-blue-100 text-blue-700 border-blue-200' },
            3: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200' },
            4: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200' },
        };
        return variants[priority] || variants[1];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

    const status = getStatusBadge(interaction.status || 1);
    const priority = getPriorityBadge(interaction.priority || 2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

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
                            {getTypeIcon(interaction.type)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{interaction.subject}</h2>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <Badge className={status.className}>
                                    <span className="flex items-center gap-1">
                                        {status.icon}
                                        {status.label}
                                    </span>
                                </Badge>
                                <Badge className={priority.className}>
                                    {priority.label}
                                </Badge>
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                    {interaction.type}
                                </Badge>
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
                    {/* Description */}
                    {interaction.description && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Description
                            </h3>
                            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {interaction.description}
                            </p>
                        </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(interaction.leadName || interaction.leadId) && (
                            <InfoRow icon={User} label="Lead" value={interaction.leadName || interaction.leadId} />
                        )}
                        {(interaction.customerName || interaction.customerId) && (
                            <InfoRow icon={Building2} label="Customer" value={interaction.customerName || interaction.customerId} />
                        )}
                        <InfoRow icon={Users} label="Assigned To" value={interaction.assignedToUserName || 'Unassigned'} />
                        <InfoRow icon={Clock} label="Duration" value={interaction.duration ? `${interaction.duration} min` : undefined} />
                        <InfoRow icon={Calendar} label="Scheduled" value={formatDate(interaction.scheduledDate)} />
                        <InfoRow icon={CheckCircle} label="Completed" value={formatDate(interaction.completedDate)} />
                        <InfoRow icon={Target} label="Location" value={interaction.location} />
                    </div>

                    {/* Outcome */}
                    {interaction.outcome && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Outcome
                            </h3>
                            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {interaction.outcome}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(interaction.createdAt)}
                        </span>
                        {interaction.updatedAt && (
                            <span className="flex items-center gap-1">
                                Updated: {formatDate(interaction.updatedAt)}
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Interaction
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ViewInteractionModal;