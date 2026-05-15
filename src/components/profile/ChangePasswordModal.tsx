import { useState } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/MyProMod`;

export function ChangePasswordModal({ open, onClose }: Props) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const setField = (key: keyof typeof form, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    setError('');
  };

  const handleClose = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShow({ current: false, newPwd: false, confirm: false });
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post(`${BASE}/ChangePassword`, {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to change password.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Change Password</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">Password changed successfully.</p>
            </div>
          ) : (
            <>
              <PasswordField
                label="Current Password"
                value={form.currentPassword}
                show={show.current}
                onToggle={() => setShow((p) => ({ ...p, current: !p.current }))}
                onChange={(v) => setField('currentPassword', v)}
              />
              <PasswordField
                label="New Password"
                value={form.newPassword}
                show={show.newPwd}
                onToggle={() => setShow((p) => ({ ...p, newPwd: !p.newPwd }))}
                onChange={(v) => setField('newPassword', v)}
              />
              <PasswordField
                label="Confirm New Password"
                value={form.confirmPassword}
                show={show.confirm}
                onToggle={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                onChange={(v) => setField('confirmPassword', v)}
              />
              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-center gap-2 px-6 py-4 border-t border-gray-100">
             <Button
              onClick={handleSubmit}
              disabled={saving}
               className=" bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white  cursor-pointer px-6"
            >
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : <>Change Password</>}
            </Button>
            <Button
                 variant="outline"
              onClick={handleClose}
              disabled={saving}
                className="cursor-pointer px-6"
            >
              Cancel
            </Button>
           
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          placeholder="••••••••"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        >
          {show ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
        </Button>
      </div>
    </div>
  );
}
