import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

interface ReportBuilderProps {
  analyticsData: any;
  dateRange: string;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
}

export default function ReportBuilder({ analyticsData, dateRange, onExport }: ReportBuilderProps) {
  const reports = [
    {
      id: 'sales-performance',
      title: 'Sales Performance Report',
      description: 'Comprehensive sales metrics and performance analysis',
      icon: '📊',
      lastGenerated: '2024-01-19T10:30:00Z',
      size: '2.3 MB'
    },
    {
      id: 'lead-conversion',
      title: 'Lead Conversion Analysis',
      description: 'Lead funnel analysis and conversion rates',
      icon: '🎯',
      lastGenerated: '2024-01-19T09:15:00Z',
      size: '1.8 MB'
    },
    {
      id: 'activity-summary',
      title: 'Activity Summary Report',
      description: 'Team activity metrics and productivity analysis',
      icon: '⚡',
      lastGenerated: '2024-01-19T08:45:00Z',
      size: '1.2 MB'
    },
    {
      id: 'customer-support',
      title: 'Customer Support Analytics',
      description: 'Support ticket analysis and resolution metrics',
      icon: '🎧',
      lastGenerated: '2024-01-18T16:20:00Z',
      size: '1.5 MB'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span>Available Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{report.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                  <span>Size: {report.size}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExport('pdf')}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExport('excel')}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExport('csv')}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a report above to generate and download</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}