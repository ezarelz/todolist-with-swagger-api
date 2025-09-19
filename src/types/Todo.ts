// src/types/todo.ts
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  date: string; // ISO string
  priority: Priority;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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

// make all optional so you can pass only what you need
export interface TodosQuery {
  page?: number;
  limit?: number;
  priority?: Priority;
  completed?: boolean;
  sortBy?: 'date' | 'createdAt' | 'priority';
  order?: 'asc' | 'desc';
}

export interface NewTodo {
  title: string;
  completed: boolean;
  date: string; // ISO
  priority: Priority;
}
