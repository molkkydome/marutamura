import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  nickname: varchar("nickname", { length: 64 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// カテゴリーテーブル
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  emoji: varchar("emoji", { length: 8 }).notNull().default("✨"),
  color: varchar("color", { length: 32 }).notNull().default("#FF6B9D"),
  sortOrder: int("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// 招待コードテーブル
export const invites = mysqlTable("invites", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  createdBy: int("createdBy").notNull(),
  usedBy: int("usedBy"),
  usedAt: timestamp("usedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invite = typeof invites.$inferSelect;
export type InsertInvite = typeof invites.$inferInsert;

// 投稿テーブル
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  linkUrl: text("linkUrl"),
  linkTitle: varchar("linkTitle", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// コメントテーブル（スレッド形式）
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  parentId: int("parentId"), // nullなら最上位コメント
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
