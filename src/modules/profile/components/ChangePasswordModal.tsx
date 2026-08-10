import { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { PwdChgDto } from '@/modules/hr/types/employee';
import { useChangePassword } from '@/modules/hr/services/employee/user/user.queries';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  open,
  onClose,
}: Props) {
  const [form, setForm] = useState<PwdChgDto>({
    oldPwd: '',
    newPwd: '',
  });

  const [show, setShow] = useState({
    oldPwd: false,
    newPwd: false,
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    mutateAsync,
    isPending,
  } = useChangePassword();

  if (!open) return null;

  const setField = (
    key: keyof PwdChgDto,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError('');
  };

  const handleClose = () => {
    setForm({
      oldPwd: '',
      newPwd: '',
    });

    setShow({
      oldPwd: false,
      newPwd: false,
    });

    setSuccess(false);
    setError('');

    onClose();
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.oldPwd || !form.newPwd) {
      setError('All fields are required');
      return;
    }

    if (form.newPwd.length < 6) {
      setError(
        'Password must be at least 6 characters'
      );
      return;
    }

    try {
      await mutateAsync(form);

      setSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (e: any) {
      setError(
        e?.message ??
          'Failed to change password'
      );
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

            <h2 className="text-sm font-semibold text-gray-800">
              Change Password
            </h2>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4"
        >
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-6 h-6" />
              </div>

              <p className="text-sm font-medium text-gray-700">
                Password changed successfully.
              </p>
            </div>
          ) : (
            <>
              <PasswordField
                label="Current Password"
                value={form.oldPwd}
                type={
                  show.oldPwd
                    ? 'text'
                    : 'password'
                }
                visible={show.oldPwd}
                toggle={() =>
                  setShow((prev) => ({
                    ...prev,
                    oldPwd: !prev.oldPwd,
                  }))
                }
                onChange={(value) =>
                  setField('oldPwd', value)
                }
              />

              <PasswordField
                label="New Password"
                value={form.newPwd}
                type={
                  show.newPwd
                    ? 'text'
                    : 'password'
                }
                visible={show.newPwd}
                toggle={() =>
                  setShow((prev) => ({
                    ...prev,
                    newPwd: !prev.newPwd,
                  }))
                }
                onChange={(value) =>
                  setField('newPwd', value)
                }
              />

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </>
          )}

          {/* Footer */}
          {!success && (
            <div className="flex justify-center gap-2 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer px-6"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Change Password</>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="cursor-pointer px-6"
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  type: string;
  visible: boolean;
  toggle: () => void;
  onChange: (value: string) => void;
}

function PasswordField({
  label,
  value,
  type,
  visible,
  toggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>

      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder="••••••••"
          className="pr-10"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        >
          {visible ? (
            <EyeOff className="w-4 h-4 text-gray-400" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>
    </div>
  );
}