import { pgTable, serial, text, integer, date, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users_sample', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
});

export const transactions = pgTable('transactions_sample', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  amount: integer('amount').notNull(),
  date: date('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});