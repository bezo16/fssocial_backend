import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import db from '../../lib/drizzle';
import { notificationsTable } from '../../lib/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  async findAllForUser(userId: string): Promise<Notification[]> {
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.toUserId, userId));
    return rows.map((row) => ({
      id: row.id,
      toUserId: row.toUserId,
      fromUserId: row.fromUserId,
      type: row.type,
      message: row.message,
      read: row.read,
      createdAt: row.createdAt,
    }));
  }

  async create(
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  ): Promise<Notification> {
    const [row] = await db
      .insert(notificationsTable)
      .values({
        ...notification,
        read: false,
      })
      .returning();
    return {
      id: row.id,
      toUserId: row.toUserId,
      fromUserId: row.fromUserId,
      type: row.type,
      message: row.message,
      read: row.read,
      createdAt: row.createdAt,
    };
  }

  async markAsRead(id: string): Promise<Notification | undefined> {
    const [row] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    if (!row) return undefined;
    return {
      id: row.id,
      toUserId: row.toUserId,
      fromUserId: row.fromUserId,
      type: row.type,
      message: row.message,
      read: row.read,
      createdAt: row.createdAt,
    };
  }
}
