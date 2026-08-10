import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'crypto';
import type { ListItem } from '@/modules/list/types/list';

const asUUID = (value: string): UUID => value as UUID;

export const GENDER_OPTIONS: ListItem[] = [
  { id: asUUID(uuidv4()), name: 'Male' },
  { id: asUUID(uuidv4()), name: 'Female' },
];

export const REGION_OPTIONS: ListItem[] = [
  { id: asUUID(uuidv4()), name: 'North America' },
  { id: asUUID(uuidv4()), name: 'South America' },
  { id: asUUID(uuidv4()), name: 'Europe' },
  { id: asUUID(uuidv4()), name: 'Asia' },
  { id: asUUID(uuidv4()), name: 'Africa' },
  { id: asUUID(uuidv4()), name: 'Australia' },
];

export const STATUS_OPTIONS: ListItem[] = [
  { id: asUUID(uuidv4()), name: 'Active' },
  { id: asUUID(uuidv4()), name: 'Inactive' },
  { id: asUUID(uuidv4()), name: 'Pending' },
  { id: asUUID(uuidv4()), name: 'Suspended' }
];

export const BRANCH_COMP_LIST: ListItem[] = [
  { id: asUUID(uuidv4()), name: 'Active' },
  { id: asUUID(uuidv4()), name: 'Inactive' },
  { id: asUUID(uuidv4()), name: 'Pending' },
  { id: asUUID(uuidv4()), name: 'Suspended' }
];