// src/pages/hr/recruitment/EvaluationFlowsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GitBranch, Plus, Search, RefreshCw, Loader2,
    Eye, Edit, Trash2, CheckCircle, XCircle,
    MoreVertical, Filter, ChevronDown
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useEvaluationFlows, useDeleteEvaluationFlow } from '@/modules/hr/services/recruitment/evaluationFlow/evaluationFlow.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import toast from 'react-hot-toast';

const EvaluationFlowsPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: flows, isLoading, refetch } = useEvaluationFlows();
    const deleteMutation = useDeleteEvaluationFlow({
        onSuccess: () => {
            toast.success('Evaluation flow deleted successfully');
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete evaluation flow');
        }
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    const filteredFlows = flows?.filter(flow =>
        flow.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evaluation Flows</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage evaluation workflows</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </Button>
                    {isHR && (
                        <Button onClick={() => navigate('/recruitment/evaluation-flow/new')} className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Flow
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search evaluation flows..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFlows && filteredFlows.length > 0 ? (
                    filteredFlows.map((flow) => (
                        <motion.div
                            key={flow.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                <GitBranch className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{flow.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={flow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                        {flow.isActiveStr}
                                                    </Badge>
                                                    {flow.isGlobal && (
                                                        <Badge className="bg-blue-100 text-blue-700">Global</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isHR && (
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/recruitment/evaluation-flow/${flow.id}`)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No evaluation flows found</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default EvaluationFlowsPage;