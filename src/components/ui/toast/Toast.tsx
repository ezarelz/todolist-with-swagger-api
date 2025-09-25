// src/components/ui/toast/Toast.tsx
import { useEffect } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

type ToastProps = {
  open: boolean; // controlled
  type?: ToastKind; // default: 'info'
  message: string;
  duration?: number; // ms, auto close (default 2500)
  onClose: () => void; // parent closes
  className?: string;
};

export default function Toast({
  open,
  type = 'info',
  message,
  duration = 2500,
  onClose,
  className = '',
}: ToastProps) {
  // Auto hide
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  // Hidden by default
  if (!open) return null;

  const color =
    type === 'success'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : type === 'error'
      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      : 'bg-sky-500/15 text-sky-300 border-sky-500/30';

  return (
    <div
      role='status'
      aria-live='polite'
      className={`fixed top-4 right-4 z-[1000] ${className}`}
    >
      <div
        className={`border rounded-xl px-4 py-3 shadow-xl backdrop-blur ${color}`}
      >
        <div className='flex items-center gap-3'>
          <span className='text-sm font-medium'>{message}</span>
          <button
            onClick={onClose}
            className='ml-2 text-xs opacity-70 hover:opacity-100'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
