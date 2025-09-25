type PriorityKey = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

type Props = {
  query: string;
  onQuery: (v: string) => void;
  prio: PriorityKey;
  onPrio: (v: PriorityKey) => void;
};

export default function SearchPriority({
  query,
  onQuery,
  prio,
  onPrio,
}: Props) {
  return (
    <div className='flex items-center gap-3'>
      {/* Search input */}
      <div className='relative flex-1'>
        {/* icon kaca pembesar */}
        <img
          src='/icons/search.svg'
          alt=''
          aria-hidden
          className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70'
        />

        <input
          type='text'
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder='Search'
          aria-label='Search todos'
          className='
            w-full pl-9 pr-3 py-2 rounded-xl text-sm
            bg-[color:var(--surface)] text-[color:var(--foreground)]
            placeholder-[color:var(--muted)]
            border border-[color:var(--border)]
            focus:outline-none focus:ring-2 focus:ring-[color:var(--foreground)]/15
          '
        />
      </div>

      {/* Select Priority  */}
      <div className='relative'>
        {/* ikon kiri */}
        <img
          src='/icons/filter.svg'
          alt=''
          aria-hidden
          className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70'
        />

        {/* label overlay 'Priority' saat prio === 'ALL' */}
        {prio === 'ALL' && (
          <span className='pointer-events-none absolute inset-0 flex items-center justify-center gap-2 pl-8 pr-8 text-sm text-[color:var(--foreground)]'>
            Priority
          </span>
        )}

        <select
          value={prio}
          onChange={(e) => {
            const v = e.target.value as PriorityKey;
            onPrio(v === 'LOW' || v === 'MEDIUM' || v === 'HIGH' ? v : 'ALL');
          }}
          aria-label='Priority filter'
          title='Priority'
          className={`
            pl-8 pr-8 py-2 rounded-xl text-sm cursor-pointer appearance-none
            bg-[color:var(--surface)] 
            border border-[color:var(--border)]
            focus:outline-none focus:ring-2 focus:ring-[color:var(--foreground)]/15
            ${
              prio === 'ALL'
                ? 'text-transparent caret-transparent'
                : 'text-[color:var(--foreground)]'
            }
          `}
          style={{ minWidth: 130 }}
        >
          <option value='ALL'>All</option>
          <option value='LOW'>Low</option>
          <option value='MEDIUM'>Medium</option>
          <option value='HIGH'>High</option>
        </select>

        {/* caret kanan */}
        <span
          aria-hidden
          className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]'
        >
          ▾
        </span>
      </div>
    </div>
  );
}
