// types/procurement/purchaseOrder.types.ts

export interface PurchaseOrderLine {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    discount?: number;
    taxRate?: number;
    taxAmount?: number;
    unitOfMeasure?: string;
    requisitionLineId?: string;
    periodId?: string;
    periodName?: string;
}

export interface PurchaseOrder {
    id: string;
    purchaseOrderNumber: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    vendorId?: string;
    vendorName?: string;
    description?: string;
    totalAmount: number;
    status: 'Draft' | 'Sent' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'PartiallyReceived';
    currency: string;
    receivedDate?: string;
    receivedBy?: string;
    requisitionId?: string;
    requisitionNumber?: string;
    paymentTerms?: string;
    shippingAddress?: string;
    sentDate?: string;
    sentBy?: string;
    confirmedDate?: string;
    confirmedBy?: string;
    periodId?: string;
    periodName?: string;
    createdByUserId?: string;
    createdByUserName?: string;
    updatedByUserId?: string;
    updatedByUserName?: string;
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
    lines: PurchaseOrderLine[];
}

export interface PurchaseOrderFormData {
    purchaseOrderNumber: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    vendorId?: string;
    vendorName?: string;
    description?: string;
    totalAmount: number;
    status: string;
    currency: string;
    paymentTerms?: string;
    shippingAddress?: string;
    requisitionId?: string;
    requisitionNumber?: string;
    periodId?: string;
    lines: PurchaseOrderLine[];
}

export interface PurchaseOrderFilters {
    searchTerm: string;
    filterStatus: string;
    filterVendor: string;
    fromDate?: string;
    toDate?: string;
    periodId?: string;
}

export interface PurchaseOrderSummary {
    totalOrders: number;
    draftCount: number;
    sentCount: number;
    confirmedCount: number;
    deliveredCount: number;
    cancelledCount: number;
    totalAmount: number;
    averageAmount: number;
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
    rowVersion?: string;
    items?: GoodsReceiptItem[];
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


