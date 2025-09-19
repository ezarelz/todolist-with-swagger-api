import { customAxios } from '../api';
import type { Todo, NewTodo, TodosEnvelope, TodosQuery } from '../types/Todo';

// GET /todos?page=&limit=&priority=&completed=&sortBy=&order=
export async function getTodos(
  params?: Partial<TodosQuery>
): Promise<TodosEnvelope> {
  const { data } = await customAxios.get<TodosEnvelope>('/todos', { params });
  return data;
}

// POST /todos
export async function createTodo(
  payload: NewTodo
): Promise<{ message: string; data: Todo }> {
  const { data } = await customAxios.post<{ message: string; data: Todo }>(
    '/todos',
    payload
  );
  return data;
}

// PATCH /todos/:id
export async function updateTodo(
  id: string,
  payload: Partial<NewTodo> & { completed?: boolean }
): Promise<{ message: string; data: Todo }> {
  const { data } = await customAxios.patch<{ message: string; data: Todo }>(
    `/todos/${id}`,
    payload
  );
  return data;
}

// DELETE /todos/:id
export async function deleteTodo(id: string): Promise<{ message: string }> {
  const { data } = await customAxios.delete<{ message: string }>(
    `/todos/${id}`
  );
  return data;
}
