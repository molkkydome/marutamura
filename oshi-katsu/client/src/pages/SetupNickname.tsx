import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Sparkles, User } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SetupNickname() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [nickname, setNickname] = useState(user?.nickname ?? "");

  const utils = trpc.useUtils();
  const updateMutation = trpc.auth.updateNickname.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("ニックネームを設定しました！");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.95 0.04 295) 0%, oklch(0.97 0.03 340) 50%, oklch(0.96 0.03 200) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">ようこそ！</h1>
          <p className="text-muted-foreground text-sm">
            コミュニティで使うニックネームを設定してください
          </p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">ニックネーム設定</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                ニックネーム（最大20文字）
              </label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例：なか"
                className="h-12 rounded-2xl border-2 focus:border-primary text-base"
                maxLength={20}
              />
            </div>

            <Button
              onClick={() => updateMutation.mutate({ nickname: nickname.trim() })}
              disabled={!nickname.trim() || updateMutation.isPending}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90 shadow-lg text-base font-semibold"
            >
              {updateMutation.isPending ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                "設定して始める ✨"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
