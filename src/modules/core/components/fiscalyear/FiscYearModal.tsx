import { X, Check, Calendar } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import type { FiscYearListDto, NewFiscalYear } from '@/modules/core/types/fiscalYear';
import { formatDate } from '@/modules/core/data/fiscalYear';

interface FiscalYearModalProps {
  modalType: 'view' | 'edit' | 'status' | 'delete' | 'add' | null;
  selectedYear: FiscYearListDto | null;
  newYear: NewFiscalYear;
  setNewYear: (year: NewFiscalYear) => void;
  onClose: () => void;
  onYearUpdate: (updatedYear: FiscYearListDto) => void;
  onYearStatusChange: (yearId: string, newStatus: string) => void;
  onYearDelete: (yearId: string) => void;
  onAddFiscalYear: () => void;
}

export const FiscalYearModal: React.FC<FiscalYearModalProps> = ({
  modalType,
  selectedYear,
  newYear,
  setNewYear,
  onClose,
  onYearUpdate,
  onYearStatusChange,
  onYearDelete,
  onAddFiscalYear,
}) => {
  const getStatusColor = (status: string): string => {
    return status === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (!modalType) return null;

  if (modalType === 'view' && selectedYear) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white/90 z-10">
            <div>
              <h2 className="text-2xl font-bold">{selectedYear.name}</h2>
              <p className="text-gray-600">
                {formatDate(selectedYear.startDate)} - {formatDate(selectedYear.endDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="mr-2 text-emerald-500" size={20} />
                  Fiscal Year Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedYear.isActive)}`}>
                      {selectedYear.isActive === "Yes" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gregorian Start Date</p>
                    <p>{formatDate(selectedYear.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gregorian End Date</p>
                    <p>{formatDate(selectedYear.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ethiopian Start Date</p>
                    <p>{selectedYear.startDateAm}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ethiopian End Date</p>
                    <p>{selectedYear.endDateAm}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Check className="mr-2 text-blue-500" size={20} />
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p>{formatDate(selectedYear.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modified At</p>
                    <p>{formatDate(selectedYear.modifiedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ethiopian Created At</p>
                    <p>{selectedYear.createdAtAm}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ethiopian Modified At</p>
                    <p>{selectedYear.modifiedAtAm}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex justify-end sticky bottom-0 bg-white/90">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modalType === 'edit' && selectedYear) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold">Edit Fiscal Year</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            {/* Edit form would go here */}
            <p className="text-gray-600">Edit form implementation would go here...</p>
          </div>
          <div className="border-t p-4 flex justify-end space-x-3 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => onYearUpdate(selectedYear)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modalType === 'status' && selectedYear) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Status Change</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {selectedYear.isActive === 'Yes' ? 'deactivate' : 'activate'} fiscal year {selectedYear.name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onYearStatusChange(selectedYear.id, selectedYear.isActive === 'Yes' ? 'No' : 'Yes');
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modalType === 'delete' && selectedYear) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete fiscal year {selectedYear.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
              >
                No, Keep It.
              </button>
              <button
                onClick={() => {
                  onYearDelete(selectedYear.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
              >
                Yes, Delete!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modalType === 'add') {
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Fiscal Year</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new fiscal year period.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="yearName" className="block text-sm font-medium text-gray-700 mb-1">
              Fiscal Year Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="yearName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., FY 2025"
              value={newYear.name}
              onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="isActive"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={newYear.isActive}
              onChange={(e) => setNewYear({ ...newYear, isActive: e.target.value as 'Yes' | 'No' })}
            >
              <option value="Yes">Active</option>
              <option value="No">Inactive</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={newYear.dateStart}
              onChange={(e) => setNewYear({ ...newYear, dateStart: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={newYear.dateEnd}
              onChange={(e) => setNewYear({ ...newYear, dateEnd: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onAddFiscalYear}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white"
          >
            Add Fiscal Year
          </button>
        </div>
      </DialogContent>
    );
  }

  return null;
};