import React, { useState } from 'react';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  start: string;
  end: string;
  location: string;
}

interface Conflict {
  shiftId: string;
  message: string;
}

const ShiftScheduler = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [newShift, setNewShift] = useState<Omit<Shift, 'id'>>({
    employeeId: '',
    employeeName: '',
    start: '',
    end: '',
    location: ''
  });

  const handleAddShift = () => {
    // Validate required fields
    if (!newShift.employeeId || !newShift.start || !newShift.end || !newShift.location) {
      setConflicts([{
        shiftId: 'missing-fields',
        message: 'Please fill all required fields'
      }]);
      return;
    }

    // Clear previous conflicts
    setConflicts([]);
    
    // Check for conflicts
    const conflict = checkForConflicts(newShift);

    if (conflict) {
      setConflicts([conflict]);
    } else {
      setShifts([...shifts, { ...newShift, id: Date.now().toString() }]);
      resetForm();
    }
  };

  const checkForConflicts = (shift: Omit<Shift, 'id'>): Conflict | null => {
    const newStart = new Date(shift.start);
    const newEnd = new Date(shift.end);
    
    // Check for invalid time range
    if (newStart >= newEnd) {
      return {
        shiftId: 'invalid-time',
        message: 'Shift end time must be after start time'
      };
    }

    for (const existingShift of shifts) {
      const existingStart = new Date(existingShift.start);
      const existingEnd = new Date(existingShift.end);

      // Check for same employee overlap
      if (existingShift.employeeId === shift.employeeId) {
        if (newStart < existingEnd && newEnd > existingStart) {
          return {
            shiftId: existingShift.id,
            message: `${shift.employeeName} is already scheduled during this time (${formatDateTime(existingShift.start)} to ${formatDateTime(existingShift.end)})`
          };
        }
      }

      // Check for same location overlap
      if (existingShift.location === shift.location) {
        if (newStart < existingEnd && newEnd > existingStart) {
          return {
            shiftId: existingShift.id,
            message: `Location ${shift.location} is occupied by ${existingShift.employeeName} during this time`
          };
        }
      }
    }

    return null; // No conflicts found
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetForm = () => {
    setNewShift({
      employeeId: '',
      employeeName: '',
      start: '',
      end: '',
      location: ''
    });
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(shift => shift.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-2xl md:text-3xl font-bold text-center mb-6">Shift <span className='text-gray-900'>Scheduler</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Create New Shift</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="E12345"
                value={newShift.employeeId}
                onChange={e => setNewShift({ ...newShift, employeeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={newShift.employeeName}
                onChange={e => setNewShift({ ...newShift, employeeName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newShift.start}
                  onChange={e => setNewShift({ ...newShift, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newShift.end}
                  onChange={e => setNewShift({ ...newShift, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={newShift.location}
                onChange={e => setNewShift({ ...newShift, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                <option value="Main Office">Main Office</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Retail Store">Retail Store</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddShift}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
              >
                Add Shift
              </button>
              
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
          
          {conflicts.length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Scheduling Conflict
              </h4>
              {conflicts.map(conflict => (
                <p key={conflict.shiftId} className="text-red-600">
                  {conflict.message}
                </p>
              ))}
            </div>
          )}
        </div>
        
        {/* Shift Calendar Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Scheduled Shifts</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {shifts.length} shifts
            </span>
          </div>
          
          {shifts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No shifts scheduled</h3>
              <p className="text-gray-500">Add your first shift using the form</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shifts.map(shift => (
                <div key={shift.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`p-5 ${
                    shift.location === 'Main Office' ? 'bg-blue-50' :
                    shift.location === 'Warehouse' ? 'bg-amber-50' :
                    shift.location === 'Retail Store' ? 'bg-emerald-50' : 'bg-purple-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{shift.employeeName}</h3>
                        <p className="text-gray-600 text-sm">ID: {shift.employeeId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shift.location === 'Main Office' ? 'bg-blue-100 text-blue-800' :
                        shift.location === 'Warehouse' ? 'bg-amber-100 text-amber-800' :
                        shift.location === 'Retail Store' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {shift.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start</p>
                        <p className="font-medium">{formatDateTime(shift.start)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">End</p>
                        <p className="font-medium">{formatDateTime(shift.end)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftScheduler;