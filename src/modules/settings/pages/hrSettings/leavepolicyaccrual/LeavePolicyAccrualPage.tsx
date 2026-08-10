import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LeavePolicyAccrualHeader from '@/modules/settings/components/hrSettings/leave/leavepolicyaccrual/LeavePolicyAccrualHeader'
import { Button } from '@/shared/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, Clock, Settings, Pen } from 'lucide-react';
import type { LeavePolicyListDto, UUID } from '@/modules/core/types/Settings/leavepolicy';
import type { LeavePolicyAccrualListDto, LeavePolicyAccrualAddDto } from '@/modules/core/types/Settings/leavepolicyaccrual';
import AddLeavePolicyAccrualModal from '@/modules/settings/components/hrSettings/leave/leavepolicyaccrual/AddLeavePolicyAccrualModal';
import toast from 'react-hot-toast';
import { leavePolicyAccrualService } from '@/modules/core/services/settings/ModHrm/LeavePolicyAccService';
import { leavePolicyService } from '@/modules/core/services/settings/ModHrm/LeavePolicyService';

function LeavePolicyAccrualPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy] = useState<LeavePolicyListDto | null>(null);
  const [accruals, setAccruals] = useState<LeavePolicyAccrualListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  // const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // Local state for editable fields
  const [formData, setFormData] = useState({
    policyInfo: {
      name: '',
      leaveType: '',
      requiresAttachment: false,
      holidaysAsLeave: false,
    },
    durationLimits: {
      minDurPerReq: 0,
      maxDurPerReq: 0,
    },
    accrualSettings: {
      entitlement: 0,
      frequency: '',
      accrualRate: 0,
    },
    carryoverSettings: {
      minServiceMonths: 0,
      maxCarryoverDays: 0,
      carryoverExpiryDays: 0,
    }
  });

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('Policy ID is required');
          return;
        }

        // Fetch policy details from API
        let policyData: LeavePolicyListDto | null = null;
        try {
          policyData = await leavePolicyService.getLeavePolicyById(id as UUID);
        } catch (error) {
          console.error('Error fetching policy:', error);
          setError('Failed to load policy details');
          return;
        }

        if (!policyData) {
          setError('Policy not found');
          return;
        }

        // Fetch accruals from the service
        let accrualsList: LeavePolicyAccrualListDto | null = null;
        try {
          accrualsList = await leavePolicyAccrualService.getLeavePolicyAccrualsByPolicyId(id as UUID);
        } catch (error) {
          console.error('Error fetching accruals by policy ID:', error);
          // try {
          //   console.warn('New endpoint not available, falling back to getAllLeavePolicyAccruals');
          //   accrualsList = await leavePolicyAccrualService.getAllLeavePolicyAccruals();
          //   // Filter as fallback
          //   accrualsList = accrualsList.filter(accrual => accrual.leavePolicyId === id);
          // } catch (fallbackError) {
          //   console.error('Fallback also failed:', fallbackError);
          //   setError('Failed to load accrual rules');
          //   accrualsList = [];
          // }
        }

        setPolicy(policyData);
        setAccruals(accrualsList);

        // Initialize form data with the first accrual (if exists) or default values
        // const firstAccrual = accrualsList.length > 0 ? accrualsList[0] : null;

        setFormData({
          policyInfo: {
            name: policyData.name,
            leaveType: policyData.leaveType,
            requiresAttachment: policyData.requiresAttachment,
            holidaysAsLeave: policyData.holidaysAsLeave,
          },
          durationLimits: {
            minDurPerReq: policyData.minDurPerReq,
            maxDurPerReq: policyData.maxDurPerReq,
          },
          accrualSettings: {
            entitlement: accrualsList?.entitlement || 0,
            frequency: accrualsList?.frequencyStr || '',
            accrualRate: accrualsList?.accrualRate || 0,
          },
          carryoverSettings: {
            minServiceMonths: accrualsList?.minServiceMonths || 0,
            maxCarryoverDays: accrualsList?.maxCarryoverDays || 0,
            carryoverExpiryDays: accrualsList?.carryoverExpiryDays || 0,
          }
        });
      } catch (error) {
        console.error('Error fetching policy details:', error);
        setError('Failed to load policy details');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyDetails();
  }, [id]);

  const handleBackClick = () => {
    navigate('/settings/hr/annualleave');
  };

  const handleEditSection = (section: string) => {
    setIsEditing(true);
    setEditingSection(section);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSection(null);
    setHasChanges(false);
    setError(null);

    // Reset form data to original values
    if (policy && accruals) {
      const firstAccrual = accruals;
      setFormData({
        policyInfo: {
          name: policy.name,
          leaveType: policy.leaveType,
          requiresAttachment: policy.requiresAttachment,
          holidaysAsLeave: policy.holidaysAsLeave,
        },
        durationLimits: {
          minDurPerReq: policy.minDurPerReq,
          maxDurPerReq: policy.maxDurPerReq,
        },
        accrualSettings: {
          entitlement: firstAccrual.entitlement,
          frequency: firstAccrual.frequencyStr,
          accrualRate: firstAccrual.accrualRate,
        },
        carryoverSettings: {
          minServiceMonths: firstAccrual.minServiceMonths,
          maxCarryoverDays: firstAccrual.maxCarryoverDays,
          carryoverExpiryDays: firstAccrual.carryoverExpiryDays,
        }
      });
    } else if (policy) {
      // Reset to original policy data if no accruals
      setFormData({
        policyInfo: {
          name: policy.name,
          leaveType: policy.leaveType,
          requiresAttachment: policy.requiresAttachment,
          holidaysAsLeave: policy.holidaysAsLeave,
        },
        durationLimits: {
          minDurPerReq: policy.minDurPerReq,
          maxDurPerReq: policy.maxDurPerReq,
        },
        accrualSettings: {
          entitlement: 0,
          frequency: '',
          accrualRate: 0,
        },
        carryoverSettings: {
          minServiceMonths: 0,
          maxCarryoverDays: 0,
          carryoverExpiryDays: 0,
        }
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!policy || !id) {
        setError('Policy not found');
        return;
      }

      setSaveLoading(true);
      setError(null);

      if (editingSection === 'policyInfo' || editingSection === 'durationLimits') {
        try {
          const updatedPolicy = await leavePolicyService.updateLeavePolicy({
            id: id as UUID,
            name: formData.policyInfo.name,
            leaveTypeId: policy.leaveTypeId,
            requiresAttachment: formData.policyInfo.requiresAttachment,
            holidaysAsLeave: formData.policyInfo.holidaysAsLeave,
            minDurPerReq: formData.durationLimits.minDurPerReq,
            maxDurPerReq: formData.durationLimits.maxDurPerReq,
            rowVersion: policy.rowVersion,
          });

          setPolicy(updatedPolicy);
          toast.success('Policy updated successfully');
        } catch (error: any) {
          setError(error.message || 'Failed to update policy');
          throw error;
        }
      }

      // Update accrual information if it was edited and accruals exist
      // if ((editingSection === 'accrualSettings' || editingSection === 'carryoverSettings') && accruals) {
      //   const firstAccrual = accruals;
      //   try {
      //     const updatedAccrual = await leavePolicyAccrualService.updateLeavePolicyAccrual({
      //       id: firstAccrual.id,
      //       leavePolicyId: id as UUID,
      //       entitlement: formData.accrualSettings.entitlement,
      //       frequency: formData.accrualSettings.frequency,
      //       accrualRate: formData.accrualSettings.accrualRate,
      //       minServiceMonths: formData.carryoverSettings.minServiceMonths,
      //       maxCarryoverDays: formData.carryoverSettings.maxCarryoverDays,
      //       carryoverExpiryDays: formData.carryoverSettings.carryoverExpiryDays,
      //       rowVersion: firstAccrual.rowVersion,
      //     });

      //     // Update local accruals state
      //     // const updatedAccruals = accruals.map(accrual =>
      //     //   accrual.id === firstAccrual.id ? updatedAccrual : accrual
      //     // );
      //     // setAccruals(updatedAccruals);
      //     toast.success('Accrual settings updated successfully');
      //   } catch (error: any) {
      //     setError(error.message || 'Failed to update accrual settings');
      //     throw error;
      //   }
      // }

      setIsEditing(false);
      setEditingSection(null);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddAccrual = async (accrualData: any) => {
    try {
      if (!id) {
        toast.error('Policy ID is required');
        return;
      }

      const accrualAddDto: LeavePolicyAccrualAddDto = {
        leavePolicyId: id as UUID,
        entitlement: accrualData.entitlement,
        frequency: accrualData.frequency,
        accrualRate: accrualData.accrualRate,
        minServiceMonths: accrualData.minServiceMonths,
        maxCarryoverDays: accrualData.maxCarryoverDays,
        carryoverExpiryDays: accrualData.carryoverExpiryDays,
      };

      // Call the service to create the accrual
      const newAccrual = await leavePolicyAccrualService.createLeavePolicyAccrual(accrualAddDto);

      // Update the local state with the new accrual
      // const updatedAccruals = [...accruals, newAccrual];
      setAccruals(newAccrual);

      // Update the form data with the new accrual (use the first accrual for display)
      // if (updatedAccruals.length === 1) {
      //   setFormData(prev => ({
      //     ...prev,
      //     accrualSettings: {
      //       entitlement: newAccrual.entitlement,
      //       frequency: newAccrual.frequency,
      //       accrualRate: newAccrual.accrualRate,
      //     },
      //     carryoverSettings: {
      //       minServiceMonths: newAccrual.minServiceMonths,
      //       maxCarryoverDays: newAccrual.maxCarryoverDays,
      //       carryoverExpiryDays: newAccrual.carryoverExpiryDays,
      //     }
      //   }));
      // }

      toast.success('Accrual rule added successfully');
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add accrual rule');
      console.error('Error adding accrual rule:', error);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const renderField = (section: string, field: string, label: string, value: any, isBoolean = false) => {
    const isEditingThisSection = isEditing && editingSection === section;

    if (isEditingThisSection) {
      if (isBoolean) {
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => handleInputChange(section, field, e.target.value === 'true')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      }

      return (
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(
            section,
            field,
            typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
          )}
          className="text-sm border border-gray-300 rounded px-2 py-1 w-32"
          step={field === 'minDurPerReq' || field === 'maxDurPerReq' ? '0.5' : undefined}
        />
      );
    }

    if (isBoolean) {
      return (
        <span className={`text-sm ${value ? 'text-red-600' : 'text-green-600'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    return <span className="text-sm text-gray-900">{value}</span>;
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  // const handleDeleteAccrual = async (accrualId: UUID) => {
  //   try {
  //     if (!confirm('Are you sure you want to delete this accrual rule?')) {
  //       return;
  //     }

  //     setDeleteLoadingId(accrualId);
  //     await leavePolicyAccrualService.deleteLeavePolicyAccrual(accrualId);
  //     const updatedAccruals = accruals.filter(accrual => accrual.id !== accrualId);
  //     setAccruals(updatedAccruals);

  //     // If we deleted the last accrual, reset the form data
  //     if (updatedAccruals.length === 0) {
  //       setFormData(prev => ({
  //         ...prev,
  //         accrualSettings: {
  //           entitlement: 0,
  //           frequency: '',
  //           accrualRate: 0,
  //         },
  //         carryoverSettings: {
  //           minServiceMonths: 0,
  //           maxCarryoverDays: 0,
  //           carryoverExpiryDays: 0,
  //         }
  //       }));
  //     }

  //     toast.success('Accrual rule deleted successfully');
  //   } catch (error: any) {
  //     toast.error(error.message || 'Failed to delete accrual rule');
  //     console.error('Error deleting accrual rule:', error);
  //   } finally {
  //     setDeleteLoadingId(null);
  //   }
  // };

  // Loading State
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 min-h-screen"
      >
        <Button variant={"outline"} className="mb-6 cursor-pointer flex items-center gap-2" onClick={handleBackClick}>
          <ArrowLeft size={16} />
          Back to Leave Settings
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-12"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading policy details...</p>
          </div>
        </motion.div>
      </motion.section>
    );
  }

  // Error State
  if (!policy) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 min-h-screen"
      >
        <Button variant={"outline"} className="mb-6 cursor-pointer flex items-center gap-2" onClick={handleBackClick}>
          <ArrowLeft size={16} />
          Back to Leave Settings
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg border border-gray-200"
        >
          <div className="p-3 rounded-full bg-gray-100 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Policy Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            The requested policy could not be found or has been removed.
          </p>
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="cursor-pointer"
          >
            Return to Leave Settings
          </Button>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-6"
    >
      <Button variant={"outline"} className="mb-6 cursor-pointer flex items-center gap-2" onClick={handleBackClick}>
        <ArrowLeft size={16} />
        Back to Leave Settings
      </Button>

      <LeavePolicyAccrualHeader onAdd={handleAddClick} />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("load") ? (
                <>
                  Failed to load policy details.{" "}
                  <button
                    onClick={() => window.location.reload()}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>
                </>
              ) : error.includes("update") ? (
                "Failed to save changes. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete accrual rule. Please try again."
              ) : (
                error
              )}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Policy Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Basic Policy Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Policy Information
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('policyInfo')}
              className="h-8 w-8 p-0 cursor-pointer"
              disabled={isEditing && editingSection !== 'policyInfo'}
            >
              <Pen size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Policy Name</span>
              {renderField('policyInfo', 'name', 'Policy Name', formData.policyInfo.name)}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Leave Type</span>
              {renderField('policyInfo', 'leaveType', 'Leave Type', formData.policyInfo.leaveType)}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Requires Attachment</span>
              {renderField('policyInfo', 'requiresAttachment', 'Requires Attachment', formData.policyInfo.requiresAttachment, true)}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Holidays Count as Leave</span>
              {renderField('policyInfo', 'holidaysAsLeave', 'Holidays Count as Leave', formData.policyInfo.holidaysAsLeave, true)}
            </div>
          </div>
        </div>

        {/* Duration Limits */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Duration Limits
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('durationLimits')}
              className="h-8 w-8 p-0 cursor-pointer"
              disabled={isEditing && editingSection !== 'durationLimits'}
            >
              <Pen size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Minimum Duration per Request</span>
              <div className="flex items-center gap-2">
                {renderField('durationLimits', 'minDurPerReq', 'Minimum Duration per Request', formData.durationLimits.minDurPerReq)}
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Maximum Duration per Request</span>
              <div className="flex items-center gap-2">
                {renderField('durationLimits', 'maxDurPerReq', 'Maximum Duration per Request', formData.durationLimits.maxDurPerReq)}
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accrual Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Accrual Settings
            </h2>
            {accruals ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditSection('accrualSettings')}
                  className="h-8 w-8 p-0 cursor-pointer"
                  disabled={isEditing && editingSection !== 'accrualSettings'}
                >
                  <Pen size={16} />
                </Button>
                {/* <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {accruals.length} rule{accruals.length !== 1 ? 's' : ''}
                </span> */}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No accrual settings configured
              </div>
            )}
          </div>

          {accruals ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Annual Entitlement</span>
                <div className="flex items-center gap-2">
                  {renderField('accrualSettings', 'entitlement', 'Annual Entitlement', formData.accrualSettings.entitlement)}
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Accrual Frequency</span>
                {renderField('accrualSettings', 'frequency', 'Accrual Frequency', formData.accrualSettings.frequency)}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Accrual Rate</span>
                <div className="flex items-center gap-2">
                  {renderField('accrualSettings', 'accrualRate', 'Accrual Rate', formData.accrualSettings.accrualRate)}
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </div>

              {/* Accrual Rules List
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Accrual Rules:</h3>
                <div className="space-y-2">
                  {accruals.map((accrual) => (
                    <div key={accrual.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>
                        <span className="text-sm font-medium">{accrual.frequencyStr}</span>
                        <span className="text-sm text-gray-600 ml-2">- {accrual.entitlement} days/year</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleDeleteAccrual(accrual.id)}
                        disabled={deleteLoadingId === accrual.id || (isEditing && editingSection === 'accrualSettings')}
                      >
                        // {deleteLoadingId === accrual.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500 mb-3">No accrual settings have been configured for this policy.</p>
              <p className="text-sm text-gray-400">Click "Add Accrual" in the header to configure accrual settings.</p>
            </div>
          )}
        </div>

        {/* Carryover Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Carryover Settings
            </h2>
            {accruals ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditSection('carryoverSettings')}
                className="h-8 w-8 p-0 cursor-pointer"
                disabled={isEditing && editingSection !== 'carryoverSettings'}
              >
                <Pen size={16} />
              </Button>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No carryover settings configured
              </div>
            )}
          </div>

          {accruals ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Minimum Service Months</span>
                <div className="flex items-center gap-2">
                  {renderField('carryoverSettings', 'minServiceMonths', 'Minimum Service Months', formData.carryoverSettings.minServiceMonths)}
                  <span className="text-sm text-gray-500">months</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Maximum Carryover Days</span>
                <div className="flex items-center gap-2">
                  {renderField('carryoverSettings', 'maxCarryoverDays', 'Maximum Carryover Days', formData.carryoverSettings.maxCarryoverDays)}
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Carryover Expiry</span>
                <div className="flex items-center gap-2">
                  {renderField('carryoverSettings', 'carryoverExpiryDays', 'Carryover Expiry', formData.carryoverSettings.carryoverExpiryDays)}
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500 mb-3">No carryover settings have been configured for this policy.</p>
              <p className="text-sm text-gray-400">These settings will be available after adding accrual rules.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Only show when there are changes */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200"
        >
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={saveLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={handleSaveChanges}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </motion.div>
      )}

      {/* Add Accrual Modal */}
      <AddLeavePolicyAccrualModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAccrual}
        policyId={id! as UUID}
        policyName={policy.name}
      />
    </motion.section>
  );
}

export default LeavePolicyAccrualPage;