import React from "react";
import { Card, CardContent } from "../../../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../ui/avatar";
import { Badge } from "../../../../ui/badge";
import { Button } from "../../../../ui/button";
import { Calendar, ListOrdered, BadgePlus, Settings, CheckCircle2 } from "lucide-react";
import { Box } from "@radix-ui/themes";
import type { PaymentApprovalStep } from "../types";

interface PaymentApprovalStepCardProps {
  steps: PaymentApprovalStep[];
  effectiveFrom?: string;
  effectiveTo?: string;
  onAddStepClick: () => void;
  onManageStepsClick: () => void;
  loading: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PaymentApprovalStepCard: React.FC<PaymentApprovalStepCardProps> = ({
  steps,
  effectiveFrom,
  effectiveTo,
  onAddStepClick,
  onManageStepsClick,
  loading,
}) => {
  const sortedSteps = [...(steps || [])].sort((a, b) => a.step_order - b.step_order);

  return (
    <Card className="rounded-b-lg rounded-t-none border-t-0">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>
              Effective {formatDate(effectiveFrom)}
              {effectiveTo ? ` – ${formatDate(effectiveTo)}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onManageStepsClick}
              disabled={loading}
              className="gap-1.5"
            >
              <Settings className="w-4 h-4" /> Manage Steps
            </Button>
            <Button size="sm" onClick={onAddStepClick} disabled={loading} className="gap-1.5">
              <BadgePlus className="w-4 h-4" /> Add Step
            </Button>
          </div>
        </div>

        {sortedSteps.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <ListOrdered className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No approval steps configured yet.</p>
          </div>
        ) : (
          <Box className="space-y-2">
            {sortedSteps.map((step) => (
              <div
                key={step.step_id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white"
              >
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ListOrdered className="w-3 h-3" /> {step.step_order}
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={step.employee_name || step.step_name} />
                  <AvatarFallback>{initials(step.employee_name || step.step_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{step.step_name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {step.approver_role}
                    {step.employee_name ? ` · ${step.employee_name}` : ""}
                  </p>
                </div>
                {step.is_final && (
                  <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Final
                  </Badge>
                )}
              </div>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentApprovalStepCard;
