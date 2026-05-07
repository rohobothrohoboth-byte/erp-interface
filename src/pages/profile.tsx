import React, { useState } from 'react';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { OverviewTab } from '../components/profile/OverviewTab';
import { BasicInfoTab } from '../components/profile/BasicInfoTab';
import { BiographicalTab } from '../components/profile/BiographicalTab';
import { EmergencyTab } from '../components/profile/EmergencyTab';
import { FamilyTab } from '../components/profile/FamilyTab';
import { GuarantorTab } from '../components/profile/GuarantorTab';

const content: Record<string, React.ReactNode> = {
  overview:  <OverviewTab />,
  basic:     <BasicInfoTab />,
  bio:       <BiographicalTab />,
  emergency: <EmergencyTab />,
  family:    <FamilyTab />,
  guarantor: <GuarantorTab />,
};

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-4 overflow-y-auto h-full pb-8">
      <ProfileHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <div>{content[activeTab]}</div>
    </div>
  );
}

export default ProfilePage;
