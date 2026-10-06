import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/AuthContext';
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  type TodoPriority,
  type TodoStatus,
  type TodoItem,
} from '@/services/todos';

const statusOptions: { label: string; value: TodoStatus }[] = [
  { label: 'Work in Progress', value: 'work_in_progress' },
  { label: 'Hold', value: 'hold' },
  { label: 'Completed', value: 'completed' },
];

const priorityOptions: { label: string; value: TodoPriority }[] = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const priorityBadgeClass: Record<TodoPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function formatDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateFromInput(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function dueDateInputValue(dueDate?: Date): string {
  if (!dueDate) return formatDateInputValue(new Date());
  return formatDateInputValue(new Date(dueDate));
}

export function HomePage() {
  const { signOut, user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>('medium');
  const [newTodoStatus, setNewTodoStatus] = useState<TodoStatus>('work_in_progress');
  const [newTodoDueDate, setNewTodoDueDate] = useState<string>(
    formatDateInputValue(new Date())
  );
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    const data = await getTodos();
    setTodos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTodoTitle.trim();
    if (!title) return;
    setNewTodoTitle('');
    await createTodo({
      title,
      priority: newTodoPriority,
      status: newTodoStatus,
      dueDate: parseDateFromInput(newTodoDueDate),
    });
    await fetchTodos();
  };

  const handleToggle = async (id: string, isCompleted: boolean) => {
    await updateTodo(id, {
      status: isCompleted ? 'work_in_progress' : 'completed',
    });
    await fetchTodos();
  };

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    await updateTodo(id, { status });
    await fetchTodos();
  };

  const handlePriorityChange = async (id: string, priority: TodoPriority) => {
    await updateTodo(id, { priority });
    await fetchTodos();
  };

  const handleDueDateChange = async (id: string, dateValue: string) => {
    await updateTodo(id, { dueDate: parseDateFromInput(dateValue) });
    await fetchTodos();
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    await fetchTodos();
  };

  const pending = todos.filter((t) => !t.isCompleted);
  const completed = todos.filter((t) => t.isCompleted);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-gray-600" title={user.email}>
              {user.email}
            </span>
          )}
          <button
            onClick={() => void signOut()}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <form
          onSubmit={(e) => void handleAddTodo(e)}
          className="mb-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-12"
        >
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:col-span-5"
          />
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value as TodoPriority)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:col-span-2"
            aria-label="Priority"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} Priority
              </option>
            ))}
          </select>
          <select
            value={newTodoStatus}
            onChange={(e) => setNewTodoStatus(e.target.value as TodoStatus)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:col-span-3"
            aria-label="Status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newTodoDueDate}
            onChange={(e) => setNewTodoDueDate(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:col-span-2"
            aria-label="Due date"
          />
          <button
            type="submit"
            disabled={!newTodoTitle.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-40 md:col-span-12 md:justify-self-end"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        ) : todos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              No todos yet. Add one above!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  To Do ({pending.length})
                </h2>
                <ul className="space-y-2">
                  {pending.map((todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      onDueDateChange={handleDueDateChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Completed ({completed.length})
                </h2>
                <ul className="space-y-2">
                  {completed.map((todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      onDueDateChange={handleDueDateChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TodoRow({
  todo,
  onToggle,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onDelete,
}: {
  todo: TodoItem;
  onToggle: (id: string, isCompleted: boolean) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onPriorityChange: (id: string, priority: TodoPriority) => void;
  onDueDateChange: (id: string, dateValue: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="group grid items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm md:grid-cols-[auto_1fr_auto_auto_auto_auto]">
      <button
        onClick={() => onToggle(todo.id, todo.isCompleted)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.isCompleted
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-gray-300 hover:border-blue-400'
        }`}
        aria-label={todo.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.isCompleted && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-sm ${
          todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </span>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${priorityBadgeClass[todo.priority]}`}
      >
        {todo.priority}
      </span>
      <select
        value={todo.status}
        onChange={(e) =>
          onStatusChange(todo.id, e.target.value as TodoStatus)
        }
        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label={`Status for ${todo.title}`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={todo.priority}
        onChange={(e) =>
          onPriorityChange(todo.id, e.target.value as TodoPriority)
        }
        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label={`Priority for ${todo.title}`}
      >
        {priorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex items-center justify-end gap-2">
        <label className="text-xs text-gray-400">Due</label>
        <input
          type="date"
          value={dueDateInputValue(todo.dueDate)}
          onChange={(e) => onDueDateChange(todo.id, e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label={`Due date for ${todo.title}`}
        />
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 transition-colors group-hover:opacity-100 hover:text-red-500 md:opacity-0"
        aria-label="Delete todo"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </li>
  );
}
