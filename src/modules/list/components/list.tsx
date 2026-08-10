import React from 'react';
import type { UUID } from 'crypto';
import type { ListProps } from '@/modules/list/types/list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const List: React.FC<ListProps> = ({
  items,
  selectedValue,
  onSelect,
  label,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  required = false
}) => {
  const handleChange = (value: string) => {
    const selectedId = value as UUID;
    const selectedItem = items.find(item => item.id === selectedId);
    if (selectedItem) {
      onSelect(selectedItem);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        value={selectedValue || ""}
        onValueChange={handleChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-emerald-500 focus:border-emerald-500
          text-sm transition-colors
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
        `}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id} className="text-gray-900">
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default List;