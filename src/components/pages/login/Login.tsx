import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { login } from '../../../services/auth.service';
import {
  loginSchema,
  type LoginFields,
} from '../../../lib/validation/Auth.validation';
import type { LoginResponse, AuthUser } from '../../../types/Auth';
//testing
type ApiError = { message?: string; error?: string; statusCode?: number };

function readableError(err: unknown, fallbackBadCreds = false): string {
  const ax = err as AxiosError<ApiError>;
  const status = ax?.response?.status;
  const apiMsg = ax?.response?.data?.message || ax?.response?.data?.error;
  if (!status) return 'Network error, please check your connection.';
  if (fallbackBadCreds && status === 400) return 'Invalid email or password';
  if (status >= 500)
    return `Server error, please try again later. (status: ${status})`;
  return apiMsg ? String(apiMsg) : `Request failed (status: ${status})`;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErr, setFieldErr] = useState<
    Partial<Record<keyof LoginFields, string>>
  >({});

  const validate = () => {
    const res = loginSchema.safeParse({ email, password });
    if (res.success) {
      setFieldErr({});
      return true;
    }
    const next: Partial<Record<keyof LoginFields, string>> = {};
    res.error.issues.forEach((i) => {
      const k = i.path[0] as keyof LoginFields;
      next[k] = i.message;
    });
    setFieldErr(next);
    return false;
  };

  const loginMut = useMutation<
    LoginResponse,
    AxiosError<ApiError>,
    { email: string; password: string }
  >({
    mutationFn: (payload) => login(payload),
    onSuccess: (res) => {
      const token = res.data?.token ?? res.token;
      if (token) localStorage.setItem('access_token', token);
      const user: AuthUser | undefined = res.data?.user;
      if (user) localStorage.setItem('auth_user', JSON.stringify(user));
      window.location.reload();
    },
    onError: (err) => setErrorMsg(readableError(err, true)),
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    loginMut.mutate({ email: email.trim(), password: password.trim() });
  };

  const isSubmitting = loginMut.isPending;
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
          <h1 className='text-2xl font-bold'>Login</h1>
          <p className='text-sm text-gray-500 dark:text-white/60'>
            Welcome back! Stay on top of your tasks and goals
          </p>
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

        {errorMsg && <p className='text-sm text-pink-400'>{errorMsg}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2'
        >
          {isSubmitting ? 'Signing In…' : 'Login'}
        </button>

        <p className='text-center text-sm'>
          Don’t have an account?{' '}
          <a className='text-blue-600 underline' href='/register'>
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
