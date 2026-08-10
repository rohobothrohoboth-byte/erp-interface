import { motion } from "framer-motion";
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SettingsIcon,
  ClockIcon,
  AlertCircleIcon,
} from "lucide-react";
import type { LeavePolicyConfigListDto } from "@/modules/core/types/Settings/leavePolicyConfig";

interface ActiveLeavePolicyConfigProps {
  activeConfig: LeavePolicyConfigListDto | null;
  loading: boolean;
  error: string | null;
  onViewDetails: (config: LeavePolicyConfigListDto) => void;
}

export default function LeavePolicyConfigCard({
  activeConfig,
  loading,
  onViewDetails,
}: ActiveLeavePolicyConfigProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeConfig) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-4"
      >
        <div className="flex items-center">
          <XCircleIcon className="h-4 w-4 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-yellow-800 font-medium text-sm">
              No Active Leave Policy Configuration
            </h3>
            <p className="text-yellow-700 text-xs mt-0.5">
              Please set a Policy Configuration as active to continue.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onViewDetails(activeConfig)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <SettingsIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {activeConfig.leavePolicy}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Fiscal Year: {activeConfig.fiscalYear}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
            Config ID: {activeConfig.id?.substring(0, 8)}...
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Annual Entitlement & Accrual */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-medium text-gray-700">
              Annual Entitlement
            </span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            {activeConfig.annualEntitlementStr}
            <span className="text-xs text-gray-500 ml-1">days</span>
          </div>

          <div className="flex items-center space-x-1 mt-2">
            <ClockIcon className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium text-gray-700">Accrual</span>
          </div>
          <div className="text-xs text-gray-900">
            {activeConfig.accrualRateStr} per {activeConfig.accrualFrequencyStr}
          </div>
        </div>

        {/* Limits */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            <AlertCircleIcon className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-medium text-gray-700">
              Request Limits
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Per Request:</span>
              <span className="font-semibold text-gray-900">
                {activeConfig.maxDaysPerReqStr} days
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Carry Over:</span>
              <span className="font-semibold text-gray-900">
                {activeConfig.maxCarryOverDaysStr} days
              </span>
            </div>
          </div>
        </div>

        {/* Service & Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            <CheckCircleIcon className="h-3 w-3 text-purple-500" />
            <span className="text-xs font-medium text-gray-700">
              Eligibility & Status
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Min Service:</span>
              <span className="font-semibold text-gray-900">
                {activeConfig.minServiceMonthsStr} months
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-semibold ${
                  activeConfig.isActive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {activeConfig.isActiveStr}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-emerald-100">
        <div className="flex justify-between items-center">
          {/* <div className="text-xs text-gray-500">
            Last updated:{" "}
            {new Date(
              activeConfig.lastModDate || activeConfig.createDate
            ).toLocaleDateString()}
          </div> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(activeConfig);
            }}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 hover:bg-emerald-50 rounded transition-colors duration-150"
          >
            View Details →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
