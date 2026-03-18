import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../../../ui/popover";
import type { SMSTemplate } from "./SMSTemplatesSection";

interface SMSTemplatesTableProps {
  templates: SMSTemplate[];
  onEdit: (template: SMSTemplate) => void;
  onDelete: (template: SMSTemplate) => void;
  onToggleActive: (template: SMSTemplate) => void;
}

const PAGE_SIZE = 10;

const SMSTemplatesTable: React.FC<SMSTemplatesTableProps> = ({ templates, onEdit, onDelete, onToggleActive }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(templates.length / PAGE_SIZE));
  const paginated = templates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Text</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((template, index) => (
              <motion.tr
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{template.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2 max-w-xs">
                  <span className="text-sm text-gray-600 truncate block">{template.text}</span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {new Date(template.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right">
                  <Popover open={popoverOpen === template.id} onOpenChange={(o) => setPopoverOpen(o ? template.id : null)}>
                    <PopoverTrigger asChild>
                      <button className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-0" align="end">
                      <div className="py-1">
                        <button onClick={() => { onEdit(template); setPopoverOpen(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2">
                          <Edit size={15} /> Edit
                        </button>
                        <button onClick={() => { onToggleActive(template); setPopoverOpen(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2">
                          {template.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => { onDelete(template); setPopoverOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * PAGE_SIZE + 1, templates.length)}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, templates.length)}</span> of{' '}
          <span className="font-medium">{templates.length}</span> templates
        </p>
        <nav className="inline-flex rounded-md shadow-sm -space-x-px">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </motion.div>
  );
};

export default SMSTemplatesTable;
