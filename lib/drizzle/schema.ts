import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  text,
  primaryKey,
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
