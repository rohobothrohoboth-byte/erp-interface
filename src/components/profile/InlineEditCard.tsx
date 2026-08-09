import React, { memo } from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';

interface InlineEditCardProps {
  title: string;
  icon: React.ReactNode;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  children: React.ReactNode;
  actionOverride?: React.ReactNode;
}

export const InlineEditCard = memo<InlineEditCardProps>(
    ({
       title,
       icon,
       isEditing,
       isSaving,
       onEdit,
       onCancel,
       onSave,
       children,
       actionOverride,
     }) => (
        <div
            className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${
                isEditing ? "border-green-300 shadow-green-100" : "border-gray-100"
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 px-4 py-2 rounded-t-2xl bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                {icon}
              </div>

              <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                {title}
              </h3>
            </div>

            {!isEditing &&
                (actionOverride ?? (
                    <button
                        onClick={onEdit}
                        className="
          flex items-center gap-1.5
          text-xs font-medium text-white
          bg-gradient-to-r from-emerald-500 to-green-600
          hover:from-emerald-600 hover:to-green-700
          transition-all duration-200
          px-3 py-1.5 rounded-xl
          shadow-sm hover:shadow-md
        "
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                ))}
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>

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
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                  ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                  )}
                </button>
              </div>
          )}
        </div>
    ),
);
