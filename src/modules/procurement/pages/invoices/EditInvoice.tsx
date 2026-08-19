import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    FileText,
    Building2,
    Calendar,
    DollarSign,
    Loader2,
    User,
    Hash,
    Package,
    Receipt,
    X,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { useAuthStore } from '@/shared/stores/auth.store';
import { getInvoiceById } from '@/modules/procurement/services/invoice.api';

// Since we don't have an update endpoint yet, this is a placeholder
const EditInvoice = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { userId, userName } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        invoiceDate: '',
        dueDate: '',
        paymentTerms: 'Net 30',
        notes: ''
    });

    const fetchInvoice = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getInvoiceById(id);
            setInvoice(data);
            setFormData({
                title: data.title || '',
                invoiceDate: data.invoiceDate?.split('T')[0] || '',
                dueDate: data.dueDate?.split('T')[0] || '',
                paymentTerms: data.paymentTerms || 'Net 30',
                notes: data.notes || ''
            });
        } catch (error: any) {
            showToast.error(error?.response?.data?.message || 'Failed to load invoice');
            navigate('/procurement/invoice');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        showToast.info('Edit functionality coming soon');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Invoice not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/procurement/invoice')}>
                    Back to Invoices
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/procurement/invoice/${id}`)} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
                        <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
                    </div>
                </div>
                <Badge className={invoice.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}>
                    {invoice.status === 'Draft' ? 'Editable' : 'Read Only'}
                </Badge>
            </div>

            {invoice.status !== 'Draft' ? (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <p className="text-sm text-yellow-700">
                                This invoice has been sent and cannot be edited.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Same form as CreateInvoice but pre-filled */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Title</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Invoice title"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Invoice Date</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.invoiceDate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <Label>Due Date</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Payment Terms</Label>
                                            <Select
                                                value={formData.paymentTerms}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Notes</Label>
                                            <textarea
                                                rows={3}
                                                placeholder="Additional notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                                    <div className="space-y-3">
                                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            Update Invoice
                                        </Button>
                                        <Button type="button" variant="outline" className="w-full" onClick={() => navigate(`/procurement/invoice/${id}`)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            )}
        </motion.div>
    );
};

export default EditInvoice;