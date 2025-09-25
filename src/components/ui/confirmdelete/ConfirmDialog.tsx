import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
};

export default function ConfirmDialog({
  open,
  title = 'Delete To-Do',
  description = 'Do you want to delete this?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
  className = '',
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // focus ke Cancel saat modal dibuka
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      aria-modal='true'
      role='dialog'
      className={`fixed inset-0 z-[1000] grid place-items-center ${className}`}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60'
        onClick={loading ? undefined : onCancel}
      />

      {/* Card */}
      <div
        className='
        relative mx-4 w-full max-w-md rounded-2xl
        bg-[var(--surface)] text-[var(--foreground)]
        border border-[var(--border)]
        shadow-2xl p-5
      '
      >
        <h3 className='text-base font-semibold'>{title}</h3>
        <p className='mt-2 text-sm text-[color:var(--muted)]'>{description}</p>

        <div className='mt-5 flex justify-end gap-2'>
          <button
            ref={cancelRef}
            type='button'
            disabled={loading}
            onClick={onCancel}
            className='px-3 py-1.5 rounded-lg text-sm font-medium
              bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/15
              disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            type='button'
            disabled={loading}
            onClick={onConfirm}
            className='px-3 py-1.5 rounded-lg text-sm font-semibold
              bg-rose-600 text-white hover:bg-rose-500
              disabled:opacity-60'
          >
            {loading ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
