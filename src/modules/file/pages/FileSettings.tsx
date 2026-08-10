import { useState } from 'react';
import { HardDrive, Bell, Archive, Save } from 'lucide-react';
import { ModulePageShell } from '@/shared/components/ModulePageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';

export default function FileSettings() {
  const [quotaGb, setQuotaGb] = useState(50);
  const [usedGb] = useState(18.4);
  const [retentionDays, setRetentionDays] = useState(90);
  const [notifyUploads, setNotifyUploads] = useState(true);
  const [notifyShares, setNotifyShares] = useState(true);
  const [notifyQuota, setNotifyQuota] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);

  const usagePct = Math.min(100, Math.round((usedGb / quotaGb) * 100));

  const handleSave = () => {
    showToast.success('File settings saved');
  };

  return (
    <ModulePageShell
      title="File Settings"
      subtitle="Configure storage quotas, retention policies, and notification preferences."
      stats={[
        { label: 'Quota', value: `${quotaGb} GB` },
        { label: 'Used', value: `${usedGb} GB`, hint: `${usagePct}% of quota` },
        { label: 'Retention', value: `${retentionDays} days` },
      ]}
      primaryActionLabel="Save settings"
      onPrimaryAction={handleSave}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4 text-emerald-600" />
              Storage quotas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quota">Organization quota (GB)</Label>
              <Input
                id="quota"
                type="number"
                min={1}
                value={quotaGb}
                onChange={(e) => setQuotaGb(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Current usage</span>
                <span>
                  {usedGb} / {quotaGb} GB
                </span>
              </div>
              <Progress value={usagePct} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Archive className="h-4 w-4 text-emerald-600" />
              Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retention">Archive after (days)</Label>
              <Input
                id="retention"
                type="number"
                min={1}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value) || 1)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">Auto-archive inactive files</p>
                <p className="text-xs text-slate-500">Move untouched files to archive after retention period</p>
              </div>
              <Switch checked={autoArchive} onCheckedChange={setAutoArchive} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-emerald-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">Upload alerts</p>
                <p className="text-xs text-slate-500">Notify when large uploads complete</p>
              </div>
              <Switch checked={notifyUploads} onCheckedChange={setNotifyUploads} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">Share notifications</p>
                <p className="text-xs text-slate-500">Alert when documents are shared with you</p>
              </div>
              <Switch checked={notifyShares} onCheckedChange={setNotifyShares} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">Quota warnings</p>
                <p className="text-xs text-slate-500">Warn at 80% and 95% of storage quota</p>
              </div>
              <Switch checked={notifyQuota} onCheckedChange={setNotifyQuota} />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="mr-2 h-4 w-4" />
                Save settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageShell>
  );
}
