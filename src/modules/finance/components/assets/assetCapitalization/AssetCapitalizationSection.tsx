import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import AssetCapitalizationHeader from '@/modules/finance/components/assets/assetCapitalization/AssetCapitalizationHeader';
import AssetCapitalizationSearchFilter from '@/modules/finance/components/assets/assetCapitalization/AssetCapitalizationSearchFilter';
import AssetCapitalizationTable from '@/modules/finance/components/assets/assetCapitalization/AssetCapitalizationTable';
import ViewAssetDetailsModal from '@/modules/finance/components/assets/assetCapitalization/ViewAssetDetailsModal';
import CapitalizeAssetModal from '@/modules/finance/components/assets/assetCapitalization/CapitalizeAssetModal';
import type { AssetPendingCapitalization, CapitalizeAssetDTO, CapitalizedAsset } from '@/modules/finance/components/assets/assetCapitalization/types';

const AssetCapitalizationSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<AssetPendingCapitalization[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetPendingCapitalization | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCapitalizeModalOpen, setIsCapitalizeModalOpen] = useState(false);

  // Mock data for demonstration
  const mockAssets: AssetPendingCapitalization[] = [
    {
      id: '1',
      asset_reference_id: 'AST-2024-001',
      asset_name: 'Dell Laptop OptiPlex 7090',
      vendor_name: 'Dell Technologies',
      invoice_number: 'INV-DEL-2024-001',
      purchase_cost: 85000,
      purchase_date: '2024-01-15',
      status: 'PENDING_CAPITALIZATION',
      description: 'High-performance laptop for development team',
      created_at: '2024-01-16T08:30:00Z',
    },
    {
      id: '2',
      asset_reference_id: 'AST-2024-002',
      asset_name: 'Office Desk - Executive',
      vendor_name: 'Office Furniture Ltd',
      invoice_number: 'INV-OFF-2024-002',
      purchase_cost: 25000,
      purchase_date: '2024-01-20',
      status: 'PENDING_CAPITALIZATION',
      description: 'Executive office desk with drawers',
      created_at: '2024-01-21T10:15:00Z',
    },
    {
      id: '3',
      asset_reference_id: 'AST-2024-003',
      asset_name: 'Toyota Hilux 2024',
      vendor_name: 'Toyota Ethiopia',
      invoice_number: 'INV-TOY-2024-003',
      purchase_cost: 1250000,
      purchase_date: '2024-02-01',
      status: 'PENDING_CAPITALIZATION',
      description: 'Company vehicle for field operations',
      created_at: '2024-02-02T14:20:00Z',
    },
    {
      id: '4',
      asset_reference_id: 'AST-2024-004',
      asset_name: 'HP Printer LaserJet Pro',
      vendor_name: 'HP Inc.',
      invoice_number: 'INV-HP-2024-004',
      purchase_cost: 45000,
      purchase_date: '2024-02-10',
      status: 'PENDING_CAPITALIZATION',
      description: 'Multi-function laser printer for office use',
      created_at: '2024-02-11T09:45:00Z',
    },
    {
      id: '5',
      asset_reference_id: 'AST-2024-005',
      asset_name: 'Conference Room Projector',
      vendor_name: 'Epson Ethiopia',
      invoice_number: 'INV-EPS-2024-005',
      purchase_cost: 75000,
      purchase_date: '2024-02-15',
      status: 'PENDING_CAPITALIZATION',
      description: 'High-resolution projector for presentations',
      created_at: '2024-02-16T11:30:00Z',
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
        showToast.error('Error loading assets', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Filter assets based on search term
  const filteredAssets = assets.filter(asset =>
    asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  const handleViewAsset = (asset: AssetPendingCapitalization) => {
    setSelectedAsset(asset);
    setIsViewModalOpen(true);
  };

  const handleCapitalizeAsset = (asset: AssetPendingCapitalization) => {
    setSelectedAsset(asset);
    setIsCapitalizeModalOpen(true);
  };

  const handleCapitalizationSubmit = async (data: CapitalizeAssetDTO) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove the asset from pending list
      setAssets(prev => prev.filter(asset => asset.asset_reference_id !== data.asset_reference_id));
      
      showToast.success('Asset capitalized successfully and moved to Asset Register', 'success');
      
      // Generate asset tag for the capitalized asset
      const assetTag = `FA-${Date.now().toString().slice(-4)}`;
      
      // Create the capitalized asset object that would be sent to Asset Register
      const capitalizedAsset = {
        id: Date.now().toString(),
        asset_tag: assetTag,
        asset_name: selectedAsset?.asset_name || '',
        asset_category: data.asset_category_name || '',
        department: 'Not Assigned',
        location: 'Not Assigned',
        vendor_name: selectedAsset?.vendor_name || '',
        purchase_date: selectedAsset?.purchase_date || '',
        capitalization_date: data.capitalization_date,
        purchase_cost: selectedAsset?.purchase_cost || 0,
        residual_value: data.residual_value,
        useful_life_years: data.useful_life_years,
        depreciation_method: data.depreciation_method,
        accumulated_depreciation: 0,
        net_book_value: selectedAsset?.purchase_cost || 0,
        status: 'ACTIVE' as const,
        created_at: new Date().toISOString(),
        created_by: 'Current User',
      };
      
      console.log('Asset moved to Asset Register:', capitalizedAsset);
      
      // In a real application, this would make an API call to add the asset to the register
      // and create the necessary journal entries for capitalization
      
    } catch (error) {
      console.error('Error capitalizing asset:', error);
      showToast.error('Error capitalizing asset', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <AssetCapitalizationHeader />
      
      <AssetCapitalizationSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <AssetCapitalizationTable
        assets={paginatedAssets}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onViewAsset={handleViewAsset}
        onCapitalizeAsset={handleCapitalizeAsset}
      />

      <ViewAssetDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        asset={selectedAsset}
        onCapitalize={handleCapitalizeAsset}
      />

      <CapitalizeAssetModal
        isOpen={isCapitalizeModalOpen}
        onClose={() => setIsCapitalizeModalOpen(false)}
        asset={selectedAsset}
        onSubmit={handleCapitalizationSubmit}
      />
    </motion.div>
  );
};

export default AssetCapitalizationSection; 