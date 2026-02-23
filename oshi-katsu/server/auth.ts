/**
 * 独自認証モジュール
 * ManusOAuthを使わず、招待コード＋共通パスワード＋ニックネームでJWT認証を行う
 */
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import type { Request } from "express";

// 共通パスワード（環境変数で上書き可能、デフォルト5050）
export const COMMUNITY_PASSWORD = process.env.COMMUNITY_PASSWORD ?? "5050";

function getSecretKey() {
  const secret = ENV.cookieSecret || "fallback-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signUserJwt(userId: number, openId: string): Promise<string> {
  const secretKey = getSecretKey();
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ userId, openId, type: "oshi-auth" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}

export async function verifyUserJwt(
  token: string | undefined | null
): Promise<{ userId: number; openId: string } | null> {
  if (!token) return null;
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    const { userId, openId, type } = payload as Record<string, unknown>;
    if (type !== "oshi-auth" || typeof userId !== "number" || typeof openId !== "string") {
      return null;
    }
    return { userId, openId };
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) map.set(k.trim(), decodeURIComponent(v.join("=").trim()));
  }
  return map;
}

export async function authenticateRequest(req: Request): Promise<{ userId: number; openId: string } | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  return verifyUserJwt(token);
}

/** ユーザーごとのユニークなopenIdを生成する */
export function generateOpenId(): string {
  return `local-${nanoid(16)}`;
}

// ── SSO トークン ────────────────────────────────────────────────────────
// sso_token は招待コードを事前検証済みであることを示す短命JWT（15分有効）
// 管理者が発行したURLに埋め込み、受け取ったユーザーは招待コード入力をスキップできる

const SSO_EXPIRY_SECONDS = 15 * 60; // 15分

export async function signSsoToken(inviteCode: string): Promise<string> {
  const secretKey = getSecretKey();
  const expiresAt = Math.floor(Date.now() / 1000) + SSO_EXPIRY_SECONDS;
  return new SignJWT({ inviteCode, type: "oshi-sso" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}

export async function verifySsoToken(
  token: string | undefined | null
): Promise<{ inviteCode: string } | null> {
  if (!token) return null;
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    const { inviteCode, type } = payload as Record<string, unknown>;
    if (type !== "oshi-sso" || typeof inviteCode !== "string") return null;
    return { inviteCode };
  } catch {
    return null;
  }
}
