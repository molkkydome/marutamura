/**
 * AuthContext: マルタ村ポータルからのSSO認証状態を管理する
 * - URLパラメータ sso_token & sso_portal を検証
 * - 検証成功時はユーザー情報をセッションに保持
 * - 検証失敗・パラメータなし時は未ログイン状態
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface SSOUser {
  openId: string;
  name: string;
  email: string;
  role: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: SSOUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
  logout: () => {},
});

const SESSION_KEY = "petit-sponsor-sso-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SSOUser | null>(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get("sso_token");
    const ssoPortal = params.get("sso_portal");

    // 1. セッションストレージに既存のログイン情報があれば復元
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached && !ssoToken) {
      try {
        const parsed: SSOUser = JSON.parse(cached);
        setUser(parsed);
        setStatus("authenticated");
        return;
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    // 2. SSOトークンがなければ未認証
    if (!ssoToken || !ssoPortal) {
      setStatus("unauthenticated");
      return;
    }

    // 3. SSOトークンをポータルAPIで検証
    const verifyUrl = `${ssoPortal}/api/sso/verify?token=${encodeURIComponent(ssoToken)}`;

    fetch(verifyUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { valid: boolean; user?: SSOUser }) => {
        if (data.valid && data.user) {
          // 検証成功 → ユーザー情報を保存してログイン状態に
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
          setUser(data.user);
          setStatus("authenticated");

          // URLからSSOパラメータを除去（履歴汚染防止）
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("sso_token");
          cleanUrl.searchParams.delete("sso_portal");
          window.history.replaceState({}, "", cleanUrl.toString());
        } else {
          // valid: false
          setStatus("unauthenticated");
        }
      })
      .catch((err) => {
        console.warn("[SSO] 検証失敗:", err);
        setStatus("unauthenticated");
      });
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
