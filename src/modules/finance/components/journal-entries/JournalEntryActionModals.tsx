// components/finance/journal-entries/JournalEntryActionModals.tsx

import React from 'react';
import {
    AlertCircle,
    CheckCircle,
    X,
    RotateCcw,
    Trash2,
    Loader2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import type { JournalEntry } from '@/modules/finance/types/journalEntry.types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: JournalEntry | null;
    isSubmitting: boolean;
    onConfirm: () => void;
    type: 'delete' | 'post' | 'unpost' | 'approve' | 'reject' | 'reverse';
    rejectReason?: string;
    onRejectReasonChange?: (value: string) => void;
    reverseReason?: string;
    onReverseReasonChange?: (value: string) => void;
    reverseDate?: string;
    onReverseDateChange?: (value: string) => void;
}

export const JournalEntryActionModal: React.FC<Props> = ({
                                                             open,
                                                             onOpenChange,
                                                             entry,
                                                             isSubmitting,
                                                             onConfirm,
                                                             type,
                                                             rejectReason = '',
                                                             onRejectReasonChange,
                                                             reverseReason = '',
                                                             onReverseReasonChange,
                                                             reverseDate = '',
                                                             onReverseDateChange,
                                                         }) => {
    const getConfig = () => {
        switch (type) {
            case 'delete':
                return {
                    title: 'Delete Journal Entry',
                    description: 'This action cannot be undone.',
                    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    buttonIcon: <Trash2 className="h-4 w-4 mr-2" />,
                    buttonText: 'Delete',
                    loadingText: 'Deleting...',
                    iconColor: 'text-red-600',
                };
            case 'post':
                return {
                    title: 'Post Journal Entry',
                    description: 'This will update the general ledger.',
                    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                    buttonIcon: <CheckCircle className="h-4 w-4 mr-2" />,
                    buttonText: 'Post',
                    loadingText: 'Posting...',
                    iconColor: 'text-green-600',
                };
            case 'unpost':
                return {
                    title: 'Unpost Journal Entry',
                    description: 'This will reverse the posting.',
                    icon: <RotateCcw className="h-5 w-5 text-yellow-600" />,
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
                    buttonIcon: <RotateCcw className="h-4 w-4 mr-2" />,
                    buttonText: 'Unpost',
                    loadingText: 'Unposting...',
                    iconColor: 'text-yellow-600',
                };
            case 'approve':
                return {
                    title: 'Approve Journal Entry',
                    description: '',
                    icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                    buttonIcon: <CheckCircle className="h-4 w-4 mr-2" />,
                    buttonText: 'Approve',
                    loadingText: 'Approving...',
                    iconColor: 'text-blue-600',
                };
            case 'reject':
                return {
                    title: 'Reject Journal Entry',
                    description: 'Please provide a reason for rejection.',
                    icon: <X className="h-5 w-5 text-red-600" />,
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    buttonIcon: <X className="h-4 w-4 mr-2" />,
                    buttonText: 'Reject',
                    loadingText: 'Rejecting...',
                    iconColor: 'text-red-600',
                };
            case 'reverse':
                return {
                    title: 'Reverse Journal Entry',
                    description: 'This will create a reversal entry.',
                    icon: <RotateCcw className="h-5 w-5 text-purple-600" />,
                    buttonColor: 'bg-purple-600 hover:bg-purple-700',
                    buttonIcon: <RotateCcw className="h-4 w-4 mr-2" />,
                    buttonText: 'Reverse',
                    loadingText: 'Reversing...',
                    iconColor: 'text-purple-600',
                };
            default:
                return null;
        }
    };

    const config = getConfig();
    if (!config) return null;

    const isReject = type === 'reject';
    const isReverse = type === 'reverse';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${config.iconColor}`}>
                        {config.icon}
                        {config.title}
                    </DialogTitle>
                    {config.description && (
                        <DialogDescription>{config.description}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to {type.toLowerCase()} <strong>{entry?.reference}</strong>?
                    </p>

                    {isReject && (
                        <div>
                            <Label>Rejection Reason *</Label>
                            <Textarea
                                value={rejectReason}
                                onChange={(e) => onRejectReasonChange?.(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={3}
                            />
                        </div>
                    )}

                    {isReverse && (
                        <>
                            <div>
                                <Label>Reverse Date</Label>
                                <Input
                                    type="date"
                                    value={reverseDate}
                                    onChange={(e) => onReverseDateChange?.(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Reason (Optional)</Label>
                                <Input
                                    value={reverseReason}
                                    onChange={(e) => onReverseReasonChange?.(e.target.value)}
                                    placeholder="Reason for reversal..."
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className={config.buttonColor}
                        onClick={onConfirm}
                        disabled={isSubmitting || (isReject && !rejectReason)}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {config.loadingText}
                            </>
                        ) : (
                            <>
                                {config.buttonIcon}
                                {config.buttonText}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};