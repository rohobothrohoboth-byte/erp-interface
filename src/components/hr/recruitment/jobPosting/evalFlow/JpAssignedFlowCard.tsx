import React from 'react';
import { ClipboardCheck, Edit, Trash2 } from 'lucide-react';
import type { JpEvalFlowListDto } from '../../../../../types/hr/recruit/jpEvalFlow';

interface JpAssignedFlowCardProps {
  item: JpEvalFlowListDto;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const JpAssignedFlowCard: React.FC<JpAssignedFlowCardProps> = ({ item, onEdit, onDelete, isDeleting }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    {/* Card header */}
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
        <ClipboardCheck size={16} className="text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{item.evalFlowName}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Effective {item.effeDateFrom}{item.effeDateTo ? ` → ${item.effeDateTo}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer transition-colors">
          <Edit size={14} />
        </button>
        <button type="button" onClick={onDelete} disabled={isDeleting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    {/* Horizontal stepper */}
    {item.steps?.length > 0 && (
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {item.steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  s.isFinalStr === 'Yes' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  {i + 1}
                </div>
                <div className="text-center max-w-[90px]">
                  <p className="text-xs font-medium text-gray-700 leading-tight truncate">{s.stepName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{s.evalType}</p>
                  {s.minScore !== undefined && s.maxScore !== undefined && (
                    <p className="text-[10px] text-gray-400">{s.minScore}–{s.maxScore}</p>
                  )}
                  {s.isFinalStr === 'Yes' && (
                    <span className="text-[9px] bg-green-100 text-green-700 font-semibold px-1 py-0.5 rounded-full">Final</span>
                  )}
                </div>
              </div>
              {i < item.steps.length - 1 && (
                <div className="w-10 h-0.5 bg-green-200 shrink-0 mb-5" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default JpAssignedFlowCard;
