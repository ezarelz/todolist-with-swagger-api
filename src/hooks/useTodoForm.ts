import { useState } from 'react';
import type { NewTodo, Priority, Todo } from '../types/Todo';
import { createTodo, updateTodo } from '../services/todo.service';

export type TodoFormMode = 'create' | 'edit';

export type TodoFormValues = NewTodo; // { title, completed, date, priority }

type UseTodoFormOptions = {
  mode?: TodoFormMode;
  initial?: Partial<Todo>; // dipakai saat edit
  onSuccess?: (t: Todo) => void; // callback ke parent
  onError?: (msg: string) => void;
};

const isIsoDate = (s: string) => !Number.isNaN(Date.parse(s));

const normalizeDateToISO = (input?: string) => {
  if (!input) return new Date().toISOString();
  // Jika input dari <input type="date">, bentuknya "YYYY-MM-DD" → jadikan ISO di lokal 00:00
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const d = new Date(input + 'T00:00:00');
    return d.toISOString();
  }
  return isIsoDate(input)
    ? new Date(input).toISOString()
    : new Date().toISOString();
};

export function useTodoForm(opts?: UseTodoFormOptions) {
  const mode = opts?.mode ?? 'create';

  const [values, setValues] = useState<TodoFormValues>({
    title: opts?.initial?.title ?? '',
    completed: opts?.initial?.completed ?? false,
    date: normalizeDateToISO(opts?.initial?.date ?? ''),
    priority: (opts?.initial?.priority as Priority) ?? 'LOW',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const setField = <K extends keyof TodoFormValues>(
    key: K,
    val: TodoFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const validate = (v: TodoFormValues): string | null => {
    if (!v.title.trim()) return 'Title is required.';
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(v.priority))
      return 'Priority must be LOW|MEDIUM|HIGH.';
    if (!v.date || !isIsoDate(v.date)) return 'Date is invalid.';
    return null;
    // completed adalah boolean → aman
  };

  const handleSubmit = async () => {
    setError('');
    const err = validate(values);
    if (err) {
      setError(err);
      opts?.onError?.(err);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const res = await createTodo({
          title: values.title.trim(),
          completed: Boolean(values.completed),
          date: normalizeDateToISO(values.date),
          priority: values.priority,
        });
        opts?.onSuccess?.(res.data);
      } else {
        // mode edit → butuh id
        const id = opts?.initial?.id;
        if (!id) throw new Error('Missing todo id for edit mode.');
        const res = await updateTodo(id, {
          title: values.title.trim(),
          completed: Boolean(values.completed),
          date: normalizeDateToISO(values.date),
          priority: values.priority,
        });
        opts?.onSuccess?.(res.data);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to submit todo.';
      setError(msg);
      opts?.onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    values,
    setField,
    submitting,
    error,
    handleSubmit,
  };
}
