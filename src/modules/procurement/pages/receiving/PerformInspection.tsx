import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    Package,
    User,
    Loader2,
    Save,
    Clock,
    Building2,
    FileText,
    Search,
    Eye,
    Edit,
    Plus,
    Trash2,
    Users,
    UserPlus,
    UserMinus,
    Star,
    Shield,
    Award,
    Briefcase
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { getGoodsReceiptNoteById } from '@/modules/procurement/services/grn.api';
import { completeInspection } from '@/modules/procurement/services/inspection.api';
import { getAllAppUsers } from '@/modules/auth/services/account/account.api';
import type { GoodsReceiptNote } from '@/modules/procurement/types/purchaseOrder.types';
import { useAuthStore } from '@/shared/stores/auth.store';

// ============================================================
// UUID GENERATOR (FALLBACK)
// ============================================================

const generateUUID = (): string => {
    // Try crypto.randomUUID first (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback: generate UUID manually
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ============================================================
// TYPES
// ============================================================

interface InspectionItem {
    id: string;
    purchaseOrderItemId: string;
    description: string;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    condition: 'Good' | 'Damaged' | 'Partial';
    rejectionReason: string;
    unitPrice: number;
    status: 'pending' | 'passed' | 'failed';
    inspectedBy?: string;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Team Leader' | 'Quality Inspector' | 'Technical Inspector' | 'Safety Inspector' | 'Observer';
    assignedItems: string[]; // Item IDs assigned to this member
}

interface InspectionTeam {
    id: string;
    name: string;
    leaderId: string;
    members: TeamMember[];
    department: string;
    startDate: string;
    estimatedEndDate: string;
}

// ============================================================
// TEAM ROLES
// ============================================================

const TEAM_ROLES = [
    { value: 'Team Leader', label: '👑 Team Leader', color: 'bg-purple-100 text-purple-800' },
    { value: 'Quality Inspector', label: '✅ Quality Inspector', color: 'bg-green-100 text-green-800' },
    { value: 'Technical Inspector', label: '🔧 Technical Inspector', color: 'bg-blue-100 text-blue-800' },
    { value: 'Safety Inspector', label: '🛡️ Safety Inspector', color: 'bg-orange-100 text-orange-800' },
    { value: 'Observer', label: '👀 Observer', color: 'bg-gray-100 text-gray-800' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const PerformInspection = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { userId, userName } = useAuthStore();

    // State
    const [grn, setGrn] = useState<GoodsReceiptNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Inspection Team State
    const [team, setTeam] = useState<InspectionTeam>({
        id: generateUUID(), // ✅ Fixed: using fallback UUID generator
        name: '',
        leaderId: '',
        members: [],
        department: '',
        startDate: new Date().toISOString().split('T')[0],
        estimatedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const [items, setItems] = useState<InspectionItem[]>([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');

    // Fetch GRN and users
    const fetchData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            // Fetch GRN
            const grnData = await getGoodsReceiptNoteById(id);
            setGrn(grnData);

            // Initialize items from GRN
            if (grnData.items) {
                const inspectionItems: InspectionItem[] = grnData.items.map(item => ({
                    id: item.id || generateUUID(), // ✅ Fixed: using fallback UUID generator
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    description: item.description || 'N/A',
                    quantityReceived: item.quantityReceived,
                    quantityAccepted: item.quantityAccepted,
                    quantityRejected: item.quantityRejected,
                    condition: (item.condition as 'Good' | 'Damaged' | 'Partial') || 'Good',
                    rejectionReason: item.rejectionReason || '',
                    unitPrice: item.unitPrice || 0,
                    status: 'pending'
                }));
                setItems(inspectionItems);
            }

            // Fetch users for team members
            setLoadingUsers(true);
            try {
                const usersData = await getAllAppUsers();
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }

            // Auto-assign current user as team leader
            if (userId && userName) {
                setTeam(prev => ({
                    ...prev,
                    leaderId: userId,
                    name: `${userName}'s Inspection Team`,
                    members: [
                        {
                            id: userId,
                            name: userName,
                            email: '',
                            role: 'Team Leader',
                            assignedItems: []
                        }
                    ]
                }));
                setSelectedMemberId(userId);
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load inspection data');
            navigate('/procurement/receipt');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, userId, userName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ============================================================
    // TEAM MANAGEMENT
    // ============================================================

    // Add team member
    const addTeamMember = () => {
        if (!selectedMemberId) {
            showToast.error('Please select a user');
            return;
        }

        // Check if user is already in team
        if (team.members.some(m => m.id === selectedMemberId)) {
            showToast.error('User is already in the team');
            return;
        }

        const user = users.find(u => u.id === selectedMemberId);
        if (!user) return;

        setTeam(prev => ({
            ...prev,
            members: [
                ...prev.members,
                {
                    id: user.id,
                    name: user.name || user.username || 'Unknown',
                    email: user.email || '',
                    role: 'Quality Inspector',
                    assignedItems: []
                }
            ]
        }));

        setSelectedMemberId('');
        showToast.success(`${user.name} added to the team`);
    };

    // Remove team member
    const removeTeamMember = (memberId: string) => {
        const member = team.members.find(m => m.id === memberId);
        if (member?.role === 'Team Leader') {
            showToast.error('Cannot remove the team leader');
            return;
        }

        setTeam(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== memberId)
        }));
        showToast.success('Team member removed');
    };

    // Update member role
    const updateMemberRole = (memberId: string, role: string) => {
        setTeam(prev => ({
            ...prev,
            members: prev.members.map(m =>
                m.id === memberId ? { ...m, role: role as any } : m
            )
        }));
    };

    // Assign item to team member
    const assignItemToMember = (itemIndex: number, memberId: string) => {
        const item = items[itemIndex];
        if (!item) return;

        // Remove from previous assignments
        setTeam(prev => ({
            ...prev,
            members: prev.members.map(m => ({
                ...m,
                assignedItems: m.assignedItems.filter(id => id !== item.id)
            }))
        }));

        // Assign to new member
        if (memberId) {
            setTeam(prev => ({
                ...prev,
                members: prev.members.map(m =>
                    m.id === memberId
                        ? { ...m, assignedItems: [...m.assignedItems, item.id] }
                        : m
                )
            }));
        }
    };

    // Get member for an item
    const getItemAssignedMember = (itemId: string) => {
        return team.members.find(m => m.assignedItems.includes(itemId));
    };

    // Update item status
    const updateItemStatus = (index: number, field: keyof InspectionItem, value: any) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };

            // Auto-set status based on acceptance
            if (field === 'quantityAccepted' || field === 'quantityRejected' || field === 'condition') {
                const item = newItems[index];
                if (item.quantityRejected > 0 || item.condition === 'Damaged' || item.condition === 'Partial') {
                    item.status = 'failed';
                } else if (item.quantityAccepted === item.quantityReceived) {
                    item.status = 'passed';
                } else {
                    item.status = 'pending';
                }

                // Mark who inspected this item
                const assignedMember = getItemAssignedMember(item.id);
                if (assignedMember) {
                    item.inspectedBy = assignedMember.name;
                }
            }

            return newItems;
        });
    };

    // Navigate items
    const nextItem = () => {
        if (currentItemIndex < items.length - 1) {
            setCurrentItemIndex(currentItemIndex + 1);
        }
    };

    const prevItem = () => {
        if (currentItemIndex > 0) {
            setCurrentItemIndex(currentItemIndex - 1);
        }
    };

    // Calculate quality score
    const calculateQualityScore = (): number => {
        if (items.length === 0) return 0;
        const totalReceived = items.reduce((sum, item) => sum + item.quantityReceived, 0);
        const totalAccepted = items.reduce((sum, item) => sum + item.quantityAccepted, 0);
        return totalReceived > 0 ? Math.round((totalAccepted / totalReceived) * 100) : 0;
    };

    // Submit inspection
    const handleSubmit = async () => {
        // Validate
        if (!team.leaderId) {
            showToast.error('Team leader is required');
            return;
        }

        if (team.members.length === 0) {
            showToast.error('At least one team member is required');
            return;
        }

        // Check if all items are assigned
        const unassignedItems = items.filter(item => !getItemAssignedMember(item.id));
        if (unassignedItems.length > 0) {
            if (!confirm(`${unassignedItems.length} items are not assigned to any team member. Continue?`)) {
                return;
            }
        }

        // Check if all items are inspected
        const uninspectedItems = items.filter(item => item.status === 'pending' && item.quantityReceived > 0);
        if (uninspectedItems.length > 0) {
            if (!confirm(`${uninspectedItems.length} items have not been inspected yet. Continue?`)) {
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                grnId: id!,
                team: {
                    id: team.id,
                    name: team.name,
                    leaderId: team.leaderId,
                    members: team.members.map(m => ({
                        id: m.id,
                        name: m.name,
                        role: m.role,
                        assignedItems: m.assignedItems
                    })),
                    department: team.department,
                    startDate: new Date(team.startDate).toISOString(), // ✅ UTC
                    estimatedEndDate: new Date(team.estimatedEndDate).toISOString() // ✅ UTC
                },
                inspectionDate: new Date(inspectionDate).toISOString(), // ✅ UTC
                items: items.map(item => ({
                    id: item.id,
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    quantityAccepted: item.quantityAccepted,
                    quantityRejected: item.quantityRejected,
                    condition: item.condition,
                    rejectionReason: item.rejectionReason || undefined,
                    inspectedBy: item.inspectedBy
                })),
                remarks: remarks,
                qualityScore: calculateQualityScore()
            };

            await completeInspection(payload);
            showToast.success('Inspection completed successfully');
            navigate(`/procurement/receipt/${id}`);
        } catch (error: any) {
            console.error('Error submitting inspection:', error);
            showToast.error(error?.response?.data?.message || 'Failed to complete inspection');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading inspection data...</p>
                </div>
            </div>
        );
    }

    if (!grn) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">GRN not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/receipt')}
                >
                    Back to GRNs
                </Button>
            </div>
        );
    }

    const currentItem = items[currentItemIndex];
    const qualityScore = calculateQualityScore();
    const assignedMember = currentItem ? getItemAssignedMember(currentItem.id) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/procurement/receipt/${id}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Perform Inspection
                        </h1>
                        <p className="text-sm text-gray-500">
                            {grn.grnNumber} • {grn.purchaseOrderNumber || 'N/A'}
                        </p>
                    </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Users className="w-4 h-4 mr-1" />
                    Team Inspection
                </Badge>
            </div>

            {/* Inspection Team Section */}
            <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Inspection Team</h3>
                        <Badge className="bg-blue-200 text-blue-800 ml-2">
                            {team.members.length} members
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Team Name & Details */}
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-gray-500">Team Name</Label>
                                <Input
                                    placeholder="Inspection Team Name"
                                    value={team.name}
                                    onChange={(e) => setTeam(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Department</Label>
                                <Input
                                    placeholder="Department"
                                    value={team.department}
                                    onChange={(e) => setTeam(prev => ({ ...prev, department: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-500">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={team.startDate}
                                        onChange={(e) => setTeam(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Est. End Date</Label>
                                    <Input
                                        type="date"
                                        value={team.estimatedEndDate}
                                        onChange={(e) => setTeam(prev => ({ ...prev, estimatedEndDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Team Members */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-500">Add Member</Label>
                                <div className="flex-1">
                                    {loadingUsers ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                    ) : (
                                        <Select
                                            value={selectedMemberId}
                                            onValueChange={setSelectedMemberId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={addTeamMember}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {team.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className={`flex items-center justify-between p-2 rounded-lg border ${
                                            member.role === 'Team Leader'
                                                ? 'bg-purple-50 border-purple-300'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {member.role === 'Team Leader' ? (
                                                <Star className="w-4 h-4 text-purple-500" />
                                            ) : (
                                                <User className="w-4 h-4 text-gray-500" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">{member.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {member.assignedItems.length} items • {member.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Select
                                                value={member.role}
                                                onValueChange={(value) => updateMemberRole(member.id, value)}
                                                disabled={member.role === 'Team Leader'}
                                            >
                                                <SelectTrigger className="w-32 h-7 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TEAM_ROLES.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            <span className="text-xs">{role.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {member.role !== 'Team Leader' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 text-red-500"
                                                    onClick={() => removeTeamMember(member.id)}
                                                >
                                                    <UserMinus className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Inspection Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <Label className="text-xs text-gray-500">Team Leader</Label>
                        <p className="font-medium text-gray-900 mt-1">
                            {team.members.find(m => m.role === 'Team Leader')?.name || 'Not assigned'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Label className="text-xs text-gray-500">Inspection Date</Label>
                        <Input
                            type="date"
                            value={inspectionDate}
                            onChange={(e) => setInspectionDate(e.target.value)}
                            className="mt-1"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Label className="text-xs text-gray-500">Quality Score</Label>
                        <div className="mt-1 flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${
                                        qualityScore >= 80 ? 'bg-green-500' :
                                            qualityScore >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                    }`}
                                    style={{ width: `${qualityScore}%` }}
                                />
                            </div>
                            <span className={`font-bold ${
                                qualityScore >= 80 ? 'text-green-600' :
                                    qualityScore >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                            }`}>
                                {qualityScore}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Item Inspection */}
            {currentItem && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900">
                                    Item {currentItemIndex + 1} of {items.length}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                    Assigned to: {assignedMember?.name || 'Unassigned'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={prevItem}
                                    disabled={currentItemIndex === 0}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-500">
                                    {currentItemIndex + 1} / {items.length}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextItem}
                                    disabled={currentItemIndex === items.length - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Details */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Description</Label>
                                    <p className="font-medium text-gray-900">{currentItem.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-500">Quantity Received</Label>
                                        <p className="text-lg font-bold text-gray-900">{currentItem.quantityReceived}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Unit Price</Label>
                                        <p className="text-lg font-bold text-gray-900">
                                            ${currentItem.unitPrice.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Assign to</Label>
                                    <Select
                                        value={assignedMember?.id || ''}
                                        onValueChange={(value) => assignItemToMember(currentItemIndex, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {team.members.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name} ({member.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Inspection Results */}
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-700">Inspection Results</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-500">Quantity Accepted</Label>
                                        <Input
                                            type="number"
                                            value={currentItem.quantityAccepted}
                                            onChange={(e) => updateItemStatus(
                                                currentItemIndex,
                                                'quantityAccepted',
                                                Math.min(parseInt(e.target.value) || 0, currentItem.quantityReceived)
                                            )}
                                            min="0"
                                            max={currentItem.quantityReceived}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Quantity Rejected</Label>
                                        <Input
                                            type="number"
                                            value={currentItem.quantityRejected}
                                            onChange={(e) => updateItemStatus(
                                                currentItemIndex,
                                                'quantityRejected',
                                                Math.min(parseInt(e.target.value) || 0, currentItem.quantityReceived)
                                            )}
                                            min="0"
                                            max={currentItem.quantityReceived}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-gray-500">Condition</Label>
                                    <Select
                                        value={currentItem.condition}
                                        onValueChange={(value: any) => updateItemStatus(
                                            currentItemIndex,
                                            'condition',
                                            value
                                        )}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Good">✅ Good</SelectItem>
                                            <SelectItem value="Damaged">⚠️ Damaged</SelectItem>
                                            <SelectItem value="Partial">🔶 Partial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {currentItem.quantityRejected > 0 && (
                                    <div>
                                        <Label className="text-xs text-gray-500">Rejection Reason</Label>
                                        <Input
                                            placeholder="Reason for rejection..."
                                            value={currentItem.rejectionReason}
                                            onChange={(e) => updateItemStatus(
                                                currentItemIndex,
                                                'rejectionReason',
                                                e.target.value
                                            )}
                                            className="mt-1"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={
                                        currentItem.status === 'passed' ? 'bg-green-100 text-green-700' :
                                            currentItem.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                    }>
                                        {currentItem.status === 'passed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {currentItem.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                                        {currentItem.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                        {currentItem.status === 'passed' ? 'Passed' :
                                            currentItem.status === 'failed' ? 'Failed' :
                                                'Pending'}
                                    </Badge>
                                    {currentItem.inspectedBy && (
                                        <span className="text-xs text-gray-400">
                                            Inspected by: {currentItem.inspectedBy}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Progress:</span>
                            <span className="font-medium">
                                {items.filter(i => i.status !== 'pending').length} / {items.length} items inspected
                            </span>
                        </div>
                        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{
                                    width: `${(items.filter(i => i.status !== 'pending').length / items.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Remarks and Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs text-gray-500">Inspection Remarks</Label>
                            <textarea
                                rows={3}
                                placeholder="Add any remarks about the inspection..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mt-1"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Complete Inspection
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/procurement/receipt/${id}`)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default PerformInspection;