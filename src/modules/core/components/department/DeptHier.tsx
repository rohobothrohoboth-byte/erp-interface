// src/components/core/department/DepartmentHierarchy.tsx
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Department } from "@/modules/core/types/coreTypes";

interface DepartmentHierarchyProps {
  treeData: Department[];
  expandedNodes: Set<string>;
  onToggle: (nodeId: string) => void;
}

const DepartmentHierarchy = ({ 
  treeData, 
  expandedNodes, 
  onToggle 
}: DepartmentHierarchyProps) => {

  const renderTree = (nodes: Department[]) => (
    <div className="space-y-4 pl-6">
      {nodes.map(node => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        
        return (
          <div key={node.id} className="border-l-2 border-muted pl-4">
            <div className="flex items-center gap-3 mb-2">
              {hasChildren ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => onToggle(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-7" />
              )}
              
              <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{node.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {node.description}
                  </p>
                </div>
              </Card>
            </div>
            
            {hasChildren && isExpanded && (
              <div className="pl-6 mt-3">
                {renderTree(node.children || [])}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="border rounded-lg p-6 bg-muted/10">
      {treeData.length > 0 ? (
        renderTree(treeData)
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          No departments found. Create departments to see the hierarchy.
        </p>
      )}
    </div>
  );
};

export default DepartmentHierarchy;