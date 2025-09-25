// src/services/todo.service.ts
import { customAxios } from '../api';
import type { Todo, NewTodo, TodosQuery } from '../types/Todo';

export type UpdateTodoPayload = Partial<NewTodo> & { completed?: boolean };

type OneResp = Todo | { data: Todo } | { todo: Todo };
type ManyResp =
  | Todo[]
  | { data: Todo[] }
  | { todos: Todo[] }
  | { data: { todos: Todo[] } };

function isTodoArray(x: unknown): x is Todo[] {
  return (
    Array.isArray(x) &&
    x.every((v) => typeof v === 'object' && v !== null && 'id' in v)
  );
}

function normalizeOne(data: OneResp): Todo {
  if ('data' in data) return data.data;
  if ('todo' in data) return data.todo;
  return data;
}

function normalizeMany(data: ManyResp): Todo[] {
  if (isTodoArray(data)) return data;
  if ('data' in data && isTodoArray(data.data)) return data.data;
  if ('todos' in data && isTodoArray(data.todos)) return data.todos;
  if ('data' in data && 'todos' in data.data && isTodoArray(data.data.todos)) {
    return data.data.todos;
  }
  return [];
}

export async function getTodos(params?: Partial<TodosQuery>): Promise<Todo[]> {
  const { data } = await customAxios.get<ManyResp>('/todos', { params });
  return normalizeMany(data);
}

export async function createTodo(payload: NewTodo): Promise<Todo> {
  const { data } = await customAxios.post<OneResp>('/todos', payload);
  return normalizeOne(data);
}

export async function updateTodo(
  id: string,
  payload: UpdateTodoPayload
): Promise<Todo> {
  const { data } = await customAxios.put<OneResp>(`/todos/${id}`, payload);
  return normalizeOne(data);
}

export async function toggleTodoCompleted(
  id: string,
  completed: boolean
): Promise<Todo> {
  const { data } = await customAxios.put<OneResp>(`/todos/${id}`, {
    completed,
  });
  return normalizeOne(data);
}

export async function deleteTodo(id: string): Promise<void> {
  await customAxios.delete(`/todos/${id}`);
}
