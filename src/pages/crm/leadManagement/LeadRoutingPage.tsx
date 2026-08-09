// src/pages/crm/leadManagement/LeadRoutingPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, RefreshCw, Plus, Edit, Trash2, Eye,
    Users, User, CheckCircle, XCircle, Clock,
    Filter, Search, MoreVertical, AlertCircle,
    Loader2, GitBranch, Settings, Zap, Target,
    BarChart3, TrendingUp, Activity
} from 'lucide-react';
import {
    getRoutingRules,
    deleteRoutingRule,
    getRoutingStats,
    createRoutingRule,
    updateRoutingRule
} from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Skeleton } from '../../../components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { RoutingRuleDto, CreateRoutingRuleDto, UpdateRoutingRuleDto } from '../../../types/crm/crm.types';

const LeadRoutingPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rules, setRules] = useState<RoutingRuleDto[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RoutingRuleDto | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateRoutingRuleDto>({
        name: '',
        description: '',
        type: 'PriorityBased',
        conditions: '',
        isActive: true,
        priority: 0,
        maxLeadsPerDay: 10,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rulesData, statsData] = await Promise.all([
                getRoutingRules(),
                getRoutingStats()
            ]);
            setRules(rulesData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching routing data:', error);
            showToast.error('Failed to load routing data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this routing rule?')) return;
        try {
            await deleteRoutingRule(id);
            showToast.success('Routing rule deleted successfully');
            fetchData();
        } catch (error) {
            showToast.error('Failed to delete routing rule');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showToast.error('Rule name is required');
            return;
        }

        try {
            setSubmitting(true);
            if (editingRule) {
                await updateRoutingRule(editingRule.id, formData);
                showToast.success('Routing rule updated successfully');
            } else {
                await createRoutingRule(formData);
                showToast.success('Routing rule created successfully');
            }
            setIsModalOpen(false);
            setEditingRule(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast.error(error?.response?.data?.message || 'Failed to save routing rule');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'PriorityBased',
            conditions: '',
            isActive: true,
            priority: 0,
            maxLeadsPerDay: 10,
        });
    };

    const openEditModal = (rule: RoutingRuleDto) => {
        setEditingRule(rule);
        setFormData({
            name: rule.name,
            description: rule.description || '',
            type: rule.type,
            conditions: rule.conditions || '',
            isActive: rule.isActive,
            priority: rule.priority,
            maxLeadsPerDay: rule.maxLeadsPerDay || 10,
        });
        setIsModalOpen(true);
    };

    const getTypeBadgeColor = (type: string) => {
        const colors: Record<string, string> = {
            RoundRobin: 'bg-blue-100 text-blue-700',
            LoadBalance: 'bg-green-100 text-green-700',
            SkillBased: 'bg-purple-100 text-purple-700',
            PriorityBased: 'bg-orange-100 text-orange-700',
            LocationBased: 'bg-cyan-100 text-cyan-700',
            Custom: 'bg-gray-100 text-gray-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredRules = rules.filter(rule =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats cards data
    const statsData = [
        {
            title: 'Total Rules',
            value: stats?.totalRules || 0,
            icon: <GitBranch className="h-4 w-4" />,
            color: 'bg-blue-500'
        },
        {
            title: 'Active Rules',
            value: stats?.activeRules || 0,
            icon: <CheckCircle className="h-4 w-4" />,
            color: 'bg-green-500'
        },
        {
            title: 'Total Routed',
            value: stats?.totalRouted || 0,
            icon: <Users className="h-4 w-4" />,
            color: 'bg-purple-500'
        },
        {
            title: 'Pending Routing',
            value: stats?.pendingRouting || 0,
            icon: <Clock className="h-4 w-4" />,
            color: 'bg-orange-500'
        },
        {
            title: 'Avg Response Time',
            value: stats?.avgResponseTime ? `${Math.round(stats.avgResponseTime)}s` : '0s',
            icon: <Activity className="h-4 w-4" />,
            color: 'bg-cyan-500'
        },
        {
            title: 'Rules by Type',
            value: Object.keys(stats?.rulesByType || {}).length || 0,
            icon: <BarChart3 className="h-4 w-4" />,
            color: 'bg-pink-500'
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32 mt-1" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lead Routing</h1>
                        <p className="text-sm text-gray-500">
                            Manage automatic lead assignment rules
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => {
                            resetForm();
                            setEditingRule(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        New Rule
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statsData.map((stat, index) => (
                    <Card key={index} className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <span className="text-white">{stat.icon}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search routing rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                </Button>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredRules.length === 0 ? (
                    <div className="text-center py-12">
                        <GitBranch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No routing rules found</h3>
                        <p className="text-gray-500">Create your first routing rule to automate lead assignment.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => {
                                resetForm();
                                setEditingRule(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Rule
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Max/Day</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Matches</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{rule.name}</p>
                                            {rule.description && (
                                                <p className="text-xs text-gray-500">{rule.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeBadgeColor(rule.type)}>
                                            {rule.type}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium">{rule.priority}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {rule.isActive ? (
                                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700">Inactive</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm">{rule.maxLeadsPerDay || '∞'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm font-medium">{rule.matchesCount || 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditModal(rule)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(rule.id)} className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <GitBranch className="h-5 w-5" />
                            {editingRule ? 'Edit Routing Rule' : 'Create Routing Rule'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRule ? 'Update the routing rule details.' : 'Define a new rule for lead assignment.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Rule Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., High Priority Leads"
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the rule..."
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RoundRobin">Round Robin</SelectItem>
                                        <SelectItem value="LoadBalance">Load Balance</SelectItem>
                                        <SelectItem value="SkillBased">Skill Based</SelectItem>
                                        <SelectItem value="PriorityBased">Priority Based</SelectItem>
                                        <SelectItem value="LocationBased">Location Based</SelectItem>
                                        <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Priority</Label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <Select
                                    value={formData.isActive ? 'active' : 'inactive'}
                                    onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Max Leads/Day</Label>
                                <Input
                                    type="number"
                                    value={formData.maxLeadsPerDay || ''}
                                    onChange={(e) => setFormData({ ...formData, maxLeadsPerDay: parseInt(e.target.value) || undefined })}
                                    placeholder="Unlimited"
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Conditions (JSON)</Label>
                            <Textarea
                                value={formData.conditions}
                                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                                placeholder='{"priority": ["High", "Urgent"]}'
                                rows={2}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingRule ? 'Update Rule' : 'Create Rule'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default LeadRoutingPage;