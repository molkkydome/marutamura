import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COMMUNITY_PASSWORD, generateOpenId, signSsoToken, signUserJwt, verifySsoToken } from "./auth";
import {
  createCategory,
  createComment,
  createInvite,
  createPost,
  deleteComment,
  deletePost,
  getActiveCategories,
  getAllCategories,
  getAllInvites,
  getAllUsers,
  getCommentsByPost,
  getInviteByCode,
  getPostById,
  getPostsByCategory,
  getPostsWithDetails,
  getUserById,
  getUserByOpenId,
  getUserPostInCategory,
  seedDefaultCategories,
  updateCategory,
  updatePost,
  updateUserNickname,
  upsertUser,
  useInvite,
} from "./db";
import { storagePut } from "./storage";

// 管理者チェックミドルウェア
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    // 独自認証ログイン：招待コード＋パスワード＋ニックネームでJWT発行
    login: publicProcedure
      .input(
        z.object({
          inviteCode: z.string().min(1).max(32),
          password: z.string().min(1),
          nickname: z.string().min(1).max(20),
          ssoToken: z.string().optional(), // SSOトークン経由の場合はパスワードチェックをスキップ
        })
      )
      .mutation(async ({ ctx, input }) => {
        // SSOトークンがある場合はトークンを再検証（パスワードチェックをスキップ）
        if (input.ssoToken) {
          const ssoResult = await verifySsoToken(input.ssoToken);
          if (!ssoResult || ssoResult.inviteCode !== input.inviteCode.toUpperCase()) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "SSOトークンが無効または期限切れです",
            });
          }
        } else {
          // 通常ログイン：パスワード検証
          if (input.password !== COMMUNITY_PASSWORD) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "パスワードが正しくありません",
            });
          }
        }
        // 招待コード検証
        const invite = await getInviteByCode(input.inviteCode.toUpperCase());
        if (!invite || !invite.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "招待コードが無効です",
          });
        }
        // ユーザー作成（招待コードが既に使われていれば既存ユーザーを返す）
        let user = invite.usedBy ? await getUserById(invite.usedBy) : null;
        if (!user) {
          const openId = generateOpenId();
          await upsertUser({
            openId,
            name: input.nickname,
            nickname: input.nickname,
            loginMethod: "invite",
            lastSignedIn: new Date(),
          });
          user = await getUserByOpenId(openId);
          if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          // 招待コードを使用済みにする
          await useInvite(input.inviteCode.toUpperCase(), user.id);
        } else {
          // 既存ユーザーのニックネームを更新
          await updateUserNickname(user.id, input.nickname);
          await upsertUser({ openId: user.openId, lastSignedIn: new Date() });
          user = await getUserById(user.id) ?? user;
        }
        // JWTを発行してクッキーにセット
        const token = await signUserJwt(user.id, user.openId);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        return { success: true, user };
      }),
    updateNickname: protectedProcedure
      .input(z.object({ nickname: z.string().min(1).max(20) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserNickname(ctx.user.id, input.nickname);
        return { success: true };
      }),
    // sso_token検証：有効なトークンなら招待コードを返す（パスワード・招待コード入力スキップ用）
    verifySsoToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const result = await verifySsoToken(input.token);
        if (!result) {
          return { valid: false, inviteCode: null } as const;
        }
        // 招待コードがまだ有効か確認
        const invite = await getInviteByCode(result.inviteCode);
        if (!invite || !invite.isActive) {
          return { valid: false, inviteCode: null } as const;
        }
        return { valid: true, inviteCode: result.inviteCode } as const;
      }),
    // SSOトークン発行（管理者のみ）
    issueSsoToken: adminProcedure
      .input(z.object({ inviteCode: z.string().min(1), origin: z.string().url() }))
      .mutation(async ({ input }) => {
        const invite = await getInviteByCode(input.inviteCode.toUpperCase());
        if (!invite || !invite.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "招待コードが無効です" });
        }
        const token = await signSsoToken(input.inviteCode.toUpperCase());
        const url = `${input.origin}/join?sso_token=${encodeURIComponent(token)}`;
        return { token, url };
      }),
  }),

  // ── カテゴリー ─────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      await seedDefaultCategories();
      return getActiveCategories();
    }),
    listAll: adminProcedure.query(() => getAllCategories()),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(64),
          emoji: z.string().min(1).max(8),
          color: z.string().min(1).max(32),
          sortOrder: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createCategory({
          name: input.name,
          emoji: input.emoji,
          color: input.color,
          sortOrder: input.sortOrder ?? 99,
        });
        return { success: true };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1).max(64).optional(),
          emoji: z.string().min(1).max(8).optional(),
          color: z.string().min(1).max(32).optional(),
          sortOrder: z.number().int().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateCategory(id, data);
        return { success: true };
      }),
  }),

  // ── 招待コード ─────────────────────────────────────────────────────────
  invites: router({
    create: adminProcedure
      .input(z.object({ origin: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        const code = nanoid(10).toUpperCase();
        await createInvite({ code, createdBy: ctx.user.id });
        const inviteUrl = `${input.origin}/join?code=${code}`;
        return { code, inviteUrl };
      }),
    list: adminProcedure.query(() => getAllInvites()),
    verify: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const invite = await getInviteByCode(input.code);
        if (!invite || !invite.isActive) {
          return { valid: false };
        }
        if (invite.expiresAt && invite.expiresAt < new Date()) {
          return { valid: false };
        }
        return { valid: true };
      }),
    use: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invite = await getInviteByCode(input.code);
        if (!invite || !invite.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "無効な招待コードです" });
        }
        await useInvite(input.code, ctx.user.id);
        return { success: true };
      }),
  }),

  // ── 投稿 ───────────────────────────────────────────────────────────────
  posts: router({
    list: publicProcedure.query(() => getPostsWithDetails()),
    listByCategory: publicProcedure
      .input(z.object({ categoryId: z.number().int() }))
      .query(({ input }) => getPostsByCategory(input.categoryId)),
    get: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const post = await getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        return post;
      }),
    myPostInCategory: protectedProcedure
      .input(z.object({ categoryId: z.number().int() }))
      .query(({ ctx, input }) =>
        getUserPostInCategory(ctx.user.id, input.categoryId)
      ),
    create: protectedProcedure
      .input(
        z.object({
          categoryId: z.number().int(),
          title: z.string().min(1).max(200),
          description: z.string().max(2000).optional(),
          imageUrl: z.string().url().optional().or(z.literal("")),
          linkUrl: z.string().url().optional().or(z.literal("")),
          linkTitle: z.string().max(200).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserPostInCategory(ctx.user.id, input.categoryId);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "このカテゴリーにはすでに投稿があります",
          });
        }
        const post = await createPost({
          userId: ctx.user.id,
          categoryId: input.categoryId,
          title: input.title,
          description: input.description ?? null,
          imageUrl: input.imageUrl || null,
          linkUrl: input.linkUrl || null,
          linkTitle: input.linkTitle ?? null,
        });
        return post;
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          title: z.string().min(1).max(200).optional(),
          description: z.string().max(2000).optional(),
          imageUrl: z.string().url().optional().or(z.literal("")),
          linkUrl: z.string().url().optional().or(z.literal("")),
          linkTitle: z.string().max(200).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const post = await getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await updatePost(id, {
          ...data,
          imageUrl: data.imageUrl || null,
          linkUrl: data.linkUrl || null,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const post = await getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await deletePost(input.id);
        return { success: true };
      }),
    uploadImage: protectedProcedure
      .input(
        z.object({
          base64: z.string(),
          mimeType: z.string(),
          fileName: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.fileName.split(".").pop() ?? "jpg";
        const key = `posts/${ctx.user.id}-${Date.now()}-${nanoid(6)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
  }),

  // ── コメント ───────────────────────────────────────────────────────────
  comments: router({
    list: publicProcedure
      .input(z.object({ postId: z.number().int() }))
      .query(({ input }) => getCommentsByPost(input.postId)),
    create: protectedProcedure
      .input(
        z.object({
          postId: z.number().int(),
          content: z.string().min(1).max(1000),
          parentId: z.number().int().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const comment = await createComment({
          postId: input.postId,
          userId: ctx.user.id,
          content: input.content,
          parentId: input.parentId ?? null,
        });
        return comment;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await deleteComment(input.id);
        return { success: true };
      }),
  }),

  // ── 管理者 ─────────────────────────────────────────────────────────────
  admin: router({
    users: adminProcedure.query(() => getAllUsers()),
  }),
});

export type AppRouter = typeof appRouter;
