import { and, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  ChecklistItem,
  InsertChecklistItem,
  InsertDiaryEntry,
  InsertGoal,
  InsertUser,
  checklistItems,
  cheers,
  comments,
  diaryEntries,
  goals,
  notifications,
  progressLogs,
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

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
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
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(
  userId: number,
  data: { name?: string; bio?: string; avatarUrl?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl, bio: users.bio })
    .from(users);
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export async function createGoal(data: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(goals).values(data);
  return result.insertId;
}

export async function getGoalsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
}

export async function getGoalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
  return result[0];
}

export async function updateGoal(id: number, userId: number, data: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) return;
  await db.update(goals).set(data).where(and(eq(goals.id, id), eq(goals.userId, userId)));
}

export async function deleteGoal(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
}

export async function getPublicGoals(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: goals.id,
      userId: goals.userId,
      title: goals.title,
      description: goals.description,
      category: goals.category,
      deadline: goals.deadline,
      isCompleted: goals.isCompleted,
      completedAt: goals.completedAt,
      createdAt: goals.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(goals)
    .innerJoin(users, eq(goals.userId, users.id))
    .where(eq(goals.isPublic, true))
    .orderBy(desc(goals.createdAt))
    .limit(limit);
}

// ─── Checklist Items ──────────────────────────────────────────────────────────
export async function getChecklistByGoalId(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.goalId, goalId))
    .orderBy(checklistItems.order);
}

export async function createChecklistItem(data: InsertChecklistItem) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(checklistItems).values(data);
  return result.insertId;
}

export async function updateChecklistItem(
  id: number,
  goalId: number,
  data: Partial<ChecklistItem>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(checklistItems)
    .set(data)
    .where(and(eq(checklistItems.id, id), eq(checklistItems.goalId, goalId)));
}

export async function deleteChecklistItem(id: number, goalId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(checklistItems)
    .where(and(eq(checklistItems.id, id), eq(checklistItems.goalId, goalId)));
}

export async function getGoalProgress(goalId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.goalId, goalId));
  if (items.length === 0) return 0;
  const checked = items.filter((i) => i.isChecked).length;
  return Math.round((checked / items.length) * 100);
}

// ─── Progress Logs ────────────────────────────────────────────────────────────
export async function addProgressLog(
  goalId: number,
  userId: number,
  note: string,
  progressPercent: number
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(progressLogs).values({ goalId, userId, note, progressPercent });
}

export async function getProgressLogsByGoalId(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(progressLogs)
    .where(eq(progressLogs.goalId, goalId))
    .orderBy(desc(progressLogs.createdAt))
    .limit(20);
}

// ─── Diary Entries ────────────────────────────────────────────────────────────
export async function createDiaryEntry(data: InsertDiaryEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(diaryEntries).values(data);
  return result.insertId;
}

export async function getDiaryEntriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(diaryEntries)
    .where(eq(diaryEntries.userId, userId))
    .orderBy(desc(diaryEntries.createdAt));
}

export async function getDiaryEntryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id)).limit(1);
  return result[0];
}

export async function updateDiaryEntry(
  id: number,
  userId: number,
  data: Partial<InsertDiaryEntry>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(diaryEntries)
    .set(data)
    .where(and(eq(diaryEntries.id, id), eq(diaryEntries.userId, userId)));
}

export async function deleteDiaryEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(diaryEntries)
    .where(and(eq(diaryEntries.id, id), eq(diaryEntries.userId, userId)));
}

// ─── Cheers ───────────────────────────────────────────────────────────────────
export async function addCheer(
  fromUserId: number,
  emoji: string,
  goalId?: number,
  diaryId?: number
) {
  const db = await getDb();
  if (!db) return;
  // Prevent duplicate cheers from same user on same target
  const existing = await db
    .select()
    .from(cheers)
    .where(
      and(
        eq(cheers.fromUserId, fromUserId),
        goalId ? eq(cheers.goalId, goalId) : isNull(cheers.goalId),
        diaryId ? eq(cheers.diaryId, diaryId) : isNull(cheers.diaryId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    // Toggle: remove if already cheered
    await db.delete(cheers).where(eq(cheers.id, existing[0].id));
    return { toggled: false };
  }
  await db.insert(cheers).values({ fromUserId, emoji, goalId, diaryId });
  return { toggled: true };
}

export async function getCheersForGoal(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: cheers.id,
      fromUserId: cheers.fromUserId,
      emoji: cheers.emoji,
      createdAt: cheers.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(cheers)
    .innerJoin(users, eq(cheers.fromUserId, users.id))
    .where(eq(cheers.goalId, goalId));
}

export async function getCheersForDiary(diaryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: cheers.id,
      fromUserId: cheers.fromUserId,
      emoji: cheers.emoji,
      createdAt: cheers.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(cheers)
    .innerJoin(users, eq(cheers.fromUserId, users.id))
    .where(eq(cheers.diaryId, diaryId));
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export async function addComment(
  fromUserId: number,
  content: string,
  goalId?: number,
  diaryId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db
    .insert(comments)
    .values({ fromUserId, content, goalId, diaryId });
  return result.insertId;
}

export async function getCommentsForGoal(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: comments.id,
      fromUserId: comments.fromUserId,
      content: comments.content,
      createdAt: comments.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.fromUserId, users.id))
    .where(eq(comments.goalId, goalId))
    .orderBy(desc(comments.createdAt));
}

export async function deleteComment(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(comments).where(and(eq(comments.id, id), eq(comments.fromUserId, userId)));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function createNotification(data: {
  userId: number;
  type: "cheer" | "comment" | "deadline_reminder" | "goal_completed" | "system";
  title: string;
  message: string;
  relatedGoalId?: number;
  relatedDiaryId?: number;
  fromUserId?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(result[0]?.count ?? 0);
}

// ─── Deadline Reminders (cron-style check) ───────────────────────────────────
export async function getGoalsWithUpcomingDeadlines() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return db
    .select({
      id: goals.id,
      userId: goals.userId,
      title: goals.title,
      deadline: goals.deadline,
    })
    .from(goals)
    .where(
      and(
        eq(goals.isCompleted, false),
        gte(goals.deadline!, now),
        sql`${goals.deadline} <= ${threeDaysLater}`
      )
    );
}
