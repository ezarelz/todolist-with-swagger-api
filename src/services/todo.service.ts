// src/services/todo.service.ts
import { customAxios } from '../api';
import type { Todo, NewTodo, TodosEnvelope, TodosQuery } from '../types/Todo';

type UpdateTodoPayload = Partial<NewTodo> & { completed?: boolean };

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

// PUT /todos/:id  — update fields (title, completed, date, priority)
export async function updateTodo(
  id: string,
  payload: UpdateTodoPayload
): Promise<{ message: string; data: Todo }> {
  const { data } = await customAxios.put<{ message: string; data: Todo }>(
    `/todos/${id}`,
    payload
  );
  return data;
}

// Helper: toggle completed only (PUT)
export async function toggleTodoCompleted(
  id: string,
  completed: boolean
): Promise<{ message: string; data: Todo }> {
  const { data } = await customAxios.put<{ message: string; data: Todo }>(
    `/todos/${id}`,
    { completed }
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
