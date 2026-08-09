// src/components/finance/accountsPayable/AddPaymentModal.tsx

import { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Upload, AlertCircle, RefreshCw,
  Banknote, Calendar, Building2, FileText, DollarSign,
  Wallet, CreditCard, CheckCircle, Receipt, User,
  Phone, Smartphone, Users, Shield, Clock,
  ChevronRight, ChevronLeft, Printer, Signature,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { getPurchaseInvoices, getBankAccounts, getVendors, getFinancialPeriods } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { uploadFile } from '../../../services/fileManagement/fileManagementApi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ============================================================
// Interfaces
// ============================================================

interface Invoice {
  id: string;
  invoice_no: string;
  vendor_id: string;
  vendor_name: string;
  total_amount: number;
  remaining_amount: number;
  paid_amount: number;
  invoice_date: string;
  status: string;
  periodId?: string;
  periodName?: string;
}

interface InvoiceToPay {
  invoice_id: string;
  invoice_no: string;
  amount_paid: number;
  periodId?: string;
}

interface InvoiceSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currentPaymentAmount: number;
  newTotalPaid: number;
  newRemaining: number;
}

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  accountType: string;
  glCode: string;
  currentBalance: number;
  bankName: string;
  isDefault: boolean;
  isActive: boolean;
}

interface VendorWithInvoices {
  id: string;
  name: string;
  totalRemaining: number;
  invoiceCount: number;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    external_bank_ref: string;
    vendor_id: string;
    payment_date: string;
    payment_method: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bank_account_id: string;
    invoices_to_pay: InvoiceToPay[];
    total_amount: number;
    attachment_url?: string;
    description?: string;
    require_signature?: boolean;
    receiver_name?: string;
    authorized_by?: string;
    _pdfBlob?: Blob;
    _pdfFileName?: string;
    periodId?: string;
  }) => void;

  availableInvoices?: Invoice[];
  vendors?: any[];
  periods?: any[];
  selectedPeriodId?: string;
}

// ============================================================
// Main Component
// ============================================================

export default function AddPaymentModal({
                                          isOpen,
                                          onClose,
                                          onSubmit,
                                          availableInvoices: propAvailableInvoices = [],
                                          vendors: propVendors = [],
                                          periods: propPeriods = [],
                                          selectedPeriodId: propSelectedPeriodId = ''
                                        }: AddPaymentModalProps) {
  // ============================================================
  // State
  // ============================================================

  const [externalBankRef, setExternalBankRef] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr'>('Bank_Transfer');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'signature'>('details');

  // Period state
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  // Signature fields
  const [requireSignature, setRequireSignature] = useState(true);
  const [receiverName, setReceiverName] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('');

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

  const [invoicesToPay, setInvoicesToPay] = useState<InvoiceToPay[]>([]);
  const [availableInvoices, setAvailableInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amountToPay, setAmountToPay] = useState('');
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary | null>(null);

  const [vendorsWithInvoices, setVendorsWithInvoices] = useState<VendorWithInvoices[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorMap, setVendorMap] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <Wallet className="h-5 w-5 text-emerald-500" />;
      case 'Bank_Transfer': return <Banknote className="h-5 w-5 text-blue-500" />;
      case 'Check': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'Telebirr': return <Phone className="h-5 w-5 text-orange-500" />;
      default: return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const isCashPayment = paymentMethod === 'Cash';

  // ============================================================
  // Generate Payment Voucher HTML
  // ============================================================

  const generatePaymentVoucherHTML = (): string => {
    const vendor = vendorsWithInvoices.find(v => v.id === selectedVendor);
    const totalAmount = calculateTotal();
    const paymentMethodDisplay = paymentMethod.replace('_', ' ');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const period = periods.find(p => p.id === selectedPeriodId);
    const periodName = period?.name || 'N/A';

    const invoiceRows = invoicesToPay.map((inv, index) => {
      return `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">${inv.invoice_no}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(inv.amount_paid)}</td>
      </tr>
    `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Voucher - ${externalBankRef}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f0f4f8;
        }
        .voucher-wrapper {
          max-width: 900px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .voucher-container {
          padding: 40px;
        }
        .voucher-header {
          text-align: center;
          border-bottom: 3px solid #1e293b;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .voucher-header h1 {
          margin: 0;
          font-size: 28px;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 800;
        }
        .voucher-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }
        .voucher-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .voucher-meta .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }
        .voucher-meta .value {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 25px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        .details-grid .field .label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .details-grid .field .value {
          font-size: 15px;
          color: #0f172a;
          font-weight: 500;
          margin-top: 2px;
        }
        .details-grid .field-full {
          grid-column: span 2;
        }
        .table-container {
          margin: 25px 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table thead {
          background: #f1f5f9;
        }
        table th {
          padding: 12px 12px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          color: #475569;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #1e293b;
        }
        table th:last-child {
          text-align: right;
        }
        table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #1e293b;
        }
        table td:last-child {
          text-align: right;
        }
        table tbody tr:hover {
          background: #f8fafc;
        }
        .total-row td {
          border-top: 2px solid #1e293b;
          padding: 14px 12px;
          font-size: 16px;
          font-weight: 700;
          background: #f8fafc;
        }
        .total-row td:last-child {
          font-size: 20px;
          color: #059669;
        }
        .period-info {
          margin-top: 5px;
          padding: 8px 12px;
          background: #eef2ff;
          border-radius: 6px;
          border: 1px solid #c7d2fe;
          font-size: 13px;
          color: #4338ca;
          text-align: center;
        }
        .signature-section {
          margin-top: 40px;
          border-top: 2px solid #1e293b;
          padding-top: 30px;
        }
        .signature-section h3 {
          font-size: 16px;
          color: #0f172a;
          margin: 0 0 10px 0;
        }
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 40px;
          margin-top: 20px;
        }
        .signature-box {
          text-align: center;
        }
        .signature-box .line {
          border-bottom: 2px solid #1e293b;
          margin: 10px 0 6px;
          height: 45px;
          background: #fafafa;
          border-radius: 4px;
        }
        .signature-box .label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .signature-box .name {
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          margin-top: 4px;
        }
        .voucher-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        @media print {
          body { background: #ffffff; padding: 0; }
          .voucher-wrapper { box-shadow: none; border-radius: 0; }
          .voucher-container { padding: 30px; }
        }
        @media (max-width: 600px) {
          .details-grid { grid-template-columns: 1fr; }
          .details-grid .field-full { grid-column: span 1; }
          .signature-grid { grid-template-columns: 1fr; gap: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="voucher-wrapper">
        <div class="voucher-container">
          <div class="voucher-header">
            <h1>PAYMENT VOUCHER</h1>
            <p>Official Payment Receipt</p>
          </div>

          <div class="voucher-meta">
            <div>
              <span class="label">Reference Number</span>
              <div class="value">${externalBankRef}</div>
            </div>
            <div style="text-align: right;">
              <span class="label">Date Issued</span>
              <div class="value">${currentDate}</div>
            </div>
          </div>

          <div class="details-grid">
            <div class="field">
              <div class="label">Vendor</div>
              <div class="value">${vendor?.name || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="label">Payment Date</div>
              <div class="value">${formatDate(paymentDate)}</div>
            </div>
            <div class="field">
              <div class="label">Payment Method</div>
              <div class="value">${paymentMethodDisplay}</div>
            </div>
            <div class="field">
              <div class="label">Bank Account</div>
              <div class="value">${isCashPayment ? 'Cash' : bankAccounts.find(a => a.id === selectedBankAccount)?.name || 'N/A'}</div>
            </div>
            <div class="field field-full">
              <div class="label">Financial Period</div>
              <div class="value">${periodName}</div>
            </div>
            ${description ? `
            <div class="field field-full">
              <div class="label">Description</div>
              <div class="value">${description}</div>
            </div>
            ` : ''}
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">#</th>
                  <th>Invoice Number</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceRows}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right;">TOTAL AMOUNT</td>
                  <td style="text-align: right;">${formatCurrency(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${requireSignature ? `
          <div class="signature-section">
            <h3>Authorizations</h3>
            <div class="signature-grid">
              <div class="signature-box">
                <div class="line"></div>
                <div class="label">Receiver Signature</div>
                <div class="name">${receiverName || '_________________'}</div>
              </div>
              <div class="signature-box">
                <div class="line"></div>
                <div class="label">Authorized Signature</div>
                <div class="name">${authorizedBy || '_________________'}</div>
              </div>
              <div class="signature-box">
                <div class="line"></div>
                <div class="label">Date</div>
                <div class="name">${currentDate}</div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="voucher-footer">
            This is a computer-generated payment voucher. No signature required if printed.
            <br />
            Generated on ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  // ============================================================
  // Print and Save Functions
  // ============================================================

  const handlePrintAndSave = async () => {
    const totalAmount = calculateTotal();
    const vendor = vendorsWithInvoices.find(v => v.id === selectedVendor);
    const vendorName = vendor?.name || 'Unknown Vendor';

    try {
      showToast.info('Generating payment voucher...');

      const htmlContent = generatePaymentVoucherHTML();

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '800px';
      iframe.style.height = '1200px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      await new Promise(resolve => setTimeout(resolve, 500));

      const container = iframeDoc.body;

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: container.scrollHeight,
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (pdfHeight <= pdf.internal.pageSize.getHeight()) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let remainingHeight = canvas.height;
        let yPosition = 0;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(remainingHeight, pageHeight / pdfWidth * canvas.width);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = currentPageHeight;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, yPosition, canvas.width, currentPageHeight, 0, 0, canvas.width, currentPageHeight);
            const pageImgData = pageCanvas.toDataURL('image/png');
            if (yPosition > 0) {
              pdf.addPage();
            }
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, (currentPageHeight * pdfWidth) / canvas.width);
          }
          yPosition += currentPageHeight;
          remainingHeight -= currentPageHeight;
        }
      }

      const pdfBlob = pdf.output('blob');

      onSubmit({
        external_bank_ref: externalBankRef,
        vendor_id: selectedVendor,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        bank_account_id: isCashPayment ? 'cash-account' : selectedBankAccount,
        invoices_to_pay: invoicesToPay,
        total_amount: totalAmount,
        attachment_url: '',
        description: description || `Payment to ${vendorName}`,
        require_signature: requireSignature,
        receiver_name: receiverName,
        authorized_by: authorizedBy,
        _pdfBlob: pdfBlob,
        _pdfFileName: `payment-voucher-${externalBankRef}.pdf`,
        periodId: selectedPeriodId,
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      }

      showToast.success('Payment voucher generated');
      resetForm();
      onClose();

    } catch (error: any) {
      console.error('Error generating voucher:', error);
      showToast.error(error.message || 'Failed to generate payment voucher');
    }
  };

  // ============================================================
  // Data Fetching - FIXED
  // ============================================================

  // ✅ Fetch periods
  const fetchPeriods = async () => {
    if (propPeriods.length > 0) {
      setPeriods(propPeriods);
      if (propSelectedPeriodId) {
        setSelectedPeriodId(propSelectedPeriodId);
      } else {
        const active = propPeriods.find((p: any) => !p.isClosed);
        if (active) {
          setSelectedPeriodId(active.id);
        }
      }
      return;
    }

    try {
      setLoadingPeriods(true);
      const res = await getFinancialPeriods({ status: 'All' });
      let data = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res.data.$values && Array.isArray(res.data.$values)) {
          data = res.data.$values;
        }
      }
      setPeriods(data);
      const active = data.find((p: any) => !p.isClosed);
      if (active) {
        setSelectedPeriodId(active.id);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setLoadingPeriods(false);
    }
  };

  // ✅ Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      setLoadingBankAccounts(true);
      const response = await getBankAccounts();

      let data = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.$values && Array.isArray(response.data.$values)) {
          data = response.data.$values;
        }
      }

      const mappedAccounts: BankAccount[] = data.map((item: any) => ({
        id: item.id,
        name: item.name || item.accountName || 'Unknown Account',
        accountNumber: item.accountNumber || item.account_no || '',
        accountType: item.accountType || 'Chequing',
        glCode: item.glCode || item.gl_code || '',
        currentBalance: Number(item.currentBalance || 0),
        bankName: item.bankName || item.bank_name || '',
        isDefault: item.isDefault || false,
        isActive: item.isActive !== false
      }));

      setBankAccounts(mappedAccounts);

      const defaultAccount = mappedAccounts.find((a: any) => a.isDefault);
      if (defaultAccount) {
        setSelectedBankAccount(defaultAccount.id);
      } else if (mappedAccounts.length > 0) {
        setSelectedBankAccount(mappedAccounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      showToast.error('Failed to load bank accounts');
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  // ✅ Build vendor list from props or fetch
  const buildVendorList = (vendorsData: any[]) => {
    const vendorMapData: Record<string, string> = {};
    vendorsData.forEach((vendor: any) => {
      const id = vendor.id || vendor.vendorId;
      if (id) {
        vendorMapData[id] = vendor.name || vendor.vendorName || vendor.displayName || 'Unknown Vendor';
      }
    });
    setVendorMap(vendorMapData);

    // Use available invoices to build vendor list with remaining amounts
    const invoices = propAvailableInvoices.length > 0 ? propAvailableInvoices : availableInvoices;
    if (invoices.length > 0) {
      const vendorMapWithInvoices: Record<string, { name: string; totalRemaining: number; count: number }> = {};

      invoices.forEach((inv: any) => {
        const vendorId = inv.vendor_id || inv.vendorId;
        if (!vendorId) return;

        const remaining = inv.remaining_amount || inv.remainingAmount || 0;
        if (remaining <= 0) return;

        if (!vendorMapWithInvoices[vendorId]) {
          vendorMapWithInvoices[vendorId] = {
            name: vendorMapData[vendorId] || 'Unknown Vendor',
            totalRemaining: 0,
            count: 0
          };
        }

        vendorMapWithInvoices[vendorId].totalRemaining += remaining;
        vendorMapWithInvoices[vendorId].count += 1;
      });

      const vendorsArray = Object.entries(vendorMapWithInvoices)
          .map(([id, data]) => ({
            id,
            name: data.name,
            totalRemaining: data.totalRemaining,
            invoiceCount: data.count
          }))
          .sort((a, b) => b.totalRemaining - a.totalRemaining);

      setVendorsWithInvoices(vendorsArray);
    }
  };

  // ✅ Fetch vendors and invoices from API
  const fetchVendorsAndInvoices = async () => {
    try {
      setLoadingVendors(true);

      let vendorsData = propVendors;
      if (vendorsData.length === 0) {
        const vendorsRes = await getVendors();
        if (vendorsRes.data) {
          if (Array.isArray(vendorsRes.data)) {
            vendorsData = vendorsRes.data;
          } else if (vendorsRes.data.data && Array.isArray(vendorsRes.data.data)) {
            vendorsData = vendorsRes.data.data;
          } else if (vendorsRes.data.$values && Array.isArray(vendorsRes.data.$values)) {
            vendorsData = vendorsRes.data.$values;
          }
        }
      }

      const vendorMapData: Record<string, string> = {};
      vendorsData.forEach((vendor: any) => {
        const id = vendor.id || vendor.vendorId;
        if (id) {
          vendorMapData[id] = vendor.name || vendor.vendorName || vendor.displayName || 'Unknown Vendor';
        }
      });
      setVendorMap(vendorMapData);

      const params: any = {};
      if (selectedPeriodId) {
        params.periodId = selectedPeriodId;
      }

      const response = await getPurchaseInvoices(params);
      let data = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.$values && Array.isArray(response.data.$values)) {
          data = response.data.$values;
        }
      }

      const vendorMapWithInvoices: Record<string, { name: string; totalRemaining: number; count: number }> = {};

      data.forEach((inv: any) => {
        const vendorId = inv.vendorId || inv.vendor_id || inv.supplierId;
        if (!vendorId) return;

        const status = inv.status || inv.invoiceStatus || 'Draft';
        const allowedStatuses = ['Pending', 'Partially_Paid', 'Approved', 'Paid'];
        if (!allowedStatuses.includes(status)) return;

        const totalAmount = Number(inv.totalAmount || inv.total_amount || inv.total || 0);
        const paidAmount = Number(inv.paidAmount || inv.paid_amount || 0);
        const remainingAmount = totalAmount - paidAmount;

        if (remainingAmount <= 0) return;

        const vendorName = vendorMapData[vendorId] || inv.vendorName || inv.vendor_name || inv.supplierName || 'Unknown Vendor';

        if (!vendorMapWithInvoices[vendorId]) {
          vendorMapWithInvoices[vendorId] = {
            name: vendorName,
            totalRemaining: 0,
            count: 0
          };
        }

        vendorMapWithInvoices[vendorId].totalRemaining += remainingAmount;
        vendorMapWithInvoices[vendorId].count += 1;
      });

      const vendorsWithInvoicesArray = Object.entries(vendorMapWithInvoices)
          .map(([id, data]) => ({
            id,
            name: data.name,
            totalRemaining: data.totalRemaining,
            invoiceCount: data.count
          }))
          .sort((a, b) => b.totalRemaining - a.totalRemaining);

      setVendorsWithInvoices(vendorsWithInvoicesArray);

    } catch (error) {
      console.error('Error fetching vendors with invoices:', error);
      showToast.error('Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  // ✅ Fetch invoices for a specific vendor
  const fetchInvoicesForVendor = async (vendorId: string) => {
    try {
      setLoadingInvoices(true);

      const params: any = {};
      if (selectedPeriodId) {
        params.periodId = selectedPeriodId;
      }

      const response = await getPurchaseInvoices(params);
      let data = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.$values && Array.isArray(response.data.$values)) {
          data = response.data.$values;
        }
      }

      const vendorFiltered = data.filter((inv: any) => {
        const invVendorId = inv.VendorId || inv.vendorId || inv.vendor_id || inv.supplierId;
        return String(invVendorId) === String(vendorId);
      });

      const vendorInvoices: Invoice[] = vendorFiltered
          .filter((inv: any) => {
            const totalAmount = Number(inv.TotalAmount || inv.totalAmount || inv.total || 0);
            const paidAmount = Number(inv.PaidAmount || inv.paidAmount || inv.paid || 0);
            const remainingAmount = totalAmount - paidAmount;
            return remainingAmount > 0;
          })
          .map((inv: any) => {
            const totalAmount = Number(inv.TotalAmount || inv.totalAmount || inv.total || 0);
            const paidAmount = Number(inv.PaidAmount || inv.paidAmount || inv.paid || 0);
            const remainingAmount = totalAmount - paidAmount;
            const status = inv.Status || inv.status || inv.invoiceStatus || 'Draft';
            const invoiceNumber = inv.InvoiceNumber || inv.invoiceNumber || inv.invoice_no || 'N/A';
            const invoiceId = inv.Id || inv.id || inv.invoiceId;
            const vendorName = vendorMap[vendorId] || inv.VendorName || inv.vendorName || inv.vendor_name || 'Unknown Vendor';

            return {
              id: invoiceId,
              invoice_no: invoiceNumber,
              vendor_id: vendorId,
              vendor_name: vendorName,
              total_amount: totalAmount,
              paid_amount: paidAmount,
              remaining_amount: remainingAmount,
              invoice_date: inv.InvoiceDate || inv.invoiceDate || inv.invoice_date || new Date().toISOString(),
              status: status,
              periodId: inv.periodId || inv.PeriodId || selectedPeriodId || '',
              periodName: inv.periodName || inv.PeriodName || periods.find(p => p.id === selectedPeriodId)?.name || '',
            };
          });

      setAvailableInvoices(vendorInvoices);

      if (vendorInvoices.length === 0) {
        showToast.info('No pending invoices found for this vendor in the selected period');
      }

    } catch (error) {
      console.error('Error fetching invoices:', error);
      showToast.error('Failed to load invoices');
      setAvailableInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // ============================================================
  // Effects
  // ============================================================

  // ✅ Initialize periods when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPeriods();
      fetchBankAccounts();
    }
  }, [isOpen]);

  // ✅ Load vendors when period changes
  useEffect(() => {
    if (isOpen && selectedPeriodId) {
      if (propVendors.length > 0) {
        buildVendorList(propVendors);
      } else {
        fetchVendorsAndInvoices();
      }
    }
  }, [selectedPeriodId, isOpen, propVendors]);

  // ✅ Load invoices when vendor is selected
  useEffect(() => {
    if (selectedVendor && selectedPeriodId) {
      // Check if we have prop available invoices
      if (propAvailableInvoices.length > 0) {
        const vendorInvoices = propAvailableInvoices.filter(
            (inv: any) => String(inv.vendor_id) === String(selectedVendor)
        );
        if (vendorInvoices.length > 0) {
          setAvailableInvoices(vendorInvoices);
          return;
        }
      }
      fetchInvoicesForVendor(selectedVendor);
    } else {
      setAvailableInvoices([]);
      setInvoiceSummary(null);
    }
  }, [selectedVendor, selectedPeriodId, propAvailableInvoices]);

  // ✅ Update invoice summary
  useEffect(() => {
    if (availableInvoices.length > 0) {
      const totalAmount = availableInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const alreadyPaid = availableInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
      const remainingFromDb = availableInvoices.reduce((sum, inv) => sum + inv.remaining_amount, 0);
      const currentPaymentAmount = invoicesToPay.reduce((sum, inv) => sum + inv.amount_paid, 0);
      const newTotalPaid = alreadyPaid + currentPaymentAmount;
      const newRemaining = totalAmount - newTotalPaid;

      setInvoiceSummary({
        totalAmount,
        paidAmount: alreadyPaid,
        remainingAmount: remainingFromDb,
        currentPaymentAmount,
        newTotalPaid,
        newRemaining
      });
    } else {
      setInvoiceSummary(null);
    }
  }, [availableInvoices, invoicesToPay]);

  // ============================================================
  // Form Handlers
  // ============================================================

  const handleAddInvoiceToPayment = () => {
    if (!selectedInvoice || !amountToPay) {
      showToast.error('Please select an invoice and enter an amount');
      return;
    }

    const invoice = availableInvoices.find(inv => inv.id === selectedInvoice);
    if (!invoice) return;

    const amount = parseFloat(amountToPay);
    if (isNaN(amount) || amount <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }

    if (amount > invoice.remaining_amount) {
      showToast.error(`Amount cannot exceed remaining balance of ${formatCurrency(invoice.remaining_amount)}`);
      return;
    }

    if (invoicesToPay.find(inv => inv.invoice_id === invoice.id)) {
      showToast.error('This invoice is already selected');
      return;
    }

    setInvoicesToPay([
      ...invoicesToPay,
      {
        invoice_id: invoice.id,
        invoice_no: invoice.invoice_no,
        amount_paid: amount,
        periodId: selectedPeriodId,
      }
    ]);

    setAvailableInvoices(availableInvoices.map(inv =>
        inv.id === invoice.id
            ? { ...inv, remaining_amount: inv.remaining_amount - amount }
            : inv
    ));

    setSelectedInvoice('');
    setAmountToPay('');
    showToast.success(`Added ${formatCurrency(amount)} to ${invoice.invoice_no}`);
  };

  const handleRemoveInvoiceFromPayment = (invoiceId: string) => {
    const removedInvoice = invoicesToPay.find(inv => inv.invoice_id === invoiceId);
    if (removedInvoice) {
      setAvailableInvoices(availableInvoices.map(inv =>
          inv.id === invoiceId
              ? { ...inv, remaining_amount: inv.remaining_amount + removedInvoice.amount_paid }
              : inv
      ));
    }
    setInvoicesToPay(invoicesToPay.filter(inv => inv.invoice_id !== invoiceId));
  };

  const calculateTotal = () => {
    return invoicesToPay.reduce((sum, inv) => sum + inv.amount_paid, 0);
  };

  const isOverpaying = () => {
    if (!invoiceSummary) return false;
    const totalPaid = calculateTotal();
    const remaining = invoiceSummary.remainingAmount;
    return totalPaid > remaining + 0.01;
  };

  const isSubmitDisabled = () => {
    const overpaying = isOverpaying();
    const hasNoInvoices = invoicesToPay.length === 0;
    const hasNoVendor = !selectedVendor;
    const hasNoPeriod = !selectedPeriodId;
    const isCash = isCashPayment;
    const hasNoBankAccount = !isCash && !selectedBankAccount;
    const hasNoBankAccounts = !isCash && bankAccounts.length === 0;

    const selectedAccount = bankAccounts.find(a => a.id === selectedBankAccount);
    const totalAmt = calculateTotal();
    const insufficientBalance = !isCash && selectedAccount && totalAmt > selectedAccount.currentBalance;
    const missingSignature = requireSignature && (!receiverName.trim() || !authorizedBy.trim());

    const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
    const periodClosed = selectedPeriod?.isClosed;

    if (periodClosed) return true;
    if (overpaying) return true;
    if (hasNoInvoices) return true;
    if (hasNoVendor) return true;
    if (hasNoPeriod) return true;
    if (hasNoBankAccount) return true;
    if (hasNoBankAccounts) return true;
    if (insufficientBalance) return true;
    if (missingSignature) return true;

    return false;
  };

  const resetForm = () => {
    setExternalBankRef('');
    setSelectedVendor('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Bank_Transfer');
    setAttachmentUrl('');
    setDescription('');
    setInvoicesToPay([]);
    setAvailableInvoices([]);
    setInvoiceSummary(null);
    setSelectedInvoice('');
    setAmountToPay('');
    setActiveTab('details');
    setReceiverName('');
    setAuthorizedBy('');
    setRequireSignature(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedAccount = bankAccounts.find(a => a.id === selectedBankAccount);
  const totalAmount = calculateTotal();

  // ============================================================
  // Render
  // ============================================================

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {/* Hidden DialogHeader for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>Create a vendor payment transaction</DialogDescription>
          </DialogHeader>

          {/* HEADER */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Record AP Payment</h2>
                  <p className="text-sm text-gray-500">Create vendor payment transactions</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-sm ${isCashPayment ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                {getPaymentMethodIcon(paymentMethod)}
                <span className="font-medium">
                {paymentMethod === 'Bank_Transfer' ? 'Bank Transfer' : paymentMethod}
              </span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex border-b border-gray-200 bg-gray-50/50 px-6">
            <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment Details
                {!selectedVendor && <span className="text-red-500 ml-1">*</span>}
              </div>
            </button>
            <button
                type="button"
                onClick={() => {
                  if (selectedVendor) {
                    setActiveTab('invoices');
                  } else {
                    showToast.error('Please select a vendor first');
                  }
                }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'invoices'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Invoices
                <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${invoicesToPay.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                {invoicesToPay.length}
              </span>
              </div>
            </button>
            <button
                type="button"
                onClick={() => {
                  if (selectedVendor && invoicesToPay.length > 0) {
                    setActiveTab('signature');
                  } else {
                    showToast.error('Please select a vendor and add invoices first');
                  }
                }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'signature'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <Signature className="h-4 w-4" />
                Signature & Print
              </div>
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={(e) => e.preventDefault()} className="px-6 py-5 space-y-5">

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Row 1: Period + Vendor in 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Financial Period <span className="text-red-500">*</span>
                      </Label>
                      {loadingPeriods ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading periods...
                          </div>
                      ) : (
                          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                            <SelectTrigger className="h-10 bg-white w-full">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              {periods.map((period) => (
                                  <SelectItem key={period.id} value={period.id}>
                                    {period.name} {period.isClosed ? '🔒' : '🔓'}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      )}
                      {selectedPeriodId && periods.find(p => p.id === selectedPeriodId)?.isClosed && (
                          <p className="text-xs text-red-500">⚠️ This period is closed. Cannot create payments.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Vendor <span className="text-red-500">*</span>
                      </Label>
                      {loadingVendors ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading vendors...
                          </div>
                      ) : (
                          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                            <SelectTrigger className="h-10 bg-white w-full">
                              <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendorsWithInvoices.length === 0 ? (
                                  <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                    No vendors with pending invoices found
                                  </div>
                              ) : (
                                  vendorsWithInvoices.map(vendor => (
                                      <SelectItem key={vendor.id} value={vendor.id}>
                                        <div className="flex items-center justify-between w-full gap-3">
                                          <span className="font-medium">{vendor.name}</span>
                                          <span className="text-xs text-gray-400">
                                  {vendor.invoiceCount} invoice(s) • {formatCurrency(vendor.totalRemaining)} remaining
                                </span>
                                        </div>
                                      </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Payment Date + Reference in 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Payment Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="h-10 bg-white w-full"
                          required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Reference Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                          value={externalBankRef}
                          onChange={(e) => setExternalBankRef(e.target.value)}
                          placeholder="Enter reference number"
                          className="h-10 bg-white w-full"
                          required
                      />
                    </div>
                  </div>

                  {/* Row 3: Payment Method + Bank Account in 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                      </Label>
                      <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <SelectTrigger className="h-10 bg-white w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-emerald-500" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="Bank_Transfer">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-blue-500" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                          <SelectItem value="Check">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              Check
                            </div>
                          </SelectItem>
                          <SelectItem value="Telebirr">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-orange-500" />
                              Telebirr
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!isCashPayment ? (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            Bank Account <span className="text-red-500">*</span>
                          </Label>
                          {loadingBankAccounts ? (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Loading accounts...
                              </div>
                          ) : bankAccounts.length === 0 ? (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-700">
                                No bank accounts found. Please set up a bank account first.
                              </div>
                          ) : (
                              <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                                <SelectTrigger className="h-10 bg-white w-full">
                                  <SelectValue placeholder="Select bank account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bankAccounts.map((account) => (
                                      <SelectItem key={account.id} value={account.id}>
                                        <div className="flex items-center justify-between w-full gap-3">
                                          <span className="font-medium">{account.name}</span>
                                          <span className={`text-sm ${account.currentBalance <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                  {formatCurrency(account.currentBalance)}
                                </span>
                                        </div>
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                          )}
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-emerald-700">
                              <Wallet className="h-5 w-5" />
                              <span className="text-sm font-medium">Cash Payment</span>
                            </div>
                            <p className="text-xs text-emerald-600 mt-0.5">No bank account required for cash payments</p>
                          </div>
                        </div>
                    )}
                  </div>

                  {/* Row 4: Description (full width) */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Payment description (optional)"
                        className="h-10 bg-white w-full"
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        onClick={() => {
                          if (selectedVendor) {
                            setActiveTab('invoices');
                          } else {
                            showToast.error('Please select a vendor first');
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={!selectedVendor || !selectedPeriodId}
                    >
                      Next: Select Invoices
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
            )}

            {/* TAB 2: INVOICES */}
            {activeTab === 'invoices' && (
                <div className="space-y-4">
                  {/* Vendor info */}
                  {selectedVendor && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                        {vendorsWithInvoices.find(v => v.id === selectedVendor)?.name || 'Vendor'}
                      </span>
                          </div>
                          <div className="text-xs text-blue-600">
                            {availableInvoices.length} invoice(s) available
                            {selectedPeriodId && (
                                <span className="ml-2">• Period: {periods.find(p => p.id === selectedPeriodId)?.name || 'N/A'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Summary cards */}
                  {selectedVendor && invoiceSummary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                          <p className="text-lg font-bold text-blue-700">{formatCurrency(invoiceSummary.totalAmount)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-medium uppercase">Paid</p>
                          <p className="text-lg font-bold text-green-700">{formatCurrency(invoiceSummary.paidAmount)}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-600 font-medium uppercase">Remaining</p>
                          <p className={`text-lg font-bold ${invoiceSummary.remainingAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {formatCurrency(invoiceSummary.remainingAmount)}
                          </p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                          <p className="text-xs text-indigo-600 font-medium uppercase">This Payment</p>
                          <p className="text-lg font-bold text-indigo-700">{formatCurrency(totalAmount)}</p>
                          <p className="text-xs text-gray-500">
                            New Remaining: {formatCurrency(invoiceSummary.newRemaining)}
                          </p>
                        </div>
                      </div>
                  )}

                  {/* Insufficient balance warning */}
                  {!isCashPayment && selectedAccount && selectedAccount.currentBalance < totalAmount && totalAmount > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                          <span className="text-red-700 font-medium">Insufficient Balance</span>
                          <span className="text-red-600">Available: <strong>{formatCurrency(selectedAccount.currentBalance)}</strong></span>
                          <span className="text-red-600">Required: <strong>{formatCurrency(totalAmount)}</strong></span>
                          <span className="text-red-700 font-medium">Shortfall: {formatCurrency(totalAmount - selectedAccount.currentBalance)}</span>
                        </div>
                      </div>
                  )}

                  {/* Invoice selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Select Invoices to Pay</h3>
                      {availableInvoices.length > 0 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {availableInvoices.length} available
                    </span>
                      )}
                    </div>

                    {loadingInvoices ? (
                        <div className="text-center py-6">
                          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500 mx-auto" />
                          <p className="text-sm text-gray-500 mt-2">Loading invoices...</p>
                        </div>
                    ) : availableInvoices.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <CheckCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No pending invoices found for this vendor</p>
                          <p className="text-xs text-gray-400">All invoices have been fully paid</p>
                        </div>
                    ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                                <SelectTrigger className="h-10 bg-white w-full">
                                  <SelectValue placeholder="Select an invoice to pay" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableInvoices
                                      .filter(inv => !invoicesToPay.find(i => i.invoice_id === inv.id))
                                      .map(invoice => (
                                          <SelectItem key={invoice.id} value={invoice.id}>
                                            <div className="flex items-center justify-between w-full gap-3">
                                              <span className="font-medium">{invoice.invoice_no}</span>
                                              <span className="text-sm text-gray-500">
                                      Remaining: {formatCurrency(invoice.remaining_amount)}
                                    </span>
                                            </div>
                                          </SelectItem>
                                      ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Input
                                  type="number"
                                  step="0.01"
                                  value={amountToPay}
                                  onChange={(e) => setAmountToPay(e.target.value)}
                                  placeholder="Enter amount"
                                  className="h-10 bg-white flex-1"
                              />
                              <Button
                                  type="button"
                                  onClick={handleAddInvoiceToPayment}
                                  size="icon"
                                  className="h-10 w-10 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>

                          {invoicesToPay.length > 0 && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Selected Invoices <span className="text-gray-400">({invoicesToPay.length})</span>
                          </span>
                                  <span className="text-sm text-gray-600">
                            Total: <span className="font-bold text-indigo-600">{formatCurrency(totalAmount)}</span>
                          </span>
                                </div>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                  {invoicesToPay.map((invoice) => (
                                      <div key={invoice.invoice_id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                                          <span className="text-sm font-medium text-gray-700 truncate">{invoice.invoice_no}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-sm text-gray-600 font-medium">
                                  {formatCurrency(invoice.amount_paid)}
                                </span>
                                          <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveInvoiceFromPayment(invoice.invoice_id)}
                                              className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                              </div>
                          )}
                        </>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('details')}
                        className="text-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Details
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                          if (invoicesToPay.length > 0) {
                            setActiveTab('signature');
                          } else {
                            showToast.error('Please add at least one invoice to pay');
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={invoicesToPay.length === 0}
                    >
                      Next: Signature & Print
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
            )}

            {/* TAB 3: SIGNATURE & PRINT */}
            {activeTab === 'signature' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Signature className="h-5 w-5 text-purple-600" />
                      <h3 className="text-sm font-semibold text-purple-900">Signature & Authorization</h3>
                    </div>
                    <p className="text-xs text-purple-700">
                      This payment will generate a payment voucher with signature fields. The voucher will be saved to file management.
                    </p>
                  </div>

                  {/* Signature checkbox */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                          checked={requireSignature}
                          onCheckedChange={(checked) => setRequireSignature(checked as boolean)}
                          id="requireSignature"
                      />
                      <Label htmlFor="requireSignature" className="text-sm font-medium text-gray-700">
                        Require Signature
                      </Label>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">
                      Enable to include signature fields on the payment voucher
                    </p>
                  </div>

                  {/* Signature fields - 2 columns */}
                  {requireSignature && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            Receiver Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                              value={receiverName}
                              onChange={(e) => setReceiverName(e.target.value)}
                              placeholder="Enter receiver name"
                              className="h-10 bg-white w-full"
                              required={requireSignature}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            Authorized By <span className="text-red-500">*</span>
                          </Label>
                          <Input
                              value={authorizedBy}
                              onChange={(e) => setAuthorizedBy(e.target.value)}
                              placeholder="Enter authorized person name"
                              className="h-10 bg-white w-full"
                              required={requireSignature}
                          />
                        </div>
                      </div>
                  )}

                  {/* Payment summary preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Printer className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Payment Voucher Preview</p>
                        <p className="text-xs text-blue-600">
                          A payment voucher will be generated with the following details:
                        </p>
                        <ul className="text-xs text-blue-600 mt-1 space-y-0.5 list-disc list-inside">
                          <li>Vendor: {vendorsWithInvoices.find(v => v.id === selectedVendor)?.name || 'N/A'}</li>
                          <li>Total Amount: {formatCurrency(totalAmount)}</li>
                          <li>Reference: {externalBankRef}</li>
                          <li>Payment Method: {paymentMethod.replace('_', ' ')}</li>
                          <li>Period: {periods.find(p => p.id === selectedPeriodId)?.name || 'N/A'}</li>
                          <li>{invoicesToPay.length} invoice(s) included</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('invoices')}
                        className="text-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Invoices
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrintAndSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                        disabled={isSubmitDisabled()}
                    >
                      <Printer className="h-4 w-4" />
                      Print & Save Payment
                    </Button>
                  </div>
                </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
  );
}