// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AppProvider from './providers/AppProvider';
import LoginPage from './components/pages/login/Login';
import RegisterPage from './components/pages/register/Register'; // sesuaikan jika file-mu di folder lain
import Home from './components/pages/home';

const hasToken = () => Boolean(localStorage.getItem('access_token'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  return hasToken() ? <>{children}</> : <Navigate to='/login' replace />;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  return hasToken() ? <Navigate to='/home' replace /> : <>{children}</>;
}
export default function App() {
  return (
    <AppProvider>
      <Routes>
        {/* root: arahkan sesuai status login */}
        <Route
          path='/'
          element={<Navigate to={hasToken() ? '/home' : '/login'} replace />}
        />

        {/* public pages (redirect kalau sudah login) */}
        <Route
          path='/login'
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path='/register'
          element={
            <RedirectIfAuthed>
              <RegisterPage />
            </RedirectIfAuthed>
          }
        />

        {/* protected page */}
        <Route
          path='/home'
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        {/* fallback 404 */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </AppProvider>
  );
}
