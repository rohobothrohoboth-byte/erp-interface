import { useState, useEffect, useRef } from 'react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Plus, Trash2, Eye, Building2, X } from 'lucide-react';
import * as d3 from 'd3';

interface Company {
  id: number;
  name: string;
  nameAm: string;
  parentId?: number;
}

interface TreeNode {
  id: number;
  name: string;
  nameAm: string;
  children?: TreeNode[];
  parentId?: number;
}

const AddHierarchy = () => {
  const allCompanies: Company[] = [
    { id: 1, name: 'Rohobot Tech', nameAm: 'ሮሆቦት ቴክ', parentId: 0 },
    { id: 2, name: 'EthioDev', nameAm: 'ኢትዮዴቭ', parentId: 0 },
    { id: 3, name: 'Rohobot Group', nameAm: 'ሮሆቦት ግሩፕ', parentId: 1 },
    { id: 4, name: 'Tech Solutions', nameAm: 'ቴክ ሶልዩሽንስ', parentId: 1 },
    { id: 5, name: 'Innovate Ethiopia', nameAm: 'ኢንኖቬት ኢትዮጵያ', parentId: 2 },
  ];

  const [childCompanies, setChildCompanies] = useState<Company[]>(allCompanies.filter(c => c.parentId === 0));
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showVisualization, setShowVisualization] = useState<boolean>(false);
  const [hierarchyData, setHierarchyData] = useState<TreeNode | null>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showVisualization) {
      buildHierarchy();
    }
  }, [showVisualization, childCompanies]);

  useEffect(() => {
    if (showVisualization && hierarchyData && visualizationRef.current) {
      drawVisualization();
    }
  }, [hierarchyData, showVisualization]);

  const buildHierarchy = () => {
    const companyMap = new Map<number, TreeNode>();

    const root: TreeNode = { id: 0, name: 'BDA', nameAm: 'ቢዲኤ' };
    companyMap.set(0, root);

    childCompanies.forEach(company => {
      companyMap.set(company.id, {
        id: company.id,
        name: company.name,
        nameAm: company.nameAm,
        parentId: company.parentId
      });
    });

    companyMap.forEach(company => {
      if (company.id === 0) return;

      const parentId = company.parentId !== undefined ? company.parentId : 0;
      const parent = companyMap.get(parentId);

      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(company);
      }
    });

    companyMap.forEach(company => {
      if (company.children && company.children.length === 0) {
        delete company.children;
      }
    });

    setHierarchyData(root);
  };

  const drawVisualization = () => {
    if (!hierarchyData || !visualizationRef.current) return;

    d3.select(visualizationRef.current).selectAll('*').remove();

    const width = visualizationRef.current.clientWidth || 800;
    const height = 400;

    const svg = d3.select(visualizationRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(40, 20)`);

    const treeLayout = d3.tree<TreeNode>()
        .size([width - 100, height - 60]);

    const root = d3.hierarchy(hierarchyData, d => d.children);
    treeLayout(root);

    // Draw links
    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
            .x((d: any) => d.x)
            .y((d: any) => d.y))
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2);

    // Draw nodes
    const nodes = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodes.append('circle')
        .attr('r', 8)
        .attr('fill', '#64748b')
        .attr('stroke', '#475569')
        .attr('stroke-width', 1);

    nodes.append('text')
        .attr('dy', '0.31em')
        .attr('x', (d: any) => d.children ? -12 : 12)
        .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
        .attr('font-size', '11px')
        .attr('fill', '#334155')
        .text((d: any) => d.data.name);
  };

  const handleAddHierarchy = () => {
    const company = allCompanies.find((c) => c.id.toString() === selectedCompanyId);
    if (!company) return;

    const parentId = selectedParentId === "0" ? 0 : parseInt(selectedParentId);
    const companyExists = childCompanies.some(c => c.id === company.id);

    if (companyExists) {
      setChildCompanies(prev =>
          prev.map(c => c.id === company.id ? {...c, parentId} : c)
      );
    } else {
      const updatedCompany = { ...company, parentId };
      setChildCompanies((prev) => [...prev, updatedCompany]);
    }

    setSelectedCompanyId('');
    setSelectedParentId('');
    setOpenDialog(false);
  };

  const handleRemoveCompany = (id: number) => {
    setChildCompanies(prev => prev.filter(company => company.id !== id));
  };

  const getParentName = (parentId: number) => {
    if (parentId === 0) return 'BDA';
    const parent = allCompanies.find(c => c.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const getParentNameAm = (parentId: number) => {
    if (parentId === 0) return 'ቢዲኤ';
    const parent = allCompanies.find(c => c.id === parentId);
    return parent ? parent.nameAm : 'Unknown';
  };

  const toggleVisualization = () => {
    setShowVisualization(!showVisualization);
  };

  return (
      <div className="space-y-5">
        <style>{`
        .node circle {
          fill: #64748b;
          stroke: #475569;
          stroke-width: 1px;
        }
        .node text {
          font: 11px sans-serif;
          fill: #334155;
        }
        .link {
          fill: none;
          stroke: #94a3b8;
          stroke-width: 2px;
        }
      `}</style>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Organization Structure
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage company hierarchy and relationships
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
                onClick={toggleVisualization}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
            >
              <Eye size={16} />
              {showVisualization ? 'Hide Chart' : 'Show Chart'}
            </Button>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Hierarchy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Hierarchy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Company</Label>
                    <Select
                        value={selectedCompanyId}
                        onValueChange={setSelectedCompanyId}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allCompanies.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nameAm} ({c.name})
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Parent Company</Label>
                    <Select
                        value={selectedParentId}
                        onValueChange={setSelectedParentId}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose parent company..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">BDA (ቢዲኤ)</SelectItem>
                        {allCompanies.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nameAm} ({c.name})
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpenDialog(false)}
                        className="h-8"
                    >
                      Cancel
                    </Button>
                    <Button
                        onClick={handleAddHierarchy}
                        className="h-8"
                        disabled={!selectedCompanyId}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Visualization */}
        {showVisualization && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 overflow-x-auto">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Organization Chart
              </h3>
              <div ref={visualizationRef} style={{ width: '100%', minHeight: '300px' }} />
            </div>
        )}

        {/* Companies Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Company (Amharic)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Company (English)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Parent Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {childCompanies.map((company, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                      {company.nameAm}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {company.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {getParentNameAm(company.parentId || 0)} ({getParentName(company.parentId || 0)})
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCompany(company.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>

            {childCompanies.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No companies added yet. Click "Add Hierarchy" to get started.
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AddHierarchy;