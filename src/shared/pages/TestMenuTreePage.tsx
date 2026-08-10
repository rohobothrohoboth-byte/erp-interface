// src/pages/TestMenuTreePage.tsx
import React, { useState, useEffect } from 'react';
import { getAllMenus } from '@/modules/auth/services/account/account.api';
import { api } from '@/shared/services/api';

const TestMenuTreePage: React.FC = () => {
    const [menuTree, setMenuTree] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                console.log('=== FETCHING MENU TREE ===');

                // Try GetMenuTree endpoint
                try {
                    const response = await api.get('/auth/v1/Permission/GetMenuTree');
                    const treeData = response.data.data || response.data || [];
                    console.log('Menu tree response:', treeData);

                    if (treeData && treeData.length > 0) {
                        // Log the structure
                        console.log('✅ Menu tree loaded:', treeData.length, 'root items');

                        // Log modules found
                        const modules = new Set();
                        treeData.forEach((item: any) => {
                            if (item.module) {
                                modules.add(item.module);
                            }
                            // Also check children
                            if (item.children) {
                                item.children.forEach((child: any) => {
                                    if (child.module) {
                                        modules.add(child.module);
                                    }
                                });
                            }
                        });
                        console.log('Modules found:', Array.from(modules));

                        setMenuTree(treeData);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.log('❌ GetMenuTree failed:', error);
                }

                // Fallback: Try AllPerMenu
                try {
                    const response = await api.get('/auth/v1/Permission/AllPerMenu');
                    const allPerMenu = response.data.data || response.data || [];
                    console.log('AllPerMenu response:', allPerMenu.length);

                    if (allPerMenu.length > 0) {
                        // Check if it has children
                        const hasChildren = allPerMenu.some((m: any) => m.children && m.children.length > 0);
                        if (hasChildren) {
                            setMenuTree(allPerMenu);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.log('❌ AllPerMenu failed:', error);
                }

                // Final fallback
                const flat = await getAllMenus();
                console.log('Flat menus fallback:', flat?.length);
                setMenuTree(flat || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching menus:', error);
                setLoading(false);
            }
        };

        fetchMenus();
    }, []);

    // ✅ Build module groups from the tree
    const getModuleGroups = () => {
        const moduleMap = new Map<string, { moduleName: string; menus: any[] }>();

        // Function to traverse tree and collect menus by module
        const traverseTree = (items: any[]) => {
            items.forEach((item: any) => {
                const moduleName = item.module || 'Unknown Module';

                if (!moduleMap.has(moduleName)) {
                    moduleMap.set(moduleName, { moduleName, menus: [] });
                }

                // Only add root level items (non-children) to the module's menu list
                // Children will be displayed under their parent
                if (!item.parentId && !item.parentKey) {
                    moduleMap.get(moduleName)!.menus.push(item);
                }

                // Recursively process children
                if (item.children && item.children.length > 0) {
                    traverseTree(item.children);
                }
            });
        };

        traverseTree(menuTree);
        return Array.from(moduleMap.values());
    };

    const toggleModule = (moduleName: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
    };

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading menus...</p>
                </div>
            </div>
        );
    }

    const moduleGroups = getModuleGroups();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Menu Tree Test</h1>
            <p className="text-gray-500 mb-4">Total root menus: {menuTree.length}</p>

            {/* Module Groups */}
            <div className="border rounded-lg overflow-hidden">
                {moduleGroups.map((module) => {
                    const isExpanded = expandedModules[module.moduleName] ?? true;

                    return (
                        <div key={module.moduleName} className="border-b last:border-b-0">
                            {/* Module Header */}
                            <div
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-white cursor-pointer hover:bg-indigo-100"
                                onClick={() => toggleModule(module.moduleName)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-indigo-700 text-lg">{module.moduleName}</span>
                                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
                    {module.menus.length} menus
                  </span>
                                </div>
                                <span className="text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </span>
                            </div>

                            {/* Module Menus */}
                            {isExpanded && (
                                <div className="p-2">
                                    {module.menus.map((menu: any) => (
                                        <MenuNode
                                            key={menu.key || menu.id}
                                            menu={menu}
                                            depth={0}
                                            expandedMenus={expandedMenus}
                                            onToggle={toggleMenu}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Raw Data */}
            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Raw Menu Tree Data</h3>
                <pre className="text-xs overflow-auto max-h-60 bg-white p-2 rounded border">
          {JSON.stringify(menuTree.slice(0, 5), null, 2)}
        </pre>
            </div>
        </div>
    );
};

// ✅ Menu Node Component - Shows tree structure
const MenuNode: React.FC<{
    menu: any;
    depth: number;
    expandedMenus: Record<string, boolean>;
    onToggle: (key: string) => void;
}> = ({ menu, depth, expandedMenus, onToggle }) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus[menu.key || menu.id] ?? true;
    const paddingLeft = depth * 24 + 8;

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-1.5 rounded px-2 cursor-pointer ${
                    hasChildren ? 'hover:bg-gray-50' : ''
                }`}
                style={{ paddingLeft: `${paddingLeft}px` }}
                onClick={() => hasChildren && onToggle(menu.key || menu.id)}
            >
                {hasChildren && (
                    <span className="text-gray-400 text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
                )}
                {!hasChildren && <span className="w-3" />}
                <span className="text-sm">
          {menu.label || menu.name || menu.key}
        </span>
                <span className="text-xs text-gray-400 ml-2">
          ({menu.key || menu.id})
        </span>
                {hasChildren && (
                    <span className="text-xs text-green-500 ml-1">
            ({menu.children.length} children)
          </span>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div>
                    {menu.children.map((child: any) => (
                        <MenuNode
                            key={child.key || child.id}
                            menu={child}
                            depth={depth + 1}
                            expandedMenus={expandedMenus}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestMenuTreePage;