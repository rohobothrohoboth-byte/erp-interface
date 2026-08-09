// src/pages/procurement/po/ReceivePurchaseOrder.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Loader2,
    CheckCircle,
    Calendar,
    User,
    FileText,
    Building2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import { getPurchaseOrderById } from '../../../services/procurement/purchaseOrder.api';
import type { PurchaseOrder } from '../../../types/procurement/purchaseOrder.types';

const ReceivePurchaseOrder = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
    const [receivedBy, setReceivedBy] = useState('');
    const [notes, setNotes] = useState('');

    const fetchPurchaseOrder = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await getPurchaseOrderById(id);
            const data = response?.data?.data || response?.data;
            if (!data) {
                showToast.error('Purchase order not found');
                navigate('/procurement/po');
                return;
            }
            setPurchaseOrder(data);
        } catch (error) {
            console.error('Error fetching purchase order:', error);
            showToast.error('Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchPurchaseOrder();
    }, [fetchPurchaseOrder]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseOrder) return;

        setSaving(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('Purchase order received successfully');
            navigate(`/procurement/po/${id}`);
        } catch (error) {
            console.error('Error receiving purchase order:', error);
            showToast.error('Failed to receive purchase order');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-12 w-12 text-emerald-600" />
            </div>
        );
    }

    if (!purchaseOrder) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/procurement/po')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Receive Purchase Order</h1>
                    <p className="text-sm text-gray-500">{purchaseOrder.purchaseOrderNumber}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                    Receive Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Received Date *</Label>
                                        <Input
                                            type="date"
                                            value={receivedDate}
                                            onChange={(e) => setReceivedDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Received By</Label>
                                        <Input
                                            placeholder="Enter receiver name"
                                            value={receivedBy}
                                            onChange={(e) => setReceivedBy(e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Notes</Label>
                                        <Input
                                            placeholder="Additional notes (optional)"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Description</th>
                                            <th className="px-4 py-2 text-right">Qty</th>
                                            <th className="px-4 py-2 text-right">Unit Price</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {purchaseOrder.lines?.map((line, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="px-4 py-2">{line.description}</td>
                                                <td className="px-4 py-2 text-right">{line.quantity}</td>
                                                <td className="px-4 py-2 text-right">${line.unitPrice}</td>
                                                <td className="px-4 py-2 text-right font-medium">${line.totalAmount}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Items</span>
                                        <span className="font-medium">{purchaseOrder.lines?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Amount</span>
                                        <span className="font-bold text-emerald-600">${purchaseOrder.totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vendor</span>
                                        <span className="font-medium">{purchaseOrder.vendorName}</span>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Confirm Receipt
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default ReceivePurchaseOrder;