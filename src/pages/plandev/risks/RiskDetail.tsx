import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    AlertTriangle,
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

const RiskDetail = () => {
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
                    name: 'Sample Risk',
                    description: 'This is a sample Risk description for demonstration purposes.',
                    status: 'Active',
                    priority: 'High',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'John Doe',
                    department: 'Operations'
                });
            } catch (error) {
                showToast.error('Failed to load Risk');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this Risk?')) return;
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('Risk deleted successfully!');
            navigate(-1);
        } catch (error) {
            showToast.error('Failed to delete Risk');
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
                <p className="text-gray-500">Risk not found</p>
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
                        // ✅ Fixed: Added backticks for template literal
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/risks/${id}/edit`)}
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
                        <AlertTriangle className="w-5 h-5 text-emerald-600" />
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

export default RiskDetail;