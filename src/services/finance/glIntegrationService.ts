// GL Integration Service - Called from AR/AP modules when transactions are posted
import { 
  createARInvoiceJournal, 
  createARPaymentJournal, 
  createAPPaymentJournal, 
  postJournalToGL 
} from '../../utils/finance/glAutoPosting';
import type { PaymentReceipt, SalesInvoice } from '../../components/finance/accountsReceivable/types';
import type { PaymentEntry } from '../../components/finance/accountsPayable/types';

/**
 * Service class for GL integration with AR/AP modules
 */
export class GLIntegrationService {
  
  /**
   * Called when an AR invoice is posted
   */
  static async postARInvoiceToGL(invoice: SalesInvoice): Promise<void> {
    try {
      const journal = createARInvoiceJournal(invoice);
      postJournalToGL(journal);
      
      console.log(`GL Journal created for AR Invoice: ${invoice.invoice_no}`);
    } catch (error) {
      console.error('Error posting AR invoice to GL:', error);
      throw error;
    }
  }

  /**
   * Called when an AR payment is received
   */
  static async postARPaymentToGL(payment: PaymentReceipt): Promise<void> {
    try {
      const journal = createARPaymentJournal(payment);
      postJournalToGL(journal);
      
      console.log(`GL Journal created for AR Payment: ${payment.receipt_id}`);
    } catch (error) {
      console.error('Error posting AR payment to GL:', error);
      throw error;
    }
  }

  /**
   * Called when an AP payment is made
   */
  static async postAPPaymentToGL(payment: PaymentEntry): Promise<void> {
    try {
      const journal = createAPPaymentJournal(payment);
      postJournalToGL(journal);
      
      console.log(`GL Journal created for AP Payment: ${payment.internal_pv_no}`);
    } catch (error) {
      console.error('Error posting AP payment to GL:', error);
      throw error;
    }
  }

  /**
   * Reverse a journal entry (for cancellations/corrections)
   */
  static async reverseJournalEntry(originalJournalId: string, reason: string): Promise<void> {
    try {
      const journals = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const originalJournal = journals.find((j: any) => j.id === originalJournalId);
      
      if (!originalJournal) {
        throw new Error('Original journal entry not found');
      }

      // Create reversing entry
      const reversingJournal = {
        ...originalJournal,
        id: `REV-${Date.now()}`,
        entryNumber: `REV-${originalJournal.entryNumber}`,
        description: `REVERSAL: ${originalJournal.description} - ${reason}`,
        isReversing: true,
        reversingDate: new Date().toISOString(),
        reversedEntryId: originalJournalId,
        lines: originalJournal.lines.map((line: any) => ({
          ...line,
          id: `REV-${line.id}`,
          debit: line.credit, // Swap debit and credit
          credit: line.debit,
          memo: `REVERSAL: ${line.memo}`,
        })),
        createdAt: new Date().toISOString(),
        postedAt: new Date().toISOString(),
      };

      postJournalToGL(reversingJournal);
      
      console.log(`Reversing journal created for: ${originalJournal.entryNumber}`);
    } catch (error) {
      console.error('Error creating reversing journal:', error);
      throw error;
    }
  }

  /**
   * Get GL impact summary for a transaction
   */
  static getGLImpactSummary(transactionType: 'AR_INVOICE' | 'AR_PAYMENT' | 'AP_PAYMENT', amount: number): string {
    switch (transactionType) {
      case 'AR_INVOICE':
        return `Dr. Accounts Receivable ${amount.toLocaleString()}, Cr. Revenue ${amount.toLocaleString()}`;
      case 'AR_PAYMENT':
        return `Dr. Cash/Bank ${amount.toLocaleString()}, Cr. Accounts Receivable ${amount.toLocaleString()}`;
      case 'AP_PAYMENT':
        return `Dr. Accounts Payable ${amount.toLocaleString()}, Cr. Cash/Bank ${amount.toLocaleString()}`;
      default:
        return '';
    }
  }

  /**
   * Validate GL posting requirements
   */
  static validateGLPosting(transactionData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!transactionData.amount || transactionData.amount <= 0) {
      errors.push('Transaction amount must be greater than zero');
    }

    if (!transactionData.date) {
      errors.push('Transaction date is required');
    }

    if (!transactionData.description) {
      errors.push('Transaction description is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export individual functions for backward compatibility
export const {
  postARInvoiceToGL,
  postARPaymentToGL,
  postAPPaymentToGL,
  reverseJournalEntry,
  getGLImpactSummary,
  validateGLPosting,
} = GLIntegrationService;