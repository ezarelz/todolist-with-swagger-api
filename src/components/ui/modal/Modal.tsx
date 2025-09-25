import { useEffect } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className='
        fixed inset-0 z-50
        bg-black/60 backdrop-blur-sm
        flex items-center justify-center p-4
      '
      onClick={onClose}
      aria-modal='true'
      role='dialog'
    >
      <div
        className='
          w-full max-w-lg rounded-2xl
          bg-[color:var(--surface)] text-[color:var(--foreground)]
          border border-[color:var(--border)]
          shadow-2xl
        '
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between px-5 py-4 border-b border-[color:var(--border)]'>
          <h3 className='text-xl font-semibold'>{title ?? 'Add Task'}</h3>
          <button
            onClick={onClose}
            aria-label='Close'
            className='text-[color:var(--muted)] text-xl leading-none'
          >
            ×
          </button>
        </div>

        <div className='p-5'>{children}</div>
      </div>
    </div>
  );
}
