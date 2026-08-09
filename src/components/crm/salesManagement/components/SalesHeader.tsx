// src/components/crm/salesManagement/components/SalesHeader.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../../../ui/button';

export interface SalesHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    showBackButton?: boolean;
    backPath?: string;
    onRefresh?: () => void;
    onAdd?: () => void;
    addButtonText?: string;
    actions?: React.ReactNode;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({
                                                            title,
                                                            subtitle,
                                                            icon,
                                                            showBackButton = false,
                                                            backPath = '/crm/sales',
                                                            onRefresh,
                                                            onAdd,
                                                            addButtonText = 'Add',
                                                            actions,
                                                        }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {showBackButton && (
                    <button
                        onClick={() => navigate(backPath)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                )}
                {icon && (
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {actions}
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={onRefresh}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                )}
                {onAdd && (
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={onAdd}
                    >
                        <Plus size={16} />
                        {addButtonText}
                    </Button>
                )}
            </div>
        </div>
    );
};