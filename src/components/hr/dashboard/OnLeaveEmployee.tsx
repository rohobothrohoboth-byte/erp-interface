import React from "react";
import { Card } from "../../ui/card";
import { ChevronRight } from "lucide-react";

export interface OnLeaveEmployee {
  empFullName: string;
  empFullNameAm: string;
  gender: string;
  department: string;
  position: string;
  leaveType: "Annual" | "Sick" | "Maternity" | "Unpaid";
}

interface Props {
  employees: OnLeaveEmployee[];
}


const getLeaveTypeColor = (type: OnLeaveEmployee["leaveType"]) => {
  switch (type) {
    case "Annual":
      return "bg-blue-100 text-blue-700";

    case "Sick":
      return "bg-red-100 text-red-700";

    case "Maternity":
      return "bg-pink-100 text-pink-700";

    case "Unpaid":
      return "bg-gray-200 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OnLeaveEmployee: React.FC<Props> = ({ employees }) => {
  return (
    <Card className="p-6 border border-gray-200 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
         Leave Request
        </h2>

        <a
          href="/hr/on-leave"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-all group"
        >
          View all
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto  rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Leave Type</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {employees.map((emp, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                 <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-medium">
                          {emp.empFullName
                            ?.split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

                     <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-30 md:max-w-none">
                            {emp.empFullName || "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-30 md:max-w-none">
                            {emp.empFullNameAm ||
                              emp.empFullName ||
                              "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-30 md:max-w-none">
                            {emp.gender || "N/A"}
                          </div>
                        </div>
                    </div>
                  </td>

                <td className="px-4 py-3 text-gray-600">
                  {emp.department}
                </td>
<td className="px-4 py-3">
  <span
    className={`text-xs px-2 py-1 rounded-full font-medium ${getLeaveTypeColor(
      emp.leaveType
    )}`}
  >
    {emp.leaveType}
  </span>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default OnLeaveEmployee;