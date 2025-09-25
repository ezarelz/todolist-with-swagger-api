import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { register as registerApi } from '../../../services/auth.service';
import {
  registerSchema,
  type RegisterFields,
} from '../../../lib/validation/auth.validation';

type ApiError = { message?: string; error?: string; statusCode?: number };

function readableError(err: unknown): string {
  const ax = err as AxiosError<ApiError>;
  const status = ax?.response?.status;
  const apiMsg = ax?.response?.data?.message || ax?.response?.data?.error;
  if (!status) return 'Network error, please check your connection.';
  if (status >= 500)
    return `Server error, please try again later. (status: ${status})`;
  return apiMsg ? String(apiMsg) : `Request failed (status: ${status})`;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErr, setFieldErr] = useState<
    Partial<Record<keyof RegisterFields, string>>
  >({});

  const validate = () => {
    const res = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (res.success) {
      setFieldErr({});
      return true;
    }
    const next: Partial<Record<keyof RegisterFields, string>> = {};
    res.error.issues.forEach((i) => {
      const k = i.path[0] as keyof RegisterFields;
      next[k] = i.message;
    });
    setFieldErr(next);
    return false;
  };

  const registerMut = useMutation<
    unknown,
    AxiosError<ApiError>,
    { name: string; email: string; password: string }
  >({
    mutationFn: (payload) => registerApi(payload),
    onSuccess: () => {
      // arahkan ke login setelah sukses
      window.location.href = '/login';
    },
    onError: (err) => setErrorMsg(readableError(err)),
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    registerMut.mutate({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    });
  };

  const isSubmitting = registerMut.isPending;
  const inputBase =
    'w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500/40';
  const errorBorder = 'border-pink-500 focus:ring-pink-400';

  return (
    <div className='min-h-dvh grid place-items-center bg-gray-50 text-gray-900 dark:bg-black dark:text-white px-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4'
      >
        <div>
          <h1 className='text-2xl font-bold'>Register</h1>
          <p className='text-sm text-gray-500 dark:text-white/60'>
            Create your free account and start achieving more today
          </p>
        </div>

        <div className='space-y-1'>
          <label htmlFor='name' className='text-sm'>
            Name
          </label>
          <input
            id='name'
            className={`${inputBase} ${fieldErr.name ? errorBorder : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='John Doe'
          />
          {fieldErr.name && (
            <p className='text-xs text-pink-400'>{fieldErr.name}</p>
          )}
        </div>

        <div className='space-y-1'>
          <label htmlFor='email' className='text-sm'>
            Email
          </label>
          <input
            id='email'
            type='email'
            className={`${inputBase} ${fieldErr.email ? errorBorder : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='name@email.com'
          />
          {fieldErr.email && (
            <p className='text-xs text-pink-400'>{fieldErr.email}</p>
          )}
        </div>

        <div className='space-y-1'>
          <label htmlFor='password' className='text-sm'>
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPw ? 'text' : 'password'}
              className={`${inputBase} pr-10 ${
                fieldErr.password ? errorBorder : ''
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
            />
            <button
              type='button'
              onClick={() => setShowPw((v) => !v)}
              className='absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md hover:bg-white/10'
            >
              <img src='/icons/eye.svg' alt='toggle password' />
            </button>
          </div>
          {fieldErr.password && (
            <p className='text-xs text-pink-400'>{fieldErr.password}</p>
          )}
        </div>

        <div className='space-y-1'>
          <label htmlFor='confirm' className='text-sm'>
            Confirm Password
          </label>
          <div className='relative'>
            <input
              id='confirm'
              type={showPw2 ? 'text' : 'password'}
              className={`${inputBase} pr-10 ${
                fieldErr.confirmPassword ? errorBorder : ''
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='••••••••'
            />
            <button
              type='button'
              onClick={() => setShowPw2((v) => !v)}
              className='absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md hover:bg-white/10'
            >
              <img src='/icons/eye.svg' alt='toggle confirm password' />
            </button>
          </div>
          {fieldErr.confirmPassword && (
            <p className='text-xs text-pink-400'>{fieldErr.confirmPassword}</p>
          )}
        </div>

        {errorMsg && <p className='text-sm text-pink-400'>{errorMsg}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2'
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>

        <p className='text-center text-sm'>
          Already have an account?{' '}
          <a className='text-blue-600 underline' href='/login'>
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
