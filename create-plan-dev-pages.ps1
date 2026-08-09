# Create all Plan & Development page files with sample data
$basePath = "E:\untitled46\RST_ERP_UI\src\pages\plandev"

# Create Strategic Plans pages
$strategicPages = @(
    "CreateStrategicPlan",
    "EditStrategicPlan",
    "StrategicPlanDetail"
)

# Create Objectives pages
$objectivePages = @(
    "CreateObjective",
    "EditObjective",
    "ObjectiveDetail"
)

# Create KPIs pages
$kpiPages = @(
    "CreateKPI",
    "EditKPI",
    "KPIDetail"
)

# Create Initiatives pages
$initiativePages = @(
    "CreateInitiative",
    "EditInitiative",
    "InitiativeDetail"
)

# Create Planning pages
$planningPages = @(
    "CreateMilestone",
    "EditMilestone",
    "MilestoneDetail"
)

# Create Risks pages
$riskPages = @(
    "CreateRisk",
    "EditRisk",
    "RiskDetail"
)

# Create Reports pages
$reportPages = @(
    "ReportDetail",
    "GenerateReport"
)

# Function to create a page with sample data
function Create-PageWithSampleData {
    param(
        [string]$Path,
        [string]$PageName,
        [string]$Title,
        [string]$Icon
    )

    $content = @"
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    $Icon,
    Loader2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';

const $PageName = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('$Title saved successfully!');
            navigate(-1);
        } catch (error) {
            showToast.error('Failed to save $Title');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {id ? 'Edit' : 'Create'} $Title
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <$Icon className="w-5 h-5 text-emerald-600" />
                        {id ? 'Edit' : 'Create'} $Title
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <Input
                                required
                                placeholder="Enter $Title name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.status || 'Planning'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Planning">Planning</option>
                                    <option value="Active">Active</option>
                                    <option value="OnHold">On Hold</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.priority || 'Medium'}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default $PageName;
"@

    # Create the directory if it doesn't exist
    $dir = Split-Path $Path -Parent
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # Write the file
    $content | Out-File -FilePath $Path -Encoding UTF8
    Write-Host "✅ Created: $Path"
}

# Function to create Detail page
function Create-DetailPage {
    param(
        [string]$Path,
        [string]$PageName,
        [string]$Title,
        [string]$Icon
    )

    $content = @"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    $Icon,
    Loader2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';

const $PageName = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Simulate API fetch
        const fetchData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setData({
                    id: id,
                    name: 'Sample $Title',
                    description: 'This is a sample $Title description for demonstration purposes.',
                    status: 'Active',
                    priority: 'High',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'John Doe',
                    department: 'Operations'
                });
            } catch (error) {
                showToast.error('Failed to load $Title');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this $Title?')) return;
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('$Title deleted successfully!');
            navigate(-1);
        } catch (error) {
            showToast.error('Failed to delete $Title');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">$Title not found</p>
                <Button className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/edit`)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Tag className="w-4 h-4" />
                            Status
                        </div>
                        <Badge className={
                            data.status === 'Active' ? 'bg-green-100 text-green-800' :
                            data.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                            data.status === 'OnHold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }>
                            {data.status}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <User className="w-4 h-4" />
                            Created By
                        </div>
                        <p className="font-medium">{data.createdBy}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            Created
                        </div>
                        <p className="font-medium">
                            {new Date(data.createdAt).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <$Icon className="w-5 h-5 text-emerald-600" />
                        Description
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">{data.description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default $PageName;
"@

    # Create the directory if it doesn't exist
    $dir = Split-Path $Path -Parent
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # Write the file
    $content | Out-File -FilePath $Path -Encoding UTF8
    Write-Host "✅ Created: $Path"
}

# ============================================================
# CREATE ALL PAGES
# ============================================================

# Strategic Plans
$strategicPages | ForEach-Object {
    $path = "$basePath\strategic\$_.tsx"
    $pageName = $_
    $title = "Strategic Plan"
    $icon = "Target"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}

# Detail page for Strategic Plans (with extra fields)
Create-DetailPage -Path "$basePath\strategic\StrategicPlanDetail.tsx" -PageName "StrategicPlanDetail" -Title "Strategic Plan" -Icon "Target"

# Objectives
$objectivePages | ForEach-Object {
    $path = "$basePath\objectives\$_.tsx"
    $pageName = $_
    $title = "Objective"
    $icon = "GitBranch"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}
Create-DetailPage -Path "$basePath\objectives\ObjectiveDetail.tsx" -PageName "ObjectiveDetail" -Title "Objective" -Icon "GitBranch"

# KPIs
$kpiPages | ForEach-Object {
    $path = "$basePath\kpis\$_.tsx"
    $pageName = $_
    $title = "KPI"
    $icon = "TrendingUp"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}
Create-DetailPage -Path "$basePath\kpis\KPIDetail.tsx" -PageName "KPIDetail" -Title "KPI" -Icon "TrendingUp"

# Initiatives
$initiativePages | ForEach-Object {
    $path = "$basePath\initiatives\$_.tsx"
    $pageName = $_
    $title = "Initiative"
    $icon = "Rocket"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}
Create-DetailPage -Path "$basePath\initiatives\InitiativeDetail.tsx" -PageName "InitiativeDetail" -Title "Initiative" -Icon "Rocket"

# Planning (Milestones)
$planningPages | ForEach-Object {
    $path = "$basePath\planning\$_.tsx"
    $pageName = $_
    $title = "Milestone"
    $icon = "Award"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}
Create-DetailPage -Path "$basePath\planning\MilestoneDetail.tsx" -PageName "MilestoneDetail" -Title "Milestone" -Icon "Award"

# Risks
$riskPages | ForEach-Object {
    $path = "$basePath\risks\$_.tsx"
    $pageName = $_
    $title = "Risk"
    $icon = "AlertTriangle"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}
Create-DetailPage -Path "$basePath\risks\RiskDetail.tsx" -PageName "RiskDetail" -Title "Risk" -Icon "AlertTriangle"

# Reports
$reportPages | ForEach-Object {
    $path = "$basePath\reports\$_.tsx"
    $pageName = $_
    $title = "Report"
    $icon = "FileText"
    Create-PageWithSampleData -Path $path -PageName $pageName -Title $title -Icon $icon
}

Write-Host ""
Write-Host "========================================"
Write-Host "✅ All Plan & Development pages created!"
Write-Host "========================================"
Write-Host ""
Write-Host "Created pages:"
Write-Host "  - Strategic Plans: Create, Edit, Detail"
Write-Host "  - Objectives: Create, Edit, Detail"
Write-Host "  - KPIs: Create, Edit, Detail"
Write-Host "  - Initiatives: Create, Edit, Detail"
Write-Host "  - Milestones: Create, Edit, Detail"
Write-Host "  - Risks: Create, Edit, Detail"
Write-Host "  - Reports: Detail, Generate"
Write-Host ""
Write-Host "Total pages created: 20"