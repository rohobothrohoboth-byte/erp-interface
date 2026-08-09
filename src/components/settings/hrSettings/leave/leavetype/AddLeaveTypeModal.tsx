import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BadgePlus, DollarSign, Calendar, Clock,
  AlertCircle, CheckCircle, TrendingUp,
  Briefcase, FileText, Bell, Users,
  Shield, Zap, ChevronLeft, ChevronRight,
  UserCheck, Building2, Crown, UserCog, GitBranch
} from "lucide-react";
import { Button } from "../../../../ui/button";
import { Label } from "../../../../ui/label";
import { Input } from "../../../../ui/input";
import type { LeaveTypeAddDto } from "../../../../../types/core/Settings/leavetype";
import toast from "react-hot-toast";

interface AddLeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLeaveType: (leaveType: LeaveTypeAddDto) => Promise<any>;
  loading?: boolean;
}

const AddLeaveTypeModal: React.FC<AddLeaveTypeModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onAddLeaveType,
                                                               loading: externalLoading = false,
                                                             }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Basic Info
  const [name, setName] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [code, setCode] = useState("");
  const [leaveCategory, setLeaveCategory] = useState("Paid");
  const [description, setDescription] = useState("");

  // Accrual Settings
  const [accrualFrequency, setAccrualFrequency] = useState("Annual");
  const [accrualRate, setAccrualRate] = useState(12);
  const [maxAccrual, setMaxAccrual] = useState(30);
  const [allowCarryover, setAllowCarryover] = useState(true);
  const [maxCarryoverDays, setMaxCarryoverDays] = useState(5);
  const [carryoverExpiryMonths, setCarryoverExpiryMonths] = useState(3);

  // Rules
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [requiresAttachment, setRequiresAttachment] = useState(false);
  const [requiresDoctorNote, setRequiresDoctorNote] = useState(false);
  const [allowHalfDay, setAllowHalfDay] = useState(true);
  const [allowNegativeBalance, setAllowNegativeBalance] = useState(false);
  const [maxDaysPerRequest, setMaxDaysPerRequest] = useState(30);
  const [maxDaysPerYear, setMaxDaysPerYear] = useState(30);
  const [minDaysPerRequest, setMinDaysPerRequest] = useState(0.5);

  // Eligibility
  const [minServiceMonths, setMinServiceMonths] = useState(0);
  const [probationPeriodOnly, setProbationPeriodOnly] = useState(false);
  const [eligibleEmploymentTypes, setEligibleEmploymentTypes] = useState<string[]>(["Permanent"]);

  // Notifications
  const [sendReminderDays, setSendReminderDays] = useState<number[]>([30, 14, 7, 3]);
  const [notifyManagerOnRequest, setNotifyManagerOnRequest] = useState(true);

  // Display
  const [icon, setIcon] = useState("Calendar");
  const [color, setColor] = useState("emerald");
  const [priority, setPriority] = useState(0);

  const loading = externalLoading || isLoading;

  const tabs = ["Basic Info", "Accrual", "Rules", "Eligibility", "Notifications"];

  const categoryOptions = [
    { value: "Paid", label: "Paid Leave", icon: DollarSign, color: "emerald", description: "Employee receives full/partial pay" },
    { value: "Unpaid", label: "Unpaid Leave", icon: Calendar, color: "orange", description: "No payment during leave" },
    { value: "Special", label: "Special Leave", icon: Calendar, color: "purple", description: "Special circumstances" }
  ];

  const accrualOptions = [
    { value: "Annual", label: "Annual", description: "Accrued once per year" },
    { value: "Monthly", label: "Monthly", description: "Accrued each month" },
    { value: "Daily", label: "Daily", description: "Accrued daily" },
    { value: "None", label: "None", description: "No automatic accrual" }
  ];

  const employmentTypeOptions = [
    { value: "Permanent", label: "Permanent", icon: Shield },
    { value: "Contract", label: "Contract", icon: FileText },
    { value: "Probation", label: "Probation", icon: Clock },
    { value: "Intern", label: "Intern", icon: Users },
    { value: "PartTime", label: "Part-time", icon: Briefcase }
  ];

  const colorOptions = [
    { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "red", label: "Red", class: "bg-red-500" }
  ];

  const iconOptions = [
    { value: "Calendar", icon: Calendar },
    { value: "Clock", icon: Clock },
    { value: "TrendingUp", icon: TrendingUp },
    { value: "Briefcase", icon: Briefcase },
    { value: "Users", icon: Users },
    { value: "Shield", icon: Shield },
    { value: "Zap", icon: Zap }
  ];

  const resetForm = () => {
    setName("");
    setNameAm("");
    setCode("");
    setLeaveCategory("Paid");
    setDescription("");
    setAccrualFrequency("Annual");
    setAccrualRate(12);
    setMaxAccrual(30);
    setAllowCarryover(true);
    setMaxCarryoverDays(5);
    setCarryoverExpiryMonths(3);
    setRequiresApproval(true);
    setRequiresAttachment(false);
    setRequiresDoctorNote(false);
    setAllowHalfDay(true);
    setAllowNegativeBalance(false);
    setMaxDaysPerRequest(30);
    setMaxDaysPerYear(30);
    setMinDaysPerRequest(0.5);
    setMinServiceMonths(0);
    setProbationPeriodOnly(false);
    setEligibleEmploymentTypes(["Permanent"]);
    setSendReminderDays([30, 14, 7, 3]);
    setNotifyManagerOnRequest(true);
    setIcon("Calendar");
    setColor("emerald");
    setPriority(0);
    setFormErrors({});
    setActiveTab(0);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Leave type name is required";
    if (!code.trim()) errors.code = "Unique code is required";
    if (accrualRate <= 0) errors.accrualRate = "Accrual rate must be greater than 0";
    if (maxDaysPerYear < maxDaysPerRequest) {
      errors.maxDaysPerRequest = "Max days per request cannot exceed yearly limit";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmploymentTypeToggle = (type: string) => {
    setEligibleEmploymentTypes(prev =>
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleReminderDaysToggle = (days: number) => {
    setSendReminderDays(prev =>
        prev.includes(days) ? prev.filter(d => d !== days) : [...prev, days].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        nameAm: nameAm.trim() || undefined,
        code: code.trim().toUpperCase(),
        leaveCategory,
        description: description.trim() || undefined,
        accrualFrequency,
        accrualRate,
        maxAccrual,
        allowCarryover,
        maxCarryoverDays,
        carryoverExpiryMonths,
        requiresApproval,
        requiresAttachment,
        requiresDoctorNote,
        allowHalfDay,
        allowNegativeBalance,
        maxDaysPerRequest,
        maxDaysPerYear,
        minDaysPerRequest,
        minServiceMonths,
        probationPeriodOnly,
        eligibleEmploymentTypes,
        sendReminderDays,
        notifyManagerOnRequest,
        icon,
        color,
        priority
      };

      console.log("Submitting leave type:", payload);
      await onAddLeaveType(payload);
      toast.success("Leave type created successfully");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create leave type");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!loading) {
      resetForm();
      onClose();
    }
  }, [loading, onClose]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  const SelectedIcon = iconOptions.find(i => i.value === icon)?.icon || Calendar;
  const selectedCategory = categoryOptions.find(c => c.value === leaveCategory) || categoryOptions[0];
  const CategoryIcon = selectedCategory.icon;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 h-screen">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${color}-100`}>
                <SelectedIcon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Create Leave Type</h2>
                <p className="text-sm text-gray-500">Configure leave policy rules and settings</p>
              </div>
            </div>
            <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b px-6 pt-2">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab, index) => (
                  <button
                      key={index}
                      type="button"
                      onClick={() => setActiveTab(index)}
                      className={`px-4 py-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                          activeTab === index
                              ? "border-emerald-500 text-emerald-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    {tab}
                  </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Tab 0: Basic Info */}
              {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Leave Type Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Annual Leave"
                            className={formErrors.name ? "border-red-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Unique Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g., AL, SL, ML"
                            className={formErrors.code ? "border-red-500" : ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Name (Amharic)</Label>
                      <Input
                          value={nameAm}
                          onChange={(e) => setNameAm(e.target.value)}
                          placeholder="የዕረፍት አይነት ስም"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the purpose and conditions of this leave type"
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Leave Category <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-3 gap-3">
                        {categoryOptions.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = leaveCategory === cat.value;
                          return (
                              <button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => setLeaveCategory(cat.value)}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                      isSelected
                                          ? `border-${cat.color}-500 bg-${cat.color}-50 shadow-sm`
                                          : "border-gray-200 hover:border-gray-300"
                                  }`}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className={`p-2 rounded-full ${
                                      isSelected ? `bg-${cat.color}-100 text-${cat.color}-600` : "bg-gray-100 text-gray-400"
                                  }`}>
                                    <Icon size={20} />
                                  </div>
                                  <span className="text-sm font-medium">{cat.label}</span>
                                  <span className="text-xs text-gray-500 text-center">{cat.description}</span>
                                </div>
                              </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Icon</Label>
                        <select
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {iconOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.value}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Color</Label>
                        <div className="flex gap-2">
                          {colorOptions.map(c => (
                              <button
                                  key={c.value}
                                  type="button"
                                  onClick={() => setColor(c.value)}
                                  className={`w-8 h-8 rounded-full ${c.class} ${
                                      color === c.value ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                  }`}
                                  title={c.label}
                              />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Tab 1: Accrual Settings */}
              {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Accrual Configuration</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">Configure how leave days are earned over time</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Accrual Frequency</Label>
                      <select
                          value={accrualFrequency}
                          onChange={(e) => setAccrualFrequency(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {accrualOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} - {opt.description}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-gray-700">Days per Period</Label>
                        <span className="text-sm text-emerald-600 font-medium">{accrualRate} days</span>
                      </div>
                      <input
                          type="range"
                          value={accrualRate}
                          onChange={(e) => setAccrualRate(Number(e.target.value))}
                          min={0}
                          max={accrualFrequency === "Annual" ? 30 : accrualFrequency === "Monthly" ? 5 : 30}
                          step={0.5}
                          className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-gray-700">Maximum Accrual</Label>
                        <span className="text-sm text-emerald-600 font-medium">{maxAccrual} days</span>
                      </div>
                      <input
                          type="range"
                          value={maxAccrual}
                          onChange={(e) => setMaxAccrual(Number(e.target.value))}
                          min={accrualRate}
                          max={90}
                          step={1}
                          className="w-full"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Allow Carryover</span>
                          <p className="text-xs text-gray-500">Unused days carry over to next period</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAllowCarryover(!allowCarryover)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                allowCarryover ? "bg-emerald-600" : "bg-gray-300"
                            }`}
                        >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          allowCarryover ? "translate-x-6" : "translate-x-1"
                      }`} />
                        </button>
                      </div>

                      {allowCarryover && (
                          <div className="space-y-3 pl-4 border-l-2 border-emerald-200">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Max Carryover Days</Label>
                              <Input
                                  type="number"
                                  value={maxCarryoverDays}
                                  onChange={(e) => setMaxCarryoverDays(Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Carryover Expiry (months)</Label>
                              <Input
                                  type="number"
                                  value={carryoverExpiryMonths}
                                  onChange={(e) => setCarryoverExpiryMonths(Number(e.target.value))}
                              />
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              )}

              {/* Tab 2: Rules */}
              {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Max Days Per Request</Label>
                        <Input
                            type="number"
                            value={maxDaysPerRequest}
                            onChange={(e) => setMaxDaysPerRequest(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Max Days Per Year</Label>
                        <Input
                            type="number"
                            value={maxDaysPerYear}
                            onChange={(e) => setMaxDaysPerYear(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Minimum Days Per Request</Label>
                      <Input
                          type="number"
                          step={0.5}
                          value={minDaysPerRequest}
                          onChange={(e) => setMinDaysPerRequest(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      {[
                        { key: "requiresApproval", label: "Requires Approval", desc: "Manager must approve before leave is taken", value: requiresApproval, setter: setRequiresApproval },
                        { key: "requiresAttachment", label: "Requires Attachment", desc: "Supporting documents required", value: requiresAttachment, setter: setRequiresAttachment },
                        { key: "requiresDoctorNote", label: "Requires Doctor's Note", desc: "Medical certificate required for sick leave", value: requiresDoctorNote, setter: setRequiresDoctorNote },
                        { key: "allowHalfDay", label: "Allow Half Day Leave", desc: "Employee can take half day leave", value: allowHalfDay, setter: setAllowHalfDay },
                        { key: "allowNegativeBalance", label: "Allow Negative Balance", desc: "Allow leave when balance is insufficient", value: allowNegativeBalance, setter: setAllowNegativeBalance }
                      ].map(rule => (
                          <div key={rule.key} className="flex items-center justify-between py-2">
                            <div>
                              <span className="text-sm text-gray-700">{rule.label}</span>
                              <p className="text-xs text-gray-500">{rule.desc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => (rule.setter as any)(!rule.value)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    rule.value ? "bg-emerald-600" : "bg-gray-300"
                                }`}
                            >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rule.value ? "translate-x-6" : "translate-x-1"
                        }`} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* Tab 3: Eligibility */}
              {activeTab === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Minimum Service Months</Label>
                      <Input
                          type="number"
                          value={minServiceMonths}
                          onChange={(e) => setMinServiceMonths(Number(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-700">Probation Period Only</span>
                        <p className="text-xs text-gray-500">Only available during probation</p>
                      </div>
                      <button
                          type="button"
                          onClick={() => setProbationPeriodOnly(!probationPeriodOnly)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              probationPeriodOnly ? "bg-emerald-600" : "bg-gray-300"
                          }`}
                      >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        probationPeriodOnly ? "translate-x-6" : "translate-x-1"
                    }`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Eligible Employment Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {employmentTypeOptions.map(type => {
                          const Icon = type.icon;
                          const isSelected = eligibleEmploymentTypes.includes(type.value);
                          return (
                              <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => handleEmploymentTypeToggle(type.value)}
                                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                                      isSelected
                                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                                  }`}
                              >
                                <Icon size={14} />
                                {type.label}
                                {isSelected && <CheckCircle size={14} />}
                              </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
              )}

              {/* Tab 4: Notifications */}
              {activeTab === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-700">Notify Manager on Request</span>
                        <p className="text-xs text-gray-500">Send notification when leave is requested</p>
                      </div>
                      <button
                          type="button"
                          onClick={() => setNotifyManagerOnRequest(!notifyManagerOnRequest)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notifyManagerOnRequest ? "bg-emerald-600" : "bg-gray-300"
                          }`}
                      >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifyManagerOnRequest ? "translate-x-6" : "translate-x-1"
                    }`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Send Reminders (days before)</Label>
                      <div className="flex flex-wrap gap-2">
                        {[30, 14, 7, 3, 1].map(days => {
                          const isSelected = sendReminderDays.includes(days);
                          return (
                              <button
                                  key={days}
                                  type="button"
                                  onClick={() => handleReminderDaysToggle(days)}
                                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                                      isSelected
                                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                          : "bg-gray-100 text-gray-600 border border-gray-200"
                                  }`}
                              >
                                {days} days
                              </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <Label className="text-sm font-medium text-gray-700">Display Priority</Label>
                      <Input
                          type="number"
                          value={priority}
                          onChange={(e) => setPriority(Number(e.target.value))}
                          placeholder="Lower number = higher priority"
                      />
                    </div>
                  </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Step {activeTab + 1} of {tabs.length}
                </div>
                <div className="flex gap-3">
                  {activeTab > 0 && (
                      <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab(activeTab - 1)}
                          className="flex items-center gap-1"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                  )}
                  {activeTab < tabs.length - 1 ? (
                      <Button
                          type="button"
                          onClick={() => setActiveTab(activeTab + 1)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                  ) : (
                      <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={loading || !name.trim() || !code.trim()}
                      >
                        {loading ? "Creating..." : "Create Leave Type"}
                      </Button>
                  )}
                  <Button
                      variant="outline"
                      onClick={handleClose}
                      type="button"
                      disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default AddLeaveTypeModal;