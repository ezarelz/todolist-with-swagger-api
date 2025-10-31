import { useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../../../types/Auth';
import type { Todo, Priority } from '../../../types/Todo';

import {
  getAllTodos,
  getTodosCompleted,
  createTodo,
  toggleTodoCompleted,
  deleteTodo, // ✅ tambah import deleteTodo
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

  // UI states
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabKey>('today');
  const [prio, setPrio] = useState<PriorityKey>('ALL');
  const [openAdd, setOpenAdd] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    open: false,
    type: 'info',
    message: '',
  });
  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ open: true, type, message });
  const hideToast = () => setToast((t) => ({ ...t, open: false }));

  // Confirm delete
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id?: string;
    loading: boolean;
  }>({
    open: false,
    id: undefined,
    loading: false,
  });
  const askDelete = (id: string) =>
    setConfirm({ open: true, id, loading: false });

  /** ✅ Confirm delete — now calls backend DELETE /todos/:id */
  const confirmDelete = async () => {
    if (!confirm.id) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      await deleteTodo(confirm.id); // ✅ call backend
      setTodos((prev) => prev.filter((t) => t.id !== confirm.id));
      showToast('success', 'Task deleted successfully');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete task');
    } finally {
      setConfirm({ open: false, id: undefined, loading: false });
    }
  };

  // ✅ Load user (keep simple, fallback handled by TopBar)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? parsed);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Fetch todos by tab
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let list: Todo[] = [];

        if (tab === 'completed') {
          list = await getTodosCompleted();
        } else {
          list = await getAllTodos();
        }

        // Optional: local filter for deleted IDs
        const deletedIds = JSON.parse(
          localStorage.getItem('deletedTodos') || '[]'
        );
        const filtered = list.filter((t) => !deletedIds.includes(t.id));

        // ✅ Restore completed state (local override)
        const completedState = JSON.parse(
          localStorage.getItem('completedState') || '{}'
        );
        const merged = filtered.map((t) =>
          completedState[t.id] !== undefined
            ? { ...t, completed: completedState[t.id] }
            : t
        );

        setTodos(merged);
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to load todos');
        setTodos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);

  // ✅ Toggle complete
  const handleToggleCompleted = (id: string, nextCompleted: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    const completedState = JSON.parse(
      localStorage.getItem('completedState') || '{}'
    );
    completedState[id] = nextCompleted;
    localStorage.setItem('completedState', JSON.stringify(completedState));

    toggleTodoCompleted(id, nextCompleted)
      .then(() =>
        showToast(
          'success',
          nextCompleted ? 'Marked complete' : 'Marked incomplete'
        )
      )
      .catch(() => showToast('info', 'Offline toggle saved locally'));
  };

  // Filter todos
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
    return q ? byPrio.filter((t) => t.task.toLowerCase().includes(q)) : byPrio;
  }, [todos, tab, prio, query]);

  return (
    <div className='min-h-dvh flex flex-col items-center bg-[var(--background)] text-[var(--foreground)] px-4'>
      <div className='w-full max-w-3xl py-6 space-y-6'>
        <TopBar
          userName={user?.name}
          onLogout={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />
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

        <SearchPriority
          query={query}
          onQuery={setQuery}
          prio={prio}
          onPrio={setPrio}
        />
        <TabsBar tab={tab} onTab={setTab} />

        {/* === Todos list === */}
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
                onDelete={askDelete}
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

      {/* === Add Modal === */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title='Add Task'>
        <AddTaskForm
          saving={savingAdd}
          onCancel={() => setOpenAdd(false)}
          onSubmit={async ({ title, priority, date }) => {
            try {
              setSavingAdd(true);
              const created = await createTodo({
                task: title,
                priority,
                date: new Date(date).toISOString().split('T')[0],
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

      {/* ✅ Confirm Delete (now backend-based) */}
      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        title='Delete To-Do'
        description='Are you sure you want to delete this task? This action cannot be undone.'
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
