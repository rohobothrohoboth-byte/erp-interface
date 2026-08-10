import React from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Eye, Calendar, ListOrdered, BadgePlus, Settings } from "lucide-react";
import { Box } from "@radix-ui/themes";
import type { LeaveAppStepListDto } from "@/modules/core/types/Settings/leaveAppStep";
import { ApprovalRole } from "@/modules/core/types/enum";

interface ApprovalStepCardProps {
  steps: LeaveAppStepListDto[];
  effectiveFrom?: string;
  effectiveTo?: string;
  onViewDetails?: () => void;
  onAddStepClick: () => void;
  onManageStepsClick: () => void;
  loading: boolean;
}

const LeaveAppStepCard: React.FC<ApprovalStepCardProps> = ({
  steps,
  effectiveFrom,
  effectiveTo,
  onViewDetails,
  onAddStepClick,
  onManageStepsClick,
  loading,
}) => {
  const getRoleColor = (role: ApprovalRole) => {
    switch (role) {
      case ApprovalRole["0"]:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800";
      case ApprovalRole["1"]:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800";
      case ApprovalRole["2"]: 
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
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
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm rounded-b-lg rounded-t-none">
        <CardContent className="">
          {/* Header with Effective Dates */}
          <div className="flex  sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <div>
                {/* Effective Dates */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Effective:
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {effectiveFrom}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">
                      to
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {effectiveTo ? effectiveTo : "not Assigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Total step{steps.length !== 1 ? "s " : " "}
                  {steps.length}
                </div>
                <Button
                  onClick={onAddStepClick}
                  size="sm"
                  className="flex cursor-pointer items-center justify-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
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

              {onViewDetails && steps.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 sm:h-8 gap-1 sm:gap-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3"
                  onClick={onViewDetails}
                >
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">View</span>
                </Button>
              )}
            </div>
          </div>

          {/* Steps Layout */}
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : steps.length === 0 ? (
              <div className="text-center py-4 sm:py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-b-lg">
                <ListOrdered className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  No approval steps configured
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add steps to create an approval workflow
                </p>
              </div>
            ) : (
              <div className="relative py-2 sm:py-4">
                {/* Mobile: Vertical Layout */}
                <div className="block sm:hidden space-y-3">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                          <AvatarImage
                            src="https://i.pravatar.cc/150?u=john.manager@company.com"
                            alt={step.employee ?? "Unassigned"}
                          />
                          <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {step.employee ??
                              "Unassigned"
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-semibold border-2 border-white dark:border-gray-900 shadow-sm">
                          {step.stepOrder}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {step.stepName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {step.employee || "Unassigned"}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 mt-1 ${getRoleColor(
                            ApprovalRole[
                              step.role as keyof typeof ApprovalRole
                            ],
                          )}`}
                        >
                          {
                            ApprovalRole[
                              step.role as keyof typeof ApprovalRole
                            ]
                          }
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
                      <React.Fragment key={step.id}>
                        {/* Step Card */}
                        <div className={`relative flex flex-col items-center ${stepWidth} flex-shrink-0`}>
                          {/* Step Info */}
                          <div className="text-center w-full px-2">
                            <div className="flex flex-col items-center gap-2 mb-3">
                              <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm">
                                  <AvatarImage
                                    src="https://i.pravatar.cc/150?u=john.manager@company.com"
                                    alt={step.employee ?? "Unassigned"}
                                  />
                                  <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                    {step.employee ??
                                      "Unassigned"
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Step Number Badge */}
                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-semibold border-2 border-white dark:border-gray-900 shadow-sm">
                                  {step.stepOrder}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-full">
                                  {step.stepName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-full">
                                  {step.employee || "Unassigned"}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-1 ${getRoleColor(
                                ApprovalRole[
                                  step.role as keyof typeof ApprovalRole
                                ],
                              )}`}
                            >
                              {
                                ApprovalRole[
                                  step.role as keyof typeof ApprovalRole
                                ]
                              }
                            </Badge>
                          </div>
                        </div>

                        {/* Connector Line */}
                        {!isLast && (
                          <div className="flex-1 flex items-center justify-center px-2">
                            <div className="w-full h-0.5 bg-linear-to-r from-gray-300 via-gray-300 to-gray-400 dark:from-gray-600 dark:via-gray-600 dark:to-gray-700 relative min-w-8">
                              {/* Arrow head */}
                              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                                <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-t-transparent border-b-transparent border-l-gray-400 dark:border-l-gray-600"></div>
                              </div>
                              
                              {/* Dotted overlay for visual interest */}
                              <div className="absolute inset-0 border-t border-dashed border-gray-200 dark:border-gray-700 opacity-40"></div>
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

export default LeaveAppStepCard;
