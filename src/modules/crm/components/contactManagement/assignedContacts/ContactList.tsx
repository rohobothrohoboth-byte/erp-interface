import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, MoreHorizontal, Phone, Mail, User, Building } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Pagination } from '@/shared/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import type { Contact } from '@/modules/crm/types/crm';

const stageColors = {
  'Lead': 'bg-orange-100 text-orange-800',
  'Prospect': 'bg-yellow-100 text-yellow-800',
  'Customer': 'bg-orange-100 text-orange-800',
  'Partner': 'bg-purple-100 text-purple-800'
};

interface ContactListProps {
  contacts: Contact[];
  onDelete: (contactId: string) => void;
  onBulkAction: (action: string, contactIds: string[]) => void;
  selectedContacts: string[];
  onSelectContact: (contactId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function ContactList({
  contacts,
  onDelete,
  onBulkAction,
  selectedContacts,
  onSelectContact,
  onSelectAll
}: ContactListProps) {
  const navigate = useNavigate();
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = contacts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return contacts.slice(startIndex, endIndex);
  }, [contacts, currentPage]);

  const handleBulkActionExecute = () => {
    if (bulkAction && selectedContacts.length > 0) {
      onBulkAction(bulkAction, selectedContacts);
      setBulkAction('');
    }
  };

  if (contacts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
        <p className="text-gray-500">Get started by adding your first contact or adjust your filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >


      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {/* <TableHead className="w-12">
                <Checkbox
                  checked={selectedContacts.length === contacts.length}
                  onCheckedChange={onSelectAll}
                />
              </TableHead> */}
              <TableHead>Contact</TableHead>
              <TableHead>Company & Role</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-gray-50">
                {/* <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => onSelectContact(contact.id, checked as boolean)}
                  />
                </TableCell> */}
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {contact.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{contact.company}</span>
                    </div>
                    <div className="text-sm text-gray-600">{contact.jobTitle}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={stageColors[contact.stage]}>
                    {contact.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{contact.owner}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-gray-900">
                      {new Date(contact.lastContactDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500 capitalize">
                      {contact.lastInteractionType || 'N/A'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigate(`/crm/contacts/assigned/${contact.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="contacts"
        />
      </div>
    </motion.div>
  );
}