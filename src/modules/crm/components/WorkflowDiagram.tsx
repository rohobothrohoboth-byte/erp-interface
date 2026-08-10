// src/components/crm/WorkflowDiagram.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Users, User, CheckCircle, Clock, AlertCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { useCrmData } from '@/modules/crm/hooks/useCrmData';

// Type Definitions
export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  role: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  duration?: number; // in days
  order: number;
  assignedToUserId?: string;
  dueDate?: string;
  completedAt?: string;
}

export interface WorkflowData {
  id: string;
  title: string;
  description?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'draft';
}

interface WorkflowDiagramProps {
  data?: WorkflowData;
  onStepClick?: (step: WorkflowStep) => void;
  onAddStep?: () => void;
  onEditStep?: (step: WorkflowStep) => void;
  onDeleteStep?: (stepId: string) => void;
  height?: number;
  editable?: boolean;
  loading?: boolean;
}

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
                                                           data,
                                                           onStepClick,
                                                           onAddStep,
                                                           onEditStep,
                                                           onDeleteStep,
                                                           height = 600,
                                                           editable = false,
                                                           loading = false,
                                                         }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Use real data from CRM if available
  const { opportunities, tasks, loading: crmLoading } = useCrmData();

  // Transform real data into workflow format if no data prop provided
  const getDefaultData = useCallback((): WorkflowData => {
    // Try to use real opportunities as workflow steps
    const realSteps = opportunities?.slice(0, 6).map((opp: any, index: number) => ({
      id: opp.id || `step-${index + 1}`,
      title: opp.name || `Opportunity ${index + 1}`,
      description: opp.description || '',
      assignee: opp.assignedToUserName || 'Unassigned',
      role: opp.stage || 'Discovery',
      status: (opp.stage === 'ClosedWon' ? 'completed' :
          opp.stage === 'ClosedLost' ? 'blocked' :
              opp.stage === 'Negotiation' ? 'in-progress' : 'pending') as WorkflowStep['status'],
      duration: Math.floor(Math.random() * 5) + 1,
      order: index + 1,
      assignedToUserId: opp.assignedToUserId,
      dueDate: opp.expectedCloseDate,
    })) || [];

    // If we have real steps, use them
    if (realSteps.length > 0) {
      return {
        id: 'crm-workflow',
        title: 'Sales Pipeline Workflow',
        description: 'Current sales opportunities pipeline',
        steps: realSteps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };
    }

    // Fallback to default mock data
    return {
      id: 'workflow-1',
      title: 'Customer Onboarding Workflow',
      steps: [
        {
          id: 'step-1',
          title: 'Initial Contact',
          description: 'Make first contact with the customer',
          assignee: 'Sarah Johnson',
          role: 'Sales Rep',
          status: 'completed',
          duration: 1,
          order: 1,
        },
        {
          id: 'step-2',
          title: 'Needs Assessment',
          description: 'Evaluate customer requirements',
          assignee: 'Michael Chen',
          role: 'Solution Architect',
          status: 'in-progress',
          duration: 2,
          order: 2,
        },
        {
          id: 'step-3',
          title: 'Proposal Creation',
          description: 'Create detailed proposal document',
          assignee: 'Robert Kim',
          role: 'Sales Manager',
          status: 'pending',
          duration: 3,
          order: 3,
        },
        {
          id: 'step-4',
          title: 'Contract Review',
          description: 'Legal review of contract terms',
          assignee: 'Lisa Wong',
          role: 'Legal Counsel',
          status: 'pending',
          duration: 2,
          order: 4,
        },
        {
          id: 'step-5',
          title: 'Final Approval',
          description: 'Executive sign-off',
          assignee: 'David Miller',
          role: 'VP of Sales',
          status: 'pending',
          duration: 1,
          order: 5,
        },
        {
          id: 'step-6',
          title: 'Onboarding Kickoff',
          description: 'Begin customer onboarding process',
          assignee: 'Emma Wilson',
          role: 'Customer Success',
          status: 'pending',
          duration: 5,
          order: 6,
        },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-20',
      status: 'active',
    };
  }, [opportunities]);

  const workflowData = data || getDefaultData();

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setDimensions({
          width: Math.min(containerWidth, 1200),
          height,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  // Handle zoom and pan
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(2, transform.scale * delta));

    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const x = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
      const y = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

      setTransform({ x, y, scale: newScale });
    }
  }, [transform]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) {
      setIsDragging(true);
      setDragStart({ x: event.clientX - transform.x, y: event.clientY - transform.y });
    }
  }, [transform]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      const x = event.clientX - dragStart.x;
      const y = event.clientY - dragStart.y;
      setTransform(prev => ({ ...prev, x, y }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .attr('viewBox', [0, 0, dimensions.width, dimensions.height]);

    const g = svg.append('g')
        .attr('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`);

    // Add background grid
    const gridSize = 50;
    for (let x = 0; x < dimensions.width; x += gridSize) {
      g.append('line')
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', dimensions.height)
          .attr('stroke', '#f1f5f9')
          .attr('stroke-width', 1);
    }
    for (let y = 0; y < dimensions.height; y += gridSize) {
      g.append('line')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', dimensions.width)
          .attr('y2', y)
          .attr('stroke', '#f1f5f9')
          .attr('stroke-width', 1);
    }

    // Calculate positions
    const stepCount = workflowData.steps.length;
    const nodeWidth = 220;
    const nodeHeight = 100;
    const horizontalSpacing = 300;
    const verticalSpacing = 160;

    const stepsPerColumn = 2;
    const columns = Math.ceil(stepCount / stepsPerColumn);

    const nodes = workflowData.steps.map((step, index) => {
      const column = Math.floor(index / stepsPerColumn);
      const row = index % stepsPerColumn;

      return {
        ...step,
        x: 150 + column * horizontalSpacing,
        y: 100 + row * verticalSpacing,
        width: nodeWidth,
        height: nodeHeight,
      };
    });

    // Draw connections
    nodes.forEach((node, index) => {
      if (index < nodes.length - 1) {
        const nextNode = nodes[index + 1];

        const sourceX = node.x + node.width;
        const sourceY = node.y + node.height / 2;
        const targetX = nextNode.x;
        const targetY = nextNode.y + nextNode.height / 2;

        const controlPoint1X = sourceX + 50;
        const controlPoint1Y = sourceY;
        const controlPoint2X = targetX - 50;
        const controlPoint2Y = targetY;

        const path = `M ${sourceX} ${sourceY} 
                             C ${controlPoint1X} ${controlPoint1Y}, 
                               ${controlPoint2X} ${controlPoint2Y}, 
                               ${targetX} ${targetY}`;

        g.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', node.status === 'completed' ? 'none' : '5,5')
            .attr('opacity', 0.7);

        g.append('circle')
            .attr('cx', targetX - 10)
            .attr('cy', targetY)
            .attr('r', 6)
            .attr('fill', '#94a3b8');
      }
    });

    // Draw nodes
    const nodeGroups = g.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedStep(d.id);
          onStepClick?.(d);
        });

    // Node background
    nodeGroups.append('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 12)
        .attr('fill', d => {
          switch (d.status) {
            case 'completed': return '#dcfce7';
            case 'in-progress': return '#fef9c3';
            case 'blocked': return '#fee2e2';
            default: return '#f3f4f6';
          }
        })
        .attr('stroke', d => {
          switch (d.status) {
            case 'completed': return '#22c55e';
            case 'in-progress': return '#eab308';
            case 'blocked': return '#ef4444';
            default: return '#d1d5db';
          }
        })
        .attr('stroke-width', 2)
        .attr('filter', d => selectedStep === d.id ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))')
        .attr('transform', d => selectedStep === d.id ? 'translate(0, -2)' : 'translate(0, 0)')
        .transition()
        .duration(200);

    // Step number circle
    nodeGroups.append('circle')
        .attr('cx', 25)
        .attr('cy', 25)
        .attr('r', 20)
        .attr('fill', d => {
          switch (d.status) {
            case 'completed': return '#22c55e';
            case 'in-progress': return '#eab308';
            case 'blocked': return '#ef4444';
            default: return '#6b7280';
          }
        });

    nodeGroups.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(d => d.order);

    // Step title
    nodeGroups.append('text')
        .attr('x', 60)
        .attr('y', 25)
        .attr('text-anchor', 'start')
        .attr('fill', '#1f2937')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(d => d.title)
        .call(wrapText, nodeWidth - 70, 20);

    // Assignee
    nodeGroups.append('text')
        .attr('x', 60)
        .attr('y', 50)
        .attr('text-anchor', 'start')
        .attr('fill', '#4b5563')
        .attr('font-size', '12px')
        .text(d => d.assignee);

    // Role
    nodeGroups.append('text')
        .attr('x', 60)
        .attr('y', 70)
        .attr('text-anchor', 'start')
        .attr('fill', d => {
          const roleColors: Record<string, string> = {
            'Sales Rep': '#3b82f6',
            'Sales Manager': '#8b5cf6',
            'Solution Architect': '#10b981',
            'Legal Counsel': '#ef4444',
            'VP of Sales': '#f59e0b',
            'Customer Success': '#ec4899',
            'Discovery': '#3b82f6',
            'Qualification': '#8b5cf6',
            'Proposal': '#10b981',
            'Negotiation': '#f59e0b',
            'ClosedWon': '#22c55e',
            'ClosedLost': '#ef4444',
          };
          return roleColors[d.role] || '#6b7280';
        })
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(d => d.role);

    // Status indicator
    nodeGroups.append('circle')
        .attr('cx', nodeWidth - 20)
        .attr('cy', 25)
        .attr('r', 6)
        .attr('fill', d => {
          switch (d.status) {
            case 'completed': return '#22c55e';
            case 'in-progress': return '#eab308';
            case 'blocked': return '#ef4444';
            default: return '#6b7280';
          }
        });

    // Duration
    if (workflowData.steps.some(step => step.duration)) {
      nodeGroups.append('text')
          .attr('x', nodeWidth - 15)
          .attr('y', 70)
          .attr('text-anchor', 'end')
          .attr('fill', '#6b7280')
          .attr('font-size', '11px')
          .text(d => d.duration ? `${d.duration}d` : '');
    }

    // Helper function for text wrapping
    function wrapText(text: any, width: number, yOffset: number) {
      text.each(function(this: any) {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy') || 0);
        let tspan = text.text(null).append('tspan')
            .attr('x', text.attr('x'))
            .attr('y', y)
            .attr('dy', dy + 'em');

        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node()!.getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text.append('tspan')
                .attr('x', text.attr('x'))
                .attr('y', y)
                .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                .text(word);
          }
        }
      });
    }

  }, [workflowData, dimensions, selectedStep, transform, onStepClick]);

  // Status helpers
  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in-progress': return 'text-yellow-700 bg-yellow-100';
      case 'blocked': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'blocked': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading || crmLoading) {
    return (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-gray-600">Loading workflow data...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{workflowData.title}</h2>
            {workflowData.description && (
                <p className="text-gray-600 mt-1">{workflowData.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            workflowData.status === 'active' ? 'bg-green-100 text-green-800' :
                                workflowData.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                    'bg-yellow-100 text-yellow-800'
                        }`}>
                            {workflowData.status.charAt(0).toUpperCase() + workflowData.status.slice(1)}
                        </span>
              <span className="text-xs text-gray-500">
                            Updated: {new Date(workflowData.updatedAt).toLocaleDateString()}
                        </span>
            </div>
          </div>
          {editable && onAddStep && (
              <Button onClick={onAddStep} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{workflowData.steps.length}</div>
            <div className="text-sm text-gray-600">Total Steps</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {workflowData.steps.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {workflowData.steps.filter(s => s.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(workflowData.steps.map(s => s.assignee)).size}
            </div>
            <div className="text-sm text-gray-600">Assignees</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Controls:</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Scroll to zoom • Drag to pan</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            >
              Reset View
            </Button>
            <div className="text-sm text-gray-600">
              Scale: {transform.scale.toFixed(1)}x
            </div>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div
            ref={containerRef}
            className="relative border rounded-xl bg-white overflow-hidden"
            style={{ height: `${height}px` }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
          <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 border shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-2">Status Legend</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Step Details */}
        <AnimatePresence>
          {selectedStep && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Step Details
                  </h3>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStep(null)}
                  >
                    Close
                  </Button>
                </div>

                {(() => {
                  const step = workflowData.steps.find(s => s.id === selectedStep);
                  if (!step) return null;

                  return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step.status === 'completed' ? 'bg-green-100' :
                                    step.status === 'in-progress' ? 'bg-yellow-100' :
                                        step.status === 'blocked' ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              <span className="font-bold text-gray-900">{step.order}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{step.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(step.status)}`}>
                                                        {getStatusIcon(step.status)}
                                                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                                    </span>
                                {step.duration && (
                                    <span className="text-sm text-gray-600">
                                                            Duration: {step.duration} day{step.duration !== 1 ? 's' : ''}
                                                        </span>
                                )}
                                {step.dueDate && (
                                    <span className="text-sm text-gray-600">
                                                            Due: {new Date(step.dueDate).toLocaleDateString()}
                                                        </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {editable && (
                              <div className="flex gap-2">
                                {onEditStep && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEditStep(step)}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </Button>
                                )}
                                {onDeleteStep && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => onDeleteStep(step.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </Button>
                                )}
                              </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Assignee</div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{step.assignee}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Role</div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{step.role}</span>
                            </div>
                          </div>
                        </div>

                        {step.description && (
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
                              <p className="text-gray-700">{step.description}</p>
                            </div>
                        )}
                      </div>
                  );
                })()}
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default WorkflowDiagram;