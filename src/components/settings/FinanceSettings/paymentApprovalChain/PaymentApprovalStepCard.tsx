import React from "react";
import { Card, CardContent } from "../../../ui/card";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Calendar, ListOrdered, BadgePlus, Settings } from "lucide-react";
import { Box } from "@radix-ui/themes";
import type { PaymentApprovalStep } from "./types";

interface PaymentApprovalStepCardProps {
  steps: PaymentApprovalStep[];
  effectiveFrom?: string;
  effectiveTo?: string;
  onAddStepClick: () => void;
  onManageStepsClick: () => void;
  loading: boolean;
}

const PaymentApprovalStepCard: React.FC<PaymentApprovalStepCardProps> = ({
  steps,
  effectiveFrom,
  effectiveTo,
  onAddStepClick,
  onManageStepsClick,
  loading,
}) => {
  const getRoleColor = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('manager')) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (roleLower.includes('director') || roleLower.includes('head')) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else if (roleLower.includes('finance') || roleLower.includes('accountant')) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Box
      asChild
      style={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Card className="border border-gray-200 bg-white shadow-sm rounded-b-lg rounded-t-none">
        <CardContent className="">
          {/* Header with Effective Dates */}
          <div className="flex sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <div>
                {/* Effective Dates */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      Effective:
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="font-medium text-gray-900">
                      {effectiveFrom}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">
                      to
                    </span>
                    <span className="font-medium text-gray-900">
                      {effectiveTo ? effectiveTo : "Not Assigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  Total step{steps.length !== 1 ? "s " : " "}
                  {steps.length}
                </div>
                <Button
                  onClick={onAddStepClick}
                  size="sm"
                  className="flex cursor-pointer items-center justify-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                >
                  <BadgePlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add Approval Step</span>
                  <span className="sm:hidden">Add Step</span>
                </Button>
                {steps.length > 0 && (
                  <Button
                    onClick={onManageStepsClick}
                    size="sm"
                    variant="outline"
                    className="flex cursor-pointer items-center justify-center gap-1 sm:gap-2 hover:bg-blue-50 hover:border-blue-200 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Manage Steps</span>
                    <span className="sm:hidden">Manage</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Steps Layout */}
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : steps.length === 0 ? (
              <div className="text-center py-4 sm:py-6 border border-dashed border-gray-300 rounded-b-lg">
                <ListOrdered className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-500">
                  No approval steps configured
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Add steps to create an approval workflow
                </p>
              </div>
            ) : (
              <div className="relative py-2 sm:py-4">
                {/* Mobile: Vertical Layout */}
                <div className="block sm:hidden space-y-3">
                  {steps.map((step) => (
                    <div key={step.step_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                            {(step.employee_name || "Unassigned")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-semibold border-2 border-white shadow-sm">
                          {step.step_order}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {step.step_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {step.employee_name || "Unassigned"}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 mt-1 ${getRoleColor(step.approver_role)}`}
                        >
                          {step.approver_role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Horizontal Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    const stepWidth = steps.length <= 2 ? 'w-48' : steps.length === 3 ? 'w-40' : 'w-32';

                    return (
                      <React.Fragment key={step.step_id}>
                        {/* Step Card */}
                        <div className={`relative flex flex-col items-center ${stepWidth} flex-shrink-0`}>
                          {/* Step Info */}
                          <div className="text-center w-full px-2">
                            <div className="flex flex-col items-center gap-2 mb-3">
                              <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                                    {(step.employee_name || "Unassigned")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Step Number Badge */}
                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-semibold border-2 border-white shadow-sm">
                                  {step.step_order}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-full">
                                  {step.step_name}
                                </p>
                                <p className="text-xs text-gray-600 truncate max-w-full">
                                  {step.employee_name || "Unassigned"}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-1 ${getRoleColor(step.approver_role)}`}
                            >
                              {step.approver_role}
                            </Badge>
                          </div>
                        </div>

                        {/* Connector Line */}
                        {!isLast && (
                          <div className="flex-1 flex items-center justify-center px-2">
                            <div className="w-full h-0.5 bg-linear-to-r from-gray-300 via-gray-300 to-gray-400 relative min-w-8">
                              {/* Arrow head */}
                              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                                <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-t-transparent border-b-transparent border-l-gray-400"></div>
                              </div>
                              
                              {/* Dotted overlay for visual interest */}
                              <div className="absolute inset-0 border-t border-dashed border-gray-200 opacity-40"></div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentApprovalStepCard;
