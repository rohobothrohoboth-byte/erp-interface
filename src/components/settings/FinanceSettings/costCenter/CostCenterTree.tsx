import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { PenBox, Trash2, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { CostCenter } from './CostCenterSection';

interface CostCenterTreeProps {
  costCenters: CostCenter[];
  onAddChild: (costCenter: CostCenter) => void;
  onEdit: (costCenter: CostCenter) => void;
  onDelete: (costCenter: CostCenter) => void;
  height?: number;
}

const NODE_W = 220;
const NODE_H = 100;

export default function CostCenterTree({
  costCenters,
  onAddChild,
  onEdit,
  onDelete,
  height = 400,
}: CostCenterTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ width: 900, height });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const [menu, setMenu] = useState<{ x: number; y: number; node: CostCenter } | null>(null);

  // ---------- RESIZE ----------
  useEffect(() => {
    const r = () => {
      if (!containerRef.current) return;
      setSize({ width: containerRef.current.clientWidth, height });
    };
    r();
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, [height]);

  // ---------- CENTER TREE ON FIRST LOAD ----------
  useEffect(() => {
    if (!costCenters.length) return;
    setTransform({
      x: size.width / 2,
      y: 80,
      scale: 1,
    });
  }, [costCenters, size.width]);

  // ---------- CLOSE MENU ON CLICK OUTSIDE ----------
  useEffect(() => {
    const handleClickOutside = () => setMenu(null);
    if (menu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menu]);

  // ---------- ZOOM ----------
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const k = e.deltaY > 0 ? 0.9 : 1.1;
      const ns = Math.max(0.4, Math.min(2.2, transform.scale * k));
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const x = mx - (mx - transform.x) * (ns / transform.scale);
      const y = my - (my - transform.y) * (ns / transform.scale);
      setTransform({ x, y, scale: ns });
    },
    [transform]
  );

  // ---------- PAN ----------
  const down = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDrag(true);
    setStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const move = (e: React.MouseEvent) => {
    if (!drag) return;
    setTransform((t) => ({ ...t, x: e.clientX - start.x, y: e.clientY - start.y }));
  };
  const up = () => setDrag(false);

  // ---------- DRAW ----------
  useEffect(() => {
    if (!svgRef.current || !costCenters.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", size.width).attr("height", size.height);

    // Simple grid
    const bg = svg.append("g");
    const grid = 40;
    for (let x = 0; x < size.width * 3; x += grid) {
      bg.append("line")
        .attr("x1", x - size.width)
        .attr("y1", -size.height)
        .attr("x2", x - size.width)
        .attr("y2", size.height * 2)
        .attr("stroke", "#f8fafc")
        .attr("stroke-width", 0.5);
    }
    for (let y = 0; y < size.height * 3; y += grid) {
      bg.append("line")
        .attr("x1", -size.width)
        .attr("y1", y - size.height)
        .attr("x2", size.width * 2)
        .attr("y2", y - size.height)
        .attr("stroke", "#f8fafc")
        .attr("stroke-width", 0.5);
    }

    const g = svg
      .append("g")
      .attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.scale})`);

    // Create hierarchy - handle root node properly
    const root = d3.hierarchy(
      costCenters.length === 1 ? costCenters[0] : ({ id: "root", children: costCenters } as any),
      (d: any) => d.children
    );

    const tree = d3.tree<CostCenter>().nodeSize([240, 150]);
    tree(root);

    // Draw connections
    g.selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#e0e7ff")
      .attr("stroke-width", 1.5)
      .attr("d", (d) => {
        const sx = d.source.x!;
        const sy = d.source.y! + NODE_H;
        const tx = d.target.x!;
        const ty = d.target.y!;
        return `M${sx},${sy} C${sx},${sy + 40} ${tx},${ty - 40} ${tx},${ty}`;
      });

    // Nodes
    const node = g
      .selectAll(".n")
      .data(root.descendants().filter((d) => d.data.id !== "root"))
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x! - NODE_W / 2},${d.y!})`);

    // Card background - subtle difference for parents (isGroup)
    node.append("rect")
      .attr("width", NODE_W)
      .attr("height", NODE_H)
      .attr("rx", 10)
      .attr("fill", (d) => d.data.isGroup ? "#faf5ff" : "#ffffff")
      .attr("stroke", (d) => d.data.isGroup ? "#c4b5fd" : "#e2e8f0")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer");

    // Code
    node.append("text")
      .attr("x", 16)
      .attr("y", 28)
      .attr("font-weight", "600")
      .attr("font-size", "13px")
      .attr("fill", "#2e1065")
      .style("pointer-events", "none")
      .text((d) => d.data.costCenterCode);

    // Name
    node.append("text")
      .attr("x", 16)
      .attr("y", 48)
      .attr("font-size", "13px")
      .attr("fill", "#1e293b")
      .style("pointer-events", "none")
      .text((d) => {
        const name = d.data.name;
        return name.length > 25 ? name.substring(0, 25) + "..." : name;
      });

    // Type indicator
    node.append("text")
      .attr("x", 16)
      .attr("y", 68)
      .attr("font-size", "11px")
      .attr("fill", "#8b5cf6")
      .style("pointer-events", "none")
      .text((d) => {
        if (d.data.isGroup) return "Group";
        return "Cost Center";
      });

    // Description (if exists)
    node.filter(d => d.data.description)
      .append("text")
      .attr("x", 16)
      .attr("y", 84)
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .style("pointer-events", "none")
      .text((d) => {
        const desc = d.data.description || "";
        return desc.length > 25 ? desc.substring(0, 25) + "..." : desc;
      });

    // Status dot
    node.append("circle")
      .attr("cx", NODE_W - 20)
      .attr("cy", 22)
      .attr("r", 5)
      .attr("fill", (d) => (d.data.status === 'Active' ? "#22c55e" : "#ef4444"));

    // Action button group - with larger hit area
    const actionButton = node.append("g")
      .attr("class", "action-button")
      .attr("transform", `translate(${NODE_W - 35}, ${NODE_H - 30})`)
      .style("cursor", "pointer")
      .style("opacity", "0")
      .on("click", function(e, d) {
        e.stopPropagation();
        e.preventDefault();
        
        const buttonElement = this as SVGGElement;
        const buttonRect = buttonElement.getBoundingClientRect();
        
        setMenu({
          x: buttonRect.right + 5,
          y: buttonRect.top,
          node: d.data,
        });
      });

    // Larger invisible hit area for easier clicking
    actionButton.append("rect")
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 32)
      .attr("height", 32)
      .attr("fill", "transparent")
      .attr("rx", 4);

    // Button background - light purple
    actionButton.append("circle")
      .attr("cx", 8)
      .attr("cy", 8)
      .attr("r", 12)
      .attr("fill", "#ffffff")
      .attr("stroke", "#c4b5fd")
      .attr("stroke-width", 1);

    // Three dots
    [4, 8, 12].forEach(cy => {
      actionButton.append("circle")
        .attr("cx", 8)
        .attr("cy", cy)
        .attr("r", 1.5)
        .attr("fill", "#8b5cf6");
    });

    // Show on hover
    node.on("mouseenter", function() {
      d3.select(this).select(".action-button").style("opacity", "1");
    }).on("mouseleave", function() {
      d3.select(this).select(".action-button").style("opacity", "0");
    });

  }, [costCenters, size, transform]);

  // Early return after all hooks
  if (costCenters.length === 0) return null;

  return (
    <div className="flex flex-col space-y-4">
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
            onClick={() => setTransform({ x: size.width / 2, y: 80, scale: 1 })}
          >
            Reset View
          </Button>
          <div className="text-sm text-gray-600">
            Scale: {transform.scale.toFixed(1)}x
          </div>
        </div>
      </div>

      {/* Tree container */}
      <div ref={containerRef} className="relative border border-gray-200 rounded-lg bg-white" style={{ height }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: drag ? "grabbing" : "grab" }}
          onWheel={onWheel}
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
        />
      </div>

      {/* Simple popover */}
      {menu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-[#e0e7ff] py-1 min-w-[140px]"
          style={{
            left: `${menu.x}px`,
            top: `${menu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onAddChild(menu.node);
              setMenu(null);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#faf5ff] w-full text-left transition-colors"
          >
            <Plus size={14} className="text-[#8b5cf6]" />
            Add Child
          </button>
          <button
            onClick={() => {
              onEdit(menu.node);
              setMenu(null);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#faf5ff] w-full text-left transition-colors"
          >
            <PenBox size={14} className="text-[#8b5cf6]" />
            Edit
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              onDelete(menu.node);
              setMenu(null);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}