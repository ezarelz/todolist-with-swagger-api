type TabKey = 'today' | 'upcoming' | 'completed';

type Props = {
  tab: TabKey;
  onTab: (k: TabKey) => void;
};

export default function TabsBar({ tab, onTab }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div
      className='
        flex justify-between rounded-2xl
        border border-[color:var(--border)]
        bg-[color:var(--foreground)]/5 p-1
      '
    >
      {tabs.map(({ key, label }) => {
        const isActive = tab === key;
        return (
          <button
            key={key}
            onClick={() => onTab(key)}
            className={`
              flex-1 text-center rounded-xl py-2 font-semibold transition-colors
              ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-[color:var(--foreground)]/70 hover:bg-[color:var(--foreground)]/10'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
