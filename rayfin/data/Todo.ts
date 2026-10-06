import {
  entity,
  role,
  text,
  boolean,
  date,
  uuid,
} from '@microsoft/rayfin-core';

@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class Todo {
  @uuid() id!: string;
  @text({ min: 1, max: 100 }) title!: string;
  @boolean() isCompleted!: boolean;
  @text({ optional: true, min: 1, max: 16 }) priority?: string;
  @text({ optional: true, min: 4, max: 24 }) status?: string;
  @date({ optional: true }) dueDate?: Date;
  @date() createdAt!: Date;
  @text() user_id!: string;
}
