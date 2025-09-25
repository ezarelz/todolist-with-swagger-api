// src/components/pages/home/Home.tsx
import { useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../../../types/Auth';
import type { Todo, Priority } from '../../../types/Todo';

import {
  getTodos,
  createTodo,
  toggleTodoCompleted,
  deleteTodo,
} from '../../../services/todo.service';

import TopBar from '../../container/Tabs/Topbar';
import SearchPriority from '../../container/SearchPriority/SearchPriority';
import TabsBar from '../../container/Tabs/Tabs';
import TodoItem from '../../TodoItem/TodoItem';
import Modal from '../../ui/modal/Modal';
import AddTaskForm from '../../container/TodoForm/AddTaskForm';
import ThemeToggle from '../../ui/ThemeToggle/ThemeToggle';
import Toast from '../../ui/toast/Toast';
import ConfirmDialog from '../../ui/confirmdelete/ConfirmDialog';
import LazyLoader from '../../ui/loader/Loader';

type TabKey = 'today' | 'upcoming' | 'completed';
type PriorityKey = 'ALL' | Priority;

type ToastState = {
  open: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
};

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabKey>('today');
  const [prio, setPrio] = useState<PriorityKey>('ALL');
  const [openAdd, setOpenAdd] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  // Toast (controlled)
  const [toast, setToastState] = useState<ToastState>({
    open: false,
    type: 'info',
    message: '',
  });
  const showToast = (type: ToastState['type'], message: string) =>
    setToastState({ open: true, type, message });
  const hideToast = () => setToastState((t) => ({ ...t, open: false }));

  // Confirm delete dialog
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id?: string;
    loading: boolean;
  }>({ open: false, id: undefined, loading: false });

  const askDelete = (id: string) =>
    setConfirm({ open: true, id, loading: false });

  const confirmDelete = async () => {
    if (!confirm.id) return;
    const id = confirm.id;

    // optimistic remove
    const snapshot = todos;
    setConfirm((c) => ({ ...c, loading: true }));
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodo(id);
      showToast('success', 'Task deleted');
    } catch (err) {
      // rollback jika gagal
      setTodos(snapshot);
      showToast('error', 'Failed to delete task');
      console.error(err);
    } finally {
      setConfirm({ open: false, id: undefined, loading: false });
    }
  };

  // Load user
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      setUser(raw ? (JSON.parse(raw) as AuthUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  // Fetch todos awal
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getTodos({
          page: 1,
          limit: 20,
          sort: 'date',
          order: 'asc',
        });
        setTodos(list);
      } catch (err) {
        setTodos([]);
        showToast('error', 'Failed to load todos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Toggle completed (optimistic + sync)
  const handleToggleCompleted = async (id: string, nextCompleted: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );
    try {
      const server = await toggleTodoCompleted(id, nextCompleted);
      setTodos((prev) => prev.map((t) => (t.id === id ? server : t)));
    } catch (err) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !nextCompleted } : t))
      );
      showToast('error', 'Failed to update task status');
      console.error(err);
    }
  };

  // Filtered view for Today / Upcoming / Completed
  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const byTab = todos.filter((t) => {
      const d = new Date(t.date);
      d.setHours(0, 0, 0, 0);
      if (tab === 'completed') return !!t.completed;
      if (tab === 'today')
        return !t.completed && d.getTime() === today.getTime();
      return !t.completed && d.getTime() > today.getTime();
    });

    const byPrio =
      prio === 'ALL' ? byTab : byTab.filter((t) => t.priority === prio);
    const q = query.trim().toLowerCase();
    return q ? byPrio.filter((t) => t.title.toLowerCase().includes(q)) : byPrio;
  }, [todos, tab, prio, query]);

  return (
    <div className='min-h-dvh flex flex-col items-center bg-[var(--background)] text-[var(--foreground)] px-4'>
      <div className='w-full max-w-3xl py-6 space-y-6'>
        {/* App topbar */}
        <TopBar
          userName={user?.name}
          onLogout={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />

        {/* Headline + Theme toggle (kanan) */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-extrabold'>
              What’s on Your Plan Today?
            </h2>
            <p className='text-sm text-[color:var(--muted)]'>
              Your productivity starts now.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Search + Priority */}
        <SearchPriority
          query={query}
          onQuery={setQuery}
          prio={prio}
          onPrio={setPrio}
        />

        {/* Tabs */}
        <TabsBar tab={tab} onTab={setTab} />

        {/* List header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-semibold'>
              {tab === 'today'
                ? 'Today'
                : tab === 'upcoming'
                ? 'Upcoming'
                : 'Completed'}
            </h3>
            <span className='text-xs rounded-lg px-2 py-1 bg-[color:var(--foreground)]/6 text-[color:var(--foreground)]/80'>
              {filtered.length} Item
            </span>
          </div>
          <span className='text-xs text-[color:var(--foreground)]/60'>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* List */}
        <div className='space-y-3'>
          {loading ? (
            <LazyLoader count={4} />
          ) : filtered.length === 0 ? (
            <div className='border border-dashed rounded-xl p-10 text-center border-[color:var(--border)]'>
              <p className='font-medium'>No todos found</p>
              <p className='text-sm text-[color:var(--muted)]'>
                Try another tab, change priority, or add a new one.
              </p>
            </div>
          ) : (
            filtered.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={handleToggleCompleted}
                onDelete={askDelete} // <-- buka dialog, tidak langsung delete
                onEdited={(updated) =>
                  setTodos((prev) =>
                    prev.map((x) => (x.id === updated.id ? updated : x))
                  )
                }
              />
            ))
          )}
        </div>

        {/* Add Task */}
        <div className='pt-2'>
          <button
            onClick={() => setOpenAdd(true)}
            className='w-full rounded-lg bg-blue-600 text-white font-semibold py-2'
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Modal Add */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title='Add Task'>
        <AddTaskForm
          saving={savingAdd}
          onCancel={() => setOpenAdd(false)}
          onSubmit={async ({ title, priority, date }) => {
            try {
              setSavingAdd(true);
              const created = await createTodo({
                title,
                priority,
                date: new Date(date).toISOString(),
              });
              setTodos((prev) => [created, ...prev]);
              setOpenAdd(false);
              showToast('success', 'Task created');
            } catch (err) {
              console.error('Create todo failed:', err);
              showToast('error', 'Failed to create task');
            } finally {
              setSavingAdd(false);
            }
          }}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        title='Delete To-Do'
        description='Do you want to delete this?'
        confirmText='Delete'
        cancelText='Cancel'
        onCancel={() =>
          setConfirm({ open: false, id: undefined, loading: false })
        }
        onConfirm={confirmDelete}
      />

      {/* Toast */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
