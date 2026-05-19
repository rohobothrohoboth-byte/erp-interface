import React from "react";
import { ClipboardCheck, ExternalLink } from "lucide-react";
import { ReviewDecision } from "../../../../types/hr/enum";
import { Button } from "../../../ui/button";
import type { EmpDbPendList } from "../../../../types/hr/dashboard";

export default function ReviewModal({ employee, onClose }: { employee: EmpDbPendList; onClose: () => void }) {
  const [decision, setDecision] = React.useState<string>('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">
              Review Employee
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Employee detail link */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Employee Details
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                View full profile before deciding
              </p>
            </div>
            <a
              href={`/hr/employees/${employee.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 shrink-0"
            >
              View Detail
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Decision */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Decision
            </p>
            <div className="flex gap-2 ">
              {Object.values(ReviewDecision).map((value) => (
                <label
                  key={value}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    decision === value
                      ? value === ReviewDecision.Accept
                        ? "border-green-400 bg-green-50"
                        : "border-red-400 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={value}
                    checked={decision === value}
                    onChange={() => setDecision(value)}
                    className={
                    decision === value
                      ? value === ReviewDecision.Accept
                        ? 'accent-green-600'
                        : 'accent-red-600'
                      : 'accent-gray-400'
                  }
                  />
                  <span
                    className={`text-sm font-medium ${
                      decision === value
                        ? value === ReviewDecision.Accept
                          ? "text-green-700"
                          : "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-gray-100">
          <Button
            onClick={onClose}
             variant="outline"
                  className="cursor-pointer px-6"
          >
            Cancel
          </Button>
          <Button
            disabled={!decision}
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}