import type { AxiosResponse } from 'axios';
import { customAxios } from '../api';
import type { Todo, NewTodo, UpdateTodo, Priority } from '../types/Todo';

// ==================== RESPONSE TYPES ====================

/** Bentuk-bentuk response yang mungkin dikirim backend */
export type TodoResponse = Todo | { data: Todo } | { todo: Todo };

export type TodosResponse =
  | Todo[]
  | { data: Todo[] }
  | { todos: Todo[] }
  | { data: { todos: Todo[] } };

// ==================== HELPERS ====================

function isTodoArray(x: unknown): x is Todo[] {
  return (
    Array.isArray(x) &&
    x.every((v) => typeof v === 'object' && v !== null && 'id' in v)
  );
}

function normalizeOne(data: TodoResponse): Todo {
  if ('data' in data && (data as { data: Todo }).data)
    return (data as { data: Todo }).data;
  if ('todo' in data && (data as { todo: Todo }).todo)
    return (data as { todo: Todo }).todo;
  return data as Todo;
}

function normalizeMany(data: TodosResponse): Todo[] {
  if (isTodoArray(data)) return data;
  if ('data' in data && isTodoArray((data as { data: Todo[] }).data))
    return (data as { data: Todo[] }).data;
  if ('todos' in data && isTodoArray((data as { todos: Todo[] }).todos))
    return (data as { todos: Todo[] }).todos;
  if (
    'data' in data &&
    typeof data.data === 'object' &&
    data.data !== null &&
    'todos' in data.data &&
    isTodoArray((data.data as { todos: Todo[] }).todos)
  ) {
    return (data.data as { todos: Todo[] }).todos;
  }
  return [];
}

function normalizePriority(priority?: Priority): Priority {
  if (!priority) return 'low';
  const p = priority.toLowerCase();
  if (p === 'high' || p === 'medium' || p === 'low') return p;
  return 'low';
}

function formatDate(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0];
}

// ==================== CRUD ====================

/** GET /todos → Ambil semua todo milik user */
export async function getAllTodos(): Promise<Todo[]> {
  const { data }: AxiosResponse<TodosResponse> = await customAxios.get(
    '/todos'
  );
  return normalizeMany(data);
}

/** GET /todos/completed → Ambil semua todo yang sudah selesai */
export async function getTodosCompleted(): Promise<Todo[]> {
  const { data }: AxiosResponse<TodosResponse> = await customAxios.get(
    '/todos/completed'
  );
  return normalizeMany(data);
}

/** POST /todos → Tambah todo baru */
export async function createTodo(payload: NewTodo): Promise<Todo> {
  const body = {
    task: payload.task.trim(),
    priority: normalizePriority(payload.priority),
    date: payload.date ? formatDate(payload.date) : formatDate(new Date()),
  };
  const { data }: AxiosResponse<TodoResponse> = await customAxios.post(
    '/todos',
    body
  );
  return normalizeOne(data);
}

/** PATCH /todos/{id}/complete → Toggle selesai / batal selesai */
export async function toggleTodoCompleted(
  id: string,
  completed: boolean
): Promise<Todo> {
  const { data }: AxiosResponse<TodoResponse> = await customAxios.patch(
    `/todos/${id}/complete`,
    { completed }
  );
  return normalizeOne(data);
}

/** PUT /todos/{id} → Update todo (task, priority, date) */
export async function updateTodo(
  id: string,
  payload: UpdateTodo
): Promise<Todo> {
  const body = {
    ...payload,
    priority: normalizePriority(payload.priority),
    date: payload.date ? formatDate(payload.date) : undefined,
  };
  const { data }: AxiosResponse<TodoResponse> = await customAxios.put(
    `/todos/${id}`,
    body
  );
  return normalizeOne(data);
}

/** DELETE /todos/{id} → Hapus todo */
export async function deleteTodo(id: string): Promise<void> {
  await customAxios.delete(`/todos/${id}`);
}
