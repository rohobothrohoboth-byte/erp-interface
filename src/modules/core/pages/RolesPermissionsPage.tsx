import { useMemo, useState } from 'react';
import { Check, Plus, Search, ShieldCheck, Users, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';

type Permission = { read: boolean; create: boolean; update: boolean; delete: boolean };
type Role = { id: number; name: string; description: string; users: number; status: 'Active' | 'Inactive'; permissions: Permission };

const initialRoles: Role[] = [
  { id: 1, name: 'System Administrator', description: 'Full access to ERP administration and configuration.', users: 2, status: 'Active', permissions: { read: true, create: true, update: true, delete: true } },
  { id: 2, name: 'HR Manager', description: 'Manage employees, recruitment, attendance and HR settings.', users: 5, status: 'Active', permissions: { read: true, create: true, update: true, delete: false } },
  { id: 3, name: 'Finance Manager', description: 'Manage finance operations, budgets, journals and reports.', users: 3, status: 'Active', permissions: { read: true, create: true, update: true, delete: false } },
  { id: 4, name: 'Report Viewer', description: 'Read-only access to approved reports and dashboards.', users: 12, status: 'Active', permissions: { read: true, create: false, update: false, delete: false } },
];

const permissionGroups = ['Core', 'Human Resources', 'Finance', 'Procurement', 'CRM', 'Projects', 'Reports'];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Core');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => roles.filter((r) => `${r.name} ${r.description}`.toLowerCase().includes(search.toLowerCase())), [roles, search]);
  const selected = roles.find((r) => r.id === selectedId) ?? filtered[0];

  const updatePermission = (key: keyof Permission) => {
    if (!selected) return;
    setRoles((current) => current.map((role) => role.id === selected.id ? { ...role, permissions: { ...role.permissions, [key]: !role.permissions[key] } } : role));
  };

  return (
    <ModulePageShell
      title="Roles & Permissions"
      subtitle="Control access to ERP modules, features and administrative capabilities."
      stats={[
        { label: 'Total Roles', value: roles.length, hint: 'Configured access roles' },
        { label: 'Active Roles', value: roles.filter((r) => r.status === 'Active').length, hint: 'Currently available' },
        { label: 'Assigned Users', value: roles.reduce((sum, r) => sum + r.users, 0), hint: 'Across all roles' },
        { label: 'Permission Groups', value: permissionGroups.length, hint: 'Security areas' },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search roles..."
      primaryActionLabel="Create Role"
      onPrimaryAction={() => setShowCreate(true)}
    >
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3"><CardTitle className="text-base">Roles</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-3">
            {filtered.map((role) => (
              <button key={role.id} onClick={() => setSelectedId(role.id)} className={`w-full rounded-lg border p-3 text-left transition ${selected?.id === role.id ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-2"><span className="font-medium text-slate-900">{role.name}</span><StatusBadge status={role.status} tone="success" /></div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{role.description}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Users className="h-3.5 w-3.5" /> {role.users} users</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="py-10 text-center text-sm text-slate-500"><Search className="mx-auto mb-2 h-5 w-5" />No roles found.</div>}
          </CardContent>
        </Card>

        {selected ? <Card className="border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><CardTitle className="text-lg">{selected.name}</CardTitle><p className="mt-1 text-sm text-slate-500">{selected.description}</p></div><Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4" />Security Overview</Button></div></CardHeader>
          <CardContent className="space-y-6 p-5">
            <div><div className="mb-3 text-sm font-semibold text-slate-900">Permission Groups</div><div className="flex flex-wrap gap-2">{permissionGroups.map((group) => <button key={group} onClick={() => setSelectedGroup(group)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selectedGroup === group ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{group}</button>)}</div></div>
            <div className="rounded-xl border border-slate-200 overflow-hidden"><div className="border-b bg-slate-50 px-4 py-3"><div className="font-medium text-slate-900">{selectedGroup} permissions</div><div className="text-xs text-slate-500">Choose the actions this role can perform.</div></div><div className="divide-y divide-slate-100">
              {(['read', 'create', 'update', 'delete'] as const).map((key) => <button key={key} onClick={() => updatePermission(key)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"><div><div className="text-sm font-medium capitalize text-slate-800">{key}</div><div className="text-xs text-slate-500">Allow {key} access for {selectedGroup.toLowerCase()} resources.</div></div>{selected.permissions[key] ? <Badge className="bg-emerald-600"><Check className="mr-1 h-3 w-3" />Allowed</Badge> : <Badge variant="outline"><X className="mr-1 h-3 w-3" />Denied</Badge>}</button>)}
            </div></div>
          </CardContent>
        </Card> : <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">Select a role to manage permissions.</div>}
      </div>

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setShowCreate(false)}><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Create Role</h2><p className="text-sm text-slate-500">Create a role and configure permissions.</p></div><button onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-slate-400" /></button></div><div className="mt-5 space-y-4"><div><label className="mb-1 block text-sm font-medium">Role name</label><Input placeholder="e.g. Branch Manager" /></div><div><label className="mb-1 block text-sm font-medium">Description</label><Input placeholder="Describe the role's responsibility" /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={() => setShowCreate(false)}><Plus className="mr-2 h-4 w-4" />Create Role</Button></div></div></div></div>}
    </ModulePageShell>
  );
}
