import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  text,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar({ length: 50 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;

export const postsTable = pgTable('posts', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  content: text(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Post = typeof postsTable.$inferSelect;

export const followsTable = pgTable(
  'follows',

  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },

  (table) => {
    return {
      pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    };
  },
);

export const likeTargetTypeEnum = pgEnum('like_target_type', [
  'post',
  'profile',
  'comment',
]);

export const likesTable = pgTable(
  'likes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    targetType: likeTargetTypeEnum('target_type').notNull(),
    targetId: uuid('target_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.userId, table.targetType, table.targetId],
      }),
    };
  },
);

export type Like = typeof likesTable.$inferSelect;

export const commentTypeEnum = pgEnum('comment_type', ['post', 'profile']);

export const commentsTable = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  targetType: commentTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Comment = typeof commentsTable.$inferSelect;
