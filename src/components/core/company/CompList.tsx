import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MoreVertical, PenBox, Trash2, Building2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '../../../components/ui/dropdown-menu';
import type { CompListDto, UUID } from '../../../types/core/comp';

interface CompListProps {
    companies: CompListDto[];
    onEditCompany: (company: CompListDto) => void;
    onDeleteCompany: (company: CompListDto) => void;
    onViewBranches: (companyId: UUID) => void;
}

const CompList: React.FC<CompListProps> = ({
                                               companies,
                                               onEditCompany,
                                               onDeleteCompany,
                                               onViewBranches,
                                           }) => {
    const handleViewBranches = (companyId: UUID) => {
        onViewBranches(companyId);
    };

    if (companies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                    <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No companies found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click "Add Company" to create one</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
                <Card
                    key={company.id}
                    className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {company.nameAm}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {company.name}
                                    </p>
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36 p-1">
                                    <DropdownMenuItem
                                        onClick={() => onEditCompany(company)}
                                        className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                                    >
                                        <PenBox className="h-3.5 w-3.5 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDeleteCompany(company)}
                                        className="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md cursor-pointer"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Branch Count */}
                        <div className="mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{company.branchCount}</span> branches
                            </p>
                        </div>

                        {/* Action Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBranches(company.id)}
                            className="w-full text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            View Branches
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default CompList;