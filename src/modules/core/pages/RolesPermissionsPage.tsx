import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search, ShieldCheck, Users, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ModulePageShell, StatusBadge } from '@/shared/components/ModulePageShell';
import { permissionsApi, type PermissionModule, type Role } from '@/services/core/permissions';

type CreateRole = { name: string; description: string };

const flattenMenus = (menus: any[]): any[] => menus.flatMap((m) => [m, ...flattenMenus(m.children ?? [])]);

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [structure, setStructure] = useState<PermissionModule[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [selectedApis, setSelectedApis] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateRole>({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [roleData, structureData] = await Promise.all([permissionsApi.getRoles(), permissionsApi.getPermissionStructure()]);
      setRoles(roleData ?? []);
      setStructure(structureData?.modules ?? []);
      if (!selectedId && roleData?.[0]?.id) setSelectedId(roleData[0].id);
      if (!selectedModule && structureData?.modules?.[0]?.id) setSelectedModule(structureData.modules[0].id);
    } catch (e: any) { setError(e?.message ?? 'Unable to load roles and permissions.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!selectedId) return;
    void permissionsApi.getRolePermissions(selectedId).then((p) => {
      setSelectedModules(p?.modules ?? []); setSelectedMenus(p?.menus ?? []); setSelectedApis(p?.apis ?? []);
    }).catch((e: any) => setError(e?.message ?? 'Unable to load role permissions.'));
  }, [selectedId]);

  const filtered = useMemo(() => roles.filter((r) => `${r.role}`.toLowerCase().includes(search.toLowerCase())), [roles, search]);
  const activeRole = roles.find((r) => r.id === selectedId) ?? filtered[0];
  const activeModule = structure.find((m) => m.id === selectedModule) ?? structure[0];
  const menus = flattenMenus(activeModule?.menus ?? []);

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const savePermissions = async () => {
    if (!selectedId) return;
    setSaving(true); setError('');
    try { await permissionsApi.saveRolePermissions({ roleId: selectedId, moduleIds: selectedModules, menuIds: selectedMenus, apiActionIds: selectedApis }); }
    catch (e: any) { setError(e?.message ?? 'Unable to save permissions.'); }
    finally { setSaving(false); }
  };
  const createRole = async () => {
    if (!form.name.trim()) return;
    try { const created = await permissionsApi.createRole(form); setShowCreate(false); setForm({ name: '', description: '' }); await load(); if (created?.id) setSelectedId(created.id); }
    catch (e: any) { setError(e?.message ?? 'Unable to create role.'); }
  };

  return (
    <ModulePageShell title="Roles & Permissions" subtitle="Manage ERP roles and their module, menu and API access." stats={[
      { label: 'Total Roles', value: roles.length, hint: 'Configured roles' },
      { label: 'Active Roles', value: roles.length, hint: 'Identity roles' },
      { label: 'Permission Groups', value: structure.length, hint: 'ERP modules' },
      { label: 'Selected Access', value: selectedModules.length + selectedMenus.length + selectedApis.length, hint: 'Assigned permissions' },
    ]} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search roles..." primaryActionLabel="Create Role" onPrimaryAction={() => setShowCreate(true)}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading roles and permission structure...</div> : <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Card className="border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100 pb-3"><CardTitle className="text-base">Roles</CardTitle></CardHeader><CardContent className="space-y-2 p-3">
          {filtered.map((role) => <button key={role.id} onClick={() => setSelectedId(role.id)} className={`w-full rounded-lg border p-3 text-left ${activeRole?.id === role.id ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-2"><span className="font-medium text-slate-900">{role.role}</span><StatusBadge status="Active" tone="success" /></div><p className="mt-2 text-xs text-slate-500">Identity role</p></button>)}
          {!filtered.length && <div className="py-10 text-center text-sm text-slate-500"><Search className="mx-auto mb-2 h-5 w-5" />No roles found.</div>}
        </CardContent></Card>

        {activeRole && <Card className="border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><CardTitle className="text-lg">{activeRole.role}</CardTitle><p className="mt-1 text-sm text-slate-500">Configure access inherited by users assigned to this role.</p></div><Button onClick={() => void savePermissions()} disabled={saving}>{saving ? 'Saving...' : 'Save Permissions'}</Button></div></CardHeader><CardContent className="space-y-5 p-5">
          <div className="flex flex-wrap gap-2">{structure.map((m) => <button key={m.id} onClick={() => setSelectedModule(m.id)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeModule?.id === m.id ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{m.name || m.key}</button>)}</div>
          <div className="rounded-xl border border-slate-200 overflow-hidden"><div className="border-b bg-slate-50 px-4 py-3"><div className="font-medium text-slate-900">{activeModule?.name || activeModule?.key || 'Module'} permissions</div><div className="text-xs text-slate-500">Select modules, menus and API actions allowed for this role.</div></div>
            <div className="divide-y divide-slate-100">
              {activeModule && <label className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-slate-50"><div><div className="text-sm font-medium">Module access</div><div className="text-xs text-slate-500">Allow this role to access the module.</div></div>{selectedModules.includes(activeModule.id) ? <Badge className="bg-emerald-600" onClick={() => toggle(selectedModules, activeModule.id, setSelectedModules)}><Check className="mr-1 h-3 w-3" />Allowed</Badge> : <Badge variant="outline" onClick={() => toggle(selectedModules, activeModule.id, setSelectedModules)}><X className="mr-1 h-3 w-3" />Denied</Badge>}</label>}
              {menus.map((menu) => <div key={menu.id} className="px-4 py-3"><label className="flex cursor-pointer items-center justify-between"><div><div className="text-sm font-medium text-slate-800">{menu.label || menu.key}</div><div className="text-xs text-slate-500">{menu.path || 'Menu permission'}</div></div><input type="checkbox" checked={selectedMenus.includes(menu.id)} onChange={() => toggle(selectedMenus, menu.id, setSelectedMenus)} /></label>{menu.actions?.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{menu.actions.map((action: any) => <label key={action.id} className="flex items-center gap-2 rounded-md border border-slate-100 px-3 py-2 text-xs"><input type="checkbox" checked={selectedApis.includes(action.id)} onChange={() => toggle(selectedApis, action.id, setSelectedApis)} />{action.name || action.key}</label>)}</div>}</div>)}
            </div>
          </div>
        </CardContent></Card>}
      </div>}

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setShowCreate(false)}><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Create Role</h2><p className="text-sm text-slate-500">Create an Identity role.</p></div><button onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-slate-400" /></button></div><div className="mt-5 space-y-4"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Role name" /><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={() => void createRole()}><Plus className="mr-2 h-4 w-4" />Create Role</Button></div></div></div></div>}
    </ModulePageShell>
  );
}
