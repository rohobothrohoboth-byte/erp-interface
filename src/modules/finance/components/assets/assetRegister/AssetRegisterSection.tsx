import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/shared/layout/layout';
import AssetRegisterHeader from '@/modules/finance/components/assets/assetRegister/AssetRegisterHeader';
import AssetRegisterSearchFilter from '@/modules/finance/components/assets/assetRegister/AssetRegisterSearchFilter';
import AssetRegisterTable from '@/modules/finance/components/assets/assetRegister/AssetRegisterTable';
import AssetRevaluationModal from '@/modules/finance/components/assets/assetRegister/modals/AssetRevaluationModal';
import AssetImpairmentModal from '@/modules/finance/components/assets/assetRegister/modals/AssetImpairmentModal';
import AssetTransferModal from '@/modules/finance/components/assets/assetRegister/modals/AssetTransferModal';
import AssetDisposalModal from '@/modules/finance/components/assets/assetRegister/modals/AssetDisposalModal';
import type { FixedAsset } from '@/modules/finance/components/assets/assetRegister/types';

const AssetRegisterSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [isRevaluationModalOpen, setIsRevaluationModalOpen] = useState(false);
  const [isImpairmentModalOpen, setIsImpairmentModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);

  // History tracking state
  const [assetHistory, setAssetHistory] = useState<{
    revaluations: any[];
    impairments: any[];
    transfers: any[];
    disposals: any[];
  }>({
    revaluations: [],
    impairments: [],
    transfers: [],
    disposals: [],
  });

  // Mock data for demonstration
  const mockAssets: FixedAsset[] = [
    {
      id: '1',
      asset_id: 'FA-1001',
      asset_name: 'Dell Laptop OptiPlex 7090',
      category: 'IT Equipment',
      department: 'IT Department',
      location: 'Head Office - Floor 3',
      vendor_name: 'Dell Technologies',
      purchase_date: '2024-01-15',
      capitalization_date: '2024-01-20',
      cost: 85000,
      residual_value: 5000,
      useful_life_years: 5,
      depreciation_method: 'STRAIGHT_LINE',
      accumulated_depreciation: 12000,
      net_book_value: 73000,
      status: 'ACTIVE',
      created_at: '2024-01-20T08:30:00Z',
      updated_at: '2024-01-20T08:30:00Z',
    },
    {
      id: '2',
      asset_id: 'FA-1002',
      asset_name: 'Office Printer HP LaserJet',
      category: 'Office Equipment',
      department: 'Administration',
      location: 'Head Office - Floor 1',
      vendor_name: 'HP Inc.',
      purchase_date: '2024-02-10',
      capitalization_date: '2024-02-15',
      cost: 45000,
      residual_value: 2000,
      useful_life_years: 7,
      depreciation_method: 'STRAIGHT_LINE',
      accumulated_depreciation: 6000,
      net_book_value: 39000,
      status: 'ACTIVE',
      created_at: '2024-02-15T10:15:00Z',
      updated_at: '2024-02-15T10:15:00Z',
    },
    {
      id: '3',
      asset_id: 'FA-1003',
      asset_name: 'Toyota Hilux 2024',
      category: 'Vehicles',
      department: 'Operations',
      location: 'Company Garage',
      vendor_name: 'Toyota Ethiopia',
      purchase_date: '2024-02-01',
      capitalization_date: '2024-02-05',
      cost: 1250000,
      residual_value: 250000,
      useful_life_years: 10,
      depreciation_method: 'STRAIGHT_LINE',
      accumulated_depreciation: 100000,
      net_book_value: 1150000,
      status: 'ACTIVE',
      created_at: '2024-02-05T14:20:00Z',
      updated_at: '2024-02-05T14:20:00Z',
    },
    {
      id: '4',
      asset_id: 'FA-1004',
      asset_name: 'Conference Room Projector',
      category: 'Office Equipment',
      department: 'Administration',
      location: 'Conference Room A',
      vendor_name: 'Epson Ethiopia',
      purchase_date: '2024-02-15',
      capitalization_date: '2024-02-20',
      cost: 75000,
      residual_value: 5000,
      useful_life_years: 8,
      depreciation_method: 'STRAIGHT_LINE',
      accumulated_depreciation: 8750,
      net_book_value: 66250,
      status: 'ACTIVE',
      created_at: '2024-02-20T11:30:00Z',
      updated_at: '2024-02-20T11:30:00Z',
    },
    {
      id: '5',
      asset_id: 'FA-1005',
      asset_name: 'Executive Office Desk',
      category: 'Furniture',
      department: 'Executive',
      location: 'CEO Office',
      vendor_name: 'Office Furniture Ltd',
      purchase_date: '2024-01-20',
      capitalization_date: '2024-01-25',
      cost: 25000,
      residual_value: 2500,
      useful_life_years: 10,
      depreciation_method: 'STRAIGHT_LINE',
      accumulated_depreciation: 2250,
      net_book_value: 22750,
      status: 'ACTIVE',
      created_at: '2024-01-25T09:45:00Z',
      updated_at: '2024-01-25T09:45:00Z',
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAssets(mockAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        showToast.error('Error loading assets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Filter assets based on search term, status, and category
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.department && asset.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || asset.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  const handleViewAsset = (asset: FixedAsset) => {
    navigate(`/finance/asset-register/${asset.id}`);
  };

  const handleRevalueAsset = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setIsRevaluationModalOpen(true);
  };

  const handleImpairAsset = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setIsImpairmentModalOpen(true);
  };

  const handleTransferAsset = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setIsTransferModalOpen(true);
  };

  const handleDisposeAsset = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setIsDisposalModalOpen(true);
  };

  const handleRevaluationSubmit = async (data: any) => {
    try {
      // Update the asset with new value
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === data.asset_id 
            ? { 
                ...asset, 
                net_book_value: data.new_value,
                cost: data.new_value + asset.accumulated_depreciation
              }
            : asset
        )
      );

      // Add to revaluation history
      const revaluationRecord = {
        id: Date.now().toString(),
        asset_id: data.asset_id,
        date: data.revaluation_date,
        old_value: data.old_value,
        new_value: data.new_value,
        revaluation_gain: data.revaluation_gain,
        reason: data.reason,
        created_by: 'Current User',
        created_at: new Date().toISOString(),
      };

      setAssetHistory(prev => ({
        ...prev,
        revaluations: [...prev.revaluations, revaluationRecord]
      }));

      showToast.success('Asset revaluation completed successfully');
    } catch (error) {
      console.error('Error processing revaluation:', error);
      showToast.error('Error processing revaluation');
    }
  };

  const handleImpairmentSubmit = async (data: any) => {
    try {
      // Update the asset with impaired value
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === data.asset_id 
            ? { 
                ...asset, 
                net_book_value: data.new_net_book_value,
                accumulated_depreciation: asset.accumulated_depreciation + data.impairment_amount
              }
            : asset
        )
      );

      // Add to impairment history
      const impairmentRecord = {
        id: Date.now().toString(),
        asset_id: data.asset_id,
        date: data.impairment_date,
        impairment_amount: data.impairment_amount,
        old_net_book_value: data.old_net_book_value,
        new_net_book_value: data.new_net_book_value,
        reason: data.reason,
        notes: data.notes,
        created_by: 'Current User',
        created_at: new Date().toISOString(),
      };

      setAssetHistory(prev => ({
        ...prev,
        impairments: [...prev.impairments, impairmentRecord]
      }));

      showToast.success('Asset impairment recorded successfully');
    } catch (error) {
      console.error('Error processing impairment:', error);
      showToast.error('Error processing impairment');
    }
  };

  const handleTransferSubmit = async (data: any) => {
    try {
      // Update the asset with new department and location
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === data.asset_id 
            ? { 
                ...asset, 
                department: data.to_department,
                location: data.to_location
              }
            : asset
        )
      );

      // Add to transfer history
      const transferRecord = {
        id: Date.now().toString(),
        asset_id: data.asset_id,
        date: data.transfer_date,
        from_department: data.from_department,
        to_department: data.to_department,
        from_location: data.from_location,
        to_location: data.to_location,
        reason: data.reason,
        notes: data.notes,
        created_by: 'Current User',
        created_at: new Date().toISOString(),
      };

      setAssetHistory(prev => ({
        ...prev,
        transfers: [...prev.transfers, transferRecord]
      }));

      showToast.success('Asset transfer completed successfully');
    } catch (error) {
      console.error('Error processing transfer:', error);
      showToast.error('Error processing transfer');
    }
  };

  const handleDisposalSubmit = async (data: any) => {
    try {
      // Update the asset status to disposed
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === data.asset_id 
            ? { 
                ...asset, 
                status: 'DISPOSED' as const
              }
            : asset
        )
      );

      // Add to disposal history
      const disposalRecord = {
        id: Date.now().toString(),
        asset_id: data.asset_id,
        date: data.disposal_date,
        disposal_method: data.disposal_method,
        sale_amount: data.sale_amount,
        net_book_value: data.net_book_value,
        gain_loss: data.gain_loss,
        notes: data.notes,
        created_by: 'Current User',
        created_at: new Date().toISOString(),
      };

      setAssetHistory(prev => ({
        ...prev,
        disposals: [...prev.disposals, disposalRecord]
      }));

      showToast.success('Asset disposal completed successfully');
    } catch (error) {
      console.error('Error processing disposal:', error);
      showToast.error('Error processing disposal');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <AssetRegisterHeader />
      
      <AssetRegisterSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <AssetRegisterTable
        assets={paginatedAssets}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onViewAsset={handleViewAsset}
        onRevalueAsset={handleRevalueAsset}
        onImpairAsset={handleImpairAsset}
        onTransferAsset={handleTransferAsset}
        onDisposeAsset={handleDisposeAsset}
      />

      <AssetRevaluationModal
        isOpen={isRevaluationModalOpen}
        onClose={() => setIsRevaluationModalOpen(false)}
        asset={selectedAsset}
        onSubmit={handleRevaluationSubmit}
      />

      <AssetImpairmentModal
        isOpen={isImpairmentModalOpen}
        onClose={() => setIsImpairmentModalOpen(false)}
        asset={selectedAsset}
        onSubmit={handleImpairmentSubmit}
      />

      <AssetTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        asset={selectedAsset}
        onSubmit={handleTransferSubmit}
      />

      <AssetDisposalModal
        isOpen={isDisposalModalOpen}
        onClose={() => setIsDisposalModalOpen(false)}
        asset={selectedAsset}
        onSubmit={handleDisposalSubmit}
      />
    </motion.div>
  );
};

export default AssetRegisterSection;