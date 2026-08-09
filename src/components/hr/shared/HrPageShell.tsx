import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  error?: string | null;
  loading?: boolean;
  children: React.ReactNode;
};

const HrPageShell: React.FC<Props> = ({
  title, subtitle, actionLabel, onAction, search, onSearchChange, error, loading, children,
}) => (
  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 min-h-screen p-6 space-y-4">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-green-700 hover:bg-green-800 text-white">{actionLabel}</Button>
      )}
    </div>

    {onSearchChange && (
      <Input
        value={search || ''}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search…"
        className="max-w-md bg-white"
      />
    )}

    {error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">{error}</div>
    )}
    {loading ? (
      <div className="bg-white border rounded-lg p-8 text-center text-gray-500">Loading…</div>
    ) : (
      children
    )}
  </motion.section>
);

export default HrPageShell;
