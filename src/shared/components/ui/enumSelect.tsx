import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";


type EnumObject = Record<string, string>;

interface EnumSelectProps {
  enumObject: EnumObject;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function EnumSelect({
  enumObject,
  value,
  onChange,
  placeholder = "Select option",
  disabled = false,
}: EnumSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {Object.entries(enumObject).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
