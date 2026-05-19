import React from 'react'
import { Card } from '../../ui/card'
import { ChevronRight } from 'lucide-react'
import type { EmpDbPendList } from '../../../types/hr/dashboard'
import { useNavigate } from 'react-router-dom'

interface TimeOffRequest {
  name: string
  avatar: string
  days: number
  reason: string
}

interface AttendanceApproval {
  name: string
  avatar: string
  hoursCompleted: number
  totalHours: number
}

interface PendingActivityProps {
  timeOffRequests: TimeOffRequest[]
  attendanceApprovals: AttendanceApproval[]
  pendingEmployees:  EmpDbPendList[];
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

const PendingActivity: React.FC<PendingActivityProps> = ({
  timeOffRequests,
  attendanceApprovals,
  pendingEmployees,
}) => {
const navigate = useNavigate();
const view=()=>{
  navigate("/hr/pend-employees")
}
return (
  <Card className="p-6 border border-gray-200 bg-white shadow-sm rounded-xl">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-semibold text-gray-900">
          Pending Employee
        </h2>

        <span className="bg-warning-500 text-white text-sm font-medium px-2.5 py-1 rounded-full flex justify-center items-center">
        {pendingEmployees.length}
        </span>
      </div>

      <button
        onClick={view}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-all group"
      >
        View all
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    {/* Pending Employees Table */}
    <div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-gray-600text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">
                Employee
              </th>

              <th className="px-4 py-3">
                Code
              </th>

              <th className="px-4 py-3">
                Branch
              </th>

              <th className="px-4 py-3">
                Department
              </th>

              <th className="px-4 py-3">
                Position
              </th>

              <th className="px-4 py-3">
                Job Grade
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {pendingEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No pending employees found
                </td>
              </tr>
            ) : (
              pendingEmployees.map((employee) => (
                <tr
                  key={employee.code}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-medium">
                          {employee.empFullName
                            ?.split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

                     <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-30 md:max-w-none">
                            {employee.empFullName || "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-30 md:max-w-none">
                            {employee.empFullNameAm ||
                              employee.empFullName ||
                              "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-30 md:max-w-none">
                            {employee.gender || "N/A"}
                          </div>
                        </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.code || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.branch || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.department || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.position || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.jobGrade || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    {/* Approval Sections */}
    <div className="flex flex-col md:flex-row md:divide-x divide-gray-200">
      {/* Time Off */}
      {/* <div className="md:w-1/2 md:pr-6 mb-6 md:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Time Off
          </h3>

          <p className="text-sm font-medium text-gray-700">
            {timeOffRequests.length} Requests
          </p>
        </div>

        <div className="space-y-4">
          {timeOffRequests.map((req, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={req.avatar}
                  alt={getInitials(req.name)}
                  className="w-10 h-10 rounded-full"
                />

                <p className="font-medium text-gray-800">
                  {req.name}
                </p>
              </div>

              <p className="text-sm text-gray-500 whitespace-nowrap">
                {req.days}d • {req.reason}
              </p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Mobile Divider */}
      {/* <hr className="my-6 md:hidden border-t border-gray-200" /> */}

      {/* Attendance */}
      {/* <div className="md:w-1/2 md:pl-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Time Attendance
          </h3>

          <p className="text-sm font-medium text-gray-700">
            {attendanceApprovals.length} Approvals
          </p>
        </div>

        <div className="space-y-4">
          {attendanceApprovals.map((entry, index) => {
            const progress = Math.min(
              (entry.hoursCompleted / entry.totalHours) * 100,
              100
            );

            const hoursRemaining =
              entry.totalHours - entry.hoursCompleted;

            return (
              <div
                key={index}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-4 w-[55%]">
                  <img
                    src={entry.avatar}
                    alt={getInitials(entry.name)}
                    className="w-10 h-10 rounded-full"
                  />

                  <p className="font-medium text-gray-800 whitespace-nowrap">
                    {entry.name}
                  </p>
                </div>

                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-full bg-gray-200 h-4 rounded-full relative overflow-hidden">
                    <div
                      className="bg-gray-500 h-4 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ width: `${progress}%` }}
                    >
                      {entry.hoursCompleted}h / {hoursRemaining}h
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div> */}
    </div>

  </Card>
);
}

export default PendingActivity
