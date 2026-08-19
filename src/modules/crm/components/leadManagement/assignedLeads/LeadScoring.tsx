// src/components/crm/leadManagement/assignedLeads/LeadScoring.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, TrendingUp, Star, Shield, Loader2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import type { LeadDto } from '@/modules/crm/types/crm.types';

interface LeadScoringProps {
  lead: LeadDto;
  isOpen: boolean;
  onClose: () => void;
  onScoreUpdate: (leadId: string, newScore: number, scoreData: any) => void;
}

interface ScoreCategory {
  name: string;
  value: number;
  max: number;
  icon: any;
  description: string;
}

const SCORE_CATEGORIES = [
  { name: 'Interest Level', max: 20, icon: TrendingUp, description: 'How interested is the lead in your solution?' },
  { name: 'Budget', max: 15, icon: Award, description: 'Does the lead have budget for your solution?' },
  { name: 'Authority', max: 15, icon: Shield, description: 'Is the lead a decision maker?' },
  { name: 'Timeline', max: 15, icon: Target, description: 'How soon is the lead looking to buy?' },
  { name: 'Product Fit', max: 15, icon: Star, description: 'How well does your solution fit their needs?' },
];

export default function LeadScoring({ lead, isOpen, onClose, onScoreUpdate }: LeadScoringProps) {
  if (!isOpen || !lead) return null;

  const [scoreValues, setScoreValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize scores
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    SCORE_CATEGORIES.forEach(cat => {
      initialScores[cat.name] = Math.floor(cat.max / 2);
    });
    setScoreValues(initialScores);
  }, []);

  const calculateTotalScore = () => {
    let total = 0;
    let maxTotal = 0;
    SCORE_CATEGORIES.forEach(cat => {
      total += scoreValues[cat.name] || 0;
      maxTotal += cat.max;
    });
    return Math.round((total / maxTotal) * 100);
  };

  const totalScore = calculateTotalScore();

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Hot Lead', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', emoji: '🔥' };
    if (score >= 60) return { label: 'Warm Lead', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', emoji: '🌤️' };
    if (score >= 40) return { label: 'Cold Lead', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', emoji: '❄️' };
    return { label: 'Unqualified', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300', emoji: '⚪' };
  };

  const scoreBadge = getScoreBadge(totalScore);

  const handleScoreChange = (category: string, value: number) => {
    setScoreValues(prev => ({ ...prev, [category]: value }));
  };

  const handleSaveScore = async () => {
    setIsSubmitting(true);
    try {
      const scoreData = {
        ...scoreValues,
        totalScore,
        notes,
        scoredAt: new Date().toISOString(),
        scoredBy: 'Current User'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onScoreUpdate(lead.id, totalScore, scoreData);
      showToast.success(`Lead score updated to ${totalScore}%`);
      onClose();
    } catch (error) {
      console.error('Error updating score:', error);
      showToast.error('Failed to update lead score');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Lead Score</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${scoreBadge.color} flex items-center gap-1`}>
                <span>{scoreBadge.emoji}</span>
                {scoreBadge.label}
              </Badge>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totalScore}%
            </span>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Lead Info */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {lead.fullName || `${lead.firstName} ${lead.lastName}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lead.companyName || 'No company'} • {lead.title || 'No title'}
                  </p>
                </div>
                {lead.score !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Current Score</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{lead.score}%</p>
                    </div>
                )}
              </div>
            </div>

            {/* Score Categories */}
            <div className="space-y-4">
              {SCORE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const value = scoreValues[category.name] || 0;
                const percentage = (value / category.max) * 100;

                return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category.name}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {value} / {category.max}
                      </span>
                          <span className="text-xs text-gray-400">
                        {Math.round(percentage)}%
                      </span>
                        </div>
                      </div>
                      <input
                          type="range"
                          min={0}
                          max={category.max}
                          value={value}
                          onChange={(e) => handleScoreChange(category.name, parseInt(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{
                            accentColor: '#ea580c',
                            background: `linear-gradient(to right, #ea580c ${percentage}%, #d1d5db ${percentage}%)`
                          }}
                      />
                      <p className="text-xs text-gray-400 dark:text-gray-500">{category.description}</p>
                    </div>
                );
              })}
            </div>

            {/* Total Score Progress */}
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalScore}%</span>
              </div>
              <Progress value={totalScore} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">{
                  totalScore >= 80 ? '🔥 Hot Lead - High Priority' :
                      totalScore >= 60 ? '🌤️ Warm Lead - Good Potential' :
                          totalScore >= 40 ? '❄️ Cold Lead - Needs Nurturing' :
                              '⚪ Unqualified - Low Priority'
                }</span>
                <span>100%</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="scoreNotes" className="text-sm font-medium">
                Notes <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <Textarea
                  id="scoreNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this score..."
                  rows={3}
                  className="resize-none"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex justify-center items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                  onClick={handleSaveScore}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Update Score
                    </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}