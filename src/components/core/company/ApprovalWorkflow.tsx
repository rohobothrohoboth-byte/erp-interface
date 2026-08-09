import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

// Type Definitions
interface ApprovalStep {
  order: number;
  title: string;
  person: string;
  role: 'Manager' | 'HR' | string;
}

interface ApprovalWorkflowData {
  effectiveDate: string;
  expiryDate: string;
  steps: ApprovalStep[];
}

interface Dimensions {
  width: number;
  height: number;
}

interface TreeNodeData {
  name: string;
  person?: string;
  role?: string;
  step?: number;
  type?: string;
  children?: TreeNodeData[];
}

interface Props {
  data: ApprovalWorkflowData;
  width?: number;
  height?: number;
}

const ApprovalWorkflowHierarchy: React.FC<Props> = ({
                                                      data,
                                                      width = 900,
                                                      height = 400
                                                    }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width, height });

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setDimensions({
          width: Math.min(containerWidth, width),
          height: Math.max(300, containerWidth * 0.4)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  useEffect(() => {
    if (!data || !svgRef.current || !data.steps.length) return;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up SVG
    const svg = d3.select(svgRef.current)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .attr('viewBox', [0, 0, dimensions.width, dimensions.height] as [number, number, number, number])
        .attr('class', 'max-w-full h-auto');

    // Create a hierarchy from the data
    const hierarchyData: TreeNodeData = {
      name: 'Approval Workflow',
      children: data.steps.map(step => ({
        name: step.title,
        person: step.person,
        role: step.role,
        step: step.order,
        type: 'step'
      }))
    };

    // Create root for hierarchy
    const root = d3.hierarchy<TreeNodeData>(hierarchyData);

    // Use tree layout for horizontal distribution
    const treeLayout = d3.tree<TreeNodeData>()
        .size([dimensions.height - 100, dimensions.width - 140])
        .separation(() => 1.5);

    treeLayout(root);

    // Calculate center offset for better centering
    const nodes = root.descendants();
    const minX = d3.min(nodes, d => d.x) || 0;
    const maxX = d3.max(nodes, d => d.x) || 0;
    const xOffset = (dimensions.height - (maxX - minX)) / 2 - minX;

    // Draw links between nodes
    const links = root.links();

    svg.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('d', d => {
          const sourceX = d.source.y;
          const sourceY = d.source.x + xOffset;
          const targetX = d.target.y;
          const targetY = d.target.x + xOffset;

          // Simple line for cleaner look
          return `M ${sourceX} ${sourceY} C ${(sourceX + targetX) / 2} ${sourceY}, ${(sourceX + targetX) / 2} ${targetY}, ${targetX} ${targetY}`;
        })
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);

    // Create node groups
    const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('transform', d => `translate(${d.y}, ${d.x + xOffset})`);

    // Draw root node
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth === 0)
        .append('rect')
        .attr('x', -80)
        .attr('y', -24)
        .attr('width', 160)
        .attr('height', 48)
        .attr('rx', 6)
        .attr('fill', '#475569')
        .attr('stroke', '#334155')
        .attr('stroke-width', 1)
        .attr('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))');

    // Draw step nodes
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('rect')
        .attr('x', -100)
        .attr('y', -40)
        .attr('width', 200)
        .attr('height', 80)
        .attr('rx', 8)
        .attr('fill', '#ffffff')
        .attr('stroke', (d: d3.HierarchyPointNode<TreeNodeData>) => {
          if (d.data.role === 'HR') return '#f43f5e';
          if (d.data.role === 'Manager') return '#3b82f6';
          return '#64748b';
        })
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))');

    // Add step numbers
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('circle')
        .attr('cx', -80)
        .attr('cy', -24)
        .attr('r', 16)
        .attr('fill', (d: d3.HierarchyPointNode<TreeNodeData>) => {
          if (d.data.role === 'HR') return '#f43f5e';
          if (d.data.role === 'Manager') return '#3b82f6';
          return '#64748b';
        });

    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('text')
        .attr('x', -80)
        .attr('y', -24)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-weight', '600')
        .attr('font-size', '12px')
        .text((d: d3.HierarchyPointNode<TreeNodeData>) => d.data.step?.toString() || '');

    // Root node text
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth === 0)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-weight', '600')
        .attr('font-size', '14px')
        .text('Approval Workflow');

    // Step node title
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('text')
        .attr('x', -55)
        .attr('y', -24)
        .attr('text-anchor', 'start')
        .attr('dy', '0.35em')
        .attr('fill', '#1e293b')
        .attr('font-weight', '600')
        .attr('font-size', '13px')
        .text((d: d3.HierarchyPointNode<TreeNodeData>) => d.data.name);

    // Person name
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('text')
        .attr('x', 10)
        .attr('y', 8)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#475569')
        .attr('font-size', '11px')
        .text((d: d3.HierarchyPointNode<TreeNodeData>) => d.data.person || '');

    // Role badge
    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('rect')
        .attr('x', -30)
        .attr('y', 20)
        .attr('width', 60)
        .attr('height', 18)
        .attr('rx', 9)
        .attr('fill', (d: d3.HierarchyPointNode<TreeNodeData>) => {
          if (d.data.role === 'HR') return '#fef2f2';
          if (d.data.role === 'Manager') return '#eff6ff';
          return '#f1f5f9';
        })
        .attr('stroke', (d: d3.HierarchyPointNode<TreeNodeData>) => {
          if (d.data.role === 'HR') return '#fecaca';
          if (d.data.role === 'Manager') return '#bfdbfe';
          return '#e2e8f0';
        })
        .attr('stroke-width', 1);

    nodeGroups.filter((d: d3.HierarchyPointNode<TreeNodeData>) => d.depth > 0)
        .append('text')
        .attr('x', 0)
        .attr('y', 29)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', (d: d3.HierarchyPointNode<TreeNodeData>) => {
          if (d.data.role === 'HR') return '#dc2626';
          if (d.data.role === 'Manager') return '#2563eb';
          return '#475569';
        })
        .attr('font-weight', '500')
        .attr('font-size', '10px')
        .text((d: d3.HierarchyPointNode<TreeNodeData>) => d.data.role || '');

  }, [data, dimensions]);

  if (!data.steps.length) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No workflow data</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approval steps will appear here</p>
        </div>
    );
  }

  return (
      <div
          ref={containerRef}
          className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4"
      >
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Approval Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hierarchical approval process
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Effective: {data.effectiveDate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expires: {data.expiryDate}
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="w-full overflow-x-auto">
          <svg
              ref={svgRef}
              className="w-full h-auto"
              style={{ minHeight: '300px' }}
          ></svg>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-500 dark:text-slate-400">Manager Approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-slate-500 dark:text-slate-400">HR Approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="text-slate-500 dark:text-slate-400">Other Approver</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-slate-300"></div>
              <span className="text-slate-500 dark:text-slate-400">Approval Flow</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ApprovalWorkflowHierarchy;