// Types for the Inventory employee-materials feature
// (MaterialRequest / MaterialAssignment).
// Reached through the gateway route `/inventory` -> `/inventory/v1/...`.

export type MaterialRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Issued'
  | string;

export type MaterialAssignmentStatus =
  | 'Issued'
  | 'Returned'
  | string;

export interface MaterialRequest {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  productId: string;
  quantity: number;
  reason?: string | null;
  status: MaterialRequestStatus;
  decidedByName?: string | null;
  decisionNote?: string | null;
  decisionDate?: string | null;
  dateAdd?: string | null;
}

// Employee creates their own request (POST /MaterialRequest/my).
export interface MaterialRequestCreate {
  productId: string;
  quantity: number;
  reason?: string | null;
}

// Approve / reject decision payload.
export interface MaterialRequestDecision {
  note?: string | null;
}

export interface MaterialAssignment {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  productId: string;
  quantity: number;
  issuedDate?: string | null;
  status: MaterialAssignmentStatus;
  returnedDate?: string | null;
  requestId?: string | null;
  note?: string | null;
}

// Admin assigns material directly (POST /MaterialAssignment).
export interface MaterialAssignmentCreate {
  employeeId: string;
  productId: string;
  quantity: number;
  note?: string | null;
}
