import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    nickname: "テストユーザー",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return createCtx({ id: 99, openId: "admin-user", role: "admin" });
}

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("auth", () => {
  it("ログアウトでセッションクッキーがクリアされる", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: createCtx().user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => clearedCookies.push(name),
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies).toHaveLength(1);
  });

  it("未認証ユーザーはnullを返す", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });
});

describe("categories", () => {
  it("公開ユーザーがカテゴリー一覧を取得できる", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const cats = await caller.categories.list();
    expect(Array.isArray(cats)).toBe(true);
  });

  it("一般ユーザーはカテゴリー作成できない（FORBIDDEN）", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.categories.create({ name: "テスト", emoji: "🧪", color: "#FF0000" })
    ).rejects.toThrow();
  });
});

describe("invites", () => {
  it("一般ユーザーは招待コードを発行できない（FORBIDDEN）", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.invites.create({ origin: "https://example.com" })
    ).rejects.toThrow();
  });

  it("無効なコードはverifyでfalseを返す", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.invites.verify({ code: "INVALID000" });
    expect(result.valid).toBe(false);
  });
});

describe("posts", () => {
  it("公開ユーザーが投稿一覧を取得できる", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const posts = await caller.posts.list();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("未認証ユーザーは投稿できない（UNAUTHORIZED）", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.posts.create({
        categoryId: 1,
        title: "テスト投稿",
      })
    ).rejects.toThrow();
  });
});

describe("comments", () => {
  it("公開ユーザーがコメント一覧を取得できる", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const comments = await caller.comments.list({ postId: 1 });
    expect(Array.isArray(comments)).toBe(true);
  });

  it("未認証ユーザーはコメントできない（UNAUTHORIZED）", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.comments.create({ postId: 1, content: "テストコメント" })
    ).rejects.toThrow();
  });
});

describe("admin", () => {
  it("一般ユーザーはユーザー一覧を取得できない（FORBIDDEN）", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.admin.users()).rejects.toThrow();
  });
});

describe("sso_token", () => {
  it("無効なsso_tokenはverifySsoTokenでvalid:falseを返す", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.verifySsoToken({ token: "invalid.token.here" });
    expect(result.valid).toBe(false);
    expect(result.inviteCode).toBeNull();
  });

  it("空のsso_tokenはverifySsoTokenでvalid:falseを返す", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.verifySsoToken({ token: "" });
    expect(result.valid).toBe(false);
  });

  it("一般ユーザーはSSOトークン発行できない（FORBIDDEN）", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.auth.issueSsoToken({ inviteCode: "ADMIN00001", origin: "https://example.com" })
    ).rejects.toThrow();
  });
});
