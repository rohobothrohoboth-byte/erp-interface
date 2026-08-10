export interface GoodsReceiptNote {
    id: string;
    grnNumber: string;
    purchaseOrderId: string;
    purchaseOrderNumber?: string;
    deliveryNoteNumber?: string;
    receivedDate: string;
    warehouseId: string;
    warehouseName?: string;
    receivedBy: string;
    inspectedBy?: string;
    status: 'Draft' | 'Completed' | 'Cancelled';
    totalReceived: number;
    totalAccepted: number;
    totalRejected: number;
    notes?: string;
    completedDate?: string;
    dateAdd: string;
    dateMod?: string;
    items: GoodsReceiptItem[];
}

export interface GoodsReceiptItem {
    id?: string;
    purchaseOrderItemId: string;
    description?: string;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    condition: 'Good' | 'Damaged' | 'Partial';
    rejectionReason?: string;
    unitPrice?: number;
    totalAmount?: number;
}

export interface CreateGoodsReceiptNoteDto {
    purchaseOrderId: string;
    deliveryNoteNumber?: string;
    receivedDate: string;
    warehouseId: string;
    warehouseName?: string;
    receivedBy: string;
    inspectedBy?: string;
    notes?: string;
    items: CreateGoodsReceiptItemDto[];
}

export interface CreateGoodsReceiptItemDto {
    purchaseOrderItemId: string;
    description?: string;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    condition: 'Good' | 'Damaged' | 'Partial';
    rejectionReason?: string;
    unitPrice?: number;
}

export interface Warehouse {
    id: string;
    name: string;
    code: string;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    warehouseType?: string;
    status?: string;
    isActive: boolean;
    syncedAt?: string;
    sourceId?: string;
    dateAdd: string;
    dateMod?: string;
}