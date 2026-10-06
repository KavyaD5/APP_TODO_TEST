import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/services/rayfinClient', () => ({
  isLocalBackend: () => true,
  getRayfinClient: vi.fn(),
}));

import { createTodo, deleteTodo, getTodos, updateTodo } from '@/services/todos';

describe('todos service (in-memory mode)', () => {
  beforeEach(async () => {
    // Drain any in-memory state left over from a previous test.
    for (const todo of await getTodos()) {
      await deleteTodo(todo.id);
    }
  });

  it('creates, lists, updates, and deletes todos', async () => {
    expect(await getTodos()).toEqual([]);

    const created = await createTodo({
      title: 'write tests',
      priority: 'high',
      status: 'work_in_progress',
      dueDate: new Date('2026-09-09T00:00:00'),
    });
    expect(created.title).toBe('write tests');
    expect(created.isCompleted).toBe(false);
    expect(created.priority).toBe('high');
    expect(created.status).toBe('work_in_progress');

    const list = await getTodos();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(created.id);

    const updated = await updateTodo(created.id, { status: 'completed' });
    expect(updated.isCompleted).toBe(true);
    expect(updated.status).toBe('completed');

    await deleteTodo(created.id);
    expect(await getTodos()).toEqual([]);
  });
});
