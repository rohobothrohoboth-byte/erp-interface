// src/components/crm/leadManagement/leadGeneration/ImportLeadContent.tsx
import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { showToast } from '../../../../layout/layout';

interface ImportLeadContentProps {
  onImport: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
  importing?: boolean;
  importResult?: {
    total: number;
    imported: number;
    errors: string[];
  } | null;
}

const ImportLeadContent: React.FC<ImportLeadContentProps> = ({
                                                               onImport,
                                                               onDownloadTemplate,
                                                               importing = false,
                                                               importResult = null,
                                                             }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!validTypes.includes(selected.type)) {
        showToast.error('Please upload a CSV or Excel file');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        showToast.error('File size must be less than 5MB');
        return;
      }
      setFile(selected);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast.error('Please select a file');
      return;
    }
    await onImport(file);
  };

  return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              {!file ? (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Upload File</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag and drop or click to upload CSV or Excel file
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Select File</span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-400 mt-2">
                      Max file size: 5MB • Supported: CSV, XLSX, XLS
                    </p>
                  </>
              ) : (
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-700">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFile(null)}
                          className="text-red-500 hover:text-red-700"
                          disabled={importing}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
              )}
            </div>

            {file && (
                <div className="mt-4 flex gap-3">
                  <Button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {importing ? 'Importing...' : 'Import Leads'}
                  </Button>
                  <Button
                      variant="outline"
                      onClick={() => setFile(null)}
                      disabled={importing}
                  >
                    Cancel
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {importResult && (
            <Card className={importResult.errors.length > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  {importResult.errors.length > 0 ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${importResult.errors.length > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                      {importResult.errors.length > 0 ? 'Import Completed with Errors' : 'Import Complete'}
                    </h3>
                    <div className={`text-sm ${importResult.errors.length > 0 ? 'text-yellow-600' : 'text-green-600'} space-y-1 mt-2`}>
                      <p>Total processed: {importResult.total}</p>
                      <p>Imported: {importResult.imported}</p>
                      {importResult.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-red-600">Errors:</p>
                            <ul className="list-disc list-inside text-red-500 max-h-32 overflow-y-auto">
                              {importResult.errors.map((err, i) => (
                                  <li key={i} className="text-sm">{err}</li>
                              ))}
                            </ul>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-700 mb-3">File Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Supported formats: CSV, XLSX, XLS</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Max file size: 5MB</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Required fields: FirstName, LastName, Email</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Status values: New, Contacted, Qualified, etc.</span>
              </li>
            </ul>
            <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={onDownloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>
  );
};

export default ImportLeadContent;