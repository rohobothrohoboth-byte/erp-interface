import React from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';

interface InlineEditCardProps {
  title: string;
  icon: React.ReactNode;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
  actionOverride?: React.ReactNode;
}

export const InlineEditCard: React.FC<InlineEditCardProps> = ({
  title, icon, isEditing, isSaving, onEdit, onCancel, onSave, children, actionOverride,
}) => (
  <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all duration-200 ${
    isEditing ? 'border-green-300 shadow-green-100' : 'border-gray-100'
  }`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      {!isEditing && (
        actionOverride ?? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors px-2 py-1 rounded-lg hover:bg-green-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )
      )}
    </div>

    {/* Content */}
    {children}

    {/* Edit actions */}
    {isEditing && (
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70"
        >
          {isSaving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</>
          ) : (
            <><Check className="w-3.5 h-3.5" />Save Changes</>
          )}
        </button>
      </div>
    )}
  </div>
);
