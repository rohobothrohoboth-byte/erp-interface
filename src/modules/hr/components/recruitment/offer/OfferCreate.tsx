// src/pages/hr/recruitment/offer/OfferCreate.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, DollarSign, Calendar, Users, Send, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { useCreateOffer } from '@/modules/hr/services/recruitment/offer/offer.queries';
import { useApplicantDetail } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import type { OfferAddDto } from '@/modules/hr/types/recruit/offer';

interface OfferCreateModalProps {
    isOpen: boolean;
    applicantId: string;
    jobPostingId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const OfferCreateModal: React.FC<OfferCreateModalProps> = ({
                                                               isOpen,
                                                               applicantId,
                                                               jobPostingId,
                                                               onClose,
                                                               onSuccess,
                                                           }) => {
    const [form, setForm] = useState<OfferAddDto>({
        applicantId,
        jobPostingId,
        salary: 0,
        currency: 'USD',
        benefits: '',
        startDate: '',
        expiryDate: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateOffer({
        onSuccess: () => {
            showToast.success('Offer created successfully');
            onSuccess();
            onClose();
        },
        onError: (error) => {
            showToast.error(error.message);
        },
    });

    const { data: applicant } = useApplicantDetail(applicantId);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            const twoWeeks = new Date(today);
            twoWeeks.setDate(twoWeeks.getDate() + 14);

            setForm({
                applicantId,
                jobPostingId,
                salary: 0,
                currency: 'USD',
                benefits: '',
                startDate: today.toISOString().split('T')[0],
                expiryDate: twoWeeks.toISOString().split('T')[0],
                notes: '',
            });
            setErrors({});
        }
    }, [isOpen, applicantId, jobPostingId]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.salary || form.salary <= 0) {
            newErrors.salary = 'Please enter a valid salary';
        }

        if (!form.startDate) {
            newErrors.startDate = 'Please select a start date';
        } else {
            const selectedDate = new Date(form.startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.startDate = 'Start date cannot be in the past';
            }
        }

        if (!form.expiryDate) {
            newErrors.expiryDate = 'Please select an expiry date';
        } else {
            const selectedDate = new Date(form.expiryDate);
            const startDate = new Date(form.startDate);
            if (selectedDate < startDate) {
                newErrors.expiryDate = 'Expiry date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        createMutation.mutate({
            ...form,
            salary: Number(form.salary),
        });
    };

    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'NGN', 'KES', 'ZAR'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    onClick={(e) => { if (e.target === e.currentTarget && !createMutation.isPending) onClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Create Offer</h2>
                                    <p className="text-sm text-gray-500">{applicant?.applicant || 'Candidate'}</p>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">New</Badge>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-6">
                            {/* Applicant Info */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Offering to:</span>
                                    <span className="font-medium text-gray-800">{applicant?.applicant || 'Candidate'}</span>
                                </div>
                            </div>

                            {/* Salary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Salary <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="number"
                                            min={0}
                                            step={1000}
                                            placeholder="0"
                                            value={form.salary || ''}
                                            onChange={(e) => {
                                                setForm(f => ({ ...f, salary: parseFloat(e.target.value) || 0 }));
                                                setErrors(e => ({ ...e, salary: '' }));
                                            }}
                                            className={`pl-9 ${errors.salary ? 'border-red-500' : ''}`}
                                            disabled={createMutation.isPending}
                                        />
                                    </div>
                                    {errors.salary && (
                                        <p className="text-xs text-red-500">{errors.salary}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Currency</Label>
                                    <select
                                        value={form.currency}
                                        onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        disabled={createMutation.isPending}
                                    >
                                        {currencies.map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Benefits</Label>
                                <Textarea
                                    placeholder="e.g. Health insurance, 401k, Paid time off, etc."
                                    value={form.benefits}
                                    onChange={(e) => setForm(f => ({ ...f, benefits: e.target.value }))}
                                    rows={3}
                                    disabled={createMutation.isPending}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Start Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => {
                                            setForm(f => ({ ...f, startDate: e.target.value }));
                                            setErrors(e => ({ ...e, startDate: '' }));
                                        }}
                                        className={errors.startDate ? 'border-red-500' : ''}
                                        disabled={createMutation.isPending}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.startDate && (
                                        <p className="text-xs text-red-500">{errors.startDate}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Offer Expiry <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.expiryDate}
                                        onChange={(e) => {
                                            setForm(f => ({ ...f, expiryDate: e.target.value }));
                                            setErrors(e => ({ ...e, expiryDate: '' }));
                                        }}
                                        className={errors.expiryDate ? 'border-red-500' : ''}
                                        disabled={createMutation.isPending}
                                        min={form.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.expiryDate && (
                                        <p className="text-xs text-red-500">{errors.expiryDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Notes</Label>
                                <Textarea
                                    placeholder="Additional notes or conditions..."
                                    value={form.notes || ''}
                                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={2}
                                    disabled={createMutation.isPending}
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                <p className="text-xs text-green-700">
                                    💡 The offer will be created as a draft. You can review and send it to the candidate later.
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={createMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4 mr-2" />
                                            Create Offer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfferCreateModal;