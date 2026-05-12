import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  RefreshCw, 
  FileText, 
  Folder, 
  FolderOpen, 
  File, 
  FileCheck, 
  FileSearch, 
  Archive, 
  Upload, 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Eye, 
  User,
  Image as ImageIcon,
  Download,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useModuleStore } from '../../stores/module.store';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';

// Type Definitions
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  owner: string;
  status: 'active' | 'archived' | 'draft';
  version: string;
}

interface Folder {
  id: number;
  name: string;
  fileCount: number;
  lastUpdated: string;
  size: string;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: React.ReactNode;
}

interface Permission {
  id: number;
  user: string;
  role: string;
  access: string;
  avatar: string;
  email: string;
}

interface Stats {
  totalFiles: number;
  totalFolders: number;
  storageUsed: string;
  activeUsers: number;
  recentUploads: number;
}

interface StorageStats {
  total: string;
  used: string;
  available: string;
  usagePercentage: number;
}

interface FileType {
  type: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

interface StorageOverviewProps {
  stats: StorageStats;
  fileTypes: FileType[];
}

interface RecentDocumentsProps {
  documents: Document[];
}

interface FolderOverviewProps {
  folders: Folder[];
}

interface RecentActivityProps {
  activities: Activity[];
}

interface PermissionsOverviewProps {
  permissions: Permission[];
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const statCardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Sample Data
const documentData: Document[] = [
  { id: 1, name: 'Quarterly_Report_Q4.pdf', type: 'PDF', size: '2.4 MB', lastModified: '2024-01-15', owner: 'John Doe', status: 'active', version: 'v2.1' },
  { id: 2, name: 'Project_Proposal.docx', type: 'DOCX', size: '1.8 MB', lastModified: '2024-01-14', owner: 'Jane Smith', status: 'draft', version: 'v1.3' },
  { id: 3, name: 'Financial_Analysis.xlsx', type: 'XLSX', size: '3.2 MB', lastModified: '2024-01-13', owner: 'Robert Johnson', status: 'active', version: 'v3.0' },
  { id: 4, name: 'Meeting_Minutes.pdf', type: 'PDF', size: '1.1 MB', lastModified: '2024-01-12', owner: 'Sarah Wilson', status: 'archived', version: 'v1.0' },
  { id: 5, name: 'Design_Assets.zip', type: 'ZIP', size: '45.2 MB', lastModified: '2024-01-11', owner: 'Mike Chen', status: 'active', version: 'v2.5' },
];

const folderData: Folder[] = [
  { id: 1, name: 'Projects', fileCount: 128, lastUpdated: '2024-01-15', size: '2.4 GB' },
  { id: 2, name: 'Financial', fileCount: 89, lastUpdated: '2024-01-14', size: '1.8 GB' },
  { id: 3, name: 'Legal', fileCount: 42, lastUpdated: '2024-01-13', size: '890 MB' },
  { id: 4, name: 'Marketing', fileCount: 156, lastUpdated: '2024-01-12', size: '3.2 GB' },
  { id: 5, name: 'Archives', fileCount: 267, lastUpdated: '2024-01-11', size: '5.6 GB' },
];

const activityData: Activity[] = [
  { id: 1, user: 'John Doe', action: 'uploaded', target: 'Q4_Report.pdf', time: '10 minutes ago', icon: <Upload className="h-4 w-4 text-blue-500" /> },
  { id: 2, user: 'Jane Smith', action: 'edited', target: 'Project_Plan.docx', time: '25 minutes ago', icon: <Edit className="h-4 w-4 text-green-500" /> },
  { id: 3, user: 'Robert Johnson', action: 'shared', target: 'Budget.xlsx', time: '1 hour ago', icon: <Users className="h-4 w-4 text-purple-500" /> },
  { id: 4, user: 'Sarah Wilson', action: 'downloaded', target: 'Contract.pdf', time: '2 hours ago', icon: <Download className="h-4 w-4 text-amber-500" /> },
  { id: 5, user: 'Mike Chen', action: 'deleted', target: 'Old_Assets.zip', time: '3 hours ago', icon: <Trash2 className="h-4 w-4 text-red-500" /> },
];

const permissionData: Permission[] = [
  { id: 1, user: 'John Doe', role: 'Admin', access: 'Full Access', avatar: 'JD', email: 'john@example.com' },
  { id: 2, user: 'Jane Smith', role: 'Editor', access: 'Can Edit', avatar: 'JS', email: 'jane@example.com' },
  { id: 3, user: 'Robert Johnson', role: 'Viewer', access: 'View Only', avatar: 'RJ', email: 'robert@example.com' },
  { id: 4, user: 'Sarah Wilson', role: 'Contributor', access: 'Can Upload', avatar: 'SW', email: 'sarah@example.com' },
  { id: 5, user: 'Mike Chen', role: 'Manager', access: 'Full Access', avatar: 'MC', email: 'mike@example.com' },
];

const storageStats: StorageStats = {
  total: '50 GB',
  used: '32.4 GB',
  available: '17.6 GB',
  usagePercentage: 65
};

const fileTypeData: FileType[] = [
  { type: 'PDF Documents', count: 128, icon: <FileText className="h-5 w-5" />, color: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
  { type: 'Word Documents', count: 89, icon: <File className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  { type: 'Excel Sheets', count: 67, icon: <BarChart3 className="h-5 w-5" />, color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  { type: 'PowerPoint', count: 42, icon: <FileCheck className="h-5 w-5" />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
  { type: 'Images', count: 156, icon: <ImageIcon className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' }
];

// Component Definitions
const StorageOverview: React.FC<StorageOverviewProps> = ({ stats, fileTypes }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Storage Usage</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stats.used} of {stats.total}
        </span>
      </div>
      <Progress value={stats.usagePercentage} className="h-2" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Used</p>
          <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{stats.used}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{stats.available}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="font-bold text-lg text-gray-700 dark:text-gray-300">{stats.total}</p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-semibold">Files by Type</h3>
      <div className="space-y-3">
        {fileTypes.map((fileType, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${fileType.color}`}>
                {fileType.icon}
              </div>
              <span className="font-medium">{fileType.type}</span>
            </div>
            <Badge variant="outline">{fileType.count} files</Badge>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ documents }) => (
  <div className="space-y-3">
    {documents.map((doc) => (
      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-medium">{doc.name}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{doc.type}</span>
              <span>•</span>
              <span>{doc.size}</span>
              <span>•</span>
              <span>Modified {doc.lastModified}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            doc.status === 'active' ? 'default' :
            doc.status === 'draft' ? 'secondary' : 'outline'
          }>
            {doc.status}
          </Badge>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ))}
  </div>
);

const FolderOverview: React.FC<FolderOverviewProps> = ({ folders }) => (
  <div className="space-y-3">
    {folders.map((folder) => (
      <div key={folder.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium">{folder.name}</p>
            <p className="text-sm text-gray-500">
              {folder.fileCount} files • {folder.size}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Updated {folder.lastUpdated}</span>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ))}
  </div>
);

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => (
  <div className="space-y-3">
    {activities.map((activity) => (
      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="mt-1">{activity.icon}</div>
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-medium">{activity.user}</span>
            <span> {activity.action} </span>
            <span className="font-medium">{activity.target}</span>
          </p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
);

const PermissionsOverview: React.FC<PermissionsOverviewProps> = ({ permissions }) => (
  <div className="space-y-3">
    {permissions.map((permission) => (
      <div key={permission.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{permission.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{permission.user}</p>
            <p className="text-sm text-gray-500">{permission.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{permission.role}</Badge>
          <span className="text-sm text-gray-500">{permission.access}</span>
        </div>
      </div>
    ))}
  </div>
);

// Main Component
const FileDashboard = () => {
  const activeModule = useModuleStore((s) => s.activeModule);
  
  const stats: Stats = {
    totalFiles: documentData.length + 156 + 89 + 67 + 42,
    totalFolders: folderData.length,
    storageUsed: storageStats.used,
    activeUsers: permissionData.length,
    recentUploads: 12
  };

  type StatKey = keyof typeof statConfig;

  const statConfig = {
    totalFiles: {
      icon: <FileText className="h-4 w-4 text-emerald-600" />,
      title: 'Total Files',
      description: 'All documents in system'
    },
    totalFolders: {
      icon: <Folder className="h-4 w-4 text-emerald-500" />,
      title: 'Folders',
      description: 'Organized collections'
    },
    storageUsed: {
      icon: <Archive className="h-4 w-4 text-emerald-500" />,
      title: 'Storage Used',
      description: 'Of 50 GB total'
    },
    activeUsers: {
      icon: <Users className="h-4 w-4 text-emerald-400" />,
      title: 'Active Users',
      description: 'With file access'
    },
    recentUploads: {
      icon: <Upload className="h-4 w-4 text-emerald-600" />,
      title: 'Recent Uploads',
      description: 'Last 7 days'
    }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeModule === 'File' ? 'File Management' : 'Dashboard'}
            </h1>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">
              Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Central hub for managing documents, folders, storage, and file permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Upload size={16} />
            <span>Upload</span>
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Folder size={16} />
            <span>New Folder</span>
          </Button>
        </div>
      </section>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {(Object.keys(statConfig) as StatKey[]).map((key) => (
          <motion.div key={key} variants={statCardVariants}>
            <Card className="hover:shadow-lg hover:ring-1 hover:ring-emerald-400 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {statConfig[key].title}
                </CardTitle>
                {statConfig[key].icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {key === 'storageUsed' ? stats[key] : stats[key]}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {statConfig[key].description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Components Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              <span>Recent Documents</span>
            </CardTitle>
            <CardDescription>
              Latest documents with status, version control, and quick actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentDocuments documents={documentData} />
          </CardContent>
        </Card>

        {/* Storage Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-emerald-500" />
              <span>Storage Overview</span>
            </CardTitle>
            <CardDescription>
              Monitor storage usage and file type distribution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StorageOverview stats={storageStats} fileTypes={fileTypeData} />
          </CardContent>
        </Card>

        {/* Folder Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              <span>Folder Overview</span>
            </CardTitle>
            <CardDescription>
              Access and manage your document folders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FolderOverview folders={folderData} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Track document changes and user actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={activityData} />
          </CardContent>
        </Card>

        {/* Permissions Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span>Permissions Overview</span>
            </CardTitle>
            <CardDescription>
              Manage user access and file permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionsOverview permissions={permissionData} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FileDashboard;