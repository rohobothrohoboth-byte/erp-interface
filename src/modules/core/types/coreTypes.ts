export interface Department {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  children?: Department[];
}