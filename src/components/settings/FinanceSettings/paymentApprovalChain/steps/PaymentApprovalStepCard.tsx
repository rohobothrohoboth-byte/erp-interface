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

const PaymentApprovalStepCard: React.FC<PaymentApprovalStepCardProps> = ({
  steps,
  effectiveFrom,
  effectiveTo,
  onAddStepClick,
  onManage