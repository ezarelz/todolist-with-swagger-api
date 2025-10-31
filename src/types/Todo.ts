/** Priority sesuai API */
export type Priority = 'low' | 'medium' | 'high';

/** Struktur utama todo */
export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  /** Tanggal target (misal deadline) */
  date: string; // format ISO: "YYYY-MM-DD"
  priority: Priority;

  /** Optional relasi user (jika multi-user system) */
  userId?: string;

  createdAt: string;
  updatedAt: string;
}

/** Envelope respons umum (misal untuk list atau paginated data) */
export interface TodosEnvelope {
  success: boolean;
  message: string;
  data: {
    todos: Todo[];
    totalTodos: number;
    hasNextPage: boolean;
    nextPage: number | null;
  };
}

/** Query params untuk endpoint GET /todos */
export interface TodosQuery {
  completed?: boolean;
  priority?: Priority;
  dateGte?: string; // filter >= tanggal tertentu (ISO)
  dateLte?: string; // filter <= tanggal tertentu (ISO)
  page?: number;
  limit?: number;
  sort?: 'date' | 'createdAt' | 'priority';
  order?: 'asc' | 'desc';
}

/** Payload untuk membuat todo baru (POST /todos) */
export interface NewTodo {
  task: string;
  priority?: Priority;
  date: string; // format "YYYY-MM-DD"
}

/** Payload untuk update todo (PATCH /todos/:id) */
export type UpdateTodo = Partial<
  Pick<Todo, 'task' | 'completed' | 'date' | 'priority'>
>;

/** Payload untuk hapus todo (DELETE /todos/:id)
 *  localOnly digunakan oleh FE-only mode (tanpa request ke server)
 */
export interface DeleteTodoPayload {
  id: string;
  localOnly?: boolean;
}
