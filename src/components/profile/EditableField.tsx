import React, { memo } from 'react';

interface EditableFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (val: string) => void;
  type?: 'text' | 'select';
  options?: { key: string; label: string }[];
  placeholder?: string;
}

export const EditableField = memo<EditableFieldProps>(({
                                                         label, value, isEditing, onChange, type = 'text', options = [], placeholder,
                                                       }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      {isEditing ? (
          type === 'select' ? (
              <select
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 bg-white text-gray-800"
              >
                <option value="">Select...</option>
                {options.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
          ) : (
              <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  placeholder={placeholder}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 text-gray-800"
              />
          )
      ) : (
          <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
      )}
    </div>
));
