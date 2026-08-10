import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Download,
    Filter,
    BarChart3,
    PieChart,
    TrendingUp,
    DollarSign,
    Package,
    Building2,
    Users,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    X
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
import { generateReport, downloadReport } from '@/modules/procurement/services/reports.api';

// ============================================================
// CONSTANTS
// ============================================================

const REPORT_TYPES = [
    { value: 'spend', label: 'Spend Analysis', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'vendor', label: 'Vendor Performance', icon: <Building2 className="w-4 h-4" /> },
    { value: 'performance', label: 'Procurement Efficiency', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'inventory', label: 'Inventory Status', icon: <Package className="w-4 h-4" /> },
    { value: 'compliance', label: 'Compliance Audit', icon: <AlertCircle className="w-4 h-4" /> },
];

const REPORT_FORMATS = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' },
];

const PERIODS = [
    { value: 'current', label: 'Current Period' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const GenerateReport = () => {
    const navigate = useNavigate();

    // State
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        reportType: '',
        title: '',
        description: '',
        format: 'pdf',
        period: 'current',
        startDate: '',
        endDate: '',
        includeCharts: true,
        includeSummary: true,
        includeDetails: true
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<{
        id: string;
        name: string;
        downloadUrl: string;
    } | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // ✅ Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.reportType) errors.reportType = 'Report type is required';
        if (!formData.title?.trim()) errors.title = 'Title is required';
        if (!formData.format) errors.format = 'Format is required';

        if (formData.period === 'custom') {
            if (!formData.startDate) errors.startDate = 'Start date is required';
            if (!formData.endDate) errors.endDate = 'End date is required';
            if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
                errors.endDate = 'End date must be after start date';
            }
        }

        setValidationErrors(errors);
        setShowErrors(true);
        return Object.keys(errors).length === 0;
    };

    // ✅ Handle form submission with real API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast.error(firstError);
            return;
        }

        setIsGenerating(true);
        setDownloadProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            // ✅ Call the real API to generate report
            const response = await generateReport({
                name: formData.title,
                description: formData.description || undefined,
                category: formData.reportType,
                period: formData.period,
                format: formData.format,
                tags: ['procurement', formData.reportType, 'report'],
                startDate: formData.period === 'custom' ? formData.startDate : undefined,
                endDate: formData.period === 'custom' ? formData.endDate : undefined,
                includeCharts: formData.includeCharts,
                includeSummary: formData.includeSummary,
                includeDetails: formData.includeDetails
            });

            clearInterval(progressInterval);
            setDownloadProgress(100);

            setGeneratedReport({
                id: response.id,
                name: response.name,
                downloadUrl: response.downloadUrl
            });

            showToast.success('Report generated successfully!');
            setStep(3);
        } catch (error: any) {
            console.error('Error generating report:', error);
            showToast.error(error?.response?.data?.message || 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    // ✅ Real download handler
    const handleDownload = async () => {
        if (!generatedReport) return;

        try {
            const blob = await downloadReport(generatedReport.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${generatedReport.name.replace(/\s+/g, '_')}.${formData.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast.success(`Downloaded "${generatedReport.name}"`);
            navigate('/procurement/reports');
        } catch (error: any) {
            console.error('Error downloading report:', error);
            showToast.error(error?.response?.data?.message || 'Failed to download report');
        }
    };

    const getError = (field: string) => showErrors ? validationErrors[field] || '' : '';
    const hasError = (field: string) => showErrors && !!validationErrors[field];

    const resetForm = () => {
        setFormData({
            reportType: '',
            title: '',
            description: '',
            format: 'pdf',
            period: 'current',
            startDate: '',
            endDate: '',
            includeCharts: true,
            includeSummary: true,
            includeDetails: true
        });
        setStep(1);
        setGeneratedReport(null);
        setDownloadProgress(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/procurement/reports')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
                    <p className="text-sm text-gray-500">Create a new procurement report</p>
                </div>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center gap-2 ${s <= step ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                s <= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">
                                {s === 1 ? 'Configure' : s === 2 ? 'Generate' : 'Download'}
                            </span>
                        </div>
                        {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* Step 1: Configure */}
            {step === 1 && (
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Report Type */}
                                <div>
                                    <Label>Report Type *</Label>
                                    <Select
                                        value={formData.reportType}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
                                    >
                                        <SelectTrigger className={hasError('reportType') ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select report type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REPORT_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <span className="flex items-center gap-2">
                                                        {type.icon}
                                                        {type.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {getError('reportType') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('reportType')}</p>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <Label>Report Title *</Label>
                                    <Input
                                        placeholder="Enter report title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className={hasError('title') ? 'border-red-500' : ''}
                                    />
                                    {getError('title') && (
                                        <p className="text-xs text-red-500 mt-1">{getError('title')}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <Label>Description</Label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter report description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                </div>

                                {/* Format & Period */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Format *</Label>
                                        <Select
                                            value={formData.format}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
                                        >
                                            <SelectTrigger className={hasError('format') ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {REPORT_FORMATS.map((format) => (
                                                    <SelectItem key={format.value} value={format.value}>
                                                        <span className="flex items-center gap-2">
                                                            {format.icon}
                                                            {format.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {getError('format') && (
                                            <p className="text-xs text-red-500 mt-1">{getError('format')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Period</Label>
                                        <Select
                                            value={formData.period}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PERIODS.map((period) => (
                                                    <SelectItem key={period.value} value={period.value}>
                                                        {period.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Custom Date Range */}
                                {formData.period === 'custom' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label>Start Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                className={hasError('startDate') ? 'border-red-500' : ''}
                                            />
                                            {getError('startDate') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('startDate')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>End Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                className={hasError('endDate') ? 'border-red-500' : ''}
                                            />
                                            {getError('endDate') && (
                                                <p className="text-xs text-red-500 mt-1">{getError('endDate')}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Options */}
                                <div className="space-y-2">
                                    <Label>Include Sections</Label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={formData.includeSummary}
                                                onChange={(e) => setFormData(prev => ({ ...prev, includeSummary: e.target.checked }))}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            Summary
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={formData.includeDetails}
                                                onChange={(e) => setFormData(prev => ({ ...prev, includeDetails: e.target.checked }))}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            Detailed Data
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={formData.includeCharts}
                                                onChange={(e) => setFormData(prev => ({ ...prev, includeCharts: e.target.checked }))}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            Charts & Visualization
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/procurement/reports')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                Next: Generate
                                                <ChevronDown className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Generating */}
            {step === 2 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Generating Report</h3>
                            <p className="text-gray-500">
                                Please wait while we generate your report...
                            </p>
                            <div className="max-w-md mx-auto">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${downloadProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    {downloadProgress < 100 ? `${downloadProgress}% complete` : 'Almost done...'}
                                </p>
                            </div>
                            <div className="flex gap-2 justify-center text-sm text-gray-400">
                                <div className={`flex items-center gap-1 ${downloadProgress >= 30 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${downloadProgress >= 30 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                    <span>Processing data</span>
                                </div>
                                <div className={`flex items-center gap-1 ${downloadProgress >= 60 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${downloadProgress >= 60 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                                    <span>Generating charts</span>
                                </div>
                                <div className={`flex items-center gap-1 ${downloadProgress >= 90 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${downloadProgress >= 90 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                    <span>Formatting</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStep(1)}
                                disabled={isGenerating}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Download */}
            {step === 3 && generatedReport && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <CheckCircle className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Report Generated Successfully!</h3>
                            <p className="text-gray-500">
                                Your report "{generatedReport.name}" is ready for download.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Button
                                    onClick={handleDownload}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Report
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/procurement/reports')}
                                >
                                    View All Reports
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={resetForm}
                                >
                                    Generate Another
                                </Button>
                            </div>
                            <div className="text-sm text-gray-400">
                                Report ID: {generatedReport.id}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default GenerateReport;