// src/components/pages/home/Home.tsx
import { useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../../../types/Auth';
import type { Todo } from '../../../types/Todo';
import Button from '../../ui/button/Button';
import { useTheme } from '../../../hooks/useTheme';
import {
  getTodos,
  updateTodo,
  deleteTodo,
} from '../../../services/todo.service';
import TodoForm from '../../container/TodoForm/TodoForm';

type TabKey = 'today' | 'upcoming' | 'completed';
type PriorityKey = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

const Home = () => {
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabKey>('today');
  const [prio, setPrio] = useState<PriorityKey>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null); // kebab menu per item

  // Load user (greeting)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      setUser(raw ? (JSON.parse(raw) as AuthUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const res = await getTodos({
          page: 1,
          limit: 20,
          sortBy: 'date',
          order: 'asc',
        });
        setTodos(res.data.todos);
      } catch {
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    window.location.reload();
  };

  // Toggle completed (optimistic)
  const handleToggleCompleted = async (todo: Todo) => {
    const nextCompleted = !todo.completed;

    // optimistic UI
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: nextCompleted } : t
      )
    );

    try {
      await updateTodo(todo.id, { completed: nextCompleted });
      // kalau backend mengembalikan todo baru dan kamu ingin sinkron penuh:
      // const { data } = await updateTodo(todo.id, { completed: nextCompleted });
      // setTodos((prev) => prev.map((t) => (t.id === todo.id ? data : t)));
    } catch (e) {
      // rollback jika gagal
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t
        )
      );
      console.error('Failed to update todo', e);
    }
  };

  // Delete todo (dengan confirm)
  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this task?');
    if (!ok) return;

    // optimistic remove
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setOpenMenuId(null);

    try {
      await deleteTodo(id);
    } catch (e) {
      // rollback
      setTodos(snapshot);
      console.error('Failed to delete todo', e);
    }
  };

  // ---- UI derivations -------------------------------------------------------
  const filtered = useMemo(() => {
    const todayISO = new Date();
    todayISO.setHours(0, 0, 0, 0);

    const byTab = todos.filter((t) => {
      const d = new Date(t.date);
      d.setHours(0, 0, 0, 0);

      if (tab === 'completed') return Boolean(t.completed);
      if (tab === 'today')
        return !t.completed && d.getTime() === todayISO.getTime();
      // upcoming
      return !t.completed && d.getTime() > todayISO.getTime();
    });

    const byPrio =
      prio === 'ALL' ? byTab : byTab.filter((t) => t.priority === prio);

    const q = query.trim().toLowerCase();
    return q ? byPrio.filter((t) => t.title.toLowerCase().includes(q)) : byPrio;
  }, [todos, tab, prio, query]);

  // Badge style
  const prioBadge = (p: string) =>
    `px-2 py-1 rounded text-xs font-medium ${
      p === 'HIGH'
        ? 'bg-pink-500/20 text-pink-400'
        : p === 'MEDIUM'
        ? 'bg-yellow-500/20 text-yellow-400'
        : 'bg-green-500/20 text-green-400'
    }`;

  return (
    <div className='min-h-dvh flex flex-col items-center bg-white text-gray-900 dark:bg-black dark:text-white transition-colors px-4'>
      <div className='w-full max-w-3xl py-10 space-y-6'>
        {/* Top bar: greeting + actions */}
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-white/60'>
              Hello{user?.name ? `, ${user.name}` : ' Guest'} 👋
            </p>
            <h1 className='text-2xl sm:text-3xl font-bold mt-1'>
              What’s on Your Plan Today?
            </h1>
            <p className='text-sm text-gray-500 dark:text-white/60 mt-1'>
              Your productivity starts now.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {/* Theme pill */}
            <div className='flex items-center gap-1 rounded-2xl border border-gray-200 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1'>
              <button
                type='button'
                onClick={() => {
                  if (theme === 'dark') toggleTheme();
                }}
                className={`rounded-xl p-2 transition-colors ${
                  theme === 'light' ? 'bg-blue-600' : 'bg-transparent'
                }`}
                title='Light'
                aria-label='Light theme'
              >
                <img
                  src='/icons/sun.svg'
                  alt=''
                  className={`h-4 w-4 ${
                    theme === 'light' ? 'invert-0' : 'opacity-80'
                  }`}
                />
              </button>

              <button
                type='button'
                onClick={() => {
                  if (theme === 'light') toggleTheme();
                }}
                className={`rounded-xl p-2 transition-colors ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-transparent'
                }`}
                title='Dark'
                aria-label='Dark theme'
              >
                <img src='/icons/moon.svg' alt='' className='h-4 w-4' />
              </button>
            </div>

            {/* Logout */}
            <Button variant='danger' size='sm' onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Search + Priority filter */}
        <div className='flex items-center gap-3'>
          <div className='relative flex-1'>
            <img
              src='/icons/search.svg'
              alt=''
              className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70 pointer-events-none'
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search'
              className='w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5
               px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500/40'
            />
          </div>

          <div className='relative'>
            <img
              src='/icons/filter.svg'
              alt=''
              className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70 pointer-events-none'
            />

            <select
              value={prio}
              onChange={(e) =>
                setPrio(
                  e.target.value === 'LOW' ||
                    e.target.value === 'MEDIUM' ||
                    e.target.value === 'HIGH'
                    ? (e.target.value as PriorityKey)
                    : 'ALL'
                )
              }
              className='pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-white/10
               bg-white dark:bg-neutral-900 text-gray-800 dark:text-white text-sm
               appearance-none focus:ring-2 focus:ring-blue-500/40'
              title='Priority'
              aria-label='Priority filter'
            >
              <option value='ALL'>Priority: All</option>
              <option value='HIGH'>High</option>
              <option value='MEDIUM'>Medium</option>
              <option value='LOW'>Low</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex justify-between rounded-2xl border border-gray-300 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1'>
          {(['today', 'upcoming', 'completed'] as TabKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 text-center rounded-xl py-2 font-semibold transition-colors ${
                tab === k
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-white/70'
              }`}
            >
              {k === 'today'
                ? 'Today'
                : k === 'upcoming'
                ? 'Upcoming'
                : 'Completed'}
            </button>
          ))}
        </div>

        {/* Add form (toggle) */}
        {showForm && (
          <TodoForm
            mode='create'
            onSuccess={(newTodo) => {
              setTodos((prev) => [newTodo as Todo, ...prev]);
              setShowForm(false);
            }}
            onError={() => {}}
            className='mt-2'
          />
        )}

        {/* List header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>
              {tab === 'today'
                ? 'Today'
                : tab === 'upcoming'
                ? 'Upcoming'
                : 'Completed'}
            </h2>
            <span className='text-xs rounded-lg px-2 py-1 bg-white/60 dark:bg-white/10'>
              {filtered.length} Item
            </span>
          </div>
          <span className='text-xs text-gray-500 dark:text-white/50'>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Todo List */}
        <div className='space-y-3'>
          {loading ? (
            <div className='rounded-xl border border-gray-300 dark:border-white/10 p-4 text-center'>
              Loading todos...
            </div>
          ) : filtered.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-300 dark:border-white/10 p-10 text-center'>
              <p className='font-medium'>No todos found</p>
              <p className='text-sm text-gray-600 dark:text-white/70 mt-1'>
                Try another tab, change priority, or add a new one.
              </p>
            </div>
          ) : (
            filtered.map((todo) => (
              <div
                key={todo.id}
                className='relative rounded-xl border border-gray-300 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 flex items-center justify-between'
              >
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    className='size-5 rounded-md accent-blue-600'
                    checked={Boolean(todo.completed)}
                    onChange={() => handleToggleCompleted(todo)}
                  />
                  <div>
                    <p
                      className={`font-medium leading-tight ${
                        todo.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {todo.title}
                    </p>
                    <div className='flex items-center gap-3 mt-1'>
                      <span className='text-xs text-gray-500 dark:text-white/60'>
                        {new Date(todo.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={prioBadge(todo.priority)}>
                        {todo.priority === 'HIGH'
                          ? 'High'
                          : todo.priority === 'MEDIUM'
                          ? 'Medium'
                          : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kebab button */}
                <button
                  className='text-lg opacity-70 hover:opacity-100 transition px-2'
                  title='More'
                  aria-label='More'
                  onClick={() =>
                    setOpenMenuId((cur) => (cur === todo.id ? null : todo.id))
                  }
                >
                  ⋯
                </button>

                {/* Dropdown Menu */}
                {openMenuId === todo.id && (
                  <div
                    className='absolute right-2 top-12 z-10 w-40 rounded-xl border border-white/10 bg-black text-white p-2 shadow-lg'
                    onMouseLeave={() => setOpenMenuId(null)}
                  >
                    <button
                      className='w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2'
                      onClick={() => {
                        setOpenMenuId(null);
                        // TODO: buka modal edit / toggle form edit
                        alert('Edit placeholder');
                      }}
                    >
                      ✏️ <span>Edit</span>
                    </button>
                    <button
                      className='w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-pink-400 flex items-center gap-2'
                      onClick={() => handleDelete(todo.id)}
                    >
                      🗑️ <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Task button */}
        <div className='pt-2'>
          <Button
            variant='primary'
            size='md'
            className='w-full'
            onClick={() => setShowForm((v) => !v)}
          >
            + Add Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
