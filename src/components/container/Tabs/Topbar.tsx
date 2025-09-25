import Button from '../../ui/button/Button';

type Props = {
  userName?: string;
  onLogout: () => void;
};

export default function TopBar({ userName, onLogout }: Props) {
  return (
    <header className='w-full flex items-center justify-between pb-4 border-0 border-black/5 dark:border-white/10'>
      <h1 className='text-lg sm:text-xl font-semibold tracking-tight'>To Do</h1>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 bg-white/70 dark:bg-white/5'>
          <span className='text-sm'>{userName ?? 'Guest'}</span>
          <span aria-hidden>▾</span>
        </div>
        <Button variant='danger' size='sm' onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
