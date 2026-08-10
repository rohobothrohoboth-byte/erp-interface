// src/types/procurement/inspection.types.ts

export interface InspectionItem {
    id: string;
    purchaseOrderItemId: string;
    description: string;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    condition: 'Good' | 'Damaged' | 'Partial';
    rejectionReason?: string;
    unitPrice: number;
    totalAmount: number;
}

export interface InspectionResult {
    id: string;
    grnId: string;
    grnNumber: string;
    inspectorId: string;
    inspectorName: string;
    inspectionDate: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    items: InspectionItem[];
    qualityScore: number;
    remarks: string;
    nextInspection?: string;
}

export interface InspectionFormData {
    inspectorId: string;
    inspectorName: string;
    inspectionDate: string;
    items: {
        id: string;
        quantityAccepted: number;
        quantityRejected: number;
        condition: 'Good' | 'Damaged' | 'Partial';
        rejectionReason?: string;
    }[];
    remarks: string;
    nextInspection?: string;
}