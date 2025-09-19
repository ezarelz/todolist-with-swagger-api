import React from 'react';
import { useTodoForm } from '../../../hooks/useTodoForm';
import Button from '../../ui/button/Button';

type TodoFormProps = {
  mode?: 'create' | 'edit';
  initial?: {
    id?: string;
    title?: string;
    date?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    completed?: boolean;
  };
  onSuccess?: (t: unknown) => void; // biarkan fleksibel
  onError?: (msg: string) => void;
  className?: string;
};

const formatDateInput = (iso: string) => {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

const TodoForm: React.FC<TodoFormProps> = ({
  mode = 'create',
  initial,
  onSuccess,
  onError,
  className = '',
}) => {
  const { values, setField, submitting, error, handleSubmit } = useTodoForm({
    mode,
    initial,
    onSuccess,
    onError,
  });

  return (
    <div
      className={
        'rounded-2xl border border-gray-300 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 ' +
        className
      }
    >
      <h3 className='text-lg font-semibold mb-3'>
        {mode === 'create' ? 'Add New Task' : 'Edit Task'}
      </h3>

      <div className='space-y-3'>
        {/* Title */}
        <div>
          <label className='block text-sm mb-1'>Title</label>
          <input
            className='w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700'
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder='e.g. Build a Responsive Website'
          />
        </div>

        {/* Date */}
        <div>
          <label className='block text-sm mb-1'>Date</label>
          <input
            type='date'
            className='w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700'
            value={formatDateInput(values.date)}
            onChange={(e) => setField('date', e.target.value)}
          />
        </div>

        {/* Priority */}
        <div>
          <label className='block text-sm mb-1'>Priority</label>
          <select
            className='w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700'
            value={values.priority}
            onChange={(e) =>
              setField('priority', e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
            }
          >
            <option value='LOW'>LOW</option>
            <option value='MEDIUM'>MEDIUM</option>
            <option value='HIGH'>HIGH</option>
          </select>
        </div>

        {/* Completed */}
        <div className='flex items-center gap-2'>
          <input
            id='completed'
            type='checkbox'
            checked={values.completed}
            onChange={(e) => setField('completed', e.target.checked)}
          />
          <label htmlFor='completed' className='text-sm'>
            Mark as completed
          </label>
        </div>

        {/* Error */}
        {error && <p className='text-sm text-red-500'>{error}</p>}

        {/* Actions */}
        <div className='flex gap-2 pt-2'>
          <Button
            variant='primary'
            size='md'
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? 'Saving…'
              : mode === 'create'
              ? 'Add Task'
              : 'Save Changes'}
          </Button>

          {mode === 'edit' && (
            <Button
              variant='outline'
              size='md'
              onClick={() => {
                if (initial?.title) setField('title', initial.title);
                if (initial?.date) setField('date', initial.date);
                if (initial?.priority) setField('priority', initial.priority);
                if (typeof initial?.completed === 'boolean') {
                  setField('completed', initial.completed);
                }
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoForm;
