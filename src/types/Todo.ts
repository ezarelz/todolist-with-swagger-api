// src/types/Todo.ts

/** Priority sesuai API */
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

/** Bentuk todo yang dipakai di FE (flat) */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  priority: Priority;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Envelope untuk list response (sesuaikan bila backend berbeda) */
export interface TodosEnvelope {
  success: boolean;
  message: string;
  data: {
    todos: Todo[];
    totalTodos: number;
    hasNextPage: boolean;
    nextPage: number;
  };
}

/** Query params GET /todos */
export interface TodosQuery {
  completed?: boolean;
  priority?: Priority;
  dateGte?: string; // ISO (>=)
  dateLte?: string; // ISO (<=)
  page?: number; // default 1
  limit?: number; // default 10
  sort?: 'date' | 'createdAt' | 'priority';
  order?: 'asc' | 'desc';
}

/** Payload create */
export interface NewTodo {
  title: string;
  date: string; // ISO
  priority: Priority;
  completed?: boolean; // default false jika tidak dikirim
}

/** Payload update (partial PUT/PATCH) */
export type UpdateTodo = Partial<
  Pick<Todo, 'title' | 'completed' | 'date' | 'priority'>
>;
