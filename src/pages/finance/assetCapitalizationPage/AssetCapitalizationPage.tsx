import React from 'react';
import AssetCapitalizationSection from '../../../components/finance/assets/assetCapitalization/AssetCapitalizationSection';

const AssetCapitalizationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <AssetCapitalizationSection />
      </div>
    </div>
  );
};

export default AssetCapitalizationPage;