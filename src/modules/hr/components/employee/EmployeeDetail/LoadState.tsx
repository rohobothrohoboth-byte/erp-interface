import { motion } from 'framer-motion';
import {
    AlertCircle,
    Loader2,
    CheckCircle,
    RefreshCw,
    FileText,
    Database,
    WifiOff
} from 'lucide-react';

// ============ Loading Skeletons ============

interface DetailSkeletonProps {
    rows?: number;
    variant?: 'default' | 'card' | 'compact' | 'table';
}

export const DetailSkeleton = ({ rows = 4, variant = 'default' }: DetailSkeletonProps) => {
    const getGridCols = () => {
        switch (variant) {
            case 'compact': return 'grid-cols-2';
            case 'table': return 'grid-cols-1';
            default: return 'grid-cols-1 sm:grid-cols-2';
        }
    };

    const getPadding = () => {
        switch (variant) {
            case 'compact': return 'p-4';
            case 'table': return 'p-3';
            default: return 'p-6';
        }
    };

    const getHeaderSize = () => {
        switch (variant) {
            case 'compact': return 'h-5 w-24';
            case 'table': return 'h-4 w-20';
            default: return 'h-6 w-32';
        }
    };

    const getFieldHeight = () => {
        switch (variant) {
            case 'compact': return 'h-4';
            default: return 'h-5';
        }
    };

    const getLabelHeight = () => {
        switch (variant) {
            case 'compact': return 'h-2';
            default: return 'h-2.5';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-pulse"
        >
            {/* Header Skeleton */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                        <div className={`bg-slate-200 rounded-lg ${getHeaderSize()}`} />
                    </div>
                    <div className="w-16 h-6 bg-slate-200 rounded-full" />
                </div>
            </div>

            {/* Body Skeleton */}
            <div className={getPadding()}>
                <div className={`grid ${getGridCols()} gap-x-6 gap-y-5`}>
                    {Array.from({ length: rows * 2 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className={`bg-slate-200 rounded ${getLabelHeight()} w-1/3`} />
                            <div className={`bg-slate-100 rounded ${getFieldHeight()} w-3/4`} />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// Compact Skeleton for inline loading
export const CompactSkeleton = ({ rows = 2 }: { rows?: number }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="w-16 h-8 bg-slate-200 rounded-lg" />
            </div>
        ))}
    </div>
);

// Card Skeleton for dashboard-like layouts
export const CardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-100 rounded w-16" />
                </div>
            </div>
            <div className="w-12 h-8 bg-slate-200 rounded-full" />
        </div>
        <div className="space-y-3">
            <div className="h-8 bg-slate-100 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
        </div>
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100 animate-pulse">
        {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1">
                <div className={`h-4 bg-slate-100 rounded ${i === 0 ? 'w-3/4' : 'w-1/2'}`} />
            </div>
        ))}
        <div className="w-8 h-8 bg-slate-100 rounded-full" />
    </div>
);

// ============ Error Components ============

interface DetailErrorProps {
    message: string;
    onRetry?: () => void;
    variant?: 'default' | 'card' | 'inline' | 'full';
}

export const DetailError = ({ message, onRetry, variant = 'default' }: DetailErrorProps) => {
    const getLayout = () => {
        switch (variant) {
            case 'inline':
                return 'flex-row items-center p-3 text-left';
            case 'full':
                return 'flex-col p-12 text-center min-h-[400px] justify-center';
            default:
                return 'flex-row p-6 text-left';
        }
    };

    const getIconSize = () => {
        switch (variant) {
            case 'inline': return 'w-4 h-4';
            case 'full': return 'w-16 h-16';
            default: return 'w-5 h-5';
        }
    };

    const getMessageSize = () => {
        switch (variant) {
            case 'full': return 'text-base';
            default: return 'text-sm';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 flex ${getLayout()} gap-4 shadow-sm`}
        >
            <div className={`${variant === 'full' ? 'w-20 h-20' : 'w-10 h-10'} bg-red-200 rounded-full flex items-center justify-center shrink-0`}>
                {variant === 'full' ? (
                    <WifiOff className="w-8 h-8 text-red-600" />
                ) : (
                    <AlertCircle className={`${getIconSize()} text-red-600`} />
                )}
            </div>

            <div className={`flex-1 ${variant === 'full' ? 'text-center' : ''}`}>
                <h4 className={`font-semibold text-red-800 ${variant === 'full' ? 'text-lg mb-2' : 'text-sm'}`}>
                    {variant === 'full' ? 'Unable to Load Data' : 'Error'}
                </h4>
                <p className={`text-red-600 ${getMessageSize()}`}>{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// Success Message Component
export const DetailSuccess = ({ message, onClose }: { message: string; onClose?: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 flex items-center gap-3"
    >
        <div className="p-1.5 bg-emerald-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-sm text-emerald-700 flex-1">{message}</p>
        {onClose && (
            <button onClick={onClose} className="text-emerald-500 hover:text-emerald-700">
                <AlertCircle className="w-4 h-4" />
            </button>
        )}
    </motion.div>
);

// ============ Loading Indicators ============

interface InlineLoaderProps {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const InlineLoader = ({ text = 'Loading...', size = 'md' }: InlineLoaderProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const textClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    return (
        <div className="flex items-center justify-center gap-3 py-8">
            <div className="relative">
                <div className={`${sizeClasses[size]} border-2 border-emerald-200 rounded-full`} />
                <div className={`absolute top-0 left-0 ${sizeClasses[size]} border-2 border-emerald-500 border-t-transparent rounded-full animate-spin`} />
            </div>
            {text && <span className={`text-slate-500 ${textClasses[size]}`}>{text}</span>}
        </div>
    );
};

// Full Page Loader
export const FullPageLoader = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 rounded-full" />
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Loading...</p>
        </div>
    </div>
);

// ============ Empty State Components ============

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export const EmptyState = ({
                               title = 'No Data Available',
                               message = 'There is no information to display at this time.',
                               icon,
                               action
                           }: EmptyStateProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
    >
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon || <FileText className="w-10 h-10 text-slate-300" />}
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">{message}</p>
        {action && <div className="mt-6">{action}</div>}
    </motion.div>
);

// Database Empty State
export const DatabaseEmptyState = () => (
    <EmptyState
        title="No Records Found"
        message="No records match your search criteria. Try adjusting your filters or add a new record."
        icon={<Database className="w-10 h-10 text-slate-300" />}
    />
);