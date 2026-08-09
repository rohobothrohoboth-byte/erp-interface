// src/pages/settings/finance/PagePaymentApprovalChain.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Search, Edit, Trash2, RefreshCw,
    GitBranch, ChevronLeft, ChevronRight,
    CheckCircle, XCircle, Users, Clock,
    ArrowUp, ArrowDown, User, Shield
} from 'lucide-react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import {
    getPaymentApprovalChains,
    createPaymentApprovalChain,
    updatePaymentApprovalChain,
    deletePaymentApprovalChain
} from '../../../services/finance/finance.api';

interface ApprovalStep {
    id: string;
    order: number;
    role: string;
    approverName?: string;
    approverId?: string;
}

interface PaymentApprovalChain {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    description?: string;
    isActive: boolean;
    paymentType: string;
    minAmount?: number;
    maxAmount?: number;
    steps: ApprovalStep[];
    dateAdd: string;
}

const PagePaymentApprovalChain = () => {
    const [chains, setChains] = useState<PaymentApprovalChain[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedChain, setSelectedChain] = useState<PaymentApprovalChain | null>(null);
    const [steps, setSteps] = useState<ApprovalStep[]>([
        { id: '1', order: 1, role: 'Manager' },
        { id: '2', order: 2, role: 'Finance' },
        { id: '3', order: 3, role: 'Director' },
    ]);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameAm: '',
        description: '',
        paymentType: 'All',
        minAmount: 0,
        maxAmount: 0,
        isActive: true,
    });
    const itemsPerPage = 10;

    useEffect(() => {
        fetchChains();
    }, []);

    // ✅ REAL API CALL
    const fetchChains = async () => {
        setLoading(true);
        try {
            const response = await getPaymentApprovalChains();
            const data = response.data.data || response.data || [];
            setChains(data);
        } catch (error) {
            console.error('Error fetching approval chains:', error);
            showToast.error('Failed to load approval chains');
        } finally {
            setLoading(false);
        }
    };

    // ✅ REAL API CALL
    const handleAdd = async () => {
        try {
            const payload = {
                ...formData,
                steps: steps.map((step, index) => ({
                    order: step.order || index + 1,
                    role: step.role,
                    approverName: step.approverName || '',
                    approverId: step.approverId || null,
                }))
            };
            await createPaymentApprovalChain(payload);
            showToast.success('Approval chain created successfully');
            setIsAddModalOpen(false);
            resetForm();
            fetchChains();
        } catch (error) {
            console.error('Error creating approval chain:', error);
            showToast.error('Failed to create approval chain');
        }
    };

    // ✅ REAL API CALL
    const handleEdit = async () => {
        if (!selectedChain) return;
        try {
            const payload = {
                id: selectedChain.id,
                ...formData,
                steps: steps.map((step) => ({
                    id: step.id,
                    order: step.order,
                    role: step.role,
                    approverName: step.approverName || '',
                    approverId: step.approverId || null,
                }))
            };
            await updatePaymentApprovalChain(payload);
            showToast.success('Approval chain updated successfully');
            setIsEditModalOpen(false);
            resetForm();
            fetchChains();
        } catch (error) {
            console.error('Error updating approval chain:', error);
            showToast.error('Failed to update approval chain');
        }
    };

    // ✅ REAL API CALL
    const handleDelete = async () => {
        if (!selectedChain) return;
        try {
            await deletePaymentApprovalChain(selectedChain.id);
            showToast.success('Approval chain deleted successfully');
            setIsDeleteDialogOpen(false);
            fetchChains();
        } catch (error) {
            console.error('Error deleting approval chain:', error);
            showToast.error('Failed to delete approval chain');
        }
    };


    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            nameAm: '',
            description: '',
            paymentType: 'All',
            minAmount: 0,
            maxAmount: 0,
            isActive: true,
        });
        setSteps([
            { id: '1', order: 1, role: 'Manager' },
            { id: '2', order: 2, role: 'Finance' },
            { id: '3', order: 3, role: 'Director' },
        ]);
        setSelectedChain(null);
    };

    const openEditModal = (chain: PaymentApprovalChain) => {
        setSelectedChain(chain);
        setFormData({
            code: chain.code,
            name: chain.name,
            nameAm: chain.nameAm || '',
            description: chain.description || '',
            paymentType: chain.paymentType,
            minAmount: chain.minAmount || 0,
            maxAmount: chain.maxAmount || 0,
            isActive: chain.isActive,
        });
        setSteps(chain.steps);
        setIsEditModalOpen(true);
    };

    const addStep = () => {
        const newStep: ApprovalStep = {
            id: Date.now().toString(),
            order: steps.length + 1,
            role: '',
        };
        setSteps([...steps, newStep]);
    };

    const removeStep = (id: string) => {
        if (steps.length <= 1) {
            showToast.warning('Minimum one step required');
            return;
        }
        const updatedSteps = steps.filter(s => s.id !== id).map((s, index) => ({
            ...s,
            order: index + 1,
        }));
        setSteps(updatedSteps);
    };

    const updateStep = (id: string, field: keyof ApprovalStep, value: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const filteredChains = chains.filter(chain =>
        chain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chain.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredChains.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedChains = filteredChains.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <GitBranch className="h-6 w-6 text-indigo-600" />
                        Payment Approval Chains
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure payment approval workflows and chains
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchChains}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        New Chain
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Chains</p>
                        <p className="text-2xl font-bold text-gray-900">{chains.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {chains.filter(c => c.isActive).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Inactive</p>
                        <p className="text-2xl font-bold text-red-600">
                            {chains.filter(c => !c.isActive).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Avg Steps</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {chains.length > 0 ? (chains.reduce((sum, c) => sum + c.steps.length, 0) / chains.length).toFixed(1) : 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search approval chains..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Range</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Steps</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedChains.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No approval chains found
                                </td>
                            </tr>
                        ) : (
                            paginatedChains.map((chain) => (
                                <tr key={chain.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{chain.code}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{chain.name}</p>
                                            {chain.nameAm && (
                                                <p className="text-xs text-gray-400">{chain.nameAm}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{chain.paymentType}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {chain.minAmount && chain.minAmount > 0 ? formatCurrency(chain.minAmount) : '0'} -
                                        {chain.maxAmount && chain.maxAmount > 0 ? formatCurrency(chain.maxAmount) : '∞'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{chain.steps.length} steps</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={chain.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                            {chain.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => openEditModal(chain)}
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-green-500" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedChain(chain);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredChains.length)} of {filteredChains.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isAddModalOpen ? 'Add New Approval Chain' : 'Edit Approval Chain'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Code *</label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., PAC-001"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Payment Type</label>
                                <select
                                    value={formData.paymentType}
                                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="All">All</option>
                                    <option value="Petty Cash">Petty Cash</option>
                                    <option value="Supplier">Supplier</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Contractor">Contractor</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Name *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Chain name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                            <Input
                                value={formData.nameAm}
                                onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                                placeholder="የሰንሰለት ስም"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Min Amount</label>
                                <Input
                                    type="number"
                                    value={formData.minAmount}
                                    onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Max Amount</label>
                                <Input
                                    type="number"
                                    value={formData.maxAmount}
                                    onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Chain description"
                            />
                        </div>

                        {/* Approval Steps */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700">Approval Steps *</label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addStep}
                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                    <Plus size={14} className="mr-1" />
                                    Add Step
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                                            {step.order}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={step.role}
                                                onChange={(e) => updateStep(step.id, 'role', e.target.value)}
                                                placeholder="Role name (e.g., Manager, Finance)"
                                                className="border-gray-300"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStep(step.id)}
                                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Remove step"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-indigo-600 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700">Active</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddModalOpen(false);
                            setIsEditModalOpen(false);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={isAddModalOpen ? handleAdd : handleEdit} className="bg-indigo-600 hover:bg-indigo-700">
                            {isAddModalOpen ? 'Create' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Approval Chain</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedChain?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
};

export default PagePaymentApprovalChain;