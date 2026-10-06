import { getRayfinClient, isLocalBackend } from './rayfinClient';

export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoStatus = 'completed' | 'work_in_progress' | 'hold';

export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: Date;
  createdAt: Date;
}

function normalizeTodo(raw: Partial<TodoItem> & { id: string; title: string }): TodoItem {
  const status = raw.status ?? (raw.isCompleted ? 'completed' : 'work_in_progress');
  const priority = raw.priority ?? 'medium';
  return {
    id: raw.id,
    title: raw.title,
    isCompleted: raw.isCompleted ?? status === 'completed',
    status,
    priority,
    dueDate: raw.dueDate,
    createdAt: raw.createdAt ?? new Date(),
  };
}

// Local-dev fallback: when no Fabric backend is configured, keep todos in
// memory so the sample is fully functional without a database.
let inMemoryTodos: TodoItem[] = [];

export async function getTodos(): Promise<TodoItem[]> {
  if (isLocalBackend()) {
    return [...inMemoryTodos].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  const client = getRayfinClient();
  const results = await client.data.Todo.select([
    'id',
    'title',
    'isCompleted',
    'priority',
    'status',
    'dueDate',
    'createdAt',
  ])
    .orderBy({ createdAt: 'desc' })
    .execute();
  return (results as Array<Partial<TodoItem> & { id: string; title: string }>).map(
    normalizeTodo
  );
}

export interface CreateTodoInput {
  title: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate: Date;
}

export async function createTodo(input: CreateTodoInput): Promise<TodoItem> {
  const { title, priority, status, dueDate } = input;
  if (isLocalBackend()) {
    const todo: TodoItem = {
      id: crypto.randomUUID(),
      title,
      isCompleted: status === 'completed',
      priority,
      status,
      dueDate,
      createdAt: new Date(),
    };
    inMemoryTodos.push(todo);
    return todo;
  }

  const client = getRayfinClient();
  const session = client.auth.getSession();
  if (!session.isAuthenticated || !session.user) {
    throw new Error('Cannot create todo: user is not authenticated.');
  }
  const todo = await client.data.Todo.create({
    title,
    isCompleted: status === 'completed',
    priority,
    status,
    dueDate,
    createdAt: new Date(),
    user_id: session.user.id,
  });
  return todo as TodoItem;
}

export interface UpdateTodoInput {
  title?: string;
  isCompleted?: boolean;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: Date;
}

export async function updateTodo(
  id: string,
  updates: UpdateTodoInput
): Promise<TodoItem> {
  const normalized = { ...updates };
  if (normalized.status) {
    normalized.isCompleted = normalized.status === 'completed';
  }

  if (isLocalBackend()) {
    const todo = inMemoryTodos.find((t) => t.id === id);
    if (!todo) throw new Error('Todo not found');
    Object.assign(todo, normalized);
    return { ...todo };
  }

  const client = getRayfinClient();
  await client.data.Todo.update({ id }, normalized);
  const todo = await client.data.Todo.findById(id);
  return normalizeTodo(todo as Partial<TodoItem> & { id: string; title: string });
}

export async function deleteTodo(id: string): Promise<void> {
  if (isLocalBackend()) {
    inMemoryTodos = inMemoryTodos.filter((t) => t.id !== id);
    return;
  }

  const client = getRayfinClient();
  await client.data.Todo.delete({ id });
}
