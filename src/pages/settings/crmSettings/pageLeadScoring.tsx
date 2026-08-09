// src/pages/settings/crmSettings/pageLeadScoring.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Plus, Edit, Trash2,
  CheckCircle, XCircle, Filter, Search, MoreVertical,
  Loader2, Star, Target, Award, TrendingUp,
  Save, AlertCircle, Zap
} from 'lucide-react';
import {
  getScoreRules,
  deleteScoreRule,
  createScoreRule,
  updateScoreRule,
  calculateLeadScore
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
import type { ScoreRuleDto, CreateScoreRuleDto, UpdateScoreRuleDto } from '../../../types/crm/crm.types';

const LeadScoringPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<ScoreRuleDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoreRuleDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testLeadId, setTestLeadId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState<CreateScoreRuleDto>({
    name: '',
    description: '',
    type: 'Demographic',
    field: '',
    operator: 'equals',
    value: '',
    score: 10,
    isActive: true,
    priority: 0,
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getScoreRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching score rules:', error);
      showToast.error('Failed to load score rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scoring rule?')) return;
    try {
      await deleteScoreRule(id);
      showToast.success('Score rule deleted successfully');
      fetchData();
    } catch (error) {
      showToast.error('Failed to delete score rule');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.field.trim() || !formData.value.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingRule) {
        await updateScoreRule(editingRule.id, formData);
        showToast.success('Score rule updated successfully');
      } else {
        await createScoreRule(formData);
        showToast.success('Score rule created successfully');
      }
      setIsModalOpen(false);
      setEditingRule(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || 'Failed to save score rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestScore = async () => {
    if (!testLeadId.trim()) {
      showToast.error('Please enter a lead ID');
      return;
    }
    try {
      setTesting(true);
      const result = await calculateLeadScore(testLeadId);
      setTestResult(result);
      showToast.success('Score calculated successfully');
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || 'Failed to calculate score');
    } finally {
      setTesting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'Demographic',
      field: '',
      operator: 'equals',
      value: '',
      score: 10,
      isActive: true,
      priority: 0,
      category: '',
    });
  };

  const openEditModal = (rule: ScoreRuleDto) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      field: rule.field,
      operator: rule.operator,
      value: rule.value,
      score: rule.score,
      isActive: rule.isActive,
      priority: rule.priority,
      category: rule.category || '',
    });
    setIsModalOpen(true);
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      Demographic: 'bg-blue-100 text-blue-700',
      Behavioral: 'bg-purple-100 text-purple-700',
      Engagement: 'bg-green-100 text-green-700',
      Firmographic: 'bg-orange-100 text-orange-700',
      Custom: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      equals: '=',
      not_equals: '≠',
      contains: 'contains',
      starts_with: 'starts with',
      ends_with: 'ends with',
      greater_than: '>',
      less_than: '<',
      greater_or_equal: '≥',
      less_or_equal: '≤',
      between: 'between',
      in: 'in',
    };
    return labels[operator] || operator;
  };

  const filteredRules = rules.filter(rule =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary stats
  const totalScore = rules.reduce((sum, r) => sum + (r.isActive ? r.score : 0), 0);
  const activeRules = rules.filter(r => r.isActive).length;
  const categories = [...new Set(rules.map(r => r.category).filter(Boolean))];

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                  <div className="flex items-center gap-4">
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
                onClick={() => navigate('/settings/crm')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lead Scoring</h1>
              <p className="text-sm text-gray-500">
                Define rules to automatically score leads
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Rules</p>
                  <p className="text-2xl font-bold text-blue-900">{rules.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Target className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Active Rules</p>
                  <p className="text-2xl font-bold text-green-900">{activeRules}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-purple-900">{categories.length}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <Award className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Total Score</p>
                  <p className="text-2xl font-bold text-orange-900">{totalScore}</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-lg">
                  <Star className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Scoring */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 flex items-center gap-3">
                <Zap className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-indigo-900">Test Scoring</h3>
                  <p className="text-sm text-indigo-700">Test the scoring rules on a specific lead</p>
                </div>
              </div>
              <div className="flex flex-1 gap-2">
                <Input
                    placeholder="Enter Lead ID"
                    value={testLeadId}
                    onChange={(e) => setTestLeadId(e.target.value)}
                    className="h-10 max-w-xs"
                />
                <Button
                    onClick={handleTestScore}
                    disabled={testing}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                      <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Calculate Score
                </Button>
              </div>
            </div>
            {testResult && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total Score: {testResult.totalScore}</span>
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {testResult.breakdown?.length || 0} rules matched
                    </Badge>
                  </div>
                  {testResult.breakdown && testResult.breakdown.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {testResult.breakdown.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {item.matched ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>{item.ruleName}</span>
                                <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              </div>
                              <span className={item.matched ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                                {item.matched ? `+${item.score}` : '0'}
                                            </span>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
                placeholder="Search score rules..."
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
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No scoring rules found</h3>
                <p className="text-gray-500">Create scoring rules to automatically score leads.</p>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{rule.name}</p>
                            {rule.category && (
                                <Badge variant="outline" className="text-xs">
                                  {rule.category}
                                </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono">{rule.field}</span>
                        </td>
                        <td className="px-4 py-3">
                                            <span className="text-sm">
                                                {getOperatorLabel(rule.operator)} {rule.value}
                                            </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getTypeBadgeColor(rule.type)}>
                            {rule.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-indigo-600">+{rule.score}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {rule.isActive ? (
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                              <Badge className="bg-red-100 text-red-700">Inactive</Badge>
                          )}
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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-indigo-600">
                <Star className="h-5 w-5" />
                {editingRule ? 'Edit Score Rule' : 'Create Score Rule'}
              </DialogTitle>
              <DialogDescription>
                {editingRule ? 'Update the scoring rule details.' : 'Define a new rule for lead scoring.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rule Name *</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., High Budget Lead"
                    className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
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
                      <SelectItem value="Demographic">Demographic</SelectItem>
                      <SelectItem value="Behavioral">Behavioral</SelectItem>
                      <SelectItem value="Engagement">Engagement</SelectItem>
                      <SelectItem value="Firmographic">Firmographic</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Budget, Company"
                      className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Field *</Label>
                  <Input
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      placeholder="e.g., Budget, CompanyName"
                      className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Operator</Label>
                  <Select
                      value={formData.operator}
                      onValueChange={(value) => setFormData({ ...formData, operator: value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="starts_with">Starts With</SelectItem>
                      <SelectItem value="ends_with">Ends With</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="greater_or_equal">Greater or Equal</SelectItem>
                      <SelectItem value="less_or_equal">Less or Equal</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                      <SelectItem value="in">In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Value *</Label>
                <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g., 100000, Corp, High"
                    className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Score</Label>
                  <Input
                      type="number"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                      className="h-10"
                  />
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

export default LeadScoringPage;