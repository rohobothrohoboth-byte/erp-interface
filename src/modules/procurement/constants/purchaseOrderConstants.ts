// constants/procurement/purchaseOrderConstants.ts

export const PO_STATUSES = [
    { value: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    { value: 'Sent', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
    { value: 'Confirmed', label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'Shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    { value: 'PartiallyReceived', label: 'Partially Received', color: 'bg-yellow-100 text-yellow-700' },
];

export const PO_CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'ETB', label: 'ETB - Ethiopian Birr' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
];

export const PO_PAYMENT_TERMS = [
    { value: 'Net 15', label: 'Net 15' },
    { value: 'Net 30', label: 'Net 30' },
    { value: 'Net 45', label: 'Net 45' },
    { value: 'Net 60', label: 'Net 60' },
    { value: 'COD', label: 'Cash on Delivery' },
    { value: 'Prepaid', label: 'Prepaid' },
    { value: 'Letter of Credit', label: 'Letter of Credit' },
];

export const DEFAULT_PO_FORM_DATA: PurchaseOrderFormData = {
    purchaseOrderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    vendorId: '',
    vendorName: '',
    description: '',
    totalAmount: 0,
    status: 'Draft',
    currency: 'USD',
    paymentTerms: 'Net 30',
    shippingAddress: '',
    requisitionId: '',
    requisitionNumber: '',
    periodId: '',
    lines: [
        { description: '', quantity: 1, unitPrice: 0, totalAmount: 0, taxRate: 0, unitOfMeasure: 'Each' }
    ]
};

export const ITEMS_PER_PAGE = 10;