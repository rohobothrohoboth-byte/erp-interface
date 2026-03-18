import { motion } from "motion/react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { User } from "lucide-react";
import type { EmpSearchRes } from "../../../types/core/EmpSearchRes";

interface EmployeeListProps {
  employees: EmpSearchRes[];
  onAddAccount: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onAddAccount,
}) => {

  const getInitials = (name: string | undefined | null): string => {
    if (!name || name.trim() === "") return "??";

    try {
      return name
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } catch (error) {
      console.error('Error getting initials:', error);
      return "??";
    }
  };


  const getDisplayValue = (value: string | undefined | null, fallback: string = "N/A"): string => {
    return value && value.trim() !== "" ? value : fallback;
  };

  // If no employees, show empty state
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>

      </div>
    );
  }


  const employee = employees[0];

  const {
    code = "EMP0012345",
    empFullName = "John Doe",
    empFullNameAm = "",
    gender = "male",
    dept = "Human Resources",
    position = "HR Manager",
  } = employee;

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
    >
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Photo with Code */}
            <div className="md:w-2/5 space-y-4">
              {/* Photo Container */}
              <div className="relative">
                <div className="w-full h-56 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    // src={`data:image/png;base64,${photo}`}
                    // src={photo}
                    alt={getDisplayValue(empFullName, "Employee")}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-56 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                            <div class="text-gray-600 font-bold text-3xl">
                              ${getInitials(empFullName)}
                            </div>
                          </div>
                        `;
                    }}
                  />
                </div>

                <div className="w-full h-56 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                  <div className="text-gray-600 font-bold text-3xl">
                    {getInitials(empFullName)}
                  </div>
                </div>

                {/* Code Display at Bottom */}
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="font-mono font-bold text-gray-800 text-sm">
                      {getDisplayValue(code)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Employee Details */}
            <div className="md:w-3/5 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  {getDisplayValue(empFullName)}
                </h2>

                {empFullNameAm && empFullNameAm.trim() !== "" && (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 text-sm">{empFullNameAm}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="text-base font-medium text-gray-800">
                    {getDisplayValue(dept)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="text-base font-medium text-gray-800">
                    {getDisplayValue(position)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-base font-medium text-gray-800 capitalize">
                    {getDisplayValue(gender)}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                  onClick={onAddAccount}
                >
                  Add Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EmployeeList;