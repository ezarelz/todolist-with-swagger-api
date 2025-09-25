// src/components/container/TodoForm/AddTaskForm.tsx
import { useRef, useState } from 'react';
import type { Priority } from '../../../types/Todo';

type FormState = {
  title: string;
  priority: Priority | '';
  /** HTML date input value: yyyy-mm-dd */
  date: string;
};

type Props = {
  /** Tutup form tanpa menyimpan */
  onCancel: () => void;
  /** Submit form. Caller boleh mengonversi date ke ISO saat memanggil API */
  onSubmit: (payload: {
    title: string;
    priority: Priority;
    date: string;
  }) => Promise<void> | void;
  /** Disable tombol saat menyimpan */
  saving?: boolean;
  /** Prefill date jika tidak ada `initial.date` (format yyyy-mm-dd) */
  defaultDate?: string;
  /** Prefill untuk mode Edit */
  initial?: {
    title?: string;
    priority?: Priority;
    /** ISO string (akan diubah ke yyyy-mm-dd untuk input) */
    date?: string;
  };
};

export default function AddTaskForm({
  onCancel,
  onSubmit,
  saving = false,
  defaultDate,
  initial,
}: Props) {
  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? '',
    priority: initial?.priority ?? '',
    date: initial?.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : defaultDate ?? '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = 'Please enter a task';
    if (!form.priority) e.priority = 'Please select a priority';
    if (!form.date) e.date = 'Please select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: form.title.trim(),
      priority: form.priority as Priority,
      // kirim yyyy-mm-dd; konversi ke ISO dilakukan oleh pemanggil (TodoItem/Home/service)
      date: form.date,
    });
  };

  // === Date picker helpers ===
  const dateRef = useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    const el = dateRef.current;
    if (!el) return;
    // `showPicker` belum diketik di TS untuk semua target; gunakan ts-expect-error agar tetap type-safe.

    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {/* Title */}
      <div>
        <label className='block text-sm mb-1 text-[color:var(--muted)]'>
          Enter your task
        </label>
        <textarea
          rows={3}
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className='w-full rounded-xl px-3 py-2
                     bg-[color:var(--surface)] text-[color:var(--foreground)]
                     border border-[color:var(--border)]
                     focus:outline-none focus:ring-2 focus:ring-[color:var(--foreground)]/15'
        />
        {errors.title && (
          <p className='mt-1 text-xs text-rose-400'>Please Enter Your Task</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className='block text-sm mb-1 text-[color:var(--muted)]'>
          Select priority
        </label>
        <div className='relative'>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                priority: e.target.value as Priority | '',
              }))
            }
            className='w-full rounded-xl px-3 py-2 appearance-none
                       bg-[color:var(--surface)] text-[color:var(--foreground)]
                       border border-[color:var(--border)]
                       focus:outline-none focus:ring-2 focus:ring-[color:var(--foreground)]/15'
          >
            <option value='' disabled hidden>
              Select priority
            </option>
            <option value='LOW'>Low</option>
            <option value='MEDIUM'>Medium</option>
            <option value='HIGH'>High</option>
          </select>
          <span
            aria-hidden
            className='absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]'
          >
            ▾
          </span>
        </div>
        {errors.priority && (
          <p className='mt-1 text-xs text-rose-400'>Please Select Priority</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className='block text-sm mb-1 text-[color:var(--muted)]'>
          Select date
        </label>
        <div className='relative'>
          <input
            ref={dateRef}
            type='date'
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className='w-full rounded-xl px-3 py-2 pr-10
                       bg-[color:var(--surface)] text-[color:var(--foreground)]
                       border border-[color:var(--border)]
                       focus:outline-none focus:ring-2 focus:ring-[color:var(--foreground)]/15'
          />
          <button
            type='button'
            onClick={openDatePicker}
            aria-label='Open date picker'
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1'
          >
            <img
              src='/icons/select-dates.svg'
              alt=''
              className='w-5 h-5 opacity-80'
            />
          </button>
        </div>
        {errors.date && (
          <p className='mt-1 text-xs text-rose-400'>Invalid Date Format</p>
        )}
      </div>

      {/* Actions */}
      <div className='pt-2 flex gap-3'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 rounded-xl border border-[color:var(--border)] px-4 py-2'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={saving}
          className='flex-[2] rounded-xl bg-blue-600 text-white font-semibold px-4 py-2 disabled:opacity-60'
        >
          Save
        </button>
      </div>
    </form>
  );
}
