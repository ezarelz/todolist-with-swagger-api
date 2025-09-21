import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login, register } from '../../../services/auth.service';
import type { LoginResponse, AuthUser } from '../../../types/Auth';
import type { AxiosError } from 'axios';

type Mode = 'login' | 'register';
type ApiError = { message?: string; error?: string; statusCode?: number };

function readableError(err: unknown, fallbackBadCreds = false): string {
  const ax = err as AxiosError<ApiError>;
  const status = ax?.response?.status;
  const apiMsg = ax?.response?.data?.message || ax?.response?.data?.error;
  if (!status) return 'Network error, please check your connection.';
  if (fallbackBadCreds && status === 400) {
    return 'Invalid Email or Password (Request failed with status code 400)';
  }
  if (status >= 500)
    return `Server error, please try again later. (status: ${status})`;
  return apiMsg ? String(apiMsg) : `Request failed (status: ${status})`;
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const registerMut = useMutation<
    unknown,
    AxiosError<ApiError>,
    { name: string; email: string; password: string }
  >({
    mutationFn: (payload) => register(payload),
    onSuccess: () => setMode('login'),
    onError: (err) => setErrorMsg(readableError(err)),
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      loginMut.mutate({
        email: email.trim(),
        password: password.trim(),
      });
    } else {
      registerMut.mutate({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
    }
  };

  const isSubmitting = loginMut.isPending || registerMut.isPending;

  return (
    <div className='min-h-dvh grid place-items-center bg-gray-50 text-gray-900 dark:bg-black dark:text-white px-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4'
      >
        <h1 className='text-2xl font-bold text-center'>
          {mode === 'login' ? 'Sign In' : 'Create an Account'}
        </h1>

        {mode === 'register' && (
          <div className='space-y-1'>
            <label htmlFor='name' className='text-sm'>
              Name
            </label>
            <input
              id='name'
              required
              className='w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='John Doe'
            />
          </div>
        )}

        <div className='space-y-1'>
          <label htmlFor='email' className='text-sm'>
            Email
          </label>
          <input
            id='email'
            type='email'
            required
            className='w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='name@email.com'
          />
        </div>

        <div className='space-y-1'>
          <label htmlFor='password' className='text-sm'>
            Password
          </label>
          <input
            id='password'
            type='password'
            required
            className='w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
          />
        </div>

        {errorMsg && <p className='text-sm text-red-500'>{errorMsg}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2'
        >
          {isSubmitting
            ? mode === 'login'
              ? 'Signing In…'
              : 'Registering…'
            : mode === 'login'
            ? 'Sign In'
            : 'Register'}
        </button>

        <p className='text-center text-sm'>
          {mode === 'login' ? (
            <>
              Not registered?{' '}
              <button
                type='button'
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className='text-blue-600 underline'
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className='text-blue-600 underline'
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
