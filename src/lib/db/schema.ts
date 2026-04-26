import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  olWorkId: text("ol_work_id").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  synopsis: text("synopsis"),
  year: integer("year"),
  pages: integer("pages"),
  coverUrl: text("cover_url"),
  isbn: text("isbn"),
  publisher: text("publisher"),
  genres: text("genres").array(),
  status: text("status", { enum: ["to_read", "reading", "read"] })
    .notNull()
    .default("to_read"),
  format: text("format", { enum: ["physical", "ebook", "audiobook"] })
    .notNull()
    .default("physical"),
  rating: integer("rating"),
  notes: text("notes"),
  language: text("language", { enum: ["es", "ca", "en"] }),
  readAt: timestamp("read_at", { withTimezone: true }),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const readingGoals = pgTable("reading_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  goal: integer("goal").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type BookInsert = typeof books.$inferInsert;
export type BookSelect = typeof books.$inferSelect;
export type ReadingGoalInsert = typeof readingGoals.$inferInsert;
export type ReadingGoalSelect = typeof readingGoals.$inferSelect;
