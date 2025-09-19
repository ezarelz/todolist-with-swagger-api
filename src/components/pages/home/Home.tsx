import { useEffect, useState } from 'react';
import type { AuthUser } from '../../../types/Auth';
import type { Todo } from '../../../types/Todo';
import Button from '../../ui/button/Button';
import { useTheme } from '../../../hooks/useTheme';
import { getTodos } from '../../../services/todo.service';
import TodoForm from '../../container/TodoForm/TodoForm';

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      setUser(raw ? (JSON.parse(raw) as AuthUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const res = await getTodos({
          page: 1,
          limit: 10,
          sortBy: 'date',
          order: 'asc',
        });
        setTodos(res.data.todos);
      } catch {
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    window.location.reload();
  };

  return (
    <div className='min-h-dvh flex flex-col items-center bg-white text-gray-900 dark:bg-black dark:text-white px-4'>
      <div className='flex flex-col gap-6 w-full max-w-3xl py-10'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>
            Hello{user?.name ? `, ${user?.name}` : ` Guest`} 👋
          </h1>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={toggleTheme}
              className={
                theme === 'dark'
                  ? 'bg-transparent border-white/20 text-white hover:bg-white/10'
                  : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100'
              }
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>

            <Button variant='danger' size='sm' onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Todo Form */}
        <TodoForm
          mode='create'
          onSuccess={(newTodo) =>
            setTodos((prev) => [newTodo as Todo, ...prev])
          }
        />

        {/* Todo List */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Your Todos</h2>

          {loading ? (
            <div className='rounded-xl border border-gray-300 dark:border-white/20 p-4 text-center'>
              Loading todos...
            </div>
          ) : todos.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-300 dark:border-white/20 p-8 text-center'>
              <p className='font-medium'>No todos yet</p>
              <p className='text-sm text-gray-600 dark:text-white/70'>
                Add a new task to get started.
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className='rounded-xl border border-gray-300 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 flex justify-between items-center'
              >
                <div>
                  <p className='font-medium'>{todo.title}</p>
                  <p className='text-sm text-gray-500'>
                    {new Date(todo.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    todo.priority === 'HIGH'
                      ? 'bg-red-500/20 text-red-600'
                      : todo.priority === 'MEDIUM'
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : 'bg-green-500/20 text-green-600'
                  }`}
                >
                  {todo.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
