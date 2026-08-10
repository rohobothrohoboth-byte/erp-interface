import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { EvaluationFlowListDto } from '@/modules/hr/types/recruit/evaluationFlow';

interface JpFlowSelectorProps {
  evalFlows: EvaluationFlowListDto[];
  selectedFlowId: string;
  onSelect: (flow: EvaluationFlowListDto) => void;
  onCreateNew: () => void;
}

const JpFlowSelector: React.FC<JpFlowSelectorProps> = ({ evalFlows, selectedFlowId, onSelect, onCreateNew }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
      <p className="text-sm font-semibold text-gray-700">Evaluation Flows</p>
      <Button type="button" variant="outline" size="sm" onClick={onCreateNew}
        className="flex items-center gap-1.5 border-green-500 text-green-700 hover:bg-green-50 cursor-pointer">
        <Plus size={14} /> Create New Flow
      </Button>
    </div>
    <div className="p-4">
      <Select
        value={selectedFlowId}
        onValueChange={(val) => {
          const flow = evalFlows.find(f => f.id === val);
          if (flow) onSelect(flow);
        }}
      >
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="Select a flow ..." />
        </SelectTrigger>
        <SelectContent>
          {evalFlows.length === 0
            ? <div className="px-3 py-2 text-sm text-gray-400 italic">No flows yet — create one</div>
            : evalFlows.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)
          }
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default JpFlowSelector;
