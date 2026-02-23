import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Key, Loader2, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";

export default function Join() {
  const { isAuthenticated, loading, refresh } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  // URLパラメータから取得
  const codeFromUrl = params.get("code") ?? "";
  const ssoTokenFromUrl = params.get("sso_token") ?? "";

  const [inviteCode, setInviteCode] = useState(codeFromUrl.toUpperCase());
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── sso_token 検証 ──────────────────────────────────────────────────────
  // URLにsso_tokenがある場合のみクエリを実行する
  const ssoQuery = trpc.auth.verifySsoToken.useQuery(
    { token: ssoTokenFromUrl },
    {
      enabled: ssoTokenFromUrl.length > 0,
      retry: false,
    }
  );

  // sso_tokenが有効なら招待コードを自動セットして /setup へ遷移
  useEffect(() => {
    if (!ssoQuery.data) return;
    if (ssoQuery.data.valid && ssoQuery.data.inviteCode) {
      // 招待コードをセットしてニックネーム設定ページへ
      navigate(`/setup?sso_token=${encodeURIComponent(ssoTokenFromUrl)}&code=${ssoQuery.data.inviteCode}`);
    }
  }, [ssoQuery.data]);

  // ── 招待コードのリアルタイム検証 ────────────────────────────────────────
  const verifyQuery = trpc.invites.verify.useQuery(
    { code: inviteCode.trim().toUpperCase() },
    { enabled: inviteCode.trim().length >= 4 && ssoTokenFromUrl.length === 0 }
  );
  const isCodeValid = verifyQuery.data?.valid === true;

  // ログイン済みならホームへ
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success(`ようこそ、${nickname}さん！`);
      await refresh();
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // ── SSO検証中のローディング表示 ─────────────────────────────────────────
  const isSsoLoading = ssoTokenFromUrl.length > 0 && ssoQuery.isLoading;
  const isSsoInvalid = ssoTokenFromUrl.length > 0 && !ssoQuery.isLoading && !ssoQuery.data?.valid;

  if (loading || isSsoLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        {isSsoLoading && (
          <p className="text-sm text-muted-foreground">招待リンクを確認しています...</p>
        )}
      </div>
    );
  }

  const canSubmit =
    isCodeValid &&
    password.trim().length > 0 &&
    nickname.trim().length > 0 &&
    !loginMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    loginMutation.mutate({
      inviteCode: inviteCode.trim().toUpperCase(),
      password: password.trim(),
      nickname: nickname.trim(),
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.95 0.04 295) 0%, oklch(0.97 0.03 340) 50%, oklch(0.96 0.03 200) 100%)",
      }}
    >
      {/* 装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["📚", "🎬", "🎵", "🌟", "💬", "🎨"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              transform: `rotate(${-15 + i * 8}deg)`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">今年の1つ</h1>
          <p className="text-muted-foreground text-sm">
            コミュニティに参加して、あなたの推しを共有しよう
          </p>
        </div>

        {/* SSOトークン無効エラー */}
        {isSsoInvalid && (
          <div className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">招待リンクが無効です</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                リンクの有効期限（15分）が切れているか、すでに使用済みの可能性があります。招待コードを手動で入力してください。
              </p>
            </div>
          </div>
        )}

        {/* ログインカード */}
        <div className="glass rounded-3xl p-8 shadow-2xl space-y-5">
          {/* 招待コード */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              招待コード
            </label>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="例：ABCD1234EF"
              className="text-center text-lg font-mono tracking-widest h-14 rounded-2xl border-2 focus:border-primary"
              maxLength={20}
            />
            {inviteCode.trim().length >= 4 && (
              <p
                className={`text-xs mt-1.5 text-center font-medium flex items-center justify-center gap-1 ${
                  verifyQuery.isLoading
                    ? "text-muted-foreground"
                    : isCodeValid
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {verifyQuery.isLoading ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> 確認中...</>
                ) : isCodeValid ? (
                  <><CheckCircle2 className="w-3 h-3" /> 有効な招待コードです</>
                ) : (
                  <><AlertCircle className="w-3 h-3" /> 無効な招待コードです</>
                )}
              </p>
            )}
          </div>

          {/* パスワード */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              パスワード
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理者から受け取ったパスワード"
                className="h-12 rounded-2xl border-2 focus:border-primary pr-12"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ニックネーム */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              ニックネーム（最大20文字）
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例：なか"
              className="h-12 rounded-2xl border-2 focus:border-primary"
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* ログインボタン */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90 shadow-lg text-base font-semibold gap-2 mt-2"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                参加する
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            招待コードとパスワードは管理者から受け取ってください
          </p>
        </div>
      </div>
    </div>
  );
}
