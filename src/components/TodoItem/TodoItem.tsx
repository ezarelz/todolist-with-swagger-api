import { useState } from 'react';
import type { Todo, Priority } from '../../types/Todo';
import Modal from '../ui/modal/Modal';
import AddTaskForm from '../container/TodoForm/AddTaskForm';
import { updateTodo } from '../../services/todo.service';

type Props = {
  todo: Todo;
  /** Toggle completed dengan id & nilai baru */
  onToggle: (id: string, nextCompleted: boolean) => void;
  onDelete: (id: string) => void;
  /** Callback sesudah edit, kirim Todo penuh */
  onEdited?: (updated: Todo) => void;
};

const prioBadge = (p: Priority) =>
  `px-2 py-1 rounded text-xs font-medium ${
    p === 'HIGH'
      ? 'bg-pink-500/20 text-pink-400'
      : p === 'MEDIUM'
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

  return (
    <div className='relative rounded-xl p-4 flex items-center justify-between bg-[color:var(--surface)] border border-[color:var(--border)]'>
      {/* Kiri: checkbox + detail */}
      <div className='flex items-center gap-3'>
        <input
          type='checkbox'
          className='size-5 rounded-md accent-blue-600 cursor-pointer'
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
        />
        <div>
          <p
            className={`font-medium ${
              todo.completed ? 'line-through opacity-60' : ''
            }`}
          >
            {todo.title}
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
              {todo.priority === 'HIGH'
                ? 'High'
                : todo.priority === 'MEDIUM'
                ? 'Medium'
                : 'Low'}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol menu (… ) */}
      <button
        className='text-lg opacity-70 hover:opacity-100 transition px-2'
        onClick={() => setMenuOpen((v) => !v)}
      >
        ⋯
      </button>

      {menuOpen && (
        <div
          className='absolute right-2 top-12 z-10 w-44 rounded-xl p-2 shadow-lg bg-[color:var(--surface)] border border-[color:var(--border)]'
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            className='w-full text-left px-3 py-2 rounded-lg hover:bg-[color:var(--foreground)]/5 flex items-center gap-2'
            onClick={() => {
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            <img src='/icons/edit.svg' alt='Edit' className='w-4 h-4' />
            <span>Edit</span>
          </button>
          <button
            className='w-full text-left px-3 py-2 rounded-lg hover:bg-[color:var(--foreground)]/5 text-pink-400 flex items-center gap-2'
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
            title: todo.title,
            priority: todo.priority,
            date: todo.date,
          }}
          onCancel={() => setEditOpen(false)}
          onSubmit={async ({ title, priority, date }) => {
            try {
              setSaving(true);
              const payload = {
                title,
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
            } finally {
              setSaving(false);
            }
          }}
        />
      </Modal>
    </div>
  );
}
