import type { UUID } from "crypto";

export type { UUID };

export interface ListItem {
  id: UUID;
  name: string;
}

export interface ListProps {
  items: ListItem[];
  selectedValue?: UUID;
  onSelect: (item: ListItem) => void;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}
