// src/pages/finance/payroll/PayrollSettings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    DollarSign,
    Calendar,
    Users,
    Shield,
    Clock,
    Save,
    RefreshCw,
    Plus,
    Trash2,
    Edit,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import useToast from '../../../hooks/useToast';
import { payrollApi } from '../../../services/finance/payroll/payrollApi';

interface PayrollSettingsData {
    id: string;
    companyName: string;
    taxId: string;
    payrollFrequency: 'monthly' | 'bi-weekly' | 'weekly' | 'semi-monthly';
    paymentDay: number;
    currency: string;
    overtimeRate: number;
    holidayRate: number;
    weekendRate: number;
    latePenalty: number;
    gracePeriod: number;
    autoApprove: boolean;
    requireApproval: boolean;
    enableBenefits: boolean;
    enableTax: boolean;
}

const PayrollSettings: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<PayrollSettingsData>({
        id: '',
        companyName: '',
        taxId: '',
        payrollFrequency: 'monthly',
        paymentDay: 15,
        currency: 'USD',
        overtimeRate: 1.5,
        holidayRate: 2,
        weekendRate: 1.5,
        latePenalty: 15,
        gracePeriod: 5,
        autoApprove: false,
        requireApproval: true,
        enableBenefits: true,
        enableTax: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getSettings();
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load payroll settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await payrollApi.updateSettings(settings);
            toast.success('Payroll settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save payroll settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof PayrollSettingsData, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-5xl mx-auto"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Settings className="h-8 w-8 text-indigo-600" />
                        Payroll <span className="text-indigo-600">Settings</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Configure payroll policies and preferences</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={loadSettings}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="compensation" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Compensation
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="approval" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Approval
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Basic payroll configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        value={settings.companyName}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tax ID</Label>
                                    <Input
                                        value={settings.taxId}
                                        onChange={(e) => handleChange('taxId', e.target.value)}
                                        placeholder="Enter tax ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payroll Frequency</Label>
                                    <Select
                                        value={settings.payrollFrequency}
                                        onValueChange={(value) => handleChange('payrollFrequency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Day</Label>
                                    <Input
                                        type="number"
                                        value={settings.paymentDay}
                                        onChange={(e) => handleChange('paymentDay', parseInt(e.target.value))}
                                        min={1}
                                        max={31}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select
                                        value={settings.currency}
                                        onValueChange={(value) => handleChange('currency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="CAD">CAD ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Compensation Settings */}
                <TabsContent value="compensation">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compensation Settings</CardTitle>
                            <CardDescription>Configure pay rates and benefits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Overtime Rate</Label>
                                    <Select
                                        value={settings.overtimeRate.toString()}
                                        onValueChange={(value) => handleChange('overtimeRate', parseFloat(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1.25">1.25x</SelectItem>
                                            <SelectItem value="1.5">1.5x</SelectItem>
                                            <SelectItem value="2">2x</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Holiday Rate</Label>
                                    <Select
                                        value={settings.holidayRate.toString()}
                                        onValueChange={(value) => handleChange('holidayRate', parseFloat(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1.5">1.5x</SelectItem>
                                            <SelectItem value="2">2x</SelectItem>
                                            <SelectItem value="2.5">2.5x</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Weekend Rate</Label>
                                    <Select
                                        value={settings.weekendRate.toString()}
                                        onValueChange={(value) => handleChange('weekendRate', parseFloat(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1.25">1.25x</SelectItem>
                                            <SelectItem value="1.5">1.5x</SelectItem>
                                            <SelectItem value="2">2x</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Enable Benefits</Label>
                                        <Switch
                                            checked={settings.enableBenefits}
                                            onCheckedChange={(checked) => handleChange('enableBenefits', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Enable Tax Calculations</Label>
                                        <Switch
                                            checked={settings.enableTax}
                                            onCheckedChange={(checked) => handleChange('enableTax', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Attendance Settings */}
                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Settings</CardTitle>
                            <CardDescription>Configure attendance policies</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Late Penalty (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={settings.latePenalty}
                                        onChange={(e) => handleChange('latePenalty', parseInt(e.target.value))}
                                        min={0}
                                    />
                                    <p className="text-xs text-gray-500">Minutes after grace period that triggers penalty</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Grace Period (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={settings.gracePeriod}
                                        onChange={(e) => handleChange('gracePeriod', parseInt(e.target.value))}
                                        min={0}
                                    />
                                    <p className="text-xs text-gray-500">Allowed minutes before marking as late</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Approval Settings */}
                <TabsContent value="approval">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Settings</CardTitle>
                            <CardDescription>Configure approval workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Auto-Approve Payroll</Label>
                                        <p className="text-sm text-gray-500">Automatically approve payroll runs</p>
                                    </div>
                                    <Switch
                                        checked={settings.autoApprove}
                                        onCheckedChange={(checked) => handleChange('autoApprove', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Require Approval</Label>
                                        <p className="text-sm text-gray-500">Require manager approval before processing</p>
                                    </div>
                                    <Switch
                                        checked={settings.requireApproval}
                                        onCheckedChange={(checked) => handleChange('requireApproval', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default PayrollSettings;