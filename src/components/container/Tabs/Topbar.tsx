import { useState, useRef, useEffect } from 'react';

type Props = {
  userName?: string;
  onLogout: () => void;
};

export default function TopBar({ userName, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // tutup kalau klik di luar
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <header className='w-full flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10'>
      <h1 className='text-lg sm:text-xl font-semibold tracking-tight'>To Do</h1>

      <div className='relative' ref={popRef}>
        {/* Trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className='group flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5
                     bg-white/70 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition'
        >
          <span className='text-sm font-medium'>{userName ?? 'Guest'}</span>
          <img
            src='/icons/chevron-up.svg'
            alt=''
            className={`icon-themesafe w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform
                        ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Menu */}
        {open && (
          <div
            className='absolute right-0 mt-2 w-40 rounded-xl shadow-lg
                       border border-[color:var(--border)]
                       bg-[color:var(--surface)] text-[color:var(--foreground)]
                       p-2 z-50'
          >
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className='w-full flex items-center gap-2 px-3 py-2 rounded-lg
                         hover:bg-[color:var(--foreground)]/10 transition text-left'
            >
              <img
                src='/icons/logout.svg'
                alt=''
                className='icon-themesafe w-4 h-4 opacity-80'
              />
              <span className='text-sm'>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
