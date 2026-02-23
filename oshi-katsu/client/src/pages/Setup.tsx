/**
 * /setup ページ
 * sso_token 経由でアクセスした場合、招待コード・パスワード入力をスキップし
 * ニックネームだけ入力してログインできる。
 *
 * URLパラメータ:
 *   sso_token  - 検証済みSSOトークン（必須）
 *   code       - 招待コード（sso_token検証後にセットされる）
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Loader2, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";

export default function Setup() {
  const { isAuthenticated, loading, refresh } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const ssoToken = params.get("sso_token") ?? "";
  const inviteCode = params.get("code") ?? "";

  const [nickname, setNickname] = useState("");

  // sso_tokenを再検証（ページ直アクセス対策）
  const ssoQuery = trpc.auth.verifySsoToken.useQuery(
    { token: ssoToken },
    {
      enabled: ssoToken.length > 0,
      retry: false,
    }
  );

  // ログイン済みならホームへ
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated]);

  // sso_tokenがない、またはinviteCodeがない場合は /join へ
  useEffect(() => {
    if (!loading && (ssoToken.length === 0 || inviteCode.length === 0)) {
      navigate("/join");
    }
  }, [loading, ssoToken, inviteCode]);

  // sso_token検証失敗なら /join へ
  useEffect(() => {
    if (ssoQuery.isError || (ssoQuery.data && !ssoQuery.data.valid)) {
      toast.error("招待リンクが無効または期限切れです");
      navigate("/join");
    }
  }, [ssoQuery.data, ssoQuery.isError]);

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

  const isLoading = loading || ssoQuery.isLoading;
  const isValid = ssoQuery.data?.valid === true;
  const canSubmit = isValid && nickname.trim().length > 0 && !loginMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    loginMutation.mutate({
      inviteCode: inviteCode.toUpperCase(),
      password: "5050", // SSOトークン経由はパスワードチェックをサーバー側でスキップ
      nickname: nickname.trim(),
      ssoToken,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">招待リンクを確認しています...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">招待リンクが無効です</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/join")}>
          招待コードで参加する
        </Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold gradient-text mb-2">あと一歩！</h1>
          <p className="text-muted-foreground text-sm">
            ニックネームを設定してコミュニティに参加しよう
          </p>
        </div>

        {/* カード */}
        <div className="glass rounded-3xl p-8 shadow-2xl space-y-5">
          {/* 招待コード確認済みバッジ */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-green-50 border border-green-200">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-700 font-medium">
              招待リンクの確認が完了しました
            </p>
          </div>

          {/* ニックネーム入力 */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              ニックネーム（最大20文字）
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例：なか"
              className="h-14 rounded-2xl border-2 focus:border-primary text-lg"
              maxLength={20}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* 参加ボタン */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90 shadow-lg text-base font-semibold gap-2"
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
            招待コードの入力は不要です
          </p>
        </div>
      </div>
    </div>
  );
}
