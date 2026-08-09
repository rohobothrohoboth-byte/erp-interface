// types/procurement/requisition.types.ts

export interface RequisitionLine {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    unitOfMeasure?: string;
    notes?: string;
    periodId?: string;
}

export interface RequisitionAttachment {
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    description?: string;
    uploadedAt: string;
    uploadedBy?: string;
}

export interface RequisitionApproval {
    id: string;
    approverId: string;
    approverName?: string;
    status: string;
    comments?: string;
    approvedAt?: string;
    approvalLevel: number;
}

export interface Requisition {
    id: string;
    requisitionNumber: string;
    title: string;
    description?: string;
    departmentId?: string;
    departmentName?: string;
    requesterId?: string;
    requesterName?: string;
    requiredDate: string;
    submittedDate: string;
    priority: string;
    status: string;
    totalAmount: number;
    budgetCode?: string;
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    rejectionReason?: string;
    createdByUserId?: string;
    createdByUserName?: string;
    updatedByUserId?: string;
    updatedByUserName?: string;
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
    lines: RequisitionLine[];
    attachments?: RequisitionAttachment[];
    approvals?: RequisitionApproval[];
}

export interface RequisitionFormData {
    title: string;
    description?: string;
    departmentId: string;
    departmentName?: string;
    priority: string;
    requiredDate: string;
    budgetCode?: string;
    periodId: string;
    lines: RequisitionLine[];
    attachmentIds?: string[];
}