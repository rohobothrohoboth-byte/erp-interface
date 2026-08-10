import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { PenBox, Trash2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Account } from '@/modules/finance/components/accounts/chartofAccount/AccountsSection';

interface AccountsTreeProps {
  accounts: Account[];
  searchTerm: string;
  onAddChild?: (account: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  height?: number;
}

const NODE_W = 220;
const NODE_H = 100;

const AccountsTree: React.FC<AccountsTreeProps> = ({
  accounts,
  searchTerm,
  onAddChild,
  onEdit,
  onDelete,
  height = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [size, setSize] = useState({ width: 900, height });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const [menu, setMenu] = useState<{ x: number; y: number; account: Account } | null>(null);

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No accounts to display
      </div>
    );
  }

  // Filter accounts based on search term
  const filteredAccounts = useCallback(() => {
    if (!searchTerm) return accounts;
    
    const filterAccounts = (accs: Account[]): Account[] => {
      return accs.filter(acc => {
        const matchesSearch = 
          acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (acc.accountType && acc.accountType.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (matchesSearch) return true;
        
        if (acc.children && acc.children.length > 0) {
          const filteredChildren = filterAccounts(acc.children);
          if (filteredChildren.length > 0) {
            acc.children = filteredChildren;
            return true;
          }
        }
        
        return false;
      });
    };
    
    return filterAccounts([...accounts]);
  }, [accounts, searchTerm]);

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
    if (!accounts.length) return;
    setTransform({
      x: size.width / 2,
      y: 80,
      scale: 1,
    });
  }, [accounts, size.width]);

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
    if (!svgRef.current || !accounts.length) return;

    const dataToRender = searchTerm ? filteredAccounts() : accounts;

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

    // Create hierarchy
    const root = d3.hierarchy(
      dataToRender.length === 1 ? dataToRender[0] : ({ id: "root", children: dataToRender } as any),
      (d: any) => d.children
    );

    const tree = d3.tree<Account>().nodeSize([240, 150]);
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

    // Card background - subtle difference for groups
    node.append("rect")
      .attr("width", NODE_W)
      .attr("height", NODE_H)
      .attr("rx", 10)
      .attr("fill", (d) => d.data.isGroup ? "#faf5ff" : "#ffffff")
      .attr("stroke", (d) => d.data.isGroup ? "#c4b5fd" : "#e2e8f0")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("click", function(e, d) {
        const target = e.target as HTMLElement;
        if (!target.closest('.action-button')) {
          e.stopPropagation();
          navigate(`/finance/accounts/${d.data.id}`);
        }
      });

    // Code
    node.append("text")
      .attr("x", 16)
      .attr("y", 28)
      .attr("font-weight", "600")
      .attr("font-size", "13px")
      .attr("fill", "#2e1065")
      .style("pointer-events", "none")
      .text((d) => d.data.code);

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
        return d.data.accountType || "Account";
      });

    // Balance (if exists)
    node.filter(d => d.data.balance !== undefined)
      .append("text")
      .attr("x", 16)
      .attr("y", 84)
      .attr("font-size", "11px")
      .attr("fill", "#64748b")
      .style("pointer-events", "none")
      .text((d) => `$${d.data.balance?.toLocaleString()}`);

    // Status dot
    node.append("circle")
      .attr("cx", NODE_W - 20)
      .attr("cy", 22)
      .attr("r", 5)
      .attr("fill", (d) => (d.data.isActive ? "#22c55e" : "#ef4444"));

    // Only show action buttons if callbacks are provided
    if (onAddChild || onEdit || onDelete) {
      // Action button group
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
            account: d.data,
          });
        });

      // Larger invisible hit area
      actionButton.append("rect")
        .attr("x", -8)
        .attr("y", -8)
        .attr("width", 32)
        .attr("height", 32)
        .attr("fill", "transparent")
        .attr("rx", 4);

      // Button background
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
    }

  }, [accounts, size, transform, searchTerm, filteredAccounts, navigate, onAddChild, onEdit, onDelete]);

  return (
    <div className="flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">Controls:</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Scroll to zoom • Drag to pan</span>
          </div>
          {searchTerm && (
            <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              Filtered by: "{searchTerm}"
            </div>
          )}
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

      {/* Action popover */}
      {menu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-[#e0e7ff] py-1 min-w-[140px]"
          style={{
            left: `${menu.x}px`,
            top: `${menu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onAddChild && (
            <button
              onClick={() => {
                onAddChild(menu.account);
                setMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#faf5ff] w-full text-left transition-colors"
            >
              <Plus size={14} className="text-[#8b5cf6]" />
              Add Child
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => {
                onEdit(menu.account);
                setMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#faf5ff] w-full text-left transition-colors"
            >
              <PenBox size={14} className="text-[#8b5cf6]" />
              Edit
            </button>
          )}
          {onDelete && (
            <>
              {(onAddChild || onEdit) && <div className="border-t border-gray-100 my-1"></div>}
              <button
                onClick={() => {
                  onDelete(menu.account);
                  setMenu(null);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountsTree;