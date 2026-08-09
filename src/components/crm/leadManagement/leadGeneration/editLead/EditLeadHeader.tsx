// src/components/crm/leadManagement/leadGeneration/editLead/EditLeadHeader.tsx
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../../../ui/button';

interface EditLeadHeaderProps {
    leadName: string;
    onBack: () => void;
    onSave: () => void;
    saving?: boolean;
}

const EditLeadHeader: React.FC<EditLeadHeaderProps> = ({
                                                           leadName,
                                                           onBack,
                                                           onSave,
                                                           saving = false,
                                                       }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
                    <p className="text-sm text-gray-500">Update lead information for {leadName}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onBack}>
                    Cancel
                </Button>
                <Button onClick={onSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export default EditLeadHeader;