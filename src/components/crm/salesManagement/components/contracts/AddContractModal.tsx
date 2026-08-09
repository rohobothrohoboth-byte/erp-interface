// src/components/crm/salesManagement/components/contracts/AddContractModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    DollarSign,
    Calendar,
    Building2,
    Users,
    Loader2,
    Target,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { createContract } from '../../../../../services/crm/crm.api';
import { getCustomers, getOpportunities, getQuotes, getQuoteById } from '../../../../../services/crm/crm.api';
import { showToast } from '../../../../../layout/layout';
import type { CustomerDto, OpportunityDto, QuoteDto } from '../../../../../types/crm/crm.types';

interface AddContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preSelectedCustomerId?: string;
    preSelectedOpportunityId?: string;
    preSelectedQuoteId?: string;
}

const AddContractModal: React.FC<AddContractModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSuccess,
                                                               preSelectedCustomerId,
                                                               preSelectedOpportunityId,
                                                               preSelectedQuoteId,
                                                           }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
    const [quotes, setQuotes] = useState<QuoteDto[]>([]);
    const [selectedQuoteData, setSelectedQuoteData] = useState<QuoteDto | null>(null);

    const [formData, setFormData] = useState({
        customerId: preSelectedCustomerId || '',
        opportunityId: preSelectedOpportunityId || '',
        quoteId: preSelectedQuoteId || '',
        title: '',
        description: '',
        totalValue: 0,
        status: 'Draft',
        startDate: '',
        endDate: '',
        termsAndConditions: '',
        notes: '',
    });

    const statusOptions = ['Draft', 'Pending', 'Active', 'Signed', 'Expired', 'Terminated'];

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            // Set default start date to today
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, startDate: today }));
        }
    }, [isOpen]);

    // When customer changes, fetch opportunities and quotes
    useEffect(() => {
        if (formData.customerId) {
            fetchOpportunitiesAndQuotes(formData.customerId);
        } else {
            setOpportunities([]);
            setQuotes([]);
        }
    }, [formData.customerId]);

    // When quote is selected, load its data
    useEffect(() => {
        if (formData.quoteId) {
            loadQuoteData(formData.quoteId);
        } else {
            setSelectedQuoteData(null);
        }
    }, [formData.quoteId]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [customersRes] = await Promise.all([
                getCustomers({ page: 1, pageSize: 1000 }),
            ]);
            setCustomers(customersRes.data?.data || []);

            if (formData.customerId) {
                await fetchOpportunitiesAndQuotes(formData.customerId);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const fetchOpportunitiesAndQuotes = async (customerId: string) => {
        try {
            const [oppsRes, quotesRes] = await Promise.all([
                getOpportunities({ customerId, page: 1, pageSize: 1000 }),
                getQuotes({ customerId, page: 1, pageSize: 1000 }),
            ]);
            setOpportunities(oppsRes.data?.data || []);
            setQuotes(quotesRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching opportunities/quotes:', error);
        }
    };

    const loadQuoteData = async (quoteId: string) => {
        try {
            setLoadingQuote(true);
            const quoteData = await getQuoteById(quoteId);
            setSelectedQuoteData(quoteData);

            // Populate form data from quote
            setFormData(prev => ({
                ...prev,
                customerId: quoteData.customerId || prev.customerId,
                opportunityId: quoteData.opportunityId || prev.opportunityId,
                totalValue: quoteData.totalAmount || 0,
                title: `Contract for ${quoteData.quoteNumber}`,
                description: `Contract based on quote ${quoteData.quoteNumber}\n${quoteData.notes || ''}`,
                termsAndConditions: quoteData.termsAndConditions || '',
                notes: quoteData.notes ? `From Quote: ${quoteData.quoteNumber}\n${quoteData.notes}` : `From Quote: ${quoteData.quoteNumber}`,
            }));

            showToast.success(`Quote ${quoteData.quoteNumber} loaded successfully`);
        } catch (error) {
            console.error('Error loading quote:', error);
            showToast.error('Failed to load quote data');
        } finally {
            setLoadingQuote(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleClearQuote = () => {
        setFormData(prev => ({ ...prev, quoteId: '' }));
        setSelectedQuoteData(null);
        setFormData(prev => ({
            ...prev,
            totalValue: 0,
            title: '',
            description: '',
            termsAndConditions: '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerId) {
            showToast.error('Please select a customer');
            return;
        }

        if (!formData.title.trim()) {
            showToast.error('Contract title is required');
            return;
        }

        try {
            setLoading(true);

            const contractData = {
                customerId: formData.customerId,
                opportunityId: formData.opportunityId || null,
                quoteId: formData.quoteId || null,
                title: formData.title,
                description: formData.description,
                totalValue: formData.totalValue,
                status: formData.status,
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                termsAndConditions: formData.termsAndConditions,
                notes: formData.notes,
            };

            console.log('Creating contract with data:', contractData);

            await createContract(contractData);
            showToast.success('Contract created successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating contract:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create contract');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            opportunityId: '',
            quoteId: '',
            title: '',
            description: '',
            totalValue: 0,
            status: 'Draft',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            termsAndConditions: '',
            notes: '',
        });
        setSelectedQuoteData(null);
    };

    if (!isOpen) return null;

    const isLoading = loading || loadingOptions || loadingQuote;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Create Contract</h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedQuoteData
                                            ? `From Quote: ${selectedQuoteData.quoteNumber}`
                                            : 'Create a new customer contract'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <span className="ml-3 text-gray-600">Loading...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Source Information */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Target className="h-4 w-4 mr-2" />
                                        Source Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="customerId" className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-gray-500" />
                                                Customer *
                                            </Label>
                                            <Select
                                                value={formData.customerId}
                                                onValueChange={(value) => handleSelectChange('customerId', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="opportunityId" className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-gray-500" />
                                                Opportunity
                                            </Label>
                                            <Select
                                                value={formData.opportunityId}
                                                onValueChange={(value) => handleSelectChange('opportunityId', value)}
                                                disabled={!formData.customerId}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select opportunity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {opportunities.map((opp) => (
                                                        <SelectItem key={opp.id} value={opp.id}>
                                                            {opp.name} (${opp.amount?.toLocaleString()})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="quoteId" className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                Quote
                                            </Label>
                                            <div className="flex gap-2">
                                                <Select
                                                    value={formData.quoteId}
                                                    onValueChange={(value) => handleSelectChange('quoteId', value)}
                                                    disabled={!formData.customerId}
                                                    className="flex-1"
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select quote" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {quotes.map((quote) => (
                                                            <SelectItem key={quote.id} value={quote.id}>
                                                                {quote.quoteNumber} (${quote.totalAmount?.toLocaleString()})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formData.quoteId && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleClearQuote}
                                                        className="mt-1 text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {selectedQuoteData && (
                                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                                    <span className="font-medium">Loaded from quote:</span> {selectedQuoteData.quoteNumber}
                                                    <span className="ml-2">•</span>
                                                    <span className="ml-2">Total: ${selectedQuoteData.totalAmount?.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Details */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="title" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            Contract Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter contract title"
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="totalValue" className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-gray-500" />
                                                Total Value
                                            </Label>
                                            <Input
                                                id="totalValue"
                                                name="totalValue"
                                                type="number"
                                                value={formData.totalValue}
                                                onChange={(e) => handleNumberChange('totalValue', e.target.value)}
                                                placeholder="0"
                                                className="mt-1"
                                                min={0}
                                                step={1000}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="status" className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                                Status
                                            </Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => handleSelectChange('status', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="startDate" className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                Start Date
                                            </Label>
                                            <Input
                                                id="startDate"
                                                name="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="endDate" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            End Date
                                        </Label>
                                        <Input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the contract..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                                        <Textarea
                                            id="termsAndConditions"
                                            name="termsAndConditions"
                                            value={formData.termsAndConditions}
                                            onChange={handleChange}
                                            placeholder="Terms and conditions..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Additional notes..."
                                            className="mt-1"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                {selectedQuoteData ? 'Create Contract from Quote' : 'Create Contract'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddContractModal;