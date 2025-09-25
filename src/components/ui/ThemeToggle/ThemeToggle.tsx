import { useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle({
  className = '',
}: {
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>('light');

  // === Setter util ===
  const setDocumentTheme = (next: Theme, animate = true) => {
    const root = document.documentElement;

    // Animasi transisi
    if (animate) {
      root.classList.add('theme-transition');
      window.setTimeout(() => root.classList.remove('theme-transition'), 250);
    }

    // Terapkan mode
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
  };

  // === Initial mount ===
  useLayoutEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const next: Theme =
      stored ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');

    setTheme(next);
    setDocumentTheme(next, false); // tanpa animasi saat pertama kali render
  }, []);

  // === Handler toggle ===
  const applyTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem('theme', next);
    setDocumentTheme(next);
  };

  return (
    <div
      className={`flex items-center gap-1 rounded-2xl p-1
        bg-[color:var(--foreground)]/10
        ring-1 ring-[color:var(--border)]
        backdrop-blur ${className}`}
    >
      {/* Light Button */}
      <button
        type='button'
        aria-pressed={theme === 'light'}
        onClick={() => applyTheme('light')}
        className={`size-9 grid place-items-center rounded-xl transition-all duration-300
          ${
            theme === 'light'
              ? 'bg-blue-600 text-white shadow-sm scale-[1.05]'
              : ''
          }`}
        title='Light mode'
      >
        <img src='/icons/sun.svg' alt='Sun icon' className='w-4 h-4' />
      </button>

      {/* Dark Button */}
      <button
        type='button'
        aria-pressed={theme === 'dark'}
        onClick={() => applyTheme('dark')}
        className={`size-9 grid place-items-center rounded-xl transition-all duration-300
          ${
            theme === 'dark'
              ? 'bg-blue-600 text-white shadow-sm scale-[1.05]'
              : ''
          }`}
        title='Dark mode'
      >
        <img src='/icons/moon.svg' alt='Moon icon' className='w-4 h-4' />
      </button>
    </div>
  );
}
