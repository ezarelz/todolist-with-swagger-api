import { useState } from 'react';
import type { Todo, Priority } from '../../types/Todo';
import Modal from '../ui/modal/Modal';
import AddTaskForm from '../container/TodoForm/AddTaskForm';
import { updateTodo } from '../../services/todo.service';

type Props = {
  todo: Todo;
  onToggle: (id: string, nextCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdited?: (updated: Todo) => void;
};

const prioBadge = (p: Priority) =>
  `px-2 py-1 rounded text-xs font-medium ${
    p === 'high'
      ? 'bg-pink-500/20 text-pink-400'
      : p === 'medium'
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-green-500/20 text-green-400'
  }`;

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdited,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // ✅ PERBAIKAN: Handle toggle dengan optimistic update + rollback
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextCompleted = e.target.checked;
    const previousCompleted = todo.completed;

    // 1️⃣ Update UI dulu (optimistic)
    onToggle(todo.id, nextCompleted);
    setToggling(true);

    try {
      // 2️⃣ Kirim ke backend
      await updateTodo(todo.id, {
        completed: nextCompleted,
      });

      console.log('✅ Todo updated:', todo.id, nextCompleted);
    } catch (err) {
      // 3️⃣ Rollback jika gagal
      console.error('❌ Toggle failed, rolling back:', err);
      onToggle(todo.id, previousCompleted);

      // Opsional: tampilkan toast error
      alert('Failed to update todo. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className='relative rounded-xl p-4 flex items-center justify-between 
      bg-[color:var(--surface)] border border-[color:var(--border)] transition-opacity'
      style={{ opacity: toggling ? 0.5 : 1 }}
    >
      {/* Kiri: checkbox + detail */}
      <div className='flex items-center gap-3'>
        <input
          type='checkbox'
          className='size-5 rounded-md accent-blue-600 cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50'
          checked={todo.completed}
          disabled={toggling}
          onChange={handleToggle}
        />

        <div>
          <p
            className={`font-medium ${
              todo.completed ? 'line-through opacity-60' : ''
            }`}
          >
            {todo.task}
          </p>

          <div className='flex items-center gap-3 mt-1'>
            <span className='text-xs text-[color:var(--muted)]'>
              {new Date(todo.date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </span>

            <span className={prioBadge(todo.priority)}>
              {todo.priority === 'high'
                ? 'High'
                : todo.priority === 'medium'
                ? 'Medium'
                : 'Low'}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol menu */}
      <button
        className='text-lg opacity-70 hover:opacity-100 transition px-2'
        onClick={() => setMenuOpen((v) => !v)}
      >
        ⋯
      </button>

      {menuOpen && (
        <div
          className='absolute right-2 top-12 z-10 w-44 rounded-xl p-2 shadow-lg 
          bg-[color:var(--surface)] border border-[color:var(--border)]'
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            className='w-full text-left px-3 py-2 rounded-lg 
            hover:bg-[color:var(--foreground)]/5 flex items-center gap-2'
            onClick={() => {
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            <img src='/icons/edit.svg' alt='Edit' className='w-4 h-4' />
            <span>Edit</span>
          </button>
          <button
            className='w-full text-left px-3 py-2 rounded-lg 
            hover:bg-[color:var(--foreground)]/5 text-pink-400 flex items-center gap-2'
            onClick={() => onDelete(todo.id)}
          >
            <img src='/icons/delete.svg' alt='Delete' className='w-4 h-4' />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Modal Edit */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title='Edit Task'
      >
        <AddTaskForm
          saving={saving}
          initial={{
            title: todo.task,
            priority: todo.priority,
            date: todo.date,
          }}
          onCancel={() => setEditOpen(false)}
          onSubmit={async ({ title, priority, date }) => {
            try {
              setSaving(true);
              const payload = {
                task: title,
                priority,
                date: new Date(date).toISOString(),
              };

              await updateTodo(todo.id, payload);

              const updated: Todo = {
                ...todo,
                ...payload,
                updatedAt: new Date().toISOString(),
              };

              onEdited?.(updated);
              setEditOpen(false);
            } catch (err) {
              console.error('Failed to update todo:', err);
              alert('Failed to save changes');
            } finally {
              setSaving(false);
            }
          }}
        />
      </Modal>
    </div>
  );
}
