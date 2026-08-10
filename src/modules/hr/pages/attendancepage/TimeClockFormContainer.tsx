// src/pages/hr/attendance/TimeClockFormContainer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import TimeClockForm from '@/modules/hr/pages/attendancepage/TimeClockForm';
import TimeClockDisplay from '@/modules/hr/components/attendance/TimeClockDisplay';
import type { ShiftSchedule } from '@/modules/hr/types/attendance';
import { Clock } from 'lucide-react';

// API Service (replace with actual API calls)
const shiftScheduleApi = {
  getSchedule: async (employeeId?: string): Promise<ShiftSchedule> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const saved = localStorage.getItem('shiftSchedule');
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultSchedule;
  },
  saveSchedule: async (schedule: ShiftSchedule, employeeId?: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem('shiftSchedule', JSON.stringify(schedule));
    console.log('Schedule saved:', schedule);
  }
};

// Default schedule configuration
const defaultSchedule: ShiftSchedule = {
  Monday: { clockInStart: '08:00', clockInEnd: '10:00', clockOutStart: '17:00', clockOutEnd: '19:00' },
  Tuesday: { clockInStart: '08:00', clockInEnd: '10:00', clockOutStart: '17:00', clockOutEnd: '19:00' },
  Wednesday: { clockInStart: '08:00', clockInEnd: '10:00', clockOutStart: '17:00', clockOutEnd: '19:00' },
  Thursday: { clockInStart: '08:00', clockInEnd: '10:00', clockOutStart: '17:00', clockOutEnd: '19:00' },
  Friday: { clockInStart: '08:00', clockInEnd: '10:00', clockOutStart: '17:00', clockOutEnd: '19:00' },
  Saturday: { clockInStart: '', clockInEnd: '', clockOutStart: '', clockOutEnd: '' },
  Sunday: { clockInStart: '', clockInEnd: '', clockOutStart: '', clockOutEnd: '' },
};

const TimeClockFormContainer: React.FC = () => {
  const [schedule, setSchedule] = useState<ShiftSchedule>(defaultSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [employeeId] = useState<string>('EMP-001');
  const [employeeName] = useState<string>('John Doe');

  // Load schedule on mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await shiftScheduleApi.getSchedule(employeeId);
        setSchedule(data);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSchedule();
  }, [employeeId]);

  const handleScheduleChange = useCallback(async (newSchedule: ShiftSchedule) => {
    try {
      await shiftScheduleApi.saveSchedule(newSchedule, employeeId);
      setSchedule(newSchedule);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  }, [employeeId]);

  const handleCloseForm = () => {
    setShowForm(false);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedule...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Clock className="h-8 w-8 text-green-600" />
            Shift Schedule
          </h1>
          <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Edit Schedule
          </button>
        </div>

        <TimeClockDisplay
            schedule={schedule}
            employeeName={employeeName}
            employeeId={employeeId}
            onEdit={() => setShowForm(true)}
        />

        {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <TimeClockForm
                    schedule={schedule}
                    onScheduleChange={handleScheduleChange}
                    onClose={handleCloseForm}
                    employeeId={employeeId}
                    employeeName={employeeName}
                />
              </div>
            </div>
        )}
      </div>
  );
};

export default TimeClockFormContainer;