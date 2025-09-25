import { Skeleton } from './Skeleton';

export default function LazyLoader({ count = 3 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='rounded-xl border border-[color:var(--border)] p-4 flex items-center gap-3'
        >
          {/* Checkbox dummy */}
          <Skeleton className='size-5 rounded-md' />
          <div className='flex-1 space-y-2'>
            {/* Title bar */}
            <Skeleton className='h-4 w-2/3' />
            {/* Date + prio badge */}
            <div className='flex gap-3'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-12' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
