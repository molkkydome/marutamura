import { and, desc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Category,
  Comment,
  InsertCategory,
  InsertComment,
  InsertInvite,
  InsertPost,
  InsertUser,
  Post,
  categories,
  comments,
  invites,
  posts,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod", "nickname"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function updateUserNickname(userId: number, nickname: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ nickname }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      nickname: users.nickname,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getActiveCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function createCategory(data: InsertCategory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}

export async function updateCategory(
  id: number,
  data: Partial<InsertCategory>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function seedDefaultCategories(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;

  const defaults: InsertCategory[] = [
    { name: "本", emoji: "📚", color: "#FF6B9D", sortOrder: 1 },
    { name: "漫画", emoji: "🎨", color: "#C77DFF", sortOrder: 2 },
    { name: "映画", emoji: "🎬", color: "#4CC9F0", sortOrder: 3 },
    { name: "ドラマ", emoji: "📺", color: "#F72585", sortOrder: 4 },
    { name: "音楽", emoji: "🎵", color: "#7209B7", sortOrder: 5 },
    { name: "アーティスト", emoji: "🌟", color: "#3A0CA3", sortOrder: 6 },
    { name: "サービス", emoji: "💡", color: "#4361EE", sortOrder: 7 },
    { name: "言葉", emoji: "💬", color: "#06D6A0", sortOrder: 8 },
  ];
  await db.insert(categories).values(defaults);
}

// ── Invites ────────────────────────────────────────────────────────────────

export async function createInvite(data: InsertInvite) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(invites).values(data);
  const result = await db
    .select()
    .from(invites)
    .where(eq(invites.code, data.code))
    .limit(1);
  return result[0] ?? null;
}

export async function getInviteByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code))
    .limit(1);
  return result[0] ?? null;
}

export async function useInvite(code: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(invites)
    .set({ usedBy: userId, usedAt: new Date(), isActive: false })
    .where(eq(invites.code, code));
}

export async function getAllInvites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invites).orderBy(desc(invites.createdAt));
}

// ── Posts ──────────────────────────────────────────────────────────────────

export async function getPostsWithDetails() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      imageUrl: posts.imageUrl,
      linkUrl: posts.linkUrl,
      linkTitle: posts.linkTitle,
      createdAt: posts.createdAt,
      userId: posts.userId,
      categoryId: posts.categoryId,
      userNickname: users.nickname,
      userName: users.name,
      categoryName: categories.name,
      categoryEmoji: categories.emoji,
      categoryColor: categories.color,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.createdAt));
  return rows;
}

export async function getPostsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      imageUrl: posts.imageUrl,
      linkUrl: posts.linkUrl,
      linkTitle: posts.linkTitle,
      createdAt: posts.createdAt,
      userId: posts.userId,
      categoryId: posts.categoryId,
      userNickname: users.nickname,
      userName: users.name,
      categoryName: categories.name,
      categoryEmoji: categories.emoji,
      categoryColor: categories.color,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.categoryId, categoryId))
    .orderBy(desc(posts.createdAt));
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      imageUrl: posts.imageUrl,
      linkUrl: posts.linkUrl,
      linkTitle: posts.linkTitle,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userId: posts.userId,
      categoryId: posts.categoryId,
      userNickname: users.nickname,
      userName: users.name,
      categoryName: categories.name,
      categoryEmoji: categories.emoji,
      categoryColor: categories.color,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getUserPostInCategory(
  userId: number,
  categoryId: number
): Promise<Post | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.userId, userId), eq(posts.categoryId, categoryId)))
    .limit(1);
  return result[0] ?? undefined;
}

export async function createPost(data: InsertPost) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(posts).values(data);
  const result = await db
    .select()
    .from(posts)
    .where(
      and(eq(posts.userId, data.userId), eq(posts.categoryId, data.categoryId))
    )
    .orderBy(desc(posts.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function updatePost(id: number, data: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) return;
  await db.update(posts).set(data).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(comments).where(eq(comments.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
}

// ── Comments ───────────────────────────────────────────────────────────────

export async function getCommentsByPost(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      parentId: comments.parentId,
      content: comments.content,
      createdAt: comments.createdAt,
      userNickname: users.nickname,
      userName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt);
}

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(comments).values(data);
  const result = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      parentId: comments.parentId,
      content: comments.content,
      createdAt: comments.createdAt,
      userNickname: users.nickname,
      userName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.userId, data.userId))
    .orderBy(desc(comments.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) return;
  // 子コメントも削除
  await db.delete(comments).where(eq(comments.parentId, id));
  await db.delete(comments).where(eq(comments.id, id));
}
