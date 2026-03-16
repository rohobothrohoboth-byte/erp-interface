import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Award } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import type { Lead } from '../../../../types/crm';

interface LeadScoringProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onScoreUpdate: (leadId: string, newScore: number, scoreData: any) => void;
}

export default function LeadScoring({ lead, isOpen, onClose, onScoreUpdate }: LeadScoringProps) {
  if (!isOpen) return null;

  const [interest, setInterest] = useState(10);
  const [budget, setBudget] = useState(8);
  const [authority, setAuthority] = useState(8);
  const [timeline, setTimeline] = useState(8);
  const [productFit, setProductFit] = useState(8);
  const [notes, setNotes] = useState('');

  const totalScore = interest + budget + authority + timeline + productFit;
  const scorePercentage = Math.round((totalScore / 80) * 100);

  const handleSaveScore = () => {
    const scoreData = { interest, budget, authority, timeline, productFit, totalScore, notes, scoredAt: new Date().toISOString() };
    onScoreUpdate(lead.id, scorePercentage, scoreData);
    onClose();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Hot Lead', color: 'bg-red-100 text-red-800' };
    if (score >= 60) return { label: 'Warm Lead', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Cold Lead', color: 'bg-blue-100 text-blue-800' };
  };

  const scoreBadge = getScoreBadge(scorePercentage);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b px-6 py-4 sticky top-0 bg-white z-10">
          <Target className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold flex-1">Update Lead Score</h2>
          <Badge className={scoreBadge.color}>{scoreBadge.label}</Badge>
          <span className="text-xl font-bold text-orange-600">{scorePercentage}%</span>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Interest Level', value: interest, setter: setInterest, max: 20 },
                { label: 'Budget', value: budget, setter: setBudget, max: 15 },
                { label: 'Authority', value: authority, setter: setAuthority, max: 15 },
                { label: 'Timeline', value: timeline, setter: setTimeline, max: 15 },
              ].map(({ label, value, setter, max }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-medium text-gray-700">{label}</Label>
                    <span className="text-sm font-semibold text-gray-600">{value} / {max}</span>
                  </div>
                  <input
                    type="range" min={0} max={max} value={value}
                    onChange={(e) => setter(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: '#9ca3af', background: `linear-gradient(to right, #9ca3af ${(value/max)*100}%, #d1d5db ${(value/max)*100}%)` }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>0</span><span>{max}</span>
                  </div>
                </div>
              ))}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-medium text-gray-700">Product Fit</Label>
                  <span className="text-sm font-semibold text-gray-600">{productFit} / 15</span>
                </div>
                <input
                  type="range" min={0} max={15} value={productFit}
                  onChange={(e) => setProductFit(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#cbcdcfff', background: `linear-gradient(to right, #9499a1ff ${(productFit/15)*100}%, #d1d5db ${(productFit/15)*100}%)` }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>0</span><span>15</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes <span className="text-gray-500">(Optional)</span>
              </Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this score..." rows={3} className="mt-1.5" />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSaveScore} className="bg-orange-600 hover:bg-orange-700">
              <Award className="w-4 h-4 mr-2" />
              Update Score
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


