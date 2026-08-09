// src/pages/crm/leadManagement/ImportLeadPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { importLeads } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import ImportLeadHeader from '../../../components/crm/leadManagement/leadGeneration/ImportLeadHeader';
import ImportLeadContent from '../../../components/crm/leadManagement/leadGeneration/ImportLeadContent';

const ImportLeadPage: React.FC = () => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        total: number;
        imported: number;
        errors: string[];
    } | null>(null);

    const handleImport = async (file: File) => {
        try {
            setImporting(true);
            const formData = new FormData();
            formData.append('file', file);
            const response = await importLeads(formData);
            const result = response.data?.data || response.data;
            setImportResult(result);
            showToast.success('Import completed successfully');
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            'FirstName', 'LastName', 'CompanyName', 'Email', 'Phone', 'Mobile',
            'Address', 'City', 'State', 'Country', 'Status', 'Source', 'Priority',
            'Industry', 'Title', 'Budget', 'EstimatedValue', 'ExpectedCloseDate',
            'Tags'
        ];
        const csvContent = headers.join(',') + '\n' +
            'John,Doe,Acme Corp,john@example.com,+1234567890,+1234567890,123 Main St,New York,NY,USA,New,Website,Medium,Technology,Sales Manager,100000,50000,2024-12-31,enterprise';

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lead_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast.success('Template downloaded');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <ImportLeadHeader />

            <ImportLeadContent
                onImport={handleImport}
                onDownloadTemplate={handleDownloadTemplate}
                importing={importing}
                importResult={importResult}
            />
        </motion.div>
    );
};

export default ImportLeadPage;