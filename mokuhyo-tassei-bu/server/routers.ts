import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import {
  addCheer,
  addComment,
  addProgressLog,
  createChecklistItem,
  createDiaryEntry,
  createGoal,
  createNotification,
  deleteChecklistItem,
  deleteComment,
  deleteDiaryEntry,
  deleteGoal,
  getAllUsers,
  getCheersForDiary,
  getCheersForGoal,
  getChecklistByGoalId,
  getCommentsForGoal,
  getDiaryEntriesByUserId,
  getDiaryEntryById,
  getGoalById,
  getGoalProgress,
  getGoalsByUserId,
  getGoalsWithUpcomingDeadlines,
  getNotificationsByUserId,
  getProgressLogsByGoalId,
  getPublicGoals,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  updateChecklistItem,
  updateDiaryEntry,
  updateGoal,
  updateUserProfile,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Goals Router ─────────────────────────────────────────────────────────────
const goalsRouter = router({
  list: protectedProcedure.query(({ ctx }) => getGoalsByUserId(ctx.user.id)),

  publicList: publicProcedure.query(() => getPublicGoals(50)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const goal = await getGoalById(input.id);
      if (!goal) throw new Error("Goal not found");
      const checklist = await getChecklistByGoalId(input.id);
      const progress = await getGoalProgress(input.id);
      const cheersData = await getCheersForGoal(input.id);
      const commentsData = await getCommentsForGoal(input.id);
      const logs = await getProgressLogsByGoalId(input.id);
      return { goal, checklist, progress, cheers: cheersData, comments: commentsData, logs };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        category: z
          .enum(["health", "study", "work", "hobby", "relationship", "finance", "other"])
          .default("other"),
        deadline: z.number().optional(),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await createGoal({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
        isPublic: input.isPublic,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        category: z
          .enum(["health", "study", "work", "hobby", "relationship", "finance", "other"])
          .optional(),
        deadline: z.number().nullable().optional(),
        isPublic: z.boolean().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, deadline, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (deadline !== undefined) {
        updateData.deadline = deadline ? new Date(deadline) : null;
      }
      if (input.isCompleted) {
        updateData.completedAt = new Date();
      }
      await updateGoal(id, ctx.user.id, updateData as Parameters<typeof updateGoal>[2]);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteGoal(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Checklist Router ─────────────────────────────────────────────────────────
const checklistRouter = router({
  addItem: protectedProcedure
    .input(
      z.object({
        goalId: z.number(),
        title: z.string().min(1).max(200),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createChecklistItem(input);
      return { id };
    }),

  toggleItem: protectedProcedure
    .input(z.object({ id: z.number(), goalId: z.number(), isChecked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await updateChecklistItem(input.id, input.goalId, { isChecked: input.isChecked });
      const progress = await getGoalProgress(input.goalId);
      // Log progress
      await addProgressLog(input.goalId, ctx.user.id, "", progress);
      return { progress };
    }),

  deleteItem: protectedProcedure
    .input(z.object({ id: z.number(), goalId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteChecklistItem(input.id, input.goalId);
      return { success: true };
    }),
});

// ─── Community Router ─────────────────────────────────────────────────────────
const communityRouter = router({
  feed: publicProcedure.query(() => getPublicGoals(50)),
  members: publicProcedure.query(() => getAllUsers()),
});

// ─── Cheers Router ────────────────────────────────────────────────────────────
const cheersRouter = router({
  cheerGoal: protectedProcedure
    .input(z.object({ goalId: z.number(), emoji: z.string().default("👏") }))
    .mutation(async ({ ctx, input }) => {
      const result = await addCheer(ctx.user.id, input.emoji, input.goalId, undefined);
      // Notify goal owner if cheered (not toggled off)
      if (result?.toggled) {
        const goal = await getGoalById(input.goalId);
        if (goal && goal.userId !== ctx.user.id) {
          await createNotification({
            userId: goal.userId,
            type: "cheer",
            title: "応援が届きました！🎉",
            message: `${ctx.user.name ?? "仲間"} さんが「${goal.title}」を応援しました ${input.emoji}`,
            relatedGoalId: input.goalId,
            fromUserId: ctx.user.id,
          });
        }
      }
      return result;
    }),

  cheerDiary: protectedProcedure
    .input(z.object({ diaryId: z.number(), emoji: z.string().default("👏") }))
    .mutation(async ({ ctx, input }) => {
      const result = await addCheer(ctx.user.id, input.emoji, undefined, input.diaryId);
      if (result?.toggled) {
        const diary = await getDiaryEntryById(input.diaryId);
        if (diary && diary.userId !== ctx.user.id) {
          await createNotification({
            userId: diary.userId,
            type: "cheer",
            title: "日記に応援が届きました！",
            message: `${ctx.user.name ?? "仲間"} さんが日記を応援しました ${input.emoji}`,
            relatedDiaryId: input.diaryId,
            fromUserId: ctx.user.id,
          });
        }
      }
      return result;
    }),

  getForGoal: publicProcedure
    .input(z.object({ goalId: z.number() }))
    .query(({ input }) => getCheersForGoal(input.goalId)),

  getForDiary: publicProcedure
    .input(z.object({ diaryId: z.number() }))
    .query(({ input }) => getCheersForDiary(input.diaryId)),

  commentGoal: protectedProcedure
    .input(z.object({ goalId: z.number(), content: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const id = await addComment(ctx.user.id, input.content, input.goalId, undefined);
      const goal = await getGoalById(input.goalId);
      if (goal && goal.userId !== ctx.user.id) {
        await createNotification({
          userId: goal.userId,
          type: "comment",
          title: "コメントが届きました！💬",
          message: `${ctx.user.name ?? "仲間"} さんが「${goal.title}」にコメントしました`,
          relatedGoalId: input.goalId,
          fromUserId: ctx.user.id,
        });
      }
      return { id };
    }),

  getCommentsForGoal: publicProcedure
    .input(z.object({ goalId: z.number() }))
    .query(({ input }) => getCommentsForGoal(input.goalId)),

  deleteComment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => deleteComment(input.id, ctx.user.id)),
});

// ─── Diary Router ─────────────────────────────────────────────────────────────
const diaryRouter = router({
  list: protectedProcedure.query(({ ctx }) => getDiaryEntriesByUserId(ctx.user.id)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const entry = await getDiaryEntryById(input.id);
      if (!entry) throw new Error("Diary entry not found");
      const cheersData = await getCheersForDiary(input.id);
      return { entry, cheers: cheersData };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().max(200).optional(),
        content: z.string().min(1),
        goalId: z.number().optional(),
        mood: z.enum(["great", "good", "neutral", "bad", "terrible"]).default("neutral"),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await createDiaryEntry({ ...input, userId: ctx.user.id });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().max(200).optional(),
        content: z.string().min(1).optional(),
        mood: z.enum(["great", "good", "neutral", "bad", "terrible"]).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      await updateDiaryEntry(id, ctx.user.id, rest);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteDiaryEntry(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Notifications Router ─────────────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure.query(({ ctx }) => getNotificationsByUserId(ctx.user.id)),

  unreadCount: protectedProcedure.query(({ ctx }) =>
    getUnreadNotificationCount(ctx.user.id)
  ),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => markNotificationRead(input.id, ctx.user.id)),

  markAllRead: protectedProcedure.mutation(({ ctx }) =>
    markAllNotificationsRead(ctx.user.id)
  ),

  checkDeadlines: protectedProcedure.mutation(async () => {
    const upcoming = await getGoalsWithUpcomingDeadlines();
    for (const goal of upcoming) {
      await createNotification({
        userId: goal.userId,
        type: "deadline_reminder",
        title: "⏰ 目標の期限が近づいています",
        message: `「${goal.title}」の期限まであと3日以内です。頑張りましょう！`,
        relatedGoalId: goal.id,
      });
    }
    return { notified: upcoming.length };
  }),
});

// ─── Profile Router ───────────────────────────────────────────────────────────
const profileRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(300).optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  goals: goalsRouter,
  checklist: checklistRouter,
  community: communityRouter,
  cheers: cheersRouter,
  diary: diaryRouter,
  notifications: notificationsRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
