import { motion } from 'framer-motion';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ViewInvoiceDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  documentUrl?: string;
}

const ViewInvoiceDocModal: React.FC<ViewInvoiceDocModalProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
  documentUrl
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  const getFileExtension = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    return extension;
  };

  const isValidDocument = documentUrl && (
    documentUrl.endsWith('.pdf') || 
    documentUrl.endsWith('.doc') || 
    documentUrl.endsWith('.docx')
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            Invoice Document - {invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {!documentUrl || !isValidDocument ? (
            // No document uploaded
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Document Uploaded
              </h3>
              <p className="text-sm text-gray-500">
                No invoice document has been uploaded for this invoice yet.
              </p>
            </div>
          ) : (
            // Document available
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Invoice Document
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {documentUrl}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium mt-1 uppercase">
                      {getFileExtension(documentUrl)} File
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleOpenInNewTab}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Document
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewInvoiceDocModal;
