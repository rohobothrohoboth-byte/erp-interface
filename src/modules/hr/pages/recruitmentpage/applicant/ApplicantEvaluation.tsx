// src/pages/hr/recruitmentpage/applicant/ApplicantEvaluation.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Star,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Award,
    TrendingUp,
    MessageSquare,
    Send,
    Save,
    ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { useApplicantDetail } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { useEvaluateApplicant } from '@/modules/hr/services/recruitment/jobPostEval/jobPostEval.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface EvaluationCriteria {
    id: string;
    name: string;
    description: string;
    maxScore: number;
}

const ApplicantEvaluation: React.FC = () => {
    const { applicantId = '' } = useParams<{ applicantId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');
    const [recommendation, setRecommendation] = useState<'Pass' | 'Fail' | 'OnHold' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: applicant, isLoading, refetch } = useApplicantDetail(applicantId);
    const evaluateMutation = useEvaluateApplicant({
        onSuccess: () => {
            toast.success('Evaluation submitted successfully');
            setIsSubmitting(false);
            navigate(`/hr/recruitment/applicant/${applicantId}`);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to submit evaluation');
            setIsSubmitting(false);
        },
    });

    // Evaluation criteria
    const criteria: EvaluationCriteria[] = [
        { id: 'experience', name: 'Experience', description: 'Relevant work experience and years', maxScore: 20 },
        { id: 'skills', name: 'Technical Skills', description: 'Required technical competencies', maxScore: 25 },
        { id: 'education', name: 'Education', description: 'Educational background and certifications', maxScore: 15 },
        { id: 'communication', name: 'Communication', description: 'Verbal and written communication skills', maxScore: 15 },
        { id: 'cultural', name: 'Cultural Fit', description: 'Alignment with company values and culture', maxScore: 15 },
        { id: 'potential', name: 'Growth Potential', description: 'Ability to learn and grow', maxScore: 10 },
    ];

    const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    const calculateTotalScore = () => {
        return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
    };

    const getScoreColor = (score: number) => {
        const percentage = (score / maxTotalScore) * 100;
        if (percentage >= 70) return 'text-green-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recommendation) {
            toast.error('Please provide a recommendation');
            return;
        }

        const totalScore = calculateTotalScore();
        if (totalScore === 0) {
            toast.error('Please evaluate at least one criteria');
            return;
        }

        setIsSubmitting(true);
        evaluateMutation.mutate({
            id: applicantId,
            score: totalScore,
            feedback: feedback || `Total Score: ${totalScore}/${maxTotalScore}. Recommendation: ${recommendation}`,
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading applicant details...</span>
            </div>
        );
    }

    if (!applicant) {
        return (
            <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Applicant not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/applicants')}
                >
                    Back to Applicants
                </Button>
            </div>
        );
    }

    const totalScore = calculateTotalScore();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/hr/recruitment/applicant/${applicantId}`)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evaluate Applicant</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {applicant.applicant} - {applicant.position || 'No position'}
                    </p>
                </div>
                <Badge className="ml-auto">{applicant.statusStr}</Badge>
            </div>

            {/* Applicant Info */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{applicant.applicant}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{applicant.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Position</p>
                            <p className="font-medium text-gray-900">{applicant.position || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Applied Date</p>
                            <p className="font-medium text-gray-900">
                                {applicant.appliedDate ? format(new Date(applicant.appliedDate), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Evaluation Criteria */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                            Evaluation Criteria
                        </h3>
                        <div className="space-y-4">
                            {criteria.map((criterion) => (
                                <div key={criterion.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Label className="font-medium text-gray-700">{criterion.name}</Label>
                                                <span className="text-xs text-gray-400">(Max: {criterion.maxScore})</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{criterion.description}</p>
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={criterion.maxScore}
                                                value={scores[criterion.id] || ''}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    setScores(prev => ({
                                                        ...prev,
                                                        [criterion.id]: Math.min(Math.max(value, 0), criterion.maxScore),
                                                    }));
                                                }}
                                                className="text-center"
                                                placeholder="Score"
                                            />
                                            <p className="text-xs text-gray-400 text-center mt-1">
                                                / {criterion.maxScore}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Score */}
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Total Score</p>
                                    <p className="text-xs text-gray-500">Based on all criteria</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                                        {totalScore} / {maxTotalScore}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {Math.round((totalScore / maxTotalScore) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendation */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            Recommendation
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setRecommendation('Pass')}
                                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${recommendation === 'Pass'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                                }
                `}
                            >
                                <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                                <span className="font-medium">Pass</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecommendation('OnHold')}
                                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${recommendation === 'OnHold'
                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                    : 'border-gray-200 hover:border-yellow-300 text-gray-600'
                                }
                `}
                            >
                                <Clock className="w-6 h-6 mx-auto mb-1" />
                                <span className="font-medium">On Hold</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecommendation('Fail')}
                                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${recommendation === 'Fail'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-300 text-gray-600'
                                }
                `}
                            >
                                <XCircle className="w-6 h-6 mx-auto mb-1" />
                                <span className="font-medium">Fail</span>
                            </button>
                        </div>
                        {recommendation && (
                            <p className="text-sm text-gray-600 mt-3">
                                Recommendation: <span className="font-medium">{recommendation}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            Feedback
                        </h3>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide detailed feedback about the applicant..."
                            rows={6}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            {feedback.length} characters
                        </p>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/hr/recruitment/applicant/${applicantId}`)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Evaluation
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};

export default ApplicantEvaluation;