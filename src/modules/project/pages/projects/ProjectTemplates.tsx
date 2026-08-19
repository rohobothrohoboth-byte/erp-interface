// src/modules/project/pages/projects/ProjectTemplates.tsx
import { useState,  useMemo, } from "react";
import { useNavigate } from "react-router-dom";
import { ModulePageShell } from "@/shared/components/ModulePageShell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { showToast } from "@/shared/layout/layout";

import { ProjectType } from "../../types";
import type{  ProjectCreateDto } from "../../types";
import {
  Plus,
  Search,
  Copy,

  Eye,

  LayoutTemplate,

  Clock,
  Users,
  ListTodo,

  Star,
  StarOff,
  Filter,
} from "lucide-react";

// ============================================================
// TEMPLATE DATA
// ============================================================

interface TemplateStage {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: TemplateTask[];
}

interface TemplateTask {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  category: string;
  icon: string;
  stages: TemplateStage[];
  estimatedDuration: number; // in days
  estimatedBudget: number;
  useCount: number;
  rating: number;
  isFeatured: boolean;
  createdAt: string;
  createdBy: string;
  tags: string[];
}

// ============================================================
// SAMPLE TEMPLATE DATA
// ============================================================

const TEMPLATES: ProjectTemplate[] = [
  {
    id: "tpl-1",
    name: "Construction Fit-Out",
    description: "Complete construction and interior fit-out project template",
    type: ProjectType.External,
    category: "Construction",
    icon: "🏗️",
    estimatedDuration: 120,
    estimatedBudget: 500000,
    useCount: 45,
    rating: 4.5,
    isFeatured: true,
    createdAt: "2024-01-15T00:00:00Z",
    createdBy: "PMO Team",
    tags: ["Construction", "Fit-Out", "Interior"],
    stages: [
      {
        id: "stage-1",
        name: "Planning & Design",
        description: "Initial planning and design phase",
        order: 1,
        tasks: [
          { id: "task-1", name: "Site Survey", description: "Conduct site survey", estimatedHours: 40, priority: "High" },
          { id: "task-2", name: "Design Development", description: "Create detailed designs", estimatedHours: 80, priority: "Medium" },
        ],
      },
      {
        id: "stage-2",
        name: "Construction",
        description: "Main construction phase",
        order: 2,
        tasks: [
          { id: "task-3", name: "Foundation Work", description: "Lay foundation", estimatedHours: 160, priority: "High" },
          { id: "task-4", name: "Structural Work", description: "Complete structure", estimatedHours: 240, priority: "High" },
        ],
      },
    ],
  },
  {
    id: "tpl-2",
    name: "ERP Implementation",
    description: "Enterprise Resource Planning system implementation",
    type: ProjectType.Development,
    category: "IT",
    icon: "💻",
    estimatedDuration: 180,
    estimatedBudget: 1000000,
    useCount: 89,
    rating: 4.8,
    isFeatured: true,
    createdAt: "2024-02-10T00:00:00Z",
    createdBy: "IT PMO",
    tags: ["ERP", "Implementation", "Software"],
    stages: [
      {
        id: "stage-1",
        name: "Requirements & Planning",
        description: "Gather requirements and plan implementation",
        order: 1,
        tasks: [
          { id: "task-1", name: "Requirements Gathering", description: "Collect all requirements", estimatedHours: 80, priority: "High" },
          { id: "task-2", name: "System Design", description: "Design system architecture", estimatedHours: 120, priority: "Medium" },
        ],
      },
      {
        id: "stage-2",
        name: "Development & Testing",
        description: "Develop and test the system",
        order: 2,
        tasks: [
          { id: "task-3", name: "Development", description: "Develop the system", estimatedHours: 400, priority: "High" },
          { id: "task-4", name: "Testing", description: "Test the system", estimatedHours: 160, priority: "Medium" },
        ],
      },
    ],
  },
  {
    id: "tpl-3",
    name: "Branch Launch",
    description: "Complete new branch or office launch",
    type: ProjectType.Internal,
    category: "Operations",
    icon: "🏢",
    estimatedDuration: 90,
    estimatedBudget: 250000,
    useCount: 34,
    rating: 4.2,
    isFeatured: false,
    createdAt: "2024-03-05T00:00:00Z",
    createdBy: "Ops Team",
    tags: ["Branch", "Launch", "Operations"],
    stages: [
      {
        id: "stage-1",
        name: "Setup & Staffing",
        description: "Setup the branch and hire staff",
        order: 1,
        tasks: [
          { id: "task-1", name: "Location Setup", description: "Setup the location", estimatedHours: 80, priority: "High" },
          { id: "task-2", name: "Hiring", description: "Hire staff", estimatedHours: 60, priority: "Medium" },
        ],
      },
      {
        id: "stage-2",
        name: "Launch",
        description: "Launch the branch",
        order: 2,
        tasks: [
          { id: "task-3", name: "Marketing", description: "Marketing campaign", estimatedHours: 40, priority: "Medium" },
          { id: "task-4", name: "Grand Opening", description: "Grand opening event", estimatedHours: 20, priority: "High" },
        ],
      },
    ],
  },
  {
    id: "tpl-4",
    name: "Software Development",
    description: "Full software development lifecycle template",
    type: ProjectType.Development,
    category: "IT",
    icon: "🖥️",
    estimatedDuration: 150,
    estimatedBudget: 750000,
    useCount: 67,
    rating: 4.6,
    isFeatured: false,
    createdAt: "2024-04-20T00:00:00Z",
    createdBy: "IT PMO",
    tags: ["Software", "Development", "Agile"],
    stages: [
      {
        id: "stage-1",
        name: "Planning",
        description: "Planning and requirements",
        order: 1,
        tasks: [
          { id: "task-1", name: "Requirements Analysis", description: "Analyze requirements", estimatedHours: 60, priority: "High" },
          { id: "task-2", name: "Architecture Design", description: "Design architecture", estimatedHours: 80, priority: "Medium" },
        ],
      },
      {
        id: "stage-2",
        name: "Development",
        description: "Development and testing",
        order: 2,
        tasks: [
          { id: "task-3", name: "Sprint Planning", description: "Plan sprints", estimatedHours: 40, priority: "Medium" },
          { id: "task-4", name: "Development", description: "Develop the software", estimatedHours: 300, priority: "High" },
        ],
      },
    ],
  },
  {
    id: "tpl-5",
    name: "Digital Marketing Campaign",
    description: "Complete digital marketing campaign template",
    type: ProjectType.External,
    category: "Marketing",
    icon: "📱",
    estimatedDuration: 60,
    estimatedBudget: 100000,
    useCount: 28,
    rating: 4.3,
    isFeatured: false,
    createdAt: "2024-05-12T00:00:00Z",
    createdBy: "Marketing Team",
    tags: ["Digital", "Marketing", "Campaign"],
    stages: [
      {
        id: "stage-1",
        name: "Strategy",
        description: "Strategy and planning",
        order: 1,
        tasks: [
          { id: "task-1", name: "Market Research", description: "Research market", estimatedHours: 40, priority: "High" },
          { id: "task-2", name: "Strategy Development", description: "Develop strategy", estimatedHours: 60, priority: "Medium" },
        ],
      },
      {
        id: "stage-2",
        name: "Execution",
        description: "Execute the campaign",
        order: 2,
        tasks: [
          { id: "task-3", name: "Content Creation", description: "Create content", estimatedHours: 80, priority: "Medium" },
          { id: "task-4", name: "Campaign Launch", description: "Launch campaign", estimatedHours: 40, priority: "High" },
        ],
      },
    ],
  },
  {
    id: "tpl-6",
    name: "Training & Development",
    description: "Employee training and development program",
    type: ProjectType.Internal,
    category: "HR",
    icon: "📚",
    estimatedDuration: 45,
    estimatedBudget: 75000,
    useCount: 19,
    rating: 4.1,
    isFeatured: false,
    createdAt: "2024-06-08T00:00:00Z",
    createdBy: "HR Team",
    tags: ["Training", "Development", "HR"],
    stages: [
      {
        id: "stage-1",
        name: "Needs Assessment",
        description: "Assess training needs",
        order: 1,
        tasks: [
          { id: "task-1", name: "Training Needs Analysis", description: "Analyze needs", estimatedHours: 40, priority: "High" },
          { id: "task-2", name: "Curriculum Development", description: "Develop curriculum", estimatedHours: 60, priority: "Medium" },
        ],
      },
      {
        id: "stage-2",
        name: "Delivery",
        description: "Deliver the training",
        order: 2,
        tasks: [
          { id: "task-3", name: "Training Delivery", description: "Deliver training", estimatedHours: 80, priority: "High" },
          { id: "task-4", name: "Evaluation", description: "Evaluate training", estimatedHours: 20, priority: "Low" },
        ],
      },
    ],
  },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Construction", label: "Construction" },
  { value: "IT", label: "IT" },
  { value: "Operations", label: "Operations" },
  { value: "Marketing", label: "Marketing" },
  { value: "HR", label: "HR" },
];

const typeLabels: Record<ProjectType, string> = {
  [ProjectType.Internal]: "Internal",
  [ProjectType.External]: "External",
  [ProjectType.Research]: "Research",
  [ProjectType.Development]: "Development",
  [ProjectType.Maintenance]: "Maintenance",
  [ProjectType.Consulting]: "Consulting",
};

export default function ProjectTemplates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDetails, setShowDetails] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredTemplates = useMemo(() => {
    let result = TEMPLATES;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
          (t) =>
              t.name.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    return result;
  }, [search, selectedCategory]);

  const featuredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => t.isFeatured);
  }, []);

  const handleUseTemplate = (template: ProjectTemplate) => {
    // Create a project from template
    const projectData: ProjectCreateDto = {
      name: `${template.name} - ${new Date().toISOString().slice(0, 10)}`,
      description: template.description,
      type: template.type,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + template.estimatedDuration * 24 * 60 * 60 * 1000).toISOString(),
      budget: template.estimatedBudget,
      projectManagerName: "System",
      tags: template.tags.join(","),
      createdBy: "System",
    };

    // Show confirmation
    if (confirm(`Create a new project from "${template.name}" template?`)) {
      showToast.success(`Creating project from "${template.name}" template...`);
      // Navigate to create project with template data
      navigate("/project-management/projects/create", {
        state: { templateData: projectData },
      });
    }
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) =>
        prev.includes(templateId)
            ? prev.filter((id) => id !== templateId)
            : [...prev, templateId]
    );
    showToast.success(
        favorites.includes(templateId) ? "Removed from favorites" : "Added to favorites"
    );
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: fullStars }, (_, i) => (
              <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          {hasHalfStar && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
          {Array.from({ length: emptyStars }, (_, i) => (
              <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
          ))}
        </div>
    );
  };

  const renderTemplateCard = (template: ProjectTemplate) => (
      <Card
          key={template.id}
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-200 hover:border-emerald-300"
          onClick={() => {
            setSelectedTemplate(template);
            setShowDetails(true);
          }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{template.icon}</span>
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {template.description}
                </CardDescription>
              </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
            >
              {favorites.includes(template.id) ? (
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ) : (
                  <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {typeLabels[template.type]}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
            {template.isFeatured && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                  Featured
                </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {template.estimatedDuration} days
          </span>
            <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
              {template.stages.length} stages
          </span>
            <span className="flex items-center gap-1">
            <ListTodo className="w-3 h-3" />
              {template.stages.reduce((acc, s) => acc + s.tasks.length, 0)} tasks
          </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {renderStars(template.rating)}
            <span className="text-xs text-gray-500">({template.useCount})</span>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={(e) => {
                e.stopPropagation();
                handleUseTemplate(template);
              }}
          >
            <Copy className="w-3 h-3 mr-1" />
            Use Template
          </Button>
          <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTemplate(template);
                setShowDetails(true);
              }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
        </CardFooter>
      </Card>
  );

  const renderTemplateList = (template: ProjectTemplate) => (
      <TableRow
          key={template.id}
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => {
            setSelectedTemplate(template);
            setShowDetails(true);
          }}
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <p className="font-medium">{template.name}</p>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {typeLabels[template.type]}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
          </div>
        </TableCell>
        <TableCell>{template.estimatedDuration} days</TableCell>
        <TableCell>{template.stages.length}</TableCell>
        <TableCell>
          {template.stages.reduce((acc, s) => acc + s.tasks.length, 0)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {renderStars(template.rating)}
            <span className="text-xs text-gray-500">({template.useCount})</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseTemplate(template);
                }}
            >
              <Copy className="w-3 h-3 mr-1" />
              Use
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
            >
              {favorites.includes(template.id) ? (
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ) : (
                  <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
  );

  return (
      <ModulePageShell
          title="Project Templates"
          subtitle={`${filteredTemplates.length} templates available`}
          onRefresh={() => showToast.success("Templates refreshed")}
          primaryActionLabel={
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </div>
          }
          onPrimaryAction={() => {
            showToast.success("Opening template creator...");
          }}
      >
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3">
              <p className="text-xs text-emerald-600">Total Templates</p>
              <p className="text-xl font-bold text-emerald-700">{TEMPLATES.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-xs text-blue-600">Featured</p>
              <p className="text-xl font-bold text-blue-700">{featuredTemplates.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <p className="text-xs text-purple-600">Categories</p>
              <p className="text-xl font-bold text-purple-700">{categoryOptions.length - 1}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3">
              <p className="text-xs text-orange-600">Most Used</p>
              <p className="text-xl font-bold text-orange-700">
                {TEMPLATES.reduce((max, t) => t.useCount > max.useCount ? t : max).name}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
            >
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="text-xs px-3">Grid</TabsTrigger>
                <TabsTrigger value="list" className="text-xs px-3">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Templates Display */}
        {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No templates found matching your criteria</p>
              <Button
                  variant="link"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                  }}
              >
                Clear filters
              </Button>
            </div>
        ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
        ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Type / Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Stages</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{filteredTemplates.map(renderTemplateList)}</TableBody>
              </Table>
            </div>
        )}

        {/* Template Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTemplate && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <span className="text-3xl">{selectedTemplate.icon}</span>
                      {selectedTemplate.name}
                      {selectedTemplate.isFeatured && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Featured
                          </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>{selectedTemplate.description}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Template Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium">{typeLabels[selectedTemplate.type]}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-medium">{selectedTemplate.category}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium">{selectedTemplate.estimatedDuration} days</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="font-medium">${selectedTemplate.estimatedBudget.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                      ))}
                    </div>

                    {/* Stages */}
                    <div>
                      <h4 className="font-medium mb-2">Stages & Tasks</h4>
                      <div className="space-y-3">
                        {selectedTemplate.stages.map((stage) => (
                            <Card key={stage.id} className="border border-gray-200">
                              <CardHeader className="py-3 px-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-sm">
                                      Stage {stage.order}: {stage.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {stage.description}
                                    </CardDescription>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {stage.tasks.length} tasks
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="py-2 px-4">
                                <div className="space-y-1">
                                  {stage.tasks.map((task) => (
                                      <div
                                          key={task.id}
                                          className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">{task.name}</span>
                                          <Badge
                                              variant="outline"
                                              className={`text-xs ${
                                                  task.priority === "Critical"
                                                      ? "border-red-500 text-red-600"
                                                      : task.priority === "High"
                                                          ? "border-orange-500 text-orange-600"
                                                          : task.priority === "Medium"
                                                              ? "border-yellow-500 text-yellow-600"
                                                              : "border-gray-300 text-gray-500"
                                              }`}
                                          >
                                            {task.priority}
                                          </Badge>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                  {task.estimatedHours}h
                                </span>
                                      </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Template Usage</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {selectedTemplate.useCount}
                          </p>
                          <p className="text-xs text-gray-500">projects created</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {renderStars(selectedTemplate.rating)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {selectedTemplate.rating} average rating
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDetails(false)}>
                      Close
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setShowDetails(false);
                          handleUseTemplate(selectedTemplate);
                        }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </DialogFooter>
                </>
            )}
          </DialogContent>
        </Dialog>
      </ModulePageShell>
  );
}